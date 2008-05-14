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
            {id: "fireinputContextEnhanceWordTable", strKey: "fireinput.wordtable.enhance", attribute: "label"},
            {id: "fireinputContextEnableIME", strKey: "fireinput.show.IME", attribute: "label"},
            {id: "fireinputContextSwitchEncoding", strKey: "fireinput.encoding.switch", attribute: "label"},
            {id: "fireinputContextSwitchZHToBG", strKey: "fireinput.encoding.zhtobg", attribute: "label"},
            {id: "fireinputContextSwitchBGToZH", strKey: "fireinput.encoding.bgtozh", attribute: "label"},
            {id: "menuPinyinQuan", strKey: "fireinput.pinyin.quan.label", attribute: "label"},
            {id: "menuPinyinShuangZiGuang", strKey: "fireinput.pinyin.shuang.ziguang.label", attribute: "label"},
            {id: "menuPinyinShuangMS", strKey: "fireinput.pinyin.shuang.ms.label", attribute: "label"},
            {id: "menuPinyinShuangChineseStar", strKey: "fireinput.pinyin.shuang.chinesestar.label", attribute: "label"},
            {id: "menuPinyinShuangSmartABC", strKey: "fireinput.pinyin.shuang.smartabc.label", attribute: "label"},
            {id: "menuWubi86", strKey: "fireinput.wubi86.label", attribute: "label"},
            {id: "menuWubi98", strKey: "fireinput.wubi98.label", attribute: "label"},
            {id: "menuCangjie5", strKey: "fireinput.cangjie5.label", attribute: "label"}, 
            {id: "fireinputIMEBarCloseButton", strKey: "fireinput.close.IME", attribute: "tooltiptext"},
            {id: "inputHistoryList", strKey: "fireinput.history.list", attribute: "label"},
            {id: "fireinputHelp", strKey: "fireinput.help.label", attribute: "label"},
            {id: "fireinputSearchButton", strKey: "fireinput.search.label", attribute: "value"},
            {id: "fireinputContextSelectImage", strKey: "fireinput.context.select.image", attribute: "label"}
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
    // last input key chars before composing a new phrase 
    myInputChar: "", 
    // last selected element to be used repeatedly 
    myLastSelectedElementValue: "", 
    // save user typing history 
    mySaveHistory: true, 
    // auto insertion if there is one choice 
    myAutoInsert: false, 
    // update word freq 
    myUpdateFreq: true, 

    // is compose mode 
    myComposeEnabled: false, 

    // half/full letter mode 
    myHalfMode: 0, 

    // half/full letter mode 
    myPunctMode: 0, 

    // allow Input Keys
    myAllowInputKey: "", 

    // IME Schema 
    myIMESchema: SMART_PINYIN, 

    // long table 
    myLongTable: null, 

    // removed ime panel - used to position switch 
    myRemovedFireinputPanel: null, 

    // fireinput init function. 
    initialize: function()
    {
       FireinputPref.addObserver(this, false);
       this.observeApplicationQuit(); 

       // register event listener to trigger when context menu is invoked.
       try 
       {
          document.getElementById('contentAreaContextMenu').addEventListener('popupshowing',
                                                                         fireinput_onPopupShowing,
                                                                         false);
       } catch(e) { }

       // initialize  the open hotkey 
       var handle = document.getElementById("key_enableFireinput"); 
       var openKey = FireinputPrefDefault.getOpenKeyBinding(); 
       if(/,/.test(openKey))
       {
           var openKeys = openKey.split(","); 
           if(handle) handle.setAttribute("modifiers", openKeys[0]); 
           if(handle) handle.setAttribute("keycode", openKeys[1]); 
       }
      
       // initialize IME bar position 
       this.initIMEBarPosition(); 
      
       this.disableIMEMenu(); 
       // initial default IME 
       this.myIME = this.getDefaultIME(); 

       // load long table 
       FireinputLongTable.init();

       // setup tooltips 
       this.loadIMEPref(); 

       // initialize Pref interfaces 
       fireinputPrefInit(); 

       this.loadIMEPrefByID("fireinputStatusBar", "fireinput.statusbar.tooltip.close", "tooltiptext"); 
       this.loadIMEPrefByID("fireinputStatusBar", "fireinput.statusbar.tooltip.open", "tooltiptext"); 

       // for first run only 
       FireinputVersion.checkFirstRun(); 
    },

    observeApplicationQuit: function()
    {
       // register an observer 
       var os = Components.classes["@mozilla.org/observer-service;1"]
                          .getService(Components.interfaces.nsIObserverService);
       os.addObserver(this, "quit-application-requested", false);
    }, 

    getDefaultIME: function(schema)
    {
       if(typeof(schema) == 'undefined')
          this.myIMESchema = FireinputPrefDefault.getSchema(); 
       else
          this.myIMESchema = schema; 

       var ime = null; 

       switch(this.myIMESchema)
       {
          case CANGJIE_5:
             ime = new Cangjie();
             if (!ime.isEnabled())
             {
                // if the default set is not valid, fall back to pinyin 
                if(typeof(schema) == 'undefined')
                   return this.getDefaultIME(SMART_PINYIN);
                return null; 
             }
          break; 
          case WUBI_86: 
          case WUBI_98: 
             ime = new Wubi(); 
             if(!ime.isEnabled())
             {
                // if the default set is not valid, fall back to pinyin 
                if(typeof(schema) == 'undefined')
                   return this.getDefaultIME(SMART_PINYIN);
                return null; 
             }
          break; 
          default:
             ime = new SmartPinyin(); 
             if(!ime.isEnabled() && typeof(schema) == 'undefined')
             {
                // if the default set is not valid, we search for other method in an order of wubi, canjei5 
                ime = this.getDefaultIME(WUBI_86) ||  this.getDefaultIME(CANGJIE_5); 
                return ime; 
             }
          break; 
       }

       ime.setSchema(this.myIMESchema); 
       ime.loadTable();
       this.myAllowInputKey = ime.getAllowedInputKey(); 
       return ime; 
    }, 

    disableIMEMenu: function()
    {
       var wime = new Wubi(); 
       if(!wime.isEnabled())
       {
          var handle = document.getElementById("menuWubi86"); 
          if(handle) handle.style.display = "none"; 
          var handle = document.getElementById("imeWubi86"); 
          if(handle) handle.style.display = "none"; 

          var handle = document.getElementById("menuWubi98"); 
          if(handle) handle.style.display = "none"; 
          var handle = document.getElementById("imeWubi98"); 
          if(handle) handle.style.display = "none"; 

       }
       var cime = new Cangjie();
       if(!cime.isEnabled())
       {
          var handle = document.getElementById("menuCangjie5");
          if(handle) handle.style.display = "none";
          var handle = document.getElementById("imeCangjie5");
          if(handle) handle.style.display = "none";
       }
       if(!wime.isEnabled() && !cime.isEnabled())
       {
          // autoinsert is only for wubi or cangjie 
          var handle = document.getElementById("autoInsert"); 
          if(handle) handle.style.display = "none"; 
       }
 
       var sime = new SmartPinyin(); 
       if(!sime.isEnabled())
       {
          var handle = document.getElementById("fireinputAMB"); 
          if(handle) handle.style.display = "none";

          var handle = document.getElementById("menuPinyinQuan"); 
          if(handle) handle.style.display = "none"; 
          var handle = document.getElementById("imePinyinQuan"); 
          if(handle) handle.style.display = "none"; 

          var handle = document.getElementById("menuPinyinShuangZiGuang"); 
          if(handle) handle.style.display = "none"; 
          var handle = document.getElementById("imePinyinShuangZiGuang"); 
          if(handle) handle.style.display = "none"; 

          var handle = document.getElementById("menuPinyinShuangMS"); 
          if(handle) handle.style.display = "none"; 
          var handle = document.getElementById("imePinyinShuangMS"); 
          if(handle) handle.style.display = "none"; 

          var handle = document.getElementById("menuPinyinShuangChineseStar"); 
          if(handle) handle.style.display = "none"; 
          var handle = document.getElementById("imePinyinShuangChineseStar"); 
          if(handle) handle.style.display = "none"; 

          var handle = document.getElementById("menuPinyinShuangSmartABC"); 
          if(handle) handle.style.display = "none"; 
          var handle = document.getElementById("imePinyinShuangSmartABC"); 
          if(handle) handle.style.display = "none"; 
       }
    },

    loadIMEPrefByID: function(id, strKey, attribute)
    {
       var defaultLanguage = FireinputPrefDefault.getInterfaceLanguage(); 

       var value = FireinputUtils.getLocaleString(strKey + defaultLanguage);
       var handle = document.getElementById(id);
       if(!handle)
          return; 
       if(id == "fireinputStatusBar")
       {
          value = FireinputKeyBinding.getOpenKeyStringReadable(value); 
          handle.setAttribute(strKey, value);
       }

       handle.setAttribute(attribute, value);
    }, 

    loadIMEPref: function(name)
    {
       // get default language first 

       if(!name || name == "interfaceLanguage")
       {
          var defaultLanguage = FireinputPrefDefault.getInterfaceLanguage(); 

          // update UI 
          for(var i =imeInterfaceUI.length-1; i>=0; i--)
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

          // refresh menu if language is changed 
          
          if(name)
          {
             FireinputSpecialChar.refreshMenu(); 
             FireinputEmotions.refreshMenu(); 
             fireinputPrefInit(); 
          }

          this.loadIMEPrefByID("fireinputToggleIMEButton", "fireinput.method.chinese.value", "label"); 
       } 
  
       //update value. The label of menu should be updated if language is changed  
       if(!name || name == "defaultInputMethod" || name == "interfaceLanguage")
       {  
          var value = this.myIMESchema; 
          if(name == "defaultInputMethod")
             value = FireinputPrefDefault.getSchema(); 

          var element = document.getElementById("inputMethod"); 
          element.setAttribute("label", this.getIMENameString(value)); 
          element.setAttribute("value", value); 
          // only toggle input method if the setting has been updated 
          if(name == "defaultInputMethod")
             this.toggleInputMethod();
       }

       if(!name || name == "saveHistory")
       { 
          this.mySaveHistory = FireinputPrefDefault.getSaveHistory(); 
       }

       if(!name || name == "autoInsert")
       {
          this.myAutoInsert = FireinputPrefDefault.getAutoInsert(); 
       }

       if(!name || name == "updateFreq")
       {
          this.myUpdateFreq = FireinputPrefDefault.getUpdateFreq(); 
       }

       if(name && name == 'IMEBarPosition')
       {
          this.toggleIMEBarPosition(); 
       }
        
    },


    toggleFireinput: function(forceOpen, forceLoad)
    {
       var pos = FireinputPrefDefault.getIMEBarPosition();
       var id = document.getElementById("fireinputIMEBar_" + pos); 
       var toggleOff = forceOpen == undefined ? !id.hidden : !forceOpen;
       id.hidden = toggleOff; 
       this.myRunStatus = !toggleOff;  	

       if(!toggleOff)
       {
          var h = document.getElementById("fireinputStatusBar"); 
          if(h && h.hasAttribute("fireinput.statusbar.tooltip.close"))
             h.setAttribute("tooltiptext", h.getAttribute("fireinput.statusbar.tooltip.close")); 
          else 
             this.loadIMEPrefByID("fireinputStatusBar", "fireinput.statusbar.tooltip.close", "tooltiptext"); 

	  window.addEventListener('keypress', fireinput_onKeyPress, true);
	  window.addEventListener('keydown', fireinput_onKeyDown, true);
	  window.addEventListener('keyup', fireinput_onKeyUp, true);
	  this.myInputStatus = true; 
          this.setInputMode(ENCODING_ZH);
          this.displayAjaxService(forceLoad==undefined ? false : forceLoad);
       }
       else
       { 
          // close the IME inputbar 
          if(this.myIMEInputBarStatus)
          {
             this.hideAndCleanInput(); 
          }
          this.resetIME(); 

          var h = document.getElementById("fireinputStatusBar"); 
          if(h && h.hasAttribute("fireinput.statusbar.tooltip.open"))
             h.setAttribute("tooltiptext", h.getAttribute("fireinput.statusbar.tooltip.open")); 
          else 
             this.loadIMEPrefByID("fireinputStatusBar", "fireinput.statusbar.tooltip.open", "tooltiptext"); 
          window.removeEventListener('keypress', fireinput_onKeyPress, true);
          window.removeEventListener('keydown', fireinput_onKeyDown, true);
          window.removeEventListener('keyup', fireinput_onKeyUp, true);
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
          window.removeEventListener('keydown', fireinput_onKeyDown, true);
          window.removeEventListener('keyup', fireinput_onKeyUp, true);
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
          window.addEventListener('keydown', fireinput_onKeyDown, true);
          window.addEventListener('keyup', fireinput_onKeyUp, true);
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

       var method = document.getElementById("inputMethod").getAttribute("value"); 
       if(this.myIMESchema == method)
          return; 

       if(method == WUBI_86 || method == WUBI_98)
       {
          this.myIME = null; 
          this.myIME = new Wubi(); 
          this.myIME.setSchema(method); 
          this.myIME.loadTable(); 
       }
       else if(method == CANGJIE_5)
       {
          this.myIME = null;
          this.myIME = new Cangjie();
          this.myIME.setSchema(method);
          this.myIME.loadTable();
       }
       else if(this.myIMESchema == WUBI_86 || 
               this.myIMESchema == WUBI_98 || 
               this.myIMESchema == CANGJIE_5)
       {
          // we need to load table only if the current schema is not pinyin schema. Otherwise just set new schema 
          this.myIME = null; 
          this.myIME = new SmartPinyin(); 
          this.myIME.setSchema(method); 
          this.myIME.loadTable(); 
       }   
       else
          this.myIME.setSchema(method); 
              
       this.myIMESchema = method; 

       // enable zh input 
       this.setInputMode(ENCODING_ZH); 

       this.myAllowInputKey = this.myIME.getAllowedInputKey(); 
       if(!this.myIME.isSchemaEnabled())
       { 
          alert("火输中文输入: 对不起,此输入法字库没有安装,请到http://www.fireinput.com/forum/ 去下载字库"); 
          return; 
       }
    }, 

    getModeString: function(mode)
    {
       for(var i=imeInputModeValues.length-1; i>=0; i--)
       {
          if(mode == imeInputModeValues[i].name)
             return imeInputModeValues[i].label; 
       }

       // otherwise return first one 
       return imeInputModeValues[0].label; 

    },

    getIMENameString: function(value)
    {
       var defaultLanguage = FireinputPrefDefault.getInterfaceLanguage(); 
       switch(value)
       {
          case SMART_PINYIN: 
          default: 
             return FireinputUtils.getLocaleString('fireinput.pinyin.quan.label' + defaultLanguage); 
          break; 
          case ZIGUANG_SHUANGPIN: 
             return FireinputUtils.getLocaleString('fireinput.pinyin.shuang.ziguang.label' + defaultLanguage); 
          break; 
          case MS_SHUANGPIN: 
             return FireinputUtils.getLocaleString('fireinput.pinyin.shuang.ms.label' + defaultLanguage); 
          break; 
          case CHINESESTAR_SHUANGPIN: 
             return FireinputUtils.getLocaleString('fireinput.pinyin.shuang.chinesestar.label' + defaultLanguage); 
          break; 
          case SMARTABC_SHUANGPIN: 
             return FireinputUtils.getLocaleString('fireinput.pinyin.shuang.smartabc.label' + defaultLanguage); 
          break; 
          case WUBI_86: 
             return FireinputUtils.getLocaleString('fireinput.wubi86.label' + defaultLanguage); 
          break; 
          case WUBI_98: 
             return FireinputUtils.getLocaleString('fireinput.wubi98.label' + defaultLanguage); 
          break; 
          case CANGJIE_5: 
             return FireinputUtils.getLocaleString('fireinput.cangjie5.label' + defaultLanguage); 
          break; 
       }

       return "";
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
 
    toggleIMEMode: function()
    {
       if(this.myIMEMode == IME_MODE_ZH)
          this.setIMEMode(IME_MODE_EN); 
       else
          this.setIMEMode(IME_MODE_ZH); 
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

    fireinputContext: function()
    {
       document.getElementById('fireinputContextEnableIME').hidden = (!(gContextMenu.onTextInput) || Fireinput.myRunStatus);
       document.getElementById('fireinputContextSelectImage').hidden = !(gContextMenu.onImage);
       // init add table menu 
       var hidden = !(gContextMenu.isTextSelected); 
       if(!hidden)
       {
          var selectedText = FireinputLongTable.showSelection(); 
          if(!selectedText)
          { 
             document.getElementById('fireinputContextEnhanceWordTable').hidden = !hidden; 
             return; 
          }
          var defaultLanguage = FireinputPrefDefault.getInterfaceLanguage();
          var value = FireinputUtils.getLocaleString("fireinput.wordtable.enhance" + defaultLanguage);

          var handle = document.getElementById('fireinputContextEnhanceWordTable'); 
          label = value + '"' + selectedText + '"'; 
          handle.setAttribute("label", label); 
          handle.hidden = hidden; 
      }
      else
          document.getElementById('fireinputContextEnhanceWordTable').hidden = hidden; 
    },

    // all Observers
    observe: function(subject, topic, data)
    {
       if(topic == "quit-application-requested")
       {
          if(this.myIME)
             this.myIME.flushUserTable(); 
       }

       if(topic == "nsPref:changed")
       {
          var name = data.substr(prefDomain.length+1);
          this.updatePref(name);
       }
    },

    updatePref: function(name)
    {
	this.loadIMEPref(name);
    },

    enableComposeEditor: function(flag)
    {
       this.myComposeEnabled = flag; 
    }, 

    initIMEBarPosition: function()
    {
       var pos = FireinputPrefDefault.getIMEBarPosition();
       var rempos = (pos == IME_BAR_BOTTOM) ? IME_BAR_TOP : IME_BAR_BOTTOM; 

       var el = document.getElementById("fireinputIMEBar_" + rempos); 
       if(el.firstChild) 
       {
          this.myRemovedFireinputPanel = el.removeChild(el.firstChild); 
       } 
    }, 

    toggleIMEBarPosition: function()
    {
       var pos = FireinputPrefDefault.getIMEBarPosition();
       var rempos = (pos == IME_BAR_BOTTOM) ? IME_BAR_TOP : IME_BAR_BOTTOM;

       var oldPanel = null; 
       var el = document.getElementById("fireinputIMEBar_" + rempos);
       if(el.firstChild)
       {
          oldPanel = el.removeChild(el.firstChild); 
       }
       el.hidden = true; 

       // if sth wrong. don't proceed 
       if(!oldPanel)
          return; 

       // new position 
       el = document.getElementById("fireinputIMEBar_" + pos); 
       if(!el.firstChild)
       {
          el.appendChild(this.myRemovedFireinputPanel); 
       }
       el.hidden = false;
        
       this.myRemovedFireinputPanel = oldPanel; 

       this.disableIMEMenu();
       this.loadIMEPref();

       // initialize Pref interfaces 
       fireinputPrefInit();

       this.toggleFireinput(true, true);
       
    }, 

    isTargetATextBox : function ( node )
    {
       if(!node)
          return 0; 

       if (node instanceof HTMLInputElement)
          return (node.type == "text" || node.type == "password")

       return (node instanceof HTMLTextAreaElement);
    },

    isValidTarget: function(event)
    {
       var documentTarget = false; 
       var target = event.explicitOriginalTarget; 
       if(target == null)
          target = event.target;

       if(target == null || (target && target.type == "password"))
          return {target: target, valid: false, documentTarget: documentTarget};

       if(target instanceof XULElement && target.id == "urlbar")
          return {target: target, valid: false, documentTarget: documentTarget};

       if(target.hasAttribute('nofireinput'))
          return {target: target, valid: false, documentTarget: documentTarget};

       if(!target.setSelectionRange)
       {
          var wrappedTarget = document.commandDispatcher.focusedElement;

          if(wrappedTarget instanceof HTMLInputElement || 
             wrappedTarget instanceof HTMLTextAreaElement)
          {
             if(!this.isTargetATextBox(wrappedTarget))
                return {target: target, valid: false, documentTarget: documentTarget};
             else if(wrappedTarget.tagName == 'html:input' || wrappedTarget.tagName == 'html:textarea')
             {
                //xul window input element 
                wrappedTarget.boxObject = target.boxObject; 
                if(wrappedTarget.type == 'password')
                   return {target: wrappedTarget, valid: false, documentTarget: documentTarget};
                else
                   return {target: wrappedTarget, valid: true, documentTarget: documentTarget};
             }
                     
          }
          else 
          {
            var twin = document.commandDispatcher.focusedWindow;
             if (twin) {
                var editingSession = twin.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                                     .getInterface(Components.interfaces.nsIWebNavigation)
                                     .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                                     .getInterface(Components.interfaces.nsIEditingSession);
                if (!editingSession.windowIsEditable(twin))
                   return {target: target, valid: false, documentTarget: documentTarget};

                documentTarget = true; 
             }
             // oTarget is only will be used in editor mode 
             return {target: twin, valid: true, documentTarget: documentTarget};
          }
        }
        else if(target.readOnly)
           return {target: target, valid: false, documentTarget: documentTarget};

        return {target: target, valid: true, documentTarget: documentTarget};

    }, 

    keyUpListener: function(event)
    {
      if(!this.myRunStatus || this.myIMEInputBarStatus)
          return;

       var target = this.isValidTarget(event);

       if(!target.valid)
          return;

       if(event.keyCode == KeyEvent.DOM_VK_SHIFT && event.charCode == 0 && this.myChangeIMEModeEvent)
       {
          this.myChangeIMEModeEvent = false;
          if(this.myIMEMode == IME_MODE_ZH)
          {
             this.setIMEMode(IME_MODE_EN);
             return;
          }
          else
          {
             this.setIMEMode(IME_MODE_ZH);
             return;
          }
       }
    }, 

    keyDownListener: function(event)
    {
       if(!this.myRunStatus)
	  return; 

       if(this.myIMEInputBarStatus)
       {
          // Add fix for FCKeditor enter key issue 
          if(event.keyCode == KeyEvent.DOM_VK_RETURN || 
             event.keyCode == KeyEvent.DOM_VK_SPACE)
             event.preventDefault();
             event.stopPropagation(); 
          return; 
       }
 
       // focus search box event 
       if(event.keyCode == KeyEvent.DOM_VK_F4)
       {
          FireinputWebSearch.focusSearchbox(); 
          return; 
       } 

       var target = this.isValidTarget(event); 

       if(!target.valid)
          return; 

       if(event.keyCode == KeyEvent.DOM_VK_SHIFT && event.charCode == 0)
       {
          this.myChangeIMEModeEvent = true; 
       }

    },  

    keyPressListener: function(event)
    {

       var targetInfo = this.isValidTarget(event); 
       if(!targetInfo.valid)      
          return; 

       var target = targetInfo.target; 
       var documentTarget = targetInfo.documentTarget; 

       var keyCode = event.keyCode;
       var charCode = event.charCode; 

        // if shift key and other key has been pressed together, reset the IMEmode back 
        if(event.shiftKey && (event.altKey || event.ctrlKey || keyCode || charCode))
        {
            this.myChangeIMEModeEvent = false; 
        }

	// we don't use alt/shift key 
        // should be used to handle the long list string 
	if(event.altKey && !event.shiftKey)
        {
           // handle ctrl + alt + f to insert Fireinput Ad
           if(event.ctrlKey && String.fromCharCode(charCode) == 'f')
           {
              this.displayADString(); 
	      return; 
           }

           if(keyCode == KeyEvent.DOM_VK_RETURN)
           {
              FireinputWebSearch.load(); 
	      return; 

           }
           return; 
        }
 
       // check some key if control is pressed 
       if(event.ctrlKey && this.myIMEInputBarStatus)
       {
          // ctrl + number: choose a long table 
          if(charCode > KeyEvent.DOM_VK_0 && charCode <= KeyEvent.DOM_VK_5)
          {
             event.preventDefault();
             event.stopPropagation(); 
             FireinputLongTable.insertCharToTarget(String.fromCharCode(charCode)); 
          } 
          return;
       }

       // return if these keys are pressed 
       if(event.altKey || event.ctrlKey)
          return; 

	// ESC: clean up the input. Press twice will close input window
	if(keyCode == KeyEvent.DOM_VK_ESCAPE)
	{
	  if(this.myIMEInputBarStatus)
	  {
             event.preventDefault();
             event.stopPropagation(); 
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

          if(this.myComposeEnabled || this.myIMEInputFieldFocusedStatus)
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

          if(this.myComposeEnabled)
             return;

          if(this.myIMEInputFieldFocusedStatus)
          {
             var idf = document.getElementById("fireinputField");
             if(idf.selectionEnd < idf.value.length)
             {
               this.myInputChar = idf.value;
               this.findCharWithDelay();
             }
             return;
          }

          event.preventDefault();
	  this.nextSel("END"); 
	  return; 
       }
	
       // F2: repeat the previous selection 
       // FireinputLog.debug(this,"keyCode:" + keyCode + ", charCode: " + charCode); 
       // FireinputLog.debug(this,"charCode string:" + String.fromCharCode(charCode)); 

       // the IME mode needs to be reset if the target has changed 
       if(this.myTarget && this.myTarget.target != target)
          this.setIMEMode(IME_MODE_ZH);

       // keep the real event and target if inputfield has been focused 
       if(!this.myIMEInputFieldFocusedStatus && !this.myComposeEnabled &&(!this.myTarget || (this.myTarget.target != target)))
       {
          this.myEvent = event; 
          this.myTarget = {target: target, documentTarget: documentTarget}; 
       }
       // remember the caret position before focus switch 
       // only for HTMLInputElement or TextAreaElement 
       if(target.setSelectionRange)
       {
          this.myTarget.selectionStart = this.myTarget.target.selectionStart; 
          this.myTarget.selectionEnd =  this.myTarget.target.selectionEnd; 
          if(typeof(this.myTarget.focused) == 'undefined')
            this.myTarget.focused = 0; 
       }

       if(keyCode == KeyEvent.DOM_VK_F2)
       {
	  if(this.myIMEInputBarStatus)
             return; 

          event.preventDefault();
	  // FireinputLog.debug(this,"F2: " + this.myLastSelectedElementValue); 
          FireinputUtils.insertCharAtCaret(this.myTarget, this.myLastSelectedElementValue);
          // add into long table 
          if(this.mySaveHistory)
             FireinputLongTable.addIntoLongTable(this.myTarget.target, this.myLastSelectedElementValue);

	  return; 
	}

       //left arrow key. 
       if(keyCode == KeyEvent.DOM_VK_LEFT)
       {
          // inputField is focused 
          if(this.myComposeEnabled)
             return; 
	  var idf = document.getElementById("fireinputField");
	  //FireinputLog.debug(this,"idf.value:" + idf.value);
          if(idf.selectionStart <= 1)
          {
             // it's at the beginning 
             if(FireinputComposer.hasSet())
             {
                // the composer is formed. Now we need to disable last composed word 
                var key = FireinputComposer.removeLastFromPanel();
                if(key)
                {
                   var pos = key.length+1; 
                   idf.value = key + idf.value;
                   idf.setSelectionRange(pos, pos)
                   this.myInputChar = key; 
                   this.findCharWithDelay();
                }
             }
          }
          else 
          {
             // there are still some room on the left. Show the selected word from 0 until this position 
             var subInputKeys = idf.value.substring(0, idf.selectionStart-1); 
	     FireinputLog.debug(this,"subInputKeys:" + subInputKeys);
             this.myInputChar = subInputKeys; 
             this.findCharWithDelay(); 
          }

       }
   
       //right arrow key. 
       if(keyCode == KeyEvent.DOM_VK_RIGHT)
       {
          // inputField is focused 
          if(this.myComposeEnabled)
             return; 
          var idf = document.getElementById("fireinputField");
          if((idf.selectionEnd+1) <= idf.value.length)
          {  
             // there are still some room on the right. Show the selected word from 0 until this position 
             var subInputKeys = idf.value.substring(0, idf.selectionEnd+1); 
             this.myInputChar = subInputKeys; 
             this.findCharWithDelay(); 
          }
       }  
 
           
       // backspace: remove the input bar. If the input bar is empty, remove target value 
       if(keyCode == KeyEvent.DOM_VK_BACK_SPACE)
       {
          // inputField is focused 
          if(this.myComposeEnabled)
             return; 

        //  if(this.myIMEInputFieldFocusedStatus && !FireinputComposer.hasSet())
          if(this.myIMEInputFieldFocusedStatus)
          {
             return;
          }

          var id = document.getElementById("fireinputIMEContainer"); 
	  if(this.myIMEInputBarStatus)
	  {
	     var idf = document.getElementById("fireinputField");
	     if(idf.value.length ==0 && !FireinputComposer.hasSet())
             {
                id.hidePopup(); 
             }
             else
             {
                event.preventDefault();

                this.myInputChar = idf.value; 

/*
                if(this.myInputChar.length > 0)
                {
                   this.myInputChar = this.myInputChar.substring(0, this.myInputChar.length-1); 
                   idf.value = idf.value.substring(0, idf.value.length -1 );
                }
*/
                // if the caret is not at the end of position, only select the char from 0 to this position 
                if(this.myInputChar.length <= 0)
                {
                   var key = FireinputComposer.removeLastFromPanel(); 
                   if(key)
                   { 
                      idf.value = key; 
                      this.myInputChar = key; 
                   }
                   else 
                      idf.value = ""; 
                }
                else if(idf.selectionStart != idf.value.length)
                {
                   var subInputKeys = idf.value.substring(0, idf.selectionStart); 
                   this.myInputChar = subInputKeys; 
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
          if(!this.myIMEInputBarStatus)
          {
             if(this.mySaveHistory)
                FireinputLongTable.flushLongTable();
             return; 
          }

          if(this.myComposeEnabled)
          {
             this.insertCharToComposer(event, 1, "false"); 
          }
          else 
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
             var idf = document.getElementById("fireinputField");
             if(this.myComposeEnabled)
             {
                this.insertCharToComposer(event, 1, "false"); 
             }
             else if(idf.selectionEnd < idf.value.length)
             {
                // there are still some room on the left. Show the selected word from 0 until this position 
                var subInputKeys = idf.value.substring(idf.selectionEnd, idf.value.length); 
                var result = this.getCharByPos(1);
                if(result)
                {
                   FireinputComposer.addToPanel("false", result);
                }

                // update inputField value and caret position 
                idf.value = subInputKeys; 
                this.myInputChar = subInputKeys.substring(0, 1); 
                FireinputUtils.setCaretTo(idf, 1); 
                this.findCharWithDelay(); 
                // space key should be surpressed 
                event.preventDefault();
                event.stopPropagation();
              }
              else            
                this.insertCharToTarget(event, this.myTarget, 1, true);

	     return; 
          }
          // return here otherwise some rich editor might be broken 
          return;
	}

	// 1..2..9
	if(charCode > KeyEvent.DOM_VK_0 && charCode <= KeyEvent.DOM_VK_9)
	{
          if(this.myIMEInputBarStatus)
          {
             var idf = document.getElementById("fireinputField");
             if(this.myComposeEnabled)
             {
                this.insertCharToComposer(event, key, "false"); 
             }
             else if(idf.selectionEnd < idf.value.length)
             {
                // there are still some room on the left. Show the selected word from 0 until this position 
                var subInputKeys = idf.value.substring(idf.selectionEnd, idf.value.length); 
                var result = this.getCharByPos(key);
                if(result)
                {
                   FireinputComposer.addToPanel("false", result);
                }

                // update inputField value and caret position 
                idf.value = subInputKeys; 
                this.myInputChar = subInputKeys.substring(0, 1); 
                FireinputUtils.setCaretTo(idf, 1); 
                this.findCharWithDelay(); 
                // number key should be surpressed 
                event.preventDefault();
                event.stopPropagation();

             }
             else 
                this.insertCharToTarget(event, this.myTarget, key, true);

	     return; 
          }
	}

       // small case a-z 
       if(this.myAllowInputKey.indexOf(key) >= 0 && !event.shiftKey)
       { 
          // inputField is enabled, allow the input and send delay searching 
          // after the inputField is enabled, we rely on onInput event for findChar
          // So here we just simply return back if the key is valid 
          if(this.myIMEInputFieldFocusedStatus || this.myComposeEnabled)
          {
             return;
          }

          event.preventDefault();
	  // open IME input window 

          if(!this.myIMEInputBarStatus) 
          {
             // reset popupNode to fix inputbar popup position issue 
             document.popupNode = null;
	     var xpos = 0; 
	     var ypos = 0; 
	     if(target.boxObject)
	     {
                var id = document.getElementById("fireinputIMEContainer"); 
                xpos = target.boxObject.screenX;
	        ypos = target.boxObject.screenY + target.boxObject.height+10;
                id.showPopup(document.documentElement, xpos, ypos, "popup", null, null); 
	     }
	     else if(!documentTarget)
	     {
	        // HTML input/textarea element 
	        xpos = FireinputUtils.findPosX(target) -  
                       FireinputUtils.getDocumentScrollLeft(document.commandDispatcher.focusedWindow); 
	        ypos = FireinputUtils.findPosY(target) - 
                       FireinputUtils.getDocumentScrollTop(document.commandDispatcher.focusedWindow); 

                ypos += target.clientHeight; 

                // get FF header height/position 
                var h = document.getElementById("navigator-toolbox");
	        xpos += h.boxObject.screenX; 
	        ypos += h.boxObject.screenY + h.boxObject.height + 10; 

                // care about tab header 
                if(gBrowser.getStripVisibility())
                {
                   ypos += gBrowser.mStrip.boxObject.height;
                }

	        if(ypos > (window.innerHeight - 20))
                   ypos = window.innerHeight - 20; 

                if(ypos <= 20)
                   ypos = 20; 
	        //FireinputLog.debug(this,"xpos:" + xpos); 
	        //FireinputLog.debug(this,"ypos:" + ypos); 
	        //FireinputLog.debug(this,"window.screenY:" + window.screenY); 
	        //FireinputLog.debug(this,"window.screenX: " + window.screenX); 
	        //FireinputLog.debug(this,"window.innerHeight:" + window.innerHeight); 
	        //FireinputLog.debug(this,"window.innerWidth:" + window.innerWidth); 
	        //FireinputLog.debug(this,"window.outerHeight:" + window.outerHeight); 
	        //FireinputLog.debug(this,"window.outerWidth:" + window.outerWidth); 
	        var id = document.getElementById("fireinputIMEContainer"); 
                id.showPopup(document.documentElement, xpos, ypos, "popup", null, null); 
	     
	     }
             else 
             {
                // rich editor 
                var p = target.frameElement; 

	        xpos = FireinputUtils.findPosX(p);
	        ypos = FireinputUtils.findPosY(p);

	        //FireinputLog.debug(this,"xpos: " + xpos + ",ypos: " + ypos); 
                var scrollLeft = p.ownerDocument.body ? p.ownerDocument.body.scrollLeft : 
                                 (p.contentWindow.document.body ? p.contentWindow.document.body.scrollLeft : 0); 
                var scrollTop = p.ownerDocument.body ? p.ownerDocument.body.scrollTop : 
                                 (p.contentWindow.document.body ? p.contentWindow.document.body.scrollTop : 0); 

	        xpos = xpos - scrollLeft; 
	        ypos = ypos - scrollTop; 

	        xpos += window.screenX; 
	        ypos += window.screenY + 20; 
	        if(ypos > (window.innerHeight - 20))
                  ypos = window.innerHeight - 20; 

                if(ypos <= 20)
                  ypos = 20; 

	        //FireinputLog.debug(this,"xpos:" + xpos); 
	        //FireinputLog.debug(this,"ypos:" + ypos); 

	        //FireinputLog.debug(this,"p.ownerDocument.documentElement:" + p.ownerDocument.documentElement); 
	        var id = document.getElementById("fireinputIMEContainer"); 
                id.showPopup(document.documentElement, xpos, ypos, "popup", null, null); 
             }
          } 

	  var idf = document.getElementById("fireinputField");
          this.myInputChar += key; 
	  idf.value += key; 
	  FireinputLog.debug(this,"idf.value:" + idf.value);
	  //The findchar will be invoked thought onfocus event 
	  this.findChar();
	  return; 
       }
        
        // use single quot to separate pinyin input 
        if(this.myIMEInputBarStatus)
        {
          if(key == "'" && !this.myIMEInputFieldFocusedStatus && !this.myComposeEnabled)
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

          // won't allow any other chars if IME inputbar is opened 
          if(key != "'")  // && (this.myIMEInputFieldFocusedStatus || this.myComposeEnabled))
          {
             event.preventDefault();
             event.stopPropagation(); 
          }
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
         
          // time to flush long table 
          if(this.mySaveHistory)
             FireinputLongTable.flushLongTable();    
        }
             
    },

    sendStringToPanel: function(codeArray, inputKey)
    {
       if(!codeArray || codeArray.length <= 0)
       {
          this.hideChars(); 
          return; 
       }

       var inputPanelElement = document.getElementById('fireinputIMEList'); 
       // FireinputLog.debug(this,"codeArray: " + this.myIME.getKeyWord(codeArray)); 
       var codeArrayLength = codeArray.length; 
       for (var i = 0; i < codeArrayLength; i++)
       {
          var codeValue = "";
          if(typeof(codeArray[i].encodedWord) != 'undefined')
             codeValue = codeArray[i].encodedWord.replace(/[\d\.]+$/g, ''); 
          else
             codeValue = FireinputUnicode.getUnicodeString(codeArray[i].word.replace(/[\d\.]+$/g, '')); 
             
          var elementId = "fireinputIMEList_label" + (i+1); 
          if(document.getElementById(elementId))
          {
              var element = document.getElementById(elementId); 
              element.setAttribute("value",  (i+1) + '.' + codeValue);
              element.setAttribute("tooltiptext", "键: " + codeArray[i].key+"/右点搜索“"+codeValue+"”");
              element.setAttribute("hiddenvalue", codeValue);
              element.setAttribute("hiddenkey", codeArray[i].key);
              element.setAttribute("hiddeninputkey", inputKey);
              element.setAttribute("hiddenword", codeArray[i].word);
              element.setAttribute("ufreq", (typeof(codeArray[i].ufreq) == 'undefined') ? 'true' : codeArray[i].ufreq);
              continue; 
          }
               
           var element = document.createElement("label"); 
           element.setAttribute("value",  (i+1) + '.' + codeValue);
           element.setAttribute("tooltiptext", "键: " + codeArray[i].key+"/右点搜索“"+codeValue+"”");
           element.setAttribute("hiddenvalue", codeValue);
           element.setAttribute("hiddenkey", codeArray[i].key);
           element.setAttribute("hiddeninputkey", inputKey);
           element.setAttribute("hiddenword", codeArray[i].word);
           element.setAttribute("ufreq", (typeof(codeArray[i].ufreq) == 'undefined') ? 'true' : codeArray[i].ufreq);

           element.setAttribute("id", elementId); 
           element.setAttribute("class", "charinputlabel"); 
           var self = this; 
           element.onclick = function(event) { self.insertCharToComposerByMouse(event);}; 
           inputPanelElement.appendChild(element);
       }

       // hide all other values 
       this.hideChars(codeArray.length); 

       // check whether it needs to enable auto insertion 
       if(this.myAutoInsert && this.myIME.canAutoInsert() && codeArray.length == 1)
          this.insertCharToTarget(this.myEvent, this.myTarget, 1, true);

       // add long table  to panel 
       FireinputLongTable.addToPanel(); 
    },
 
    hideAndCleanInput: function()
    {
       var idf = document.getElementById("fireinputField");
       idf.value = ""; 
       this.myInputChar = ""; 


       // hide all old chars 
       this.hideChars(0); 
       if(this.myIMEInputBarStatus)
       { 
          var id = document.getElementById("fireinputIMEContainer"); 
          id.hidePopup(); 
       }
    }, 


    hideChars: function(start)
    {
       start = start || 0; 

       for (var i = 9; i >= start; i--)
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
       if(this.myIMEInputBarStatus)
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

       if(!this.myIME.canComposeNew() || !FireinputComposer.hasSet())
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
       FireinputUtils.insertCharAtCaret(this.myTarget, charstr);
       // add into long table 
       if(this.mySaveHistory)
          FireinputLongTable.addIntoLongTable(this.myTarget.target,charstr);
    }, 

    insertCharToTarget: function (event, target, i, hideInput)
    {
       if(this.myIMEInputBarStatus)
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
             this.insertAllCharsToTarget(target, hideInput); 
             return; 
          }

          var value = elementId.getAttribute("hiddenvalue");
          var key = elementId.getAttribute("hiddenkey");
          var word = elementId.getAttribute("hiddenword"); 
          var ufreq = elementId.getAttribute("ufreq") == 'true' ? true : false; 
          if(value.length <= 0 || key.length <= 0 || word.length <= 0)
          {
             this.insertAllCharsToTarget(target, hideInput); 
             return; 
          }

          this.insertAllCharsToTarget(target, hideInput, {key: key, word: word, value: value, ufreq: ufreq}); 
       }
    }, 

    insertAllCharsToTarget: function (target, hideInput, keyWordResult)
    {
       if(this.myIMEInputBarStatus)
       {
          var value = "";
          var key = ""; 
          var word = ""; 
          var ufreq = true; 
          if(keyWordResult)
          {
             value = keyWordResult.value; 
             key = keyWordResult.key; 
             word = keyWordResult.word; 
             ufreq = keyWordResult.ufreq; 
          }

          var insertValue = value; 
          var composeWord = FireinputComposer.getComposeWord(); 
          if(composeWord.key.length <= 0 && key.length <= 0)
             return; 

          insertValue = composeWord.value + insertValue; 


          // hide the inputbar after everything is written 
          if(hideInput)
          {
             // also clear off the input bar 
             var idf = document.getElementById("fireinputField");
             idf.value = ""; 
             var id = document.getElementById("fireinputIMEContainer");
	     id.hidePopup(); 
          }

          // keep the last selected element to insert repeatedly 
          this.myLastSelectedElementValue = insertValue; 
          FireinputUtils.insertCharAtCaret(target, insertValue);

          // reset inputChar
          this.myInputChar = ""; 

          //FireinputLog.debug(this, "word: " + word + ", key: " + key + ", ufreq: " +  ufreq); 
          // update the frequency or save as new word 
          if(composeWord.key.length > 0)
          {
             var newPhraseArray = []; 

             newPhraseArray.push({key: composeWord.key + " " + key, word: composeWord.word + word}); 
             //FireinputLog.debug(this, "newPhraseArray: " + composeWord.key + " " + key + ", word: " +  composeWord.word + word); 
             this.myIME.storeUserPhrase(newPhraseArray); 
          }
          else if(this.myUpdateFreq && ufreq)
             this.myIME.updateFrequency(word, key);

          if(this.mySaveHistory)
             FireinputLongTable.addIntoLongTable(target.target, insertValue);
       }   
    },

    IMEWindowHiding: function()
    {
       // restore the focus to target if inputfield has been focused 
       if(this.myIMEInputFieldFocusedStatus || this.myComposeEnabled)
       {
          FireinputUtils.setFocus(this.myTarget.target);
          this.myTarget.focused = 1; 
       }

       FireinputComposer.reset(); 
       FireinputLongTable.hidePanel(); 
       this.myIMEInputBarStatus = false; 
       this.myIMEInputFieldFocusedStatus = false; 
       this.hideAndCleanInput(); 
    },

    IMEWindowShown: function()
    {
       this.myIMEInputBarStatus = true; 
       FireinputUtils.setFocus(document.getElementById("fireinputField"));
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
       FireinputLog.debug(this, "idf.value: " + idf.value);
       if(idf.value.length <= 0)
          return; 
       // FireinputLog.debug(this, "send findChar from IMEInputFieldFocusEvent");
       this.findChar(); 
    },

    IMEInputFieldOnInputEvent: function(event)
    {
       if(!this.myIMEInputFieldFocusedStatus)
          return; 

       var idf = document.getElementById("fireinputField");

       // search current composed string status 
       // remove all after if one get changed 
       if(idf.value.length <= 0)
       {
          var composedLastKey = FireinputComposer.removeLastFromPanel();
          idf.value = composedLastKey;
          this.myInputChar = composedLastKey;
          if(idf.value.length <=0)
          {
             this.hideAndCleanInput();
             return; 
          }
       }
       else
       {
          var subInputKeys = idf.value.substring(0, idf.selectionStart);
          this.myInputChar = subInputKeys;
       }

       // FireinputLog.debug(this, "send findCharWithDelay from OnInputEvent");
       this.findCharWithDelay(); 
    }, 
       
    prevSel: function (homeFlag)
    {
       if(!this.canPrevSel())
          return; 

       var idf = document.getElementById("fireinputField");
       
       // send to IME method to query the string 
       var result = this.myIME.prev(homeFlag);
       // FireinputLog.debug(this,"call prev, length: " + codeArray.length); 
       if(!result || !result.charArray)
          this.disableSelButton(true, false); 
       else if(homeFlag || this.myIME.isBeginning())
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
       var result = this.myIME.next(endFlag); 
       // FireinputLog.debug(this,"call next, length: " + codeArray.length); 
       if(!result || !result.charArray || result.charArray.length < 9)
          this.disableSelButton(false, true);
       else if (endFlag || this.myIME.isEnd())
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

       FireinputLog.debug(this, "send findChar from findCharWithDelay");
       var self = this; 
       this.myKeyTimer = setTimeout(function () { self.findChar(); }, delayMSec); 
    },
 
    findChar: function()
    {
       if(this.myInputChar.length <= 0)
          return; 

       FireinputLog.debug(this, "Send key: " + this.myInputChar + "  => IME engine");
       // FireinputLog.debug(this, "myIMEInputFieldFocusedStatus: " + this.myIMEInputFieldFocusedStatus); 
 
       // send to IME method to query the string 
       var result = this.myIME.find(this.myInputChar);
       this.sendStringToPanel(result.charArray, result.validInputKey);
       if(!result.charArray || result.charArray.length < 9)
          this.disableSelButton(true, true); 
       else if (this.myIME.isEnd())
          this.disableSelButton(true, true);
       else
          this.disableSelButton(true, false);
      
       if(!this.myIME.canComposeNew())
          return; 
 
       FireinputLog.debug(this, "validid key: " + result.validInputKey);
       if(result && result.charArray && result.charArray.length > 0 && 
          this.myInputChar.length > result.validInputKey.length)
       {
          var newvalue = this.myInputChar.substr(result.validInputKey.length, this.myInputChar.length); 
          this.insertCharToComposer(null, 1, "true");
          var idf = document.getElementById("fireinputField");
	  FireinputLog.debug(this,"newvalue:" + newvalue + ", idf.value: " + idf.value + ", this.myInputChar: " + this.myInputChar);
          idf.value = newvalue + idf.value.replace(this.myInputChar, ""); 
          FireinputUtils.setCaretTo(idf, newvalue.length); 
          this.myInputChar = newvalue; 
          this.findChar(); 
       }
      // FireinputLog.debug(this, "after findChar, this.myInputChar: " + this.myInputChar);

    },
  
    findCharWithKey: function(inputChar)
    {
       if(!inputChar || inputChar.length <= 0)
          return; 

       //FireinputLog.debug(this, "Send key: inputChar: " + inputChar);
 
       // send to IME method to query the string 
       var result = this.myIME.find(inputChar);
       this.sendStringToPanel(result.charArray, result.validInputKey);
       if(!result.charArray || result.charArray.length < 9)
          this.disableSelButton(true, true); 
       else if (this.myIME.isEnd())
          this.disableSelButton(true, true);
       else
          this.disableSelButton(true, false);
    }, 
   
    displayAjaxService: function(forceLoad)
    {
       FireinputSpecialChar.load(forceLoad); 
       FireinputThemes.load(forceLoad); 
       FireinputEmotions.load(forceLoad); 
       FireinputHelp.load(forceLoad); 
    }, 

    insertSpecialCharAt: function(event, sourceType)
    {
       var clickTarget = event.target;
       // FireinputLog.debug(this, "value=" + clickTarget.value); 

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
       
       var inputTarget = {target: target, documentTarget: documentTarget, focused: 0};
 
       var value = clickTarget.getAttribute("hiddenvalue");
       if(!value)
          value = clickTarget.getAttribute("value"); 

       FireinputUtils.insertCharAtCaret(inputTarget, value, sourceType); 
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

function fireinput_onKeyUp(event)
{
    Fireinput.keyUpListener(event);
}

function fireinput_onKeyDown(event)
{
    Fireinput.keyDownListener(event);
}
function fireinput_onKeyPress(event)
{
    Fireinput.keyPressListener(event);
}

function fireinput_onPopupShowing(event)
{
    Fireinput.fireinputContext(event);
}

