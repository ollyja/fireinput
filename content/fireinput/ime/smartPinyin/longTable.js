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

const MaxSelectionLen = 30;
 
var FireinputLongTable = 
{
    debug: 0, 

    // to hash based on first few words 
    lookupHashTable: null, 

    // long table hash to avoid string duplication 
    userLongTable: null, 

    // user current typing long table 
    typinglongTable: null, 

    // is changed 
    longTableChanged: false, 

    init: function()
    {
       this.loadLongTable(); 
    }, 

    showSelection: function()
    {
       const showSelectionLen = 10; 

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
          if (selection.length > MaxSelectionLen) {
          var pattern = new RegExp("^(?:\\s*.){0," + MaxSelectionLen + "}");
          pattern.test(selection);
          selection = RegExp.lastMatch;
          }
       }
       selection = selection.replace(/^\s+/, "")
                         .replace(/\s+$/, "")
                         .replace(/^#+/, "")
                         .replace(/#+$/, "")
                         .replace(/\s+/g, " ");

       if (selection.length > MaxSelectionLen)
          selection = selection.substr(0, MaxSelectionLen);


       return selection; 
    },

    hashThisKey: function(key, value)
    {
       if(this.lookupHashTable.hasItem(key))
       {
          var check = new RegExp("/^" + value + "/", "g");
          if(!check.test(this.lookupHashTable.getItem(key)))
             this.lookupHashTable.setItem(key, this.lookupHashTable.getItem(key) + "," + value);
       }
       else
          this.lookupHashTable.setItem(key, value);
         
    }, 

    hashLongTableLine: function(line)
    {
       var wordArray = line.split(":"); 
       var freq = 0; 
       if(wordArray.length > 1)
       {
          line = wordArray[0]; 
          freq = wordArray[1];
       }
  
       
       line = FireinputUnicode.getUnicodeString(line); 
       if(this.userLongTable.hasItem(line))
          return; 

       this.userLongTable.setItem(line, freq); 

       if(line.length > 10)
       {
          // use first few chars as hash key 
          var key1 = line.substr(0, 1); 
          var key2 = line.substr(0, 2); 
          var key3 = line.substr(0, 3); 
          this.hashThisKey(key1, line);
          this.hashThisKey(key2, line);
          this.hashThisKey(key3, line);
       }
       else
       {
          var key1 = line.substr(0, 2); 
          this.hashThisKey(key1, line);
       }

    }, 

    loadLongTable: function()
    {
       var ios = IOService.getService(Components.interfaces.nsIIOService);
       var fileHandler = ios.getProtocolHandler("file")
                         .QueryInterface(Components.interfaces.nsIFileProtocolHandler);

       var path = FireinputUtils.getAppRootPath();
       var datafile = fileHandler.getFileFromURLSpec(path + "/userlargetable.fireinput");
       this.lookupHashTable = new FireinputHash();
       this.userLongTable = new FireinputHash();

       if(!datafile.exists())
          return;

       var options = {
          caller: this,
          onavailable: this.hashLongTableLine
       };
       FireinputStream.loadDataAsync(datafile, options);

    }, 

    addSelectionIntoTable: function()
    {
       var selectedText = this.getSelection();
       if (!selectedText)
          return false;
         
       this.hashLongTableLine(selectedText);
   
       this.longTableChanged = true; 
       if(this.userLongTable.hasItem(selectedText))
       {
          var freq = this.userLongTable.getItem(selectedText); 
          freq += 10; 
          this.userLongTable.setItem(selectedText, freq); 
       }
       else 
       {
          this.userLongTable.setItem(selectedText, 10); 
       }

       return true; 
    },

    getLongTableByKey: function(key)
    {
       if(!this.lookupHashTable)
          return null; 

       for(var i=key.length; i>=1; i--)
       {
          var skey = key.substr(0, i); 
          if(this.lookupHashTable.hasItem(skey))
             return this.lookupHashTable.getItem(skey).split(","); 
       }

       return null; 
    },

    addToPanel: function()
    {
       var result = Fireinput.getCharByPos(1); 
       if(!result)
       { 
          this.hidePanel(); 
          return; 
       }

       var codeArray = this.getLongTableByKey(result.value); 
       if(!codeArray)
       {  
          this.hidePanel(); 
          return; 
       }

       this.sendToPanel(codeArray); 
    }, 

    hidePanel: function(start)
    {
       start = start || 0;

       var inputPanelElement = document.getElementById('fireinputLongPanel');
       for (var i = start; i <= 5; i++)
       {
          var elementId = "fireinputLongPanel_label" + (i+1) + "_hbox";
          var element = document.getElementById(elementId); 
          if(element)
          {
             element.style.display = "none";
          }
       }
       // nothing to display. hide this 
       if(start <= 0)
          inputPanelElement.style.display="none";
    },

    sendToPanel: function(codeArray)
    {
       
       if(!codeArray || codeArray.length <= 0)
       {
          this.hidePanel();
          return;
       }

       var inputPanelElement = document.getElementById('fireinputLongPanel');

       for (var i = 0; i < codeArray.length && i < 5; i++)
       {
          var elementId = "fireinputLongPanel_label" + (i+1);
          if(document.getElementById(elementId + "_hbox"))
          {
              var element = document.getElementById(elementId);
              element.setAttribute("value",  codeArray[i]);
              element.setAttribute("tooltiptext", "右点搜索“"+codeArray[i]+"”");
              element.setAttribute("class", "charinputlabel");
              document.getElementById(elementId + "_hbox").style.display = "";
              continue;

          }

          var hboxElement = document.createElement("hbox");
          hboxElement.setAttribute("id", elementId + "_hbox");

          var element = document.createElement("label");
          element.setAttribute("value", "Alt+" + (i+1) + ".");
          element.setAttribute("class", "largetablelabel"); 
         
          hboxElement.appendChild(element); 

          element = document.createElement("label");
          element.setAttribute("value",  codeArray[i]);
          element.setAttribute("tooltiptext", "右点搜索“"+codeArray[i]+"”");
          element.setAttribute("class", "charinputlabel");
          element.setAttribute("id", elementId);
          var self = this;
          element.onclick = function(event) { self.insertCharToTargetByMouse(event);};
          hboxElement.appendChild(element);
          inputPanelElement.appendChild(hboxElement);
       }
       // show long table panel 
       inputPanelElement.style.display = "";
       // hide all other values 
       this.hidePanel(codeArray.length);
    },

    insertCharToTargetByMouse: function(event)
    {
       var charstr = event.target.value; 
       if(event.button == 2)
       {
          FireinputWebSearch.loadByMouse(charstr);
          return;
       }

       if(!charstr)
          return; 
       Fireinput.insertCharToTargetByValue(charstr); 
       Fireinput.hideAndCleanInput(); 
       if(this.userLongTable.hasItem(charstr))
       {
          var freq = this.userLongTable.getItem(charstr); 
          freq++; 
          this.userLongTable.setItem(charstr, freq); 
          this.longTableChanged = true; 
       }
    },

    insertCharToTarget: function(pos)
    {
       var elementId = "fireinputLongPanel_label" + pos;
       var handle = document.getElementById(elementId + "_hbox"); 
       if(!handle || handle.style.display == "none")
          return; 


       handle = document.getElementById(elementId); 
       if(!handle)
          return; 
       Fireinput.insertCharToTargetByValue(handle.getAttribute("value")); 
       Fireinput.hideAndCleanInput(); 
       if(this.userLongTable.hasItem(handle.getAttribute("value")))
       {
          var freq = this.userLongTable.getItem(handle.getAttribute("value")); 
          freq++; 
          this.userLongTable.setItem(handle.getAttribute("value"), freq); 
          this.longTableChanged = true; 
       }
          
    }, 

    // collect long table 
    addIntoLongTable: function(target, value)
    {
       if(value.length <= 0)
          return; 
       if(!this.typinglongTable)
       {
          this.typinglongTable = {target: target, insertTimes: 1, longTable: value};
       }
       else
       {
          if(this.typinglongTable.target == target)
          {
             this.typinglongTable.longTable += value; 
             this.typinglongTable.insertTimes += 1; 
             if(this.typinglongTable.longTable.length > MaxSelectionLen)
             {
                this.flush(); 
             }

          } 
          else 
          {
             this.flush(); 
             this.typinglongTable = {target: target, insertTimes: 1, longTable: value};
          } 
       }
    }, 
 
    flush: function()
    {
       if(!this.typinglongTable)
          return; 

       if(this.typinglongTable.longTable.length > 5 && this.typinglongTable.insertTimes > 1)
       {
          this.hashLongTableLine(this.typinglongTable.longTable);
          this.longTableChanged = true; 
          if(this.userLongTable.hasItem(this.typinglongTable.longTable))
          {
             var freq = this.userLongTable.getItem(this.typinglongTable.longTable);       
             freq += 1; 
             this.userLongTable.setItem(this.typinglongTable.longTable, freq);       
          }
          else
          {
             this.userLongTable.setItem(this.typinglongTable.longTable, 1);
          }
       }        

       this.typinglongTable = null; 
    }, 
  
    flushLongTable: function()
    {
       if(!this.longTableChanged)
          return; 

       if(this.userLongTable)
          FireinputLongTableSaver.save(this.userLongTable); 
    }
    
}; 
