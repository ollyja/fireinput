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

    composeEditorId: 0, 

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
       Fireinput.enableComposeEditor(false);
       this.composeEditorId = 0; 
    }, 

    getLastAutoSelected: function()
    {
       if(this.composedNumber <= 0)
          return ""; 
 
       var composerFieldsElement = document.getElementById("fireinputComposeField"); 
       FireinputLog.debug(this, "getLastAutoSelected: this.composedNumber= " + this.composedNumber);
       var inputkeys = ""; 
       var needed = 0; 
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
             // To make searching less expensive, only last autoselected value will be used 
             var editorBox = document.getElementById(composerFieldTag + this.composedNumber + "_textbox");
             if(editorBox.getAttribute("autoselected") == "true")
             {
                this.composedNumber--; 
                inputkeys = editorBox.getAttribute("hiddeninputkey") + inputkeys;
                FireinputLog.debug(this, "getLastAutoSelected: inputkeys= " + inputkeys);
             }

             break; 
          }
       }
       FireinputLog.debug(this, "getLastAutoSelected: inputkeys: " + inputkeys);
       return needed ? inputkeys : ""; 
    }, 

    removeLastFromPanel: function()
    {
       if(this.composedNumber <= 0)
          return ""; 

       // we actually don't remove them here. Instead they will just be marked as hidden. 
       // Removing is not thread-safe, as the function might be invoked more than one time 
       // if the user is typing or removing input keys really quick.
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
             var editorBox = document.getElementById(composerFieldTag + this.composedNumber + "_textbox");
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
       FireinputLog.debug(this, "addToPanel: this.composeEditorId= " + this.composeEditorId);
       if(this.composeEditorId != 0)
       {
          var editorBox = document.getElementById(composerFieldTag + this.composeEditorId + "_textbox");
          if(editorBox)
          {
             this.hideComposeEditorWithValue(editorBox, autoselected, result);
             return; 
          }
       }

       if(this.composedNumber >= maxComposedNumber)
          return; 

       this.createComposePanel(autoselected, result);
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

          var element = document.createElement("textbox");
          element.setAttribute("value",result.value);
          element.setAttribute("hiddenvalue", result.value); 
          element.setAttribute("hiddenkey", result.key);
          element.setAttribute("hiddeninputkey", result.inputkey);
          element.setAttribute("hiddenword", result.word);
          element.setAttribute("tooltiptext", "键: " + result.key);
          element.setAttribute("class", "composeeditorboxview");
          element.setAttribute("id", thisId + "_textbox");
          element.setAttribute("cfindex", this.composedNumber);
          element.setAttribute("composeopened", "false");
          element.setAttribute("autoselected", autoselected);

          element.style.width = 13 * result.value.length + "px"; 

          var self = this; 
          element.onclick = function(event) { self.showWordEditor(event); }; 
          element.addEventListener("blur", function(event) { self.hideWordEditor(event); }, true); 
          element.addEventListener("focus", function(event) { self.showWordEditor(event); }, true); 
          element.addEventListener("input", function(event) { self.updateWordEditor(event); } , true);

          hboxElement.appendChild(element);
           
          composerFieldsElement.appendChild(hboxElement); 
       }
       else
       {
          this.composedNumber++;
          var thisId = composerFieldTag + this.composedNumber;

          var hboxElement = document.getElementById(thisId);

          var element = document.getElementById(thisId + "_textbox");
          element.value =  result.value;
          FireinputLog.debug(this, "element.value: " + element.value);
          element.setAttribute("class", "composeeditorboxview");
          element.setAttribute("hiddenkey", result.key);
          element.setAttribute("hiddenvalue", result.value); 
          element.setAttribute("tooltiptext", "键: " + result.key);
          element.setAttribute("hiddeninputkey", result.inputkey);
          element.setAttribute("hiddenword", result.word);
          element.setAttribute("composeopened", "false");
          element.setAttribute("autoselected", autoselected);

          element.style.width = 13 * result.value.length + "px"; 

          hboxElement.style.display = ""; 
       }
    },
 
    switchWordEditor: function(cfindex, flag)
    {
       var editorBox = document.getElementById(composerFieldTag + cfindex + "_textbox");
       if(flag)
       {
          editorBox.style.display = ""; 
       }
       else
       {
          editorBox.style.display = "none"; 
       }
    }, 

    showWordEditor: function(e)
    {
       var target = e.target; 
       if(target.getAttribute("composeopened") == "true")
          return; 

       var cfindex = target.getAttribute("cfindex");

       target.setAttribute("composeopened", "true");
       target.setAttribute("class", "composeeditorbox");
       target.style.width = 13 * target.getAttribute("hiddeninputkey").length + "px";
       target.value = target.getAttribute("hiddeninputkey"); 
       FireinputLog.debug(this, "showWordEditor: " + target.value + ",cfindex=" + cfindex);
          
       this.composeEditorId = cfindex; 
     
       // enable compose mode 
       Fireinput.enableComposeEditor(true); 

       Fireinput.findCharWithKey(target.value); 

    },

    updateWordEditor: function(e)
    {
       var target = e.target; 
       FireinputLog.debug(this, "update target.value: " + target.value);
       target.style.width = (13 * target.value.length < 20 ? 20 : 13 * target.value.length) + "px";
       Fireinput.findCharWithKey(target.value); 
    }, 

    hideWordEditor: function(e)
    {
       var target = e.target; 
       // FIXME: I have seen at least one time the function was not invoked, thus leaving editorbox to be editable. 
       // maybe the compseopened was reset somehow ? 

       if(target.getAttribute("composeopened") == "false")
          return; 

       var cfindex = target.getAttribute("cfindex");

       target.setAttribute("composeopened", "false");
       FireinputLog.debug(this, "hide word editor"); 
       Fireinput.enableComposeEditor(false); 

       this.composeEditorId = 0; 

       target.setAttribute("class", "composeeditorboxview");
       // hide if everything has been removed 
       if(target.value.length <= 0)
       {
          var hboxElement = document.getElementById(composerFieldTag + cfindex);
          hboxElement.style.display = "none"; 
          return; 
       }
 
       FireinputLog.debug(this, "target.value=" + target.value + "<=>" + target.getAttribute("hiddeninputkey"));
       // no change            
       if(target.value == target.getAttribute("hiddeninputkey"))
       {
          target.value = target.getAttribute("hiddenvalue"); 
          target.style.width = 13 * target.getAttribute("hiddenvalue").length + "px";
          return;
       }
 
       var charResult = Fireinput.getCharByPos(1); 
       if(!charResult)
       {
          target.value = target.getAttribute("hiddenvalue"); 
          target.style.width = 13 * target.getAttribute("hiddenvalue").value.length + "px";
          return; 
       }

       target.value = charResult.value; 
       target.style.width = 13 * charResult.value.length + "px";
       target.setAttribute("hiddenvalue", charResult.value);
       target.setAttribute("hiddenkey", charResult.key);
       target.setAttribute("tooltiptext", "键: " + charResult.key);
       target.setAttribute("hiddenword", charResult.word);
       target.setAttribute("hiddeninputkey", charResult.inputkey);

    }, 

    hideComposeEditorWithValue: function(editorBox, autoselected, charResult)
    {
       FireinputLog.debug(this, "hide word editor with value");

       editorBox.setAttribute("class", "composeeditorboxview");
       editorBox.setAttribute("composeopened", "false");

       editorBox.value = charResult.value;
       editorBox.style.width = 13 * charResult.value.length + "px";
       editorBox.setAttribute("hiddenkey", charResult.key);
       editorBox.setAttribute("hiddenvalue", charResult.value);
       editorBox.setAttribute("tooltiptext", "键: " + charResult.key);
       editorBox.setAttribute("hiddeninputkey", charResult.inputkey);
       editorBox.setAttribute("hiddenword", charResult.word);
       editorBox.setAttribute("autoselected", autoselected);

       Fireinput.enableComposeEditor(false);
       this.composeEditorId = 0;
    }, 
 
    getComposeWord: function()
    {
       var composerFieldsElement = document.getElementById("fireinputComposeField"); 
       var wlist = composerFieldsElement.getElementsByTagName("hbox");
       var words = "";
       var value = "";
       var keys = ""; 
       if(this.composedNumber <= 0)
          return {key: keys, value:value, word: words}; 
         
       for(var i=0; i < wlist.length; i++)
       {
          if(wlist[i].style.display == "none") 
             continue;
          var cfindex = wlist[i].getAttribute("cfindex");
          var editorBox = document.getElementById(composerFieldTag + cfindex + "_textbox"); 
          if(!editorBox)
             continue; 
          words += editorBox.getAttribute("hiddenword"); 
          value += editorBox.value; 
          if(keys.length <= 0)
             keys = editorBox.getAttribute("hiddenkey"); 
          else
             keys += " " + editorBox.getAttribute("hiddenkey");
       }
       return {key: keys, value: value, word: words}; 
    }   


}; 
