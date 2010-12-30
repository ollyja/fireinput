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
const maxComposedNumber = 50; 
const composerFieldTag = "composerfield_"; 

var FireinputComposer = 
{
    debug: 0, 

    composedNumber: 0, 

    hasSet: function()
    {
       return this.composedNumber > 0; 
    }, 
 
    reset: function()
    {
       if(this.composedNumber <= 0)
          return; 

       var composerFieldsElement = document.getElementById("fireinputComposeField"); 
       FireinputLog.debug(this, "hidding all composed words"); 
       var wlist = composerFieldsElement.getElementsByTagName("hbox");
       FireinputLog.debug(this, "wlist.length: " + wlist.length);
       for(var i=0; i < wlist.length; i++)
       {
          wlist[i].style.display = "none";
       }

       this.composedNumber = 0; 
       FireinputIMEPanel.enableComposeEditor(false);
    }, 

    getLastAutoSelected: function()
    {
       if(this.composedNumber <= 0)
          return ""; 
 
       var composerFieldsElement = document.getElementById("fireinputComposeField"); 
       FireinputLog.debug(this, "getLastAutoSelected: this.composedNumber= " + this.composedNumber);
       var inputkeys = ""; 
       while(this.composedNumber > 0)
       {
          var hboxElement = document.getElementById(composerFieldTag + this.composedNumber);
          if(!hboxElement || hboxElement.style.display == "none")
          {
             this.composedNumber--; 
             continue;
          }
          else
          {
             // To make searching less expensive, only last autoselected values will be used 
             var editorBox = document.getElementById(composerFieldTag + this.composedNumber + "_label");
             if(editorBox.getAttribute("autoselected") == "true")
             {
                this.composedNumber--; 
                inputkeys = editorBox.getAttribute("hiddeninputkey") + inputkeys;
                hboxElement.style.display = "none"; 
                FireinputLog.debug(this, "getLastAutoSelected: inputkeys= " + inputkeys);
             }

             break; 
          }
       }
       FireinputLog.debug(this, "getLastAutoSelected: inputkeys: " + inputkeys);
       return inputkeys; 
    }, 

    removeLastFromPanel: function()
    {
       if(this.composedNumber <= 0)
          return ""; 

       // we actually don't remove them here. Instead they will just be marked as hidden. 
       // Removing is not thread-safe, as the function might be invoked more than one time 
       // if the user is typing or removing input keys really quickly.
       var composerFieldsElement = document.getElementById("fireinputComposeField"); 
       FireinputLog.debug(this, "removeLastFromPanel: this.composedNumber= " + this.composedNumber);
       while(this.composedNumber > 0)
       {
          FireinputLog.debug(this, "removeLastFromPanel: this.composedNumber= " + this.composedNumber);
          var hboxElement = document.getElementById(composerFieldTag + this.composedNumber);
          if(!hboxElement || hboxElement.style.display == "none")
          {
             this.composedNumber--; 
             continue;
          }
          else
          {
             var editorBox = document.getElementById(composerFieldTag + this.composedNumber + "_label");
             this.composedNumber--; 
             var inputkey = editorBox.getAttribute("hiddeninputkey");
             hboxElement.style.display = "none"; 
             return inputkey; 
          }
       }

       return "";
    }, 

    addToPanel: function(autoselected, result)
    {
       FireinputLog.debug(this, "addToPanel: result.value: " + result.value);

       if(this.composedNumber >= maxComposedNumber)
          return; 

       this.createComposePanel(autoselected, result);

       // update first choice 
       /*
       var firstEl = document.getElementById("fireinputIMEList_label" + 1);
       if(firstEl)
       {
          var hiddenValue = firstEl.getAttribute("hiddenvalue") + result.value; 
          firstEl.value = "1." + hiddenValue; 
          firstEl.setAttribute("hiddenvalue", hiddenValue);
       }
       */
    },

    createComposePanel: function(autoselected, result)
    {

       var composerFieldsElement = document.getElementById("fireinputComposeField"); 
       var wlist = composerFieldsElement.getElementsByTagName("hbox");

       FireinputLog.debug(this, "this.composedNumber: " + this.composedNumber + ", wlist.length: " + wlist.length);
       if(this.composedNumber >= wlist.length)
       {
          this.composedNumber++;
          var thisId = composerFieldTag + this.composedNumber;    
          
          var hboxElement = document.createElement("hbox");
          hboxElement.setAttribute("id", thisId);
          hboxElement.setAttribute("cfindex", this.composedNumber);

          var element = document.createElement("label");
          
          element.setAttribute("value",result.value);
          element.setAttribute("hiddenvalue", result.value); 
          element.setAttribute("hiddenkey", result.key);
          element.setAttribute("hiddeninputkey", result.inputkey);
          element.setAttribute("hiddenword", result.word);
          element.setAttribute("tooltiptext", "键: " + result.key);
          if(this.composedNumber <= 1)
              element.setAttribute("class", "composeeditorboxviewfirst");
          else 
              element.setAttribute("class", "composeeditorboxview");
          element.setAttribute("id", thisId + "_label");
          element.setAttribute("cfindex", this.composedNumber);
          element.setAttribute("composeopened", "false");
          element.setAttribute("autoselected", autoselected);

          FireinputLog.debug(this, "element.value: " + element.value);
          hboxElement.appendChild(element);
           
          composerFieldsElement.appendChild(hboxElement); 

       }
       else
       {
          this.composedNumber++;
          var thisId = composerFieldTag + this.composedNumber;

          var hboxElement = document.getElementById(thisId);

          var element = document.getElementById(thisId + "_label");
          FireinputLog.debug(this, "element.value: " + element.value);
          element.setAttribute("value",result.value);
          element.setAttribute("hiddenkey", result.key);
          element.setAttribute("hiddenvalue", result.value); 
          element.setAttribute("tooltiptext", "键: " + result.key);
          element.setAttribute("hiddeninputkey", result.inputkey);
          element.setAttribute("hiddenword", result.word);
          element.setAttribute("composeopened", "false");
          element.setAttribute("autoselected", autoselected);

          hboxElement.style.display = ""; 
       }
    },
 
    getComposeWord: function()
    {
       var composerFieldsElement = document.getElementById("fireinputComposeField"); 
       var wlist = composerFieldsElement.getElementsByTagName("hbox");
       var words = "";
       var value = "";
       var keys = ""; 
       var ikeys = ""; 
       if(this.composedNumber <= 0)
          return {key: keys, ikey: ikeys, value:value, word: words}; 
         
       for(var i=0; i < wlist.length; i++)
       {
          if(wlist[i].style.display == "none") 
             continue;
          var cfindex = wlist[i].getAttribute("cfindex");
          var editorBox = document.getElementById(composerFieldTag + cfindex + "_label"); 
          if(!editorBox)
             continue; 
          words += editorBox.getAttribute("hiddenword"); 
          value += editorBox.getAttribute("hiddenvalue"); 
          if(keys.length <= 0)
             keys = editorBox.getAttribute("hiddenkey"); 
          else
             keys += " " + editorBox.getAttribute("hiddenkey");

          if(ikeys.length <= 0)
             ikeys = editorBox.getAttribute("hiddeninputkey"); 
          else
             ikeys += "" + editorBox.getAttribute("hiddeninputkey");
       }
       return {key: keys, ikey: ikeys, value: value, word: words}; 
    }   


}; 

