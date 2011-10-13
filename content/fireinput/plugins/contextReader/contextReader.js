/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Initial Developer of the Original Code is Fireinput Inc.
 *
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *     Olly Ja <ollyja@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** 
 */

/* get history/bookmark util */
try {
  Components.utils.import("resource://gre/modules/PlacesUtils.jsm");
} catch(ex) {
  Components.utils.import("resource://gre/modules/utils.js");
}

Fireinput.namespace("Fireinput.contextReader");


Fireinput.contextReader = {

    maxStep: 30000,
    maxPhraseLen: 20, 
    beginTime: 0, 

    init: function()
    {
       gBrowser.addEventListener("load", function (event) {
            if (event.target.defaultView && !event.target.defaultView.frameElement) 
               Fireinput.contextReader.run(event.originalTarget);
       }, true);

       // if tab is closed, remove all data from context reader to claim memory 
       if(gBrowser.tabContainer) {
          // FF 4 
          gBrowser.tabContainer.addEventListener("TabClose", function(event) {
            Fireinput.contextReader.remove(event.target);
          }, false);
       }
       else {
          // FF 3 or older  
          gBrowser.addEventListener("TabClose", function(event) {
            contextReader.remove(event.target);
          }, false);
       }
    }, 


    run: function(tab)
    {
       /* if it's disabled from config, just return */
       if(!Fireinput.pref.getDefault("enableContextReader"))
          return; 

       /* only run contextReader when IME is Fireinput.SMART_PINYIN */
       if(Fireinput.util.getCurrentIME().getIMEType() != Fireinput.SMART_PINYIN)
          return; 

       if(this.beginTime <= 0)
          this.beginTime = Date.now() * 1000; // now in microseconds 

       
       if(Fireinput.contextReader.validContext(tab)) {
          this.worker = new Worker("chrome://fireinput/content/plugins/contextReader/readerThread.js"); 
          /*FIXME: we use tab index here but the index is same for different window. Something need to be figured out how 
           *       how to support multiple window opening  
           */
         var self = this;  
         this.worker.onmessage = function(event) {  
            self.postResult.call(self, event);  
         };  
  
         this.worker.postMessage({"tabId": Fireinput.util.getBrowserUniqueId(), "context": tab.defaultView.document.documentElement.innerHTML}); 
      }
    }, 
       
    validContext: function(tab)
    {
       var wintype = document.documentElement.getAttribute('windowtype');
       /* if and only if the current window is a browser window and it has a document with a character set
        */
       if (window && (wintype == "navigator:browser") && window.content && window.content.document)
       {
          var docCharset = tab.defaultView.content.document.characterSet.toUpperCase();
          if(docCharset == "UTF-8" || docCharset == "GB2312" || docCharset =="GB18030" ||
             /^(GBK|X-GBK)$/.test(docCharset) || docCharset == "HZ" || docCharset == "ISO-2022-CN" || 
             docCharset == "BIG5" || docCharset == "BIG5-HKSCS" || /^(EUC-TW|X-EUC-TW)$/.test(docCharset))
          {
             // valid charset. If the content length is too small, don't do any processing  
             try {
                var uri = makeURI(tab.defaultView.location.href); 
                // ignore if the url has been visited recently 
                if(this.hasVisited(uri))
                   return false; 

                if(tab.defaultView.document.documentElement.textContent.length > 100)
                   return true; 
             } catch(e) { }
             
          }
       }

       return false; 
    }, 

    hasVisited: function(uri) {

       var query = PlacesUtils.history.getNewQuery();
       var options = PlacesUtils.history.getNewQueryOptions();

       options.queryType  = options.QUERY_TYPE_HISTORY;
       options.resultType = options.RESULTS_AS_VISIT; 
       query.beginTime = this.beginTime; 
       query.beginTimeReference = query.TIME_RELATIVE_EPOCH; 
       query.endTime = Date.now() * 1000 - 30 * 60 * 1000000; // 30 minutes ago 
       query.endTimeReference = query.TIME_RELATIVE_EPOCH; 
       query.uri = uri; 
       try {

          var result = PlacesUtils.history.executeQuery(query, options);
          result.root.containerOpen = true;
          var count = result.root.childCount; 
          result.root.containerOpen = false; 
          /* if the visit count is larger than 0, ignore this uri */
          return (count > 0 ? true : false); 
      } catch(e) { }

      return false; 
    },

    remove: function(tab) {
      Fireinput.importer.removePhraseFromRemoteOnDemand(gBrowser.getBrowserIndexForDocument(tab)); 
    }, 

    postResult: function(event) {
      try {

         // we got data from the worker thread.
         if(!event.data || !event.data.result || event.data.result.length <= 0)
            return; 

         // it's up to importer to handle it now 
         Fireinput.importer.processPhraseFromRemoteOnDemand(event.data.tabId, event.data.result, event.data.result.length);

      } catch(err) { dump(err + "\n")}
      
    },
};



