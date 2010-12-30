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

var FireinputIMEPanel = 
{
    // debug: 0 disable, non-zero enable 
    debug: 1,

    myComposeEnabled: false, 
    // last input key chars before composing a new phrase 
    myInputChar: "",
    // table lookup delay timer 
    myKeyTimer: null,
    // save user typing history 
    mySaveHistory: true,
    // auto insertion if there is one choice 
    myAutoInsert: false,
    // update word freq 
    myUpdateFreq: true,
    // enable inputkey exact match. not extra AMB 
    myInputKeyExactMatch: false,

    // last selected element to be used repeatedly 
    myLastSelectedElementValue: "",
    
    // IME input field focused status. Popup/some key handling will be surpressed if it's true 
    myIMEInputFieldFocusedStatus: false,

    // work selection font size
    mySelectionFontSize: 9, 

    // number of selection word/phrase
    myNumWordSelection: 9, 

    initialize: function()
    {
       initPref();  
    },

    initPref: function()
    {
       this.mySaveHistory = fireinputPrefGetDefault("saveHistory"); 
       this.myAutoInsert = fireinputPrefGetDefault("autoInsert");
       this.myUpdateFreq = fireinputPrefGetDefault("updateFreq");
       this.myInputKeyExactMatch = fireinputPrefGetDefault("inputKeyExactMatch");
       this.myNumWordSelection = fireinputPrefGetDefault("wordselectionNum"); 
       this.mySelectionFontSize = fireinputPrefGetDefault("wordselectionFontsize"); 

       this.initPanelUI(); 
    }, 

    getInputChar: function()
    {
       return this.myInputChar; 
    }, 

    setInputChar: function(char)
    {
       this.myInputChar = char; 
    }, 

    getNumWordSelection: function()
    {
       return this.myNumWordSelection; 
    }, 

    getComposeEnabled: function()
    {
       return this.myComposeEnabled; 
    },

    enableComposeEditor: function(flag)
    {
       this.myComposeEnabled = flag;
    },
 
    getLastSelectedElementValue: function()
    {
       return this.myLastSelectedElementValue; 
    }, 

    getIMEInputFieldFocusedStatus: function()
    {
       return this.myIMEInputFieldFocusedStatus; 
    },

    setIMEInputFieldFocusedStatus: function(status)
    {
       this.myIMEInputFieldFocusedStatus = status; 
    }, 

    initPanelUI: function()
    {
       var handle = document.getElementById("fireinputIMEContainerBox");
       var color = fireinputPrefGetDefault("inputboxBgcolor"); 
       if(color)
         handle.style.backgroundColor = color; 

       handle = document.getElementById("fireinputField"); 
       color = fireinputPrefGetDefault("inputboxFontcolor"); 
       var fontsize = fireinputPrefGetDefault("inputboxFontsize"); 

       /*This might need to be handled differently if it works on win/mac */
       if(color)
         handle.style.color = color; 
       if(fontsize)
         handle.style.fontSize = fontsize + "pt"; 

       handle = document.getElementById("fireinputIMEList"); 
       color = fireinputPrefGetDefault("wordselectionFontcolor"); 
       if(color)
         handle.style.color = color; 

       handle = document.getElementById("fireinputLongPanel"); 
       if(color)
         handle.style.color = color; 
      
    },

    insertCharByIndex: function(event, index)
    {
       var idf = document.getElementById("fireinputField");
       // if the keyCode is Enter, we want to output char + input key left in idf 
       if(event.keyCode == KeyEvent.DOM_VK_RETURN)
       {
          this.insertCharToTarget(event, Fireinput.getTarget(), index, true, true);
          return; 
       }

       // process insertChar on-demand  
       if(this.myComposeEnabled)
       {
          this.insertCharToComposer(event, index, "false"); 
       }
       else if(idf.selectionEnd < idf.value.length)
       {
          event.preventDefault();
          event.stopPropagation();
          // there are still some room on the left. Show the selected word from 0 until this position 
          var subInputKeys = idf.value.substring(idf.selectionEnd, idf.value.length); 
          var result = this.getCharByPos(index);
          if(result)
          {
             FireinputComposer.addToPanel("false", result);
          }

          // update inputField value and caret position 
          idf.value = subInputKeys; 
          this.myInputChar = subInputKeys.substring(0, 1); 
          FireinputUtils.setCaretTo(idf, 1); 
          // number key should be surpressed 

          this.findCharWithDelay(); 

       }
       else 
          this.insertCharToTarget(event, Fireinput.getTarget(), index, true);
        
    }, 

    sendStringToPanel: function(codeArray, inputKey)
    {
       if(!codeArray || codeArray.length <= 0)
       {
          this.hideChars(); 
          return; 
       }

       var fontsize = fireinputPrefGetDefault("wordselectionFontsize"); 

       var inputPanelElement = document.getElementById('fireinputIMEList'); 

       // FireinputLog.debug(this,"codeArray: " + Fireinput.getCurrentIME().getKeyWord(codeArray)); 
       var codeArrayLength = codeArray.length; 
       for (var i = 0; i < codeArrayLength; i++)
       {
          var codeValue = "";
          if(typeof(codeArray[i].encodedWord) != 'undefined')
             codeValue = codeArray[i].encodedWord.replace(/[\d\.]+$/g, ''); 
          else
             codeValue = FireinputUnicode.getUnicodeString(codeArray[i].word.replace(/[\d\.]+$/g, '')); 
        
          var codeDisplayValue = codeValue; 
          if(i== 0 && FireinputComposer.hasSet())
          {     
             // preserve the first composed element if it's set 
             codeDisplayValue = FireinputComposer.getComposeWord().value + codeValue; 
          }

          var elementId = "fireinputIMEList_label" + (i+1); 
          if(document.getElementById(elementId))
          {
              var element = document.getElementById(elementId); 
              element.setAttribute("value",  (i+1) + '.' + codeDisplayValue);
              element.setAttribute("tooltiptext", "键: " + codeArray[i].key+"/右点搜索“"+codeValue+"”");
              element.setAttribute("hiddenvalue", codeValue);
              element.setAttribute("hiddenkey", codeArray[i].key);
              element.setAttribute("hiddeninputkey", inputKey);
              element.setAttribute("hiddenword", codeArray[i].word);
              element.setAttribute("ufreq", (typeof(codeArray[i].ufreq) == 'undefined') ? 'true' : codeArray[i].ufreq);
              element.style.fontSize = this.mySelectionFontSize + "pt"; 
              continue; 
          }
               
           var element = document.createElement("label"); 
           element.setAttribute("value",  (i+1) + '.' + codeDisplayValue);
           element.setAttribute("tooltiptext", "键: " + codeArray[i].key+"/右点搜索“"+codeValue+"”");
           element.setAttribute("hiddenvalue", codeValue);
           element.setAttribute("hiddenkey", codeArray[i].key);
           element.setAttribute("hiddeninputkey", inputKey);
           element.setAttribute("hiddenword", codeArray[i].word);
           element.setAttribute("ufreq", (typeof(codeArray[i].ufreq) == 'undefined') ? 'true' : codeArray[i].ufreq);

           element.setAttribute("id", elementId); 
           element.setAttribute("class", "charinputlabel"); 

           element.style.fontSize = this.mySelectionFontSize + "pt"; 

           var self = this; 
           element.onclick = function(event) { self.insertCharToComposerByMouse(event);}; 
           inputPanelElement.appendChild(element);
       }

       // hide all other values 
       this.hideChars(codeArray.length); 

       // check whether it needs to enable auto insertion 
       if(this.myAutoInsert && Fireinput.getCurrentIME().canAutoInsert() && codeArray.length == 1)
          this.insertCharToTarget(Fireinput.getEvent(), Fireinput.getTarget(), 1, true);

       // add long table  to panel 
       if(this.mySaveHistory)
          FireinputLongTable.notify(Fireinput.getTarget());
    },
 
    hideAndCleanInput: function()
    {
       if(Fireinput.getInputBarStatus())
       { 
          var id = document.getElementById("fireinputIMEContainer"); 
          id.hidePopup(); 
       }

       var idf = document.getElementById("fireinputField");
       idf.value = ""; 
       this.myInputChar = ""; 


       // hide all old chars 
       this.hideChars(0); 
    }, 


    hideChars: function(start)
    {
       start = start || 0; 

       /* preserve the first composed element if it's set */
       if(FireinputComposer.hasSet())
          start = start > 0 ? start : 1; 
       
       for (var i = this.myNumWordSelection; i >= start; i--)
       {
          var elementId = "fireinputIMEList_label" + (i+1);
          if(document.getElementById(elementId))
          {
             var element = document.getElementById(elementId);
             element.setAttribute("value",  "");
             element.setAttribute("hiddenvalue", "");
             element.setAttribute("hiddenkey", "");
             element.setAttribute("hiddenword", "");
             element.setAttribute("hiddeninputkey", "");
          }
       }
    }, 

    getCharByMouse: function (event)
    {
       var clickTarget = event.target; 
       var elementId = clickTarget.getAttribute("id"); 
       return this.getCharByPos(elementId); 
    }, 

    getCharByPos: function(i)
    {
       if(Fireinput.getInputBarStatus())
       {
          var elementName = "fireinputIMEList_label" + i;
          if(/fireinputIMEList_label/.test(i))
             elementName = i;

          var elementId = document.getElementById(elementName);
          if(!elementId)
             return null;


          var value = elementId.getAttribute("hiddenvalue");
          var key = elementId.getAttribute("hiddenkey");
          var inputkey = elementId.getAttribute("hiddeninputkey");
          var word = elementId.getAttribute("hiddenword");
          if(value.length <= 0 || key.length <= 0 || word.length <= 0 ||inputkey.length <= 0)
             return null;

          word = word.match(/[\D\.]+/g)[0];
          return {inputkey: inputkey, key: key, value: value, word: word }; 
       }

       return null; 

    }, 

    insertCharToComposer: function (event, i, cas)
    {
       if(event)
       { 
          event.preventDefault();
          event.stopPropagation(); 
       }

       var result = this.getCharByPos(i);
       var composeWasEnabled = this.myComposeEnabled; 
       // FireinputLog.debug(this, "result: " + result + ", this.myComposeEnabled:" + this.myComposeEnabled);
       if(result)
       {
          FireinputComposer.addToPanel(cas, result); 
          if(composeWasEnabled)
          {
             // move the focus to fireinputField 
             FireinputUtils.setFocus(document.getElementById("fireinputField"));
          }
       } 
    },
 
    insertCharToComposerByMouse: function (event)
    {
       var result = this.getCharByMouse(event); 

       // right click to launch search 
       if(event.button == 2)
       {
          FireinputWebSearch.loadByMouse(result.value);
          return; 
       }

       if(!Fireinput.getCurrentIME().canComposeNew() || !FireinputComposer.hasSet())
       {
          this.insertCharToTargetByValue(result.value);
          this.hideAndCleanInput(); 
          return; 
       }

       var composeWasEnabled = this.myComposeEnabled; 

       if(result)
       {
          FireinputComposer.addToPanel("false", result);
       } 

       if(composeWasEnabled)
       {
          FireinputUtils.setFocus(document.getElementById("fireinputField"));
       }
   
       var idf = document.getElementById("fireinputField");
       if(idf.selectionEnd < idf.value.length)
       {
          var subInputKeys = idf.value.substring(idf.selectionEnd, idf.value.length); 
          // update inputField value and caret position 
          idf.value = subInputKeys; 
          this.myInputChar = subInputKeys.substring(0, 1); 
          FireinputUtils.setCaretTo(idf, 1); 
          this.findCharWithDelay(); 
       }
       else 
       { 
          idf.value = ""; 
          this.myInputChar = ""; 
       }
    }, 

    insertCharToTargetByValue: function (charstr)
    {
       FireinputUtils.insertCharAtCaret(Fireinput.getTarget(), charstr);
       // add into long table 
       if(this.mySaveHistory)
          FireinputLongTable.notify(Fireinput.getTarget());
    }, 

    insertCharToTarget: function (event, target, i, hideInput, outputAll)
    {
       if(Fireinput.getInputBarStatus())
       {
          event.preventDefault();
          event.stopPropagation(); 

          var elementName; 
          if(/fireinputIMEList_label/.test(i))
             elementName = i; 
          else 
             elementName = "fireinputIMEList_label" + i; 
          var elementId = document.getElementById(elementName); 
          if(!elementId || this.myInputChar.length <= 0 )
          {
             this.insertAllCharsToTarget(target, hideInput, null, outputAll); 
             return; 
          }

          var value = elementId.getAttribute("hiddenvalue");
          var key = elementId.getAttribute("hiddenkey");
          var word = elementId.getAttribute("hiddenword"); 
          var ufreq = elementId.getAttribute("ufreq") == 'true' ? true : false; 
          if(value.length <= 0 || key.length <= 0 || word.length <= 0)
          {
             this.insertAllCharsToTarget(target, hideInput, null, outputAll); 
             return; 
          }

          this.insertAllCharsToTarget(target, hideInput, {key: key, word: word, value: value, ufreq: ufreq}, outputAll); 
       }
    }, 

    insertAllCharsToTarget: function (target, hideInput, keyWordResult, outputAll)
    {
       if(Fireinput.getInputBarStatus())
       {
          var value = "";
          var key = ""; 
          var word = ""; 
          var ufreq = true; 
          var keyInField = this.myInputChar; 
          if(keyWordResult)
          {
             value = keyWordResult.value; 
             key = keyWordResult.key; 
             word = keyWordResult.word; 
             ufreq = keyWordResult.ufreq; 
          }

          var insertValue = value; 
          var composeWord = FireinputComposer.getComposeWord(); 
          // if there is no composed word, and no valid word selection, and doesn't ask 
          // to output the key in pinyin field, we just hide here 
          if(composeWord.key.length <= 0 && key.length <= 0 && !outputAll)
          {
             var id = document.getElementById("fireinputIMEContainer");
	     id.hidePopup(); 
             return; 
          }

          // combine both composed and now value 
          insertValue = composeWord.value + insertValue; 

          // hide the inputbar after everything is written 
          if(hideInput)
          {
             var id = document.getElementById("fireinputIMEContainer");
	     id.hidePopup(); 
             // also clear off the input bar 
             var idf = document.getElementById("fireinputField");
             idf.value = ""; 
          }

          // reset inputChar
          this.myInputChar = ""; 


          // the outputAll is from just Enter press which just prints out the input key 
          if(outputAll)
          {
             FireinputUtils.insertCharAtCaret(target, composeWord.ikey + keyInField); 
             // no need to go further, just return here 
             return; 
          }
          else 
             FireinputUtils.insertCharAtCaret(target, insertValue);

          // keep the last selected element to insert repeatedly 
          this.myLastSelectedElementValue = insertValue; 

          //FireinputLog.debug(this, "word: " + word + ", key: " + key + ", ufreq: " +  ufreq); 
          // update the frequency or save as new word 
          if(composeWord.key.length > 0)
          {
             var newPhraseArray = []; 
             newPhraseArray.push({key: composeWord.key + " " + key, word: composeWord.word + word}); 
             //FireinputLog.debug(this, "newPhraseArray: " + composeWord.key + " " + key + ", word: " +  composeWord.word + word); 
             Fireinput.getCurrentIME().storeUserPhrase(newPhraseArray); 
          }
          else if(this.myUpdateFreq && ufreq)
             Fireinput.getCurrentIME().updateFrequency(word, key);

          if(this.mySaveHistory)
             FireinputLongTable.notify(Fireinput.getTarget());
       }   
    },

    IMEInputFieldMouseEvent: function(event)
    {
       if(event.button == 2)
       {
          event.preventDefault();
          event.stopPropagation(); 
          this.hideAndCleanInput(); 
          return;   
       }

       if(event.button != 0)
          return; 
    },

    IMEInputFieldFocusEvent: function(event)
    {
       // return if it's initially popup 
       if(this.myIMEInputFieldFocusedStatus == false)
       {
          this.myIMEInputFieldFocusedStatus = true;
          return; 
       }

       // don't do anything if there is no input char 
       var idf = document.getElementById("fireinputField");
       if(idf.value.length <= 0)
          return; 
//     why we need this ? 
//       this.findChar(); 
    },

    IMEInputFieldOnInputEvent: function(event)
    {
       if(!this.myIMEInputFieldFocusedStatus)
          return; 
    }, 
       
    prevSel: function (homeFlag)
    {
       if(!this.canPrevSel())
          return; 

       var idf = document.getElementById("fireinputField");
       
       // send to IME method to query the string 
       var result = Fireinput.getCurrentIME().prev(homeFlag);
       // FireinputLog.debug(this,"call prev, length: " + codeArray.length); 
       if(!result || !result.charArray)
          this.disableSelButton(true, false); 
       else if(homeFlag || Fireinput.getCurrentIME().isBeginning())
          this.disableSelButton(true, false); 
       else
          this.disableSelButton(false, false); 

       if(result && result.charArray)      
          this.sendStringToPanel(result.charArray, result.validInputKey);
       else 
          this.sendStringToPanel(null, null);
    },

    nextSel: function(endFlag)
    {
       if(!this.canNextSel())
          return; 

       var idf = document.getElementById("fireinputField");

       // send to IME method to query the string 
       var result = Fireinput.getCurrentIME().next(endFlag); 
       // FireinputLog.debug(this,"call next, length: " + codeArray.length); 
       if(!result || !result.charArray || result.charArray.length < this.myNumWordSelection)
          this.disableSelButton(false, true);
       else if (endFlag || Fireinput.getCurrentIME().isEnd())
          this.disableSelButton(false, true);
       else    
          this.disableSelButton(false, false);

       if(result && result.charArray)      
          this.sendStringToPanel(result.charArray, result.validInputKey);
       else 
          this.sendStringToPanel(null, null);
    },

    disableSelButton: function(prevFlag, nextFlag)
    {
       var button = document.getElementById("fireinputNextSelButton");
       if(nextFlag)
          button.disabled = true;
       else 
          button.disabled =  ""; 

       button = document.getElementById("fireinputPrevSelButton");
       if(prevFlag)
          button.disabled = true; 
       else
          button.disabled = ""; 
    }, 

    canPrevSel: function()
    {
       var button = document.getElementById("fireinputPrevSelButton");
       return (!button.disabled); 
    },

    canNextSel: function()
    {
       var button = document.getElementById("fireinputNextSelButton");
       return (!button.disabled); 
    },
 
    findCharWithDelay: function(delayMSec)
    {
       if(typeof(delayMSec) == 'undefined')
         delayMSec = 100; 
       if(this.myKeyTimer)
         clearTimeout(this.myKeyTimer); 

       FireinputLog.debug(this, "findCharWithDelay: call findChar");
       var self = this; 
       this.myKeyTimer = setTimeout(function () { self.findChar(); }, delayMSec); 
    },
 
    findChar: function(newKeyFlag)
    {
      
       if(this.myInputChar.length <= 0)
          return; 
 
       var singleWord = false; 
       // force single word to be chosen for next look up 
       if(FireinputComposer.hasSet())
          singleWord = false; 

       FireinputLog.debug(this, "findChar: " + this.myInputChar);
 
       var autoCompKeys = ""; 
       if(newKeyFlag && Fireinput.getCurrentIME().canComposeNew() && FireinputComposer.hasSet())
       {
          /* Fireinput might have composed a few, but it may not be accurate. If there is a new key in, 
           * redo the composition, so there might be a chance to get correct result 
           */
          autoCompKeys = FireinputComposer.getLastAutoSelected(); 
          /* Note: don't directly change this.myInputChar as it syncs with inputField position */
       } 
       // send to IME method to query the string 
       var result = Fireinput.getCurrentIME().find(autoCompKeys+this.myInputChar, singleWord, this.myInputKeyExactMatch);
       this.sendStringToPanel(result.charArray, result.validInputKey);
       if(!result.charArray || result.charArray.length < this.myNumWordSelection)
          this.disableSelButton(true, true); 
       else if (Fireinput.getCurrentIME().isEnd())
          this.disableSelButton(true, true);
       else
          this.disableSelButton(true, false);
      
       if(!Fireinput.getCurrentIME().canComposeNew())
          return; 

       FireinputLog.debug(this, "result.validInputKey: " + result.validInputKey);
       FireinputLog.debug(this, "this.myInputChar: " + this.myInputChar);

       /* sanity check. autoCompKeys must be considered since it was part of search keys */
       if(result && result.charArray && result.charArray.length > 0 && 
          (autoCompKeys.length + this.myInputChar.length) > result.validInputKey.length)
       {
          var newvalue = (autoCompKeys+this.myInputChar).substr(result.validInputKey.length, autoCompKeys.length + this.myInputChar.length); 
          this.insertCharToComposer(null, 1, "true");
          var idf = document.getElementById("fireinputField");
          FireinputLog.debug(this,"newvalue:" + newvalue + ", idf.value: " + idf.value + ", this.myInputChar: " + this.myInputChar);
          idf.value = newvalue + idf.value.replace(this.myInputChar, ""); 
          FireinputUtils.setCaretTo(idf, newvalue.length); 
          this.myInputChar = newvalue; 
          this.findChar(); 
       }
       else 
       {
          /* either no result or all keys are valid input key. In both cases, the autoCompKeys must be put back to 
           * inputField, and its caret must be set to the original pos 
           * Now myInputChar should include autoCompKeys 
           */
          var idf = document.getElementById("fireinputField");
          idf.value = autoCompKeys + idf.value; 
          this.myInputChar = autoCompKeys + this.myInputChar; 
          FireinputUtils.setCaretTo(idf, autoCompKeys.length + this.myInputChar.length);
          FireinputLog.debug(this, "no result or all key are valid: idf.value:  " + idf.value);
          FireinputLog.debug(this, "no result or all key are valid: this.myInputChar:  " + this.myInputChar);
       }

       // FireinputLog.debug(this, "after findChar, this.myInputChar: " + this.myInputChar);

    },
  
    findCharWithKey: function(inputChar)
    {
       if(!inputChar || inputChar.length <= 0)
          return; 

       //FireinputLog.debug(this, "Send key: inputChar: " + inputChar);
 
       // send to IME method to query the string 
       var result = Fireinput.getCurrentIME().find(inputChar);
       this.sendStringToPanel(result.charArray, result.validInputKey);
       if(!result.charArray || result.charArray.length < this.myNumWordSelection)
          this.disableSelButton(true, true); 
       else if (Fireinput.getCurrentIME().isEnd())
          this.disableSelButton(true, true);
       else
          this.disableSelButton(true, false);
    }, 
   
}; 

