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

const tableManagmentUI = [
    {id: "fireinputTableManagement", strKey: "fireinput.table.management.label", attribute: "label"}
]; 

var FireinputTable = 
{
    debug: 1, 

    updateTimer: null, 
    isUpdating: false, 
    initialized: false,

    load: function(forceLoad)
    {
       if(this.initialized && !forceLoad)
          return;

       this.refreshMenu(); 

       // register an observer 
       var os = FireinputXPC.getService("@mozilla.org/observer-service;1", "nsIObserverService");
       os.addObserver(this, "fireinput-table-update-request", false);
       
       // check new table words 
       this.checkTableUpdate(); 
    },

    observe: function(subject, topic, data)
    {

       if(topic != 'fireinput-table-update-request')
          return;

       if(data)
          this.checkTableUpdate(true); 
       else 
          this.checkTableUpdate(); 
    }, 


    refreshMenu: function()
    {
       // get default language first 
       var defaultLanguage = fireinputPrefGetDefault("interfaceLanguage");
       // update UI 
       for(var i =0; i<tableManagmentUI.length; i++)
       {
          var id = tableManagmentUI[i].id;
          var handle = document.getElementById(id);
          if(!handle)
             continue;

          var strKey = tableManagmentUI[i].strKey;
          var attr = tableManagmentUI[i].attribute;

          var value = FireinputUtils.getLocaleString(strKey + defaultLanguage);
          // to check whether the shortcut keystring exists 
          var found =value.match(/%(.+)%/i);
          if(found)
          {
             var keystring = FireinputKeyBinding.getKeyString(found[1]);
             value = value.replace(found[0], keystring);
          }

          handle.setAttribute(attr, value);
       }
    }, 

    showDialog: function()
    {
       FireinputUtils.loadURI("chrome://fireinput/content/tablemgr/tablemgr.html");
    },

    openUpdateLink: function()
    {
      FireinputUtils.loadURI(SERVER_URL + "table/index.php");
    }, 

    isBeingUpdated: function()
    {
       return this.isUpdating; 
    },
 
    showUpdatingProgress: function(showflag)
    {
       var handle = document.getElementById('fireinputTableUpdatePanel'); 
       if(showflag)
       {
          this.isUpdating = true; 
          if(handle) 
            handle.style.display = ""; // don't put block here as it will not align with other menu well 

          var defaultLanguage = fireinputPrefGetDefault("interfaceLanguage");
          var value = FireinputUtils.getLocaleString('fireinput.table.updating.label' + defaultLanguage);
          var h = document.getElementById('fireinputTableUpdate'); 
          if(h)
              h.setAttribute('label', value); 
       }
       else 
       {
          this.isUpdating = false; 
          if(handle) 
            handle.style.display = "none"; 
          var h = document.getElementById('fireinputTableUpdate'); 
          if(h)
              h.setAttribute('label', '');
       }
          
    }, 

    checkTableUpdate: function(force)
    {
       if(this.isBeingUpdated())
          return; 

       var lastupdate = fireinputPrefGetDefault("lastTableUpdate"); 
       var intervalInHour = fireinputPrefGetDefault("tableUpdateInterval");
       if(lastupdate.length <= 0)
       {

          // find out the fireinput installation time 
          var installpath = FireinputUtils.getAppRootPath() + "/extensions/fireinput@software.fireinput.com";
          var pathUrl = FireinputXPC.getIOService().newURI(installpath, null, null).QueryInterface(Components.interfaces.nsIFileURL);
          var path = pathUrl.file;
          lastupdate = path.lastModifiedTime / 1000;
       }

       if(this.updateTimer)
          clearTimeout(this.updateTimer); 

       if(!force && intervalInHour <= 0)
       {
          // perodically loop to see if the interval has been changed. 
          var timeout = 30 * 60 * 1000; 
          this.updateTimer = setTimeout(function() { FireinputTable.checkTableUpdate(); }, timeout);
       }
       else 
       {
          var last = new Date(lastupdate).getTime() - 10000000;
          var now =  new Date().getTime();
          var timeout = intervalInHour * 3600 * 1000 - (now - last);
          timeout = (!force && timeout > 0) ? timeout: 1000; // give 1 seconds window 
          lastupdatetime = last / 1000;

          FireinputLog.debug(this, "lastupdatetime: " + lastupdatetime + ", timeout: " + timeout);
          this.updateTimer = setTimeout(function() { FireinputTable.startTableUpdate(lastupdatetime); }, timeout);
       }
    },

    startTableUpdate: function(lastupdatetime)
    {
       var ime = Fireinput.getCurrentIME();
       // FIXME: only support pinyin now 
       if(ime.getIMEType() > SMARTABC_SHUANGPIN)
       {
          fireinputPrefSave('lastTableUpdate', (new Date()).toString());
          this.checkTableUpdate(); 
          return; 
       }

       var ajax = new Ajax();
       if(!ajax) 
          return;

       var self = this;

       ajax.setOptions(
          {
             method: 'get',
             onSuccess: function(p) { self.processLatestTableUpdate(p); self.checkTableUpdate(); },
             onFailure: function(p) { self.processLatestTableUpdate(p, true); self.checkTableUpdate();}
          });

       this.showUpdatingProgress(true); 

       var ime = Fireinput.getCurrentIME(); 
       var params = "imetype=" + encodeURIComponent(ime.getIMEType()) + 
                    "&lastupdate=" + encodeURIComponent(lastupdatetime); 

       setTimeout(function() { ajax.request(SERVER_URL + "/table/getlatest.php?" + params); }, 5000);
    },

    processLatestTableUpdate: function(p, error)
    {
       if(!p || p.responseText.length <= 0)
       {
          this.showUpdatingProgress(false); 
          // if not error, set lastUpdateTime 
          if(!error)
            fireinputPrefSave('lastTableUpdate', (new Date()).toString());

          // re-schedule it 
          this.checkTableUpdate(); 
          return;
       }

       // the input is UTF-8, we need to convert as we save raw bytes in memory 
       var words = FireinputUnicode.convertFromUnicode(p.responseText);
       var jsonArray;
       try {
          jsonArray = JSON.parse(words); 
       }
       catch(e) { };

       if(typeof(jsonArray) == 'undefined')
       { 
          fireinputPrefSave('lastTableUpdate', (new Date()).toString());
          this.showUpdatingProgress(false); 
          this.checkTableUpdate(); 
          return;
       }

       FireinputLog.debug(this, FireinputUnicode.getUnicodeString(jsonArray.toString()));
       this.processLatestTable(jsonArray); 
       this.showUpdatingProgress(false); 
    },

    processLatestTable: function(tableArray)
    {

       var current = new Date(); 
       try {
           
         var ime = Fireinput.getCurrentIME(); 
         ime.storeUpdatePhrases(tableArray); 
         
       } catch(e) {}; 

       // update lastTableUpdate time and re-schedule checking 
       fireinputPrefSave('lastTableUpdate', current.toString());
       this.checkTableUpdate(); 
    }
   
}; 


