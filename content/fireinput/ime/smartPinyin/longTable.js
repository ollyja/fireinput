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

 
Fireinput.longTable = 
{
    debug: 0, 
    MaxSelectionLen: 20, 

    // current target 
    currentTarget: null, 


    showSelection: function()
    {
       var showSelectionLen = 10; 

       var selectedText = this.getSelection();
       if (!selectedText)
          return null; 

       if (selectedText.length  < 5)
          return null; 

       if (selectedText.length > (showSelectionLen-1))
          selectedText = selectedText.substr(0,showSelectionLen) + "...";
       
       return selectedText; 
    }, 

    getSelection: function()
    {
       var focusedWindow = document.commandDispatcher.focusedWindow;
       var selection = focusedWindow.getSelection().toString();

       if (selection) {
          if (selection.length > this.MaxSelectionLen) {
          var pattern = new RegExp("^(?:\\s*.){0," + this.MaxSelectionLen + "}");
          pattern.test(selection);
          selection = RegExp.lastMatch;
          }
       }
       selection = selection.replace(/^\s+/, "")
                         .replace(/\s+$/, "")
                         .replace(/^#+/, "")
                         .replace(/#+$/, "")
                         .replace(/\s+/g, " ");

       if (selection.length > this.MaxSelectionLen)
          selection = selection.substr(0, this.MaxSelectionLen);


       return selection; 
    },

    addSelectionIntoTable: function()
    {
       var selectedText = this.getSelection();
       if (!selectedText)
          return false;
 
       var ime = Fireinput.util.getCurrentIME(); 

       /* no other IME won't allow add words without keys */
       if(ime.getIMEType() != Fireinput.SMART_PINYIN)
          return; 

       var keys = Fireinput.importer.getPhrasePinyinKey(selectedText);
       if(!keys || keys.length <= 0)
          return;

       Fireinput.log.debug(this, "Phrase: " + selectedText + ", Got keys: " + keys.join(","));

       for(var i=0; i<keys.length; i++)
       {
          ime.storeUserAddPhrase(Fireinput.util.unicode.convertFromUnicode(selectedText), keys[i], 0);
       }
    },

    // collect long table 
    notify: function(element)
    {
       if(!element || !element.target)
          return; 

       var ime = Fireinput.util.getCurrentIME(); 

       /* no other IME won't allow add words without keys */
       if(ime.getIMEType() != Fireinput.SMART_PINYIN)
          return; 

       if(!this.currentTarget || !this.currentTarget.target)
       {
          this.currentTarget = element; 
       }
       else
       {
          if(this.currentTarget.target != element.target)
          {
             if(this.currentTarget.target.setSelectionRange)
             {
                this.flush(this.currentTarget.target.value); 
                // set to new 
                this.currentTarget = element; 
             }
             else if(this.currentTarget.documentTarget)
             {
                var win = this.currentTarget.target;
                var doc = win.content.document;
                var selection =  win.getSelection();

                // set to new 
                this.currentTarget = element; 

                if(!selection.focusNode)
                   return;
                
                this.flush(selection.focusNode.parentNode.textContent); 
             }
          } 
       }
    }, 
 
    flush: function(str)
    {
       Fireinput.log.debug(this, "str: " + str);
       var result = contextReader.start(str);
       if(!result || result.length <= 0)
         return; 

       var ime = Fireinput.util.getCurrentIME();

       for(var i=0; i<result.length; i++)
       {
          var keys = Fireinput.importer.getPhrasePinyinKey(result[i]);
          if(!keys || keys.length <= 0)
            continue; 

          Fireinput.log.debug(this, "Phrase: " + result[i] + ", Got keys: " + keys.join(","));

          for(var n=0; n<keys.length; n++)
          {
             ime.storeUserAddPhrase(Fireinput.util.unicode.convertFromUnicode(result[i]), keys[n], 0, null, false);
          }
       }
    }
    
}; 
