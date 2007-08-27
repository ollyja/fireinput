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
var imeInterfaceUI = [     
            {id: "fireinputToggleHalfButton", strKey: "fireinput.toggle.half.button", attribute: "tooltiptext"},
            {id: "fireinputTogglePunctButton", strKey: "fireinput.toggle.punct.button", attribute: "tooltiptext"},
            {id: "fireinputToggleIMEButton", strKey: "fireinput.toggle.ime.button", attribute: "tooltiptext"},
            {id: "fireinputPrevSelButton", strKey: "fireinput.previous.selection", attribute: "tooltiptext"},
            {id: "fireinputNextSelButton", strKey: "fireinput.next.selection", attribute: "tooltiptext"},
            {id: "fireinputLongPrevSelButton", strKey: "fireinput.previous.selection", attribute: "tooltiptext"},
            {id: "fireinputLongNextSelButton", strKey: "fireinput.next.selection", attribute: "tooltiptext"},
            {id: "fireinputContextEnableIME", strKey: "fireinput.show.IME", attribute: "label"},
            {id: "fireinputContextSwitchEncoding", strKey: "fireinput.encoding.switch", attribute: "label"},
            {id: "fireinputContextSwitchZHToBG", strKey: "fireinput.encoding.zhtobg", attribute: "label"},
            {id: "fireinputContextSwitchBGToZH", strKey: "fireinput.encoding.bgtozh", attribute: "label"},
            {id: "menuPinyinQuan", strKey: "fireinput.pinyin.quan.label", attribute: "label"},
            {id: "menuPinyinShuangZiGuang", strKey: "fireinput.pinyin.shuang.ziguang.label", attribute: "label"},
            {id: "menuPinyinShuangMS", strKey: "fireinput.pinyin.shuang.ms.label", attribute: "label"},
            {id: "menuPinyinShuangChineseStar", strKey: "fireinput.pinyin.shuang.chinesestar.label", attribute: "label"},
            {id: "menuPinyinShuangSmartABC", strKey: "fireinput.pinyin.shuang.smartabc.label", attribute: "label"},
            {id: "fireinputIMEBarCloseButton", strKey: "fireinput.close.IME", attribute: "tooltiptext"},
            {id: "fireinputSpecialCharMenu", strKey: "fireinput.special.char.label", attribute: "label"},
            {id: "inputHistoryList", strKey: "fireinput.history.list", attribute: "label"},
            {id: "fireinputHelp", strKey: "fireinput.help.label", attribute: "label"}
]; 


var imeInputModeValues = [ 
            {name: ENCODING_ZH, label: "fireinput.method.chinese.value"},
            {name: ENCODING_BIG5, label: "fireinput.method.big5.value"},
            {name: ENCODING_EN, label: "fireinput.method.english.value"}
]; 

            
var Fireinput = 
{
    // debug: 0 disable, non-zero enable 
    debug: 0, 
    // global version 
    myVersion: "1.0",
    // Fireinput statusbar status 
    myRunStatus: false,
    // IME mode. False for english mode, otherwise it's IME mode 
    myInputStatus: false, 
    // instance of IME 
    myIME: null, 
    // IME input bar stauts. 
    myIMEInputBarStatus: false, 

    // IME input field focused status. Popup/some key handling will be surpressed if it's true 
    myIMEInputFieldFocusedStatus: false, 

    // IME mode. The mode can ZH or EN. Chinese can only be typed under ZH mode 
    // Shortkey: type v if enable english mode, and space will resume original mode back 
    // reset by space /enter or target change 
    myIMEMode: IME_MODE_ZH,

    // Input mode. It will decide which encoding will be used(Simplified Chinese or Big5)
    myInputMode: ENCODING_ZH,

    // table lookup delay timer 
    myKeyTimer: null, 
    // caret focus event 
    myEvent: null,
    // caret focus target 
    myTarget: null, 
    // composed phrase array {key,word}
    myNewPhraseArray: null, 
    // composed phrase input key array 
    myNewPhraseKeyArray: null, 
    // last input key chars before composing a new phrase 
    myInputChar: "", 
    // last selected element to be used repeatedly 
    myLastSelectedElementValue: "", 
    // save user typing history 
    mySaveHistory: true, 
    // input bar position 
    myInputBarPos: null, 
   
    // half/full letter mode 
    myHalfMode: 0, 

    // half/full letter mode 
    myPunctMode: 0, 

    // allow Input Keys
    myAllowInputKey: "", 

    // Pinyin Schema 
    myPinyinSchema: SMART_PINYIN, 

    // fireinput init function. 
    initialize: function()
    {
       FireinputPref.addObserver(this, false);

       // register event listener to trigger when context menu is invoked.
       try 
       {
          document.getElementById('contentAreaContextMenu').addEventListener('popupshowing',
                                                                         fireinput_onPopupShowing,
                                                                         false);
       } catch(e) { }
 
       // setup tooltips 
       this.loadIMEPref(); 

       // initialize Pref interfaces 
       fireinputPrefInit(); 

       this.loadIMEPrefByID("fireinputStatusBar", "fireinput.statusbar.tooltip.open", "tooltiptext"); 

       // initial default IME 
       this.myIME = this.getDefaultIME(); 
    },

    getDefaultIME: function()
    {
       this.myPinyinSchema = FireinputPrefDefault.getSchema(); 
       var ime = new SmartPinyin(); 
       ime.setSchema(this.myPinyinSchema); 
       ime.loadTable();
       this.myAllowInputKey = ime.getAllowedInputKey(); 
       return ime; 
    }, 

    loadIMEPrefByID: function(id, strKey, attribute)
    {
       var defaultLanguage = FireinputPrefDefault.getInterfaceLanguage(); 

       var value = FireinputUtils.getLocaleString(strKey + defaultLanguage);
       var handle = document.getElementById(id);
       if(!handle)
          return; 
       handle.setAttribute(attribute, value);
    }, 

    loadIMEPref: function(name)
    {
       // get default language first 

       if(!name || name == "interfaceLanguage")
       {
          var defaultLanguage = FireinputPrefDefault.getInterfaceLanguage(); 

          // update UI 
          for(var i =0; i<imeInterfaceUI.length; i++)
          {
             var id = imeInterfaceUI[i].id;
             var strKey = imeInterfaceUI[i].strKey;
             var attr = imeInterfaceUI[i].attribute;

             var value = FireinputUtils.getLocaleString(strKey + defaultLanguage);
             var handle = document.getElementById(id);
             if(!handle)
                continue;
             handle.setAttribute(attr, value);
          }

          // update icon status text 
          if(this.myRunStatus)
             this.loadIMEPrefByID("fireinputStatusBar", "fireinput.statusbar.tooltip.close", "tooltiptext"); 
          else 
             this.loadIMEPrefByID("fireinputStatusBar", "fireinput.statusbar.tooltip.open", "tooltiptext"); 

          // load the special char menu at the beginning 
          if(!name)
             this.displaySpecialCharPanel();          
          else // refresh menu if language is changed 
          {
             FireinputSpecialChar.refreshMenu(); 
             FireinputEmotions.refreshMenu(); 
          }

          this.loadIMEPrefByID("fireinputToggleIMEButton", "fireinput.method.chinese.value", "label"); 
       } 
  
       //update value. The label of menu should be updated if language is changed  
       if(!name || name == "defaultInputMethod" || name == "interfaceLanguage")
       {  
          var value = FireinputPrefDefault.getSchema(); 

          var element = document.getElementById("inputMethod"); 
          if(value != null)
          {
             for(var index = 0; ; index++)
             {
                element.selectedIndex = index; 
                if(element.selectedIndex != -1)
                {
                   if(element.selectedItem.value == value)
                   {
                      element.setAttribute("label", element.selectedItem.label); 
                      break;
                   }
                }
                else
                   break; 
             }
          }
          else
          { 
             element.selectedIndex = 0; 
             element.setAttribute("label", element.selectedItem.label); 
          }
       }

       if(!name || name == "saveHistory")
       { 
          this.mySaveHistory = FireinputPrefDefault.getSaveHistory(); 
       }
    },


    toggleFireinput: function(forceOpen)
    {
       var id = document.getElementById("fireinputIMEBar");
       var toggleOff = forceOpen == undefined ? !id.hidden : !forceOpen;
       id.hidden = toggleOff; 
       this.myRunStatus = !toggleOff;  	

       if(!toggleOff)
       {
          this.loadIMEPrefByID("fireinputStatusBar", "fireinput.statusbar.tooltip.close", "tooltiptext"); 
	  window.addEventListener('keypress', fireinput_onKeyPress, true);
	  this.myInputStatus = true; 
          this.setInputMode(ENCODING_ZH);
          this.displayAjaxService();
       }
       else
       { 
          // close the IME inputbar 
          if(this.myIMEInputBarStatus)
          {
             this.hideAndCleanInput(); 
          }
          this.resetIME(); 

          this.loadIMEPrefByID("fireinputStatusBar", "fireinput.statusbar.tooltip.open", "tooltiptext"); 
          window.removeEventListener('keypress', fireinput_onKeyPress, true);
       }   
    },
   
    disableIME: function()
    {
       if(!this.myRunStatus)
	  return; 
       // if it's input enabled, disable it and turn off keypress listener 
       if(this.myInputStatus)
       {
          this.hideAndCleanInput(); 
          this.resetIME();
          window.removeEventListener('keypress', fireinput_onKeyPress, true);
       }
    },

    enableIME: function()
    {
       if(!this.myRunStatus)
	  return; 

       if(!this.myInputStatus)
       {
          this.myInputStatus = true; 	
          window.addEventListener('keypress', fireinput_onKeyPress, true);
       }
    },

    toggleIME: function()
    {
       if(!this.myRunStatus)
	  return; 

       if(this.myInputStatus)
          this.setInputMode(ENCODING_EN);
       else
          this.setInputMode(this.myInputMode);
    }, 

    resetIME: function ()
    {
       this.myInputStatus = false; 
       this.myIMEInputBarStatus =  false; 
    },
    
    toggleInputMethod: function()
    {
       // close the IME inputbar 
       if(this.myIMEInputBarStatus)
       {
          this.hideAndCleanInput(); 
       }
       this.myIMEInputBarStatus = false; 

       var method = document.getElementById("inputMethod").value; 
       if(this.myPinyinSchema == method)
          return; 

       this.myPinyinSchema = method; 

       // enable zh input 
       this.setInputMode(ENCODING_ZH); 

       this.myIME.setSchema(this.myPinyinSchema); 
       this.myAllowInputKey = this.myIME.getAllowedInputKey(); 
    }, 

    getModeString: function(mode)
    {
       for(var i=0; i<imeInputModeValues.length; i++)
       {
          if(mode == imeInputModeValues[i].name)
             return imeInputModeValues[i].label; 
       }

       // otherwise return first one 
       return imeInputModeValues[0].label; 

    },

    // set IME mode - not disable keyboard listening 
    setIMEMode: function(mode)
    {
      if(this.myIMEMode == mode)
          return; 

      this.myIMEMode = mode; 

       switch(mode)
       {
          case IME_MODE_ZH:
             var modeString = this.getModeString(this.myInputMode); 
             this.loadIMEPrefByID("fireinputToggleIMEButton", modeString, "label"); 
          break; 
          case IME_MODE_EN:
             var modeString = this.getModeString(mode); 
             this.loadIMEPrefByID("fireinputToggleIMEButton", modeString, "label"); 
          break; 
          default: 
             return; 
       }
    }, 

    setInputMode: function(mode)
    {
       var modeString = this.getModeString(mode); 
       this.loadIMEPrefByID("fireinputToggleIMEButton", modeString, "label"); 
       switch(mode)
       {
          case ENCODING_ZH:
          case ENCODING_BIG5:
             this.myInputMode = mode; 
             this.myIMEMode = IME_MODE_ZH; 
             this.myIME.setEncoding(mode);
             this.enableIME(); 
          break; 
          case ENCODING_EN:
             this.myIMEMode = IME_MODE_EN; 
             this.disableIME(); 
          break; 
          default: 
             return; 
       }
    }, 

    toggleInputMode: function()
    {
       if(this.myIMEMode == IME_MODE_EN)
       { 
          this.setInputMode(ENCODING_ZH);
          return; 
       }

       switch(this.myInputMode)
       {
          case ENCODING_ZH:
              this.setInputMode(ENCODING_BIG5); 
          break; 

          case ENCODING_BIG5:
              this.setInputMode(ENCODING_EN); 
          break; 
          default: 
              this.setInputMode(ENCODING_ZH); 
       }
    },

    toggleHalfMode: function()
    {
       if(this.myIME.isHalfLetterMode())
       {
          var id = document.getElementById("fireinputToggleHalfButton"); 
          if(id)
          {
             id.style.listStyleImage = "url('chrome://fireinput/skin/full-letter.png')"; 
             this.myIME.setFullLetterMode(); 
          }
       }
       else 
       {
          var id = document.getElementById("fireinputToggleHalfButton"); 
          if(id)
          {
             id.style.listStyleImage = "url('chrome://fireinput/skin/half-letter.png')"; 
             this.myIME.setHalfLetterMode(); 
          }

       }
    }, 

    togglePunctMode: function()
    {
       if(this.myIME.isHalfPunctMode())
       {
          var id = document.getElementById("fireinputTogglePunctButton");
          if(id) 
          {
             id.style.listStyleImage = "url('chrome://fireinput/skin/full-punct.png')";
             this.myIME.setFullPunctMode(); 
          }
       }
       else
       {
          var id = document.getElementById("fireinputTogglePunctButton");
          if(id) 
          {
             id.style.listStyleImage = "url('chrome://fireinput/skin/half-punct.png')";
             this.myIME.setHalfPunctMode(); 
          }

       }
    },
       
    onClickStatusIcon: function(event)
    {
       if (event.button != 0)
           return;
       this.toggleFireinput();
    },

    showPrefs: function()
    {
        window.openDialog('chrome://fireinput/content/fireinputPrefs.xul',
                    'PrefWindow',
                    'chrome,modal=yes,resizable=no',
                    'browser');
    },

    fireinputContext: function()
    {
        document.getElementById('fireinputContextEnableIME').hidden = !(gContextMenu.onTextInput);
    },

    // nsIPrefObserver

    observe: function(subject, topic, data)
    {
        var name = data.substr(prefDomain.length+1);
        this.updatePref(name);
    },

    // FIXME: 
    updatePref: function(name)
    {
	this.loadIMEPref(name);
    },

    // mouse down on input bar 
    inputBarMouseDownListener: function(event)
    {
       if(!this.myIMEInputBarStatus)
          return; 

       // skip if it's char label 
       if(/fireinputIMEList/.test(event.target.id))
          return; 
   
       this.myMouseDownEvent = true; 
       this.myInputBarPos.x2 = event.clientX; 
       this.myInputBarPos.y2 = event.clientY;
    },

    // mouse down on input bar 
    inputBarMouseMoveListener: function(event)
    {
       if(!this.myIMEInputBarStatus)
          return;

       // skip if it's char label 
       if(/fireinputIMEList/.test(event.target.id))
          return;

       if(!this.myMouseDownEvent)
          return; 

       event.target.style.cursor = "move"; 

       var id = document.getElementById("fireinputIMEContainer"); 

       var mX = this.myInputBarPos.x + event.clientX - this.myInputBarPos.x2; 
       var mY = this.myInputBarPos.y + event.clientY - this.myInputBarPos.y2; 
 
       id.moveTo(mX, mY); 
       this.myInputBarPos = {x: mX, y: mY, x1: mX, y1: mY, x2: event.clientX, y2: event.clientY }; 
    },

    // mouse up on input bar 
    inputBarMouseUpListener: function(event)
    {
       if(!this.myIMEInputBarStatus)
          return; 

       // skip if it's char label 
       if(/fireinputIMEList/.test(event.target.id))
          return;

       if(!this.myMouseDownEvent)
          return; 

       event.target.style.cursor = "auto"; 
       // clear the event 
       this.myMouseDownEvent = false; 
    }, 

    isTargetATextBox : function ( node )
    {
       if(!node)
          return 0; 

       if (node instanceof HTMLInputElement)
          return (node.type == "text" || node.type == "password")

       return (node instanceof HTMLTextAreaElement);
    },

    keyPressListener: function(event)
    {
       var target = event.explicitOriginalTarget; 
       var keyCode = 0; 
       var charCode = 0; 
       var documentTarget = false; 
      
       keyCode = event.keyCode;

       if(target == null)
	  target = event.target; 


       if(target && target.type == "password")
          return; 

       // disable input for url address bar 
       if(target instanceof XULElement && target.id == "urlbar")
          return; 

       if(!target.setSelectionRange)
       {
          var wrappedTarget = document.commandDispatcher.focusedElement; 

          if(wrappedTarget)
          {
             if(!this.isTargetATextBox(wrappedTarget))
                return; 
          }
          else 
          {
             // editable DOM document(iframe:designMode=On) 
             target = document.commandDispatcher.focusedWindow; 
             if (target) {
                var editingSession = target.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                                     .getInterface(Components.interfaces.nsIWebNavigation)
                                     .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                                     .getInterface(Components.interfaces.nsIEditingSession);
                if (!editingSession.windowIsEditable(target)) 
                   return; 

                documentTarget = true;  
             }
          }
        }
	else if(target.readOnly)
           return; 

	charCode = event.charCode; 

	// we don't use alt/shift key 
        // should be used to handle the long list string 
	if(event.altKey)
        {
           // handle ctrl + alt + f to insert Fireinput Ad
           if(event.ctrlKey && String.fromCharCode(charCode) == 'f')
           {
              this.displayADString(); 
           }

	   return; 
        }
 
	// check some key if control is pressed 
	if(event.ctrlKey)
	{
            // ctrl + number: compose a new word 
	     if(charCode > KeyEvent.DOM_VK_0 && charCode <= KeyEvent.DOM_VK_9)
             {
                this.composeNewWord(event, String.fromCharCode(charCode)); 
             } 
             
             return;
	}


	// ESC: clean up the input. Press twice will close input window
	if(keyCode == KeyEvent.DOM_VK_ESCAPE)
	{
	  if(this.myIMEInputBarStatus)
	  {
             event.preventDefault();
             this.hideAndCleanInput(); 
             return; 
	  }
	  return; 	 
        }

       // HOME: display the first set of input (first 10)
       if(keyCode == KeyEvent.DOM_VK_HOME)
       {
          if(!this.myIMEInputBarStatus)
             return; 

          if(this.myIMEInputFieldFocusedStatus)
             return;

          event.preventDefault();

	  this.prevSel("HOME"); 
	  return; 
       }
	
       // END: display the last set of input (last 10)
       if(keyCode == KeyEvent.DOM_VK_END)
       {
          if(!this.myIMEInputBarStatus)
             return; 

          if(this.myIMEInputFieldFocusedStatus)
             return;
          event.preventDefault();
	  this.nextSel("END"); 
	  return; 
       }
	
       // F2: repeat the previous selection 
       FireinputLog.debug(this,"keyCode:" + keyCode + ", charCode: " + charCode); 
       FireinputLog.debug(this,"charCode string:" + String.fromCharCode(charCode)); 

       // the IME mode needs to be reset if the target has changed 
       if(this.myTarget && this.myTarget.target != target)
          this.setIMEMode(IME_MODE_ZH);

       // keep the real event and target if inputfield has been focused 
       if(!this.myIMEInputFieldFocusedStatus)
       {
          this.myEvent = event; 
          this.myTarget = {target: target, documentTarget: documentTarget}; 
       }

       if(keyCode == KeyEvent.DOM_VK_F2)
       {
	  if(this.myIMEInputBarStatus)
             return; 

          event.preventDefault();
	  FireinputLog.debug(this,"F2: " + this.myLastSelectedElementValue); 
          FireinputUtils.insertCharAtCaret(this.myTarget, this.myLastSelectedElementValue);
	  return; 
	}

       // backspace: remove the input bar. If the input bar is empty, remove target value 
       if(keyCode == KeyEvent.DOM_VK_BACK_SPACE)
       {
          // inputField is focused 
          if(this.myIMEInputFieldFocusedStatus)
          {
             return;
          }

          var id = document.getElementById("fireinputIMEContainer"); 
	  if(this.myIMEInputBarStatus)
	  {
	     var idf = document.getElementById("fireinputField");
	     if(idf.value.length ==0)
             {
                id.hidePopup(); 
             }
             else
             {
                event.preventDefault();

                // erase last input char first 
                if(this.myInputChar.length > 0)
                {
                  //  idf.value = idf.value.replace(this.myInputChar, "");
                   var pos = idf.value.indexOf(this.myInputChar); 
                   idf.value = idf.value.substring(0, pos+this.myInputChar.length -1);
                   this.myInputChar = this.myInputChar.substring(0, this.myInputChar.length-1); 
                }

                if(this.myInputChar.length <= 0)
                {
                   if(this.myNewPhraseArray && this.myNewPhraseArray.length > 0)
                   { 
                      var word = this.myNewPhraseArray[this.myNewPhraseArray.length-1]; 
                      idf.value = idf.value.replace(word.value, "");
                      this.myInputChar = this.myNewPhraseKeyArray[this.myNewPhraseKeyArray.length-1]; 
                      idf.value += this.myInputChar; 
                      this.myNewPhraseArray.pop(); 
                      this.myNewPhraseKeyArray.pop(); 
                   }
                   else 
                      idf.value = ""; 
                }

	        if(idf.value.length ==0)
                {
                   id.hidePopup(); 
                   return; 
                }
                this.findCharWithDelay(); 
             }
	  }

          return; 
	}

       // enter: select the highlight column. If the input bar is not activated, go to default action 
       if(keyCode == KeyEvent.DOM_VK_RETURN)
       {
          // reset the IME mode back to zh after enter pressed 
          this.setIMEMode(IME_MODE_ZH);
          this.insertCharToTarget(event, this.myTarget, 1, true);
	  return; 
       }

        // page down for next 
	if(keyCode == KeyEvent.DOM_VK_PAGE_DOWN)
        {
          if(this.myIMEInputBarStatus)
          {
             event.preventDefault();
             event.stopPropagation(); 
             this.nextSel(); 
          }
          return; 
        }
        // page up for previous 
       if(keyCode == KeyEvent.DOM_VK_PAGE_UP)
       {
          if(this.myIMEInputBarStatus)
          {
             event.preventDefault();
             event.stopPropagation(); 
             this.prevSel(); 
          }

          return; 
       }

       // if it's not printable char, just return here 
       if(charCode ==0)
	  return; 

       var key = String.fromCharCode(charCode);

       // if the charCode is DOM_VK_V and IME input bar is not open, switch IME mode to english 
       if(key == "v")
       {
          if(!this.myIMEInputBarStatus)
          {
             // if the mode is always English, don't set again 
             if(this.myIMEMode == IME_MODE_ZH)
             { 
                event.preventDefault();
                this.setIMEMode(IME_MODE_EN);
                return; 
             }
          }
       }  
 
       // if the charCode is DOM_VK_SPACE and IME input bar is not open, switch IME mode to back
       if(key == " ")
       {
          if(!this.myIMEInputBarStatus)
          {
             this.setIMEMode(IME_MODE_ZH);
             return; 
          }
       }  

       // return here if the mode is non-chinese mode 
       if(this.myIMEMode != IME_MODE_ZH)
          return; 

       // comma: display previous choice 
       // in keypress event, this value won't match 
        if(key == ',')
        {
          if(this.myIMEInputBarStatus)
          {
             event.preventDefault();
             this.prevSel(); 
             return; 
          }
        } 

        // period: display next choice 
        if(key == '.')
        {
          if(this.myIMEInputBarStatus)
          {
             event.preventDefault();
             this.nextSel(); 
             return; 
          }
        } 
        // space to insert first one 
	if(charCode == KeyEvent.DOM_VK_SPACE)
	{
          if(this.myIMEInputBarStatus)
          {
             this.insertCharToTarget(event, this.myTarget, 1, true);
	     return; 
          }
	}

	// 1..2..9
	if(charCode > KeyEvent.DOM_VK_0 && charCode <= KeyEvent.DOM_VK_9)
	{
          if(this.myIMEInputBarStatus)
          {
             this.insertCharToTarget(event, this.myTarget, key, true);
	     return; 
          }
	}

       // small case a-z 
       if(this.myAllowInputKey.indexOf(key) >= 0 && !event.shiftKey)
       { 
          // inputField is enabled, allow the input and send delay searching 
          if(this.myIMEInputFieldFocusedStatus)
          {
             return;
          }

          event.preventDefault();
	  // open IME input window 

	  var xpos = 0; 
	  var ypos = 0; 
	  if(target.boxObject)
	  {
	     // XUL element 
             // FIXME: if it's close to bottom ? 
	     xpos = target.boxObject.screenX;
	     ypos = target.boxObject.screenY + target.boxObject.height+10;
	     //FireinputLog.debug(this,"window.screenY:" + window.screenY); 
	     //FireinputLog.debug(this,"window.screenX: " + window.screenX); 
	     //FireinputLog.debug(this,"target.boxObject.screenX: " + target.boxObject.screenX); 
	     //FireinputLog.debug(this,"target.boxObject.screenY: " + target.boxObject.screenY); 
	  }
	  else if(!documentTarget)
	  {
	     // HTML input/textarea element 
	     xpos = FireinputUtils.findPosX(target) -  
                    FireinputUtils.getDocumentScrollLeft(document.commandDispatcher.focusedWindow); 
	     ypos = FireinputUtils.findPosY(target) - 
                     FireinputUtils.getDocumentScrollTop(document.commandDispatcher.focusedWindow); 

	     //FireinputLog.debug(this,"xpos: " + xpos + ",ypos: " + ypos); 

	     xpos += window.screenX + 10; 
	     ypos += window.screenY + 20; 
	     if(ypos > (window.innerHeight - 20))
               ypos = window.innerHeight - 20; 

             if(ypos <= 20)
               ypos = 20; 

	     //FireinputLog.debug(this,"window.screenY:" + window.screenY); 
	     //FireinputLog.debug(this,"window.screenX: " + window.screenX); 
	     //FireinputLog.debug(this,"window.innerHeight:" + window.innerHeight); 
	     //FireinputLog.debug(this,"window.innerWidth:" + window.innerWidth); 
	     //FireinputLog.debug(this,"window.outerHeight:" + window.outerHeight); 
	     //FireinputLog.debug(this,"window.outerWidth:" + window.outerWidth); 
	     
	  }
          else 
          {
             // rich editor 
             var p = target.frameElement; 
	     xpos = FireinputUtils.findPosX(p);
	     ypos = FireinputUtils.findPosY(p);
	     //FireinputLog.debug(this,"xpos: " + xpos + ",ypos: " + ypos); 
	     xpos = xpos - p.ownerDocument.body.scrollLeft;
	     ypos = ypos - p.ownerDocument.body.scrollTop;

	     //FireinputLog.debug(this,"xpos: " + xpos + ",ypos: " + ypos); 

	     xpos += window.screenX + 10; 
	     ypos += window.screenY + 20; 
	     if(ypos > (window.innerHeight - 20))
               ypos = window.innerHeight - 20; 

             if(ypos <= 20)
               ypos = 20; 

          }

	  //FireinputLog.debug(this,"xpos: " + xpos + ",ypos: " + ypos); 

	  var id = document.getElementById("fireinputIMEContainer"); 
          
	  id.showPopup(document.documentElement, xpos, ypos, "popup", "null", "null");

	  var idf = document.getElementById("fireinputField");
          this.myInputChar += key; 
	  idf.value += key; 

	  this.findCharWithDelay(); 
	  return; 
       }
        
        // use single quot to separate pinyin input 
        if(this.myIMEInputBarStatus)
        {
          if(key == "'" && !this.myIMEInputFieldFocusedStatus)
          {
	     var idf = document.getElementById("fireinputField");
             // only one is allowed
             if(idf.value.length > 0 && idf.value.substr(idf.value.length-1, 1) != "'")
	     {  
                event.preventDefault();
                this.myInputChar += key; 
                idf.value += key;
                return; 
             }
          }

          // won't allow any other chars if IME inputfield is focused 
          if(key != "'" && this.myIMEInputFieldFocusedStatus)
             event.preventDefault();
        }

        // convert to Full width letters 
        if(!this.myIMEInputBarStatus)
        {
          var fullLetter = this.myIME.convertLetter(charCode); 
          if(typeof(fullLetter) == "object")
          {
             event.preventDefault();
             for (var s in fullLetter)
             {
               FireinputUtils.insertCharAtCaret(this.myTarget, fullLetter[s]); 
             }
          }
          else if(typeof(fullLetter) != "undefined")
          {
             event.preventDefault();
             FireinputUtils.insertCharAtCaret(this.myTarget, fullLetter); 
          }
        }
             
    },

    sendStringToPanel: function(codeArray)
    {
       if(!codeArray || codeArray.length <= 0)
       {
          return; 
       }

       var inputPanelElement = document.getElementById('fireinputIMEList'); 
       // FireinputLog.debug(this,"codeArray: " + this.myIME.getKeyWord(codeArray)); 
       for (var i = 0; i < codeArray.length; i++)
       {
          var codeValue = "";
          if(typeof(codeArray[i].encodedWord) != 'undefined')
             codeValue = codeArray[i].encodedWord.replace(/[\d\.]+/g, ''); 
          else
             codeValue = FireinputUnicode.getUnicodeString(codeArray[i].word.replace(/[\d\.]+/g, '')); 
             
          var elementId = "fireinputIMEList_label" + (i+1); 
          if(document.getElementById(elementId))
          {
              var element = document.getElementById(elementId); 
              element.setAttribute("value",  (i+1) + '.' + codeValue);
              element.setAttribute("hiddenvalue", codeValue);
              element.setAttribute("hiddenkey", codeArray[i].key);
              element.setAttribute("hiddenword", codeArray[i].word);
              var self = this; 
              element.onclick = function(event) { self.insertCharToTargetByMouse(event);}; 
              continue; 
          }
               
           var element = document.createElement("label"); 
           element.setAttribute("value",  (i+1) + '.' + codeValue);
           element.setAttribute("hiddenvalue", codeValue);
           element.setAttribute("hiddenkey", codeArray[i].key);
           element.setAttribute("hiddenword", codeArray[i].word);
           element.setAttribute("id", elementId); 
           element.setAttribute("class", "charinputlabel"); 
           var self = this; 
           element.onclick = function(event) { self.insertCharToTargetByMouse(event);}; 
           inputPanelElement.appendChild(element);
       }

       // hide all other values 
       this.hideChars(codeArray.length); 
    },
 
    hideAndCleanInput: function()
    {
       var idf = document.getElementById("fireinputField");
       idf.value = ""; 
       this.myInputChar = ""; 
       if(this.myNewPhraseArray)
       {
          this.myNewPhraseArray.length = 0; 
          this.myNewPhraseKeyArray.length = 0; 
       }
       if(this.myIMEInputBarStatus)
       { 
          var id = document.getElementById("fireinputIMEContainer"); 
          id.hidePopup(); 
       }
    }, 


    hideChars: function(start)
    {
       start = start || 0; 

       for (var i = start; i <= 10; i++)
       {
          var elementId = "fireinputIMEList_label" + (i+1);
          if(document.getElementById(elementId))
          {
             var element = document.getElementById(elementId);
             element.setAttribute("value",  "");
             element.setAttribute("hiddenvalue", "");
             element.setAttribute("hiddenkey", "");
             element.setAttribute("hiddenword", "");
 
          }
       }
    }, 

    insertCharToTargetByMouse: function (event)
    {
       var clickTarget = event.target; 
       var elementId = clickTarget.getAttribute("id"); 
       this.insertCharToTarget(this.myEvent, this.myTarget, elementId, true);
    }, 

    insertCharToTarget: function (event, target, i, hideInput)
    {
       if(this.myIMEInputBarStatus)
       {
          event.preventDefault();

          var elementName; 
          if(/fireinputIMEList_label/.test(i))
             elementName = i; 
          else 
             elementName = "fireinputIMEList_label" + i; 
          var elementId = document.getElementById(elementName); 
          if(!elementId)
             return; 


          var value = elementId.getAttribute("hiddenvalue");
          var key = elementId.getAttribute("hiddenkey");
          var word = elementId.getAttribute("hiddenword"); 

	  var idf = document.getElementById("fireinputField");
          var insertValue = value; 
          if(this.myNewPhraseArray && this.myNewPhraseArray.length > 0)
          {
              // here, if the inputChar is empty, we only insert the composed phrase
              // the first element will not be chosen otherwise. 
              if(this.myInputChar.length > 0)
              {
                 idf.value = idf.value.replace(this.myInputChar, ""); 
                 insertValue =  idf.value + value; 
              }
              else
                 insertValue = idf.value; 
          }

          // keep the last selected element to insert repeatedly 
          this.myLastSelectedElementValue = insertValue; 
          FireinputUtils.insertCharAtCaret(target, insertValue);

          if(hideInput)
          {
             // also clear off the input bar 
             idf.value = ""; 
             var id = document.getElementById("fireinputIMEContainer");
	     id.hidePopup(); 
          }

          if(this.myNewPhraseArray && this.myNewPhraseArray.length > 0)
          {
             if(this.myInputChar.length > 0)
             {
                this.myNewPhraseArray.push({key: key, word: word, value: value}); 
             }
             this.myIME.storeUserPhrase(this.myNewPhraseArray); 
          }
          else
             this.myIME.updateFrequency(word, key);

          this.myInputChar = ""; 
          if(this.myNewPhraseArray)
          {
             this.myNewPhraseArray = null; 
             this.myNewPhraseKeyArray = null; 
          }
       }   
    },

    IMEWindowHiding: function()
    {
       // restore the focus to target if inputfield has been focused 
       if(this.myIMEInputFieldFocusedStatus)
       {
          FireinputUtils.setFocus(this.myTarget.target);
       }

       this.myIMEInputBarStatus = false; 
       this.myIMEInputFieldFocusedStatus = false; 
       this.hideAndCleanInput(); 
    },

    IMEWindowShown: function()
    {
       this.myIMEInputBarStatus = true; 
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

       this.myIMEInputFieldFocusedStatus = true; 
    },

    IMEInputFieldOnInputEvent: function(event)
    {
       if(!this.myIMEInputFieldFocusedStatus)
          return; 

       var idf = document.getElementById("fireinputField");
       // search current composed string status 
       // remove all after if one get changed 
       if(this.myNewPhraseArray && this.myNewPhraseArray.length > 0)
       {
          var currentWord = ""; 
          for(var i=0; i<this.myNewPhraseArray.length; i++)
          {
             var word = this.myNewPhraseArray[i]; 
             // don't use match. We have to match exactly word/position/length 
             if(idf.value.indexOf(word.value, currentWord.length) == -1)
             {
                idf.value = currentWord + this.myNewPhraseKeyArray[i];
                this.myNewPhraseArray.splice(i, this.myNewPhraseArray.length - i); 
                this.myNewPhraseKeyArray.splice(i, this.myNewPhraseArray.length - i); 
                break; 
             }

             // it's still valid, store it 
             currentWord += word.value; 
          }

          this.myInputChar = idf.value.substr(currentWord.length); 
       }
       else 
       {
          this.myInputChar = idf.value; 
       }

       this.findCharWithDelayAndValue(); 
    }, 
       
    prevSel: function (homeFlag)
    {
       if(!this.canPrevSel())
          return; 

       var idf = document.getElementById("fireinputField");
       
       // send to IME method to query the string 
       var codeArray = this.myIME.prev(homeFlag);
       // FireinputLog.debug(this,"call prev, length: " + codeArray.length); 
       if(!codeArray)
          this.disableSelButton(true, false); 
       else if(homeFlag || this.myIME.isBeginning())
          this.disableSelButton(true, false); 
       else
          this.disableSelButton(false, false); 
             
       this.sendStringToPanel(codeArray);
    },

    nextSel: function(endFlag)
    {
       if(!this.canNextSel())
          return; 

       var idf = document.getElementById("fireinputField");

       // send to IME method to query the string 
       var codeArray = this.myIME.next(endFlag); 
       // FireinputLog.debug(this,"call next, length: " + codeArray.length); 
       if(!codeArray || codeArray.length < 9)
          this.disableSelButton(false, true);
       else if (endFlag || this.myIME.isEnd())
          this.disableSelButton(false, true);
       else    
          this.disableSelButton(false, false);

       this.sendStringToPanel(codeArray);
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
 
    // the function is used when inputField is focused 
    findCharWithDelayAndValue: function()
    {
       if(this.myKeyTimer)
         clearTimeout(this.myKeyTimer);
       var idf = document.getElementById("fireinputField");
       if(idf.value.length ==0)
       {
          this.hideAndCleanInput(); 
          return;
       }

       var self = this;
       FireinputLog.debug(this, "this.myInputChar: " + this.myInputChar);
       this.myKeyTimer = setTimeout(function () { self.findChar(); }, 100);
    },

    findCharWithDelay: function()
    {
       if(this.myKeyTimer)
         clearTimeout(this.myKeyTimer); 
       var self = this; 
       this.myKeyTimer = setTimeout(function () { self.findChar(); }, 100); 
    },
  
    findChar: function()
    {
       if(this.myInputChar.length <= 0)
          return; 

       FireinputLog.debug(this, "Send key: " + this.myInputChar + "  => IME engine");
       FireinputLog.debug(this, "myIMEInputFieldFocusedStatus: " + this.myIMEInputFieldFocusedStatus); 
       // send to IME method to query the string 
       var codeArray = this.myIME.find(this.myInputChar);
       this.sendStringToPanel(codeArray);
       if(!codeArray || codeArray.length < 9)
          this.disableSelButton(true, true); 
       else if (this.myIME.isEnd())
          this.disableSelButton(true, true);
       else
          this.disableSelButton(true, false);
    },
  
    composeNewWord: function(event, num)
    {
       if(this.myIMEInputBarStatus)
       {
          event.preventDefault();
          event.stopPropagation(); 

          if(!this.myNewPhraseArray)
          {
             this.myNewPhraseArray = new Array(); 
             this.myNewPhraseKeyArray =  new Array(); 
          }

          elementName = "fireinputIMEList_label" + num;
          var elementId = document.getElementById(elementName);
          if(!elementId) 
             return; 

          var value = elementId.getAttribute("hiddenvalue");
          var key = elementId.getAttribute("hiddenkey");
          var word = elementId.getAttribute("hiddenword"); 

          this.myNewPhraseArray.push({key: key, word: word, value:value}); 
	  this.myNewPhraseKeyArray.push(this.myInputChar); 

	  var idf = document.getElementById("fireinputField");
          idf.value = idf.value.replace(this.myInputChar, ""); 
          idf.value += value; 

          this.myInputChar = ""; 
       }

    },

    displaySpecialCharPanel: function()
    {
      var element = document.getElementById("fireinputSpecialCharMenuItems");
      FireinputSpecialChar.addGroup(element); 
    }, 

    displayAjaxService: function()
    {
       FireinputEmotions.load(); 
    }, 

    insertSpecialCharAt: function(event)
    {
       var clickTarget = event.target;
       FireinputLog.debug(this, "value=" + clickTarget.value); 

       var target = document.commandDispatcher.focusedElement;
       var documentTarget = false; 
       if(target) 
       {
          if(!this.isTargetATextBox(target))
             return; 
       }
       else
       {
          // editable DOM document(iframe:designMode=On) 
          target = document.commandDispatcher.focusedWindow;
          if (target) {
             var editingSession = target.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                                  .getInterface(Components.interfaces.nsIWebNavigation)
                                  .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                                  .getInterface(Components.interfaces.nsIEditingSession);
             if (!editingSession.windowIsEditable(target))
                return;

             documentTarget = true;
           }
       }
       
       var inputTarget = {target: target, documentTarget: documentTarget};
 
       var value = clickTarget.getAttribute("hiddenvalue");
       if(!value)
          value = clickTarget.getAttribute("value"); 

       FireinputUtils.insertCharAtCaret(inputTarget, value); 
    },

    displayADString: function()
    {
       var ADString = "\n——————————————————————————\n"; 
       ADString += "火输中文输入法(Fireinput.com)"; 
       FireinputUtils.insertCharAtCaret(this.myTarget, ADString); 
    }
    

}; 

// Create event listener.
window.addEventListener('load', fireinput_onLoad, false);



// event handlers 
function fireinput_onLoad()
{
    Fireinput.initialize(); 
}

function fireinput_onKeyPress(event)
{
    Fireinput.keyPressListener(event);
}

function fireinput_onPopupShowing(event)
{
    Fireinput.fireinputContext(event);
}

function fireinput_onMouseDown(event)
{
    Fireinput.inputBarMouseDownListener(event); 
}

function fireinput_onMouseMove(event)
{
    Fireinput.inputBarMouseMoveListener(event); 
}

function fireinput_onMouseUp(event)
{
    Fireinput.inputBarMouseUpListener(event); 
}

