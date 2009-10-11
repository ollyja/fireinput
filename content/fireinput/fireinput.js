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
            /* all button tooltips */
            {id: "fireinputToggleHalfButton", strKey: "fireinput.toggle.half.button", attribute: "tooltiptext"},
            {id: "fireinputTogglePunctButton", strKey: "fireinput.toggle.punct.button", attribute: "tooltiptext"},
            {id: "fireinputToggleIMEButton", strKey: "fireinput.toggle.ime.button", attribute: "tooltiptext"},
            {id: "fireinputPrevSelButton", strKey: "fireinput.previous.selection", attribute: "tooltiptext"},
            {id: "fireinputNextSelButton", strKey: "fireinput.next.selection", attribute: "tooltiptext"},
            {id: "fireinputLongPrevSelButton", strKey: "fireinput.previous.selection", attribute: "tooltiptext"},
            {id: "fireinputLongNextSelButton", strKey: "fireinput.next.selection", attribute: "tooltiptext"},
            {id: "fireinputIMEBarCloseButton", strKey: "fireinput.close.IME", attribute: "tooltiptext"},
            {id: "inputMethod", strKey: "fireinput.switch.inputmethod.button", attribute: "tooltiptext"},

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

            
top.Fireinput = 
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

    // IME mode. The mode can ZH or EN. Chinese can only be typed under ZH mode 
    // Shortkey: type v if enable english mode, and space will resume original mode back 
    // reset by space /enter or target change 
    myIMEMode: IME_MODE_ZH,

    // Input mode. It will decide which encoding will be used(Simplified Chinese or Big5)
    myInputMode: ENCODING_ZH,

    // caret focus event 
    myEvent: null,
    // caret focus target 
    myTarget: null, 

    // save user typing history 
    mySaveHistory: true, 

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

    // a list of enabled IME 
    myEnabledIME: [], 

    // fireinput init function. 
    initialize: function()
    {
       FireinputPref.addObserver(this, false);
       this.registerFireinputObserver(); 


       // register event listener to trigger when context menu is invoked.
       try 
       {
          document.getElementById('contentAreaContextMenu').addEventListener('popupshowing',
                                                                         fireinput_onPopupShowing,
                                                                         false);
       } catch(e) { }

       // initialize  the open hotkey 
       var handle = document.getElementById("key_enableFireinput"); 
       var openKey = fireinputPrefGetDefault("openKey"); 
       if(/,/.test(openKey))
       {
           var openKeys = openKey.split(","); 
           if(handle) handle.setAttribute("modifiers", openKeys[0]); 
           if(handle) handle.setAttribute("keycode", openKeys[1]); 
       }
      
       // initialize IME bar position 
       this.initIMEBarPosition(); 

       // load shortkey settings 
       FireinputKeyBinding.init(); 

       this.toggleIMEMenu(); 
       // initial default IME 
       this.myIME = this.getDefaultIME(); 

       // load long table 
       FireinputLongTable.init();

       // setup tooltips 
       this.loadIMEPref(); 

       // initialize Pref interfaces 
       fireinputPrefInit(); 

       this.loadIMEPrefByID("fireinputStatusBar", "fireinput.statusbar.tooltip.open", "tooltiptext"); 

       // for first run only 
       FireinputVersion.checkFirstRun(); 

       // register 	
       var gs =  FireinputXPC.getService("@fireinput.com/fireinput;1", "nsIFireinput"); 
       gs.register(window);
    },

    registerFireinputObserver: function()
    {
       // register an observer 
       var os = FireinputXPC.getService("@mozilla.org/observer-service;1", "nsIObserverService");
       // monitor application quit event 
       os.addObserver(this, "quit-application-requested", false);
    }, 

    getDefaultIME: function(schema)
    {
       if(typeof(schema) == 'undefined')
          this.myIMESchema = fireinputPrefGetDefault("defaultInputMethod"); 
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
       // disable conflict shortkey 
       FireinputKeyBinding.disableConflictKey(this.myAllowInputKey); 
       return ime; 
    }, 

   
    toggleIMEMenu: function()
    {
       var hideIMEList = fireinputPrefGetDefault("hiddenInputMethod") || []; 
       var wime = new Wubi(); 

       // check for hidden IME list 
       if(!wime.isEnabled() || inArray(hideIMEList,WUBI_86))
       {
          var handle = document.getElementById("menuWubi86"); 
          if(handle) handle.style.display = "none"; 
          var handle = document.getElementById("imeWubi86"); 
          if(handle) handle.style.display = "none"; 
       }
       else 
       {
          this.myEnabledIME.push(WUBI_86); 
          var handle = document.getElementById("menuWubi86"); 
          if(handle) handle.style.display = ""; 
          var handle = document.getElementById("imeWubi86"); 
          if(handle) handle.style.display = ""; 
       }

       if(!wime.isEnabled() || inArray(hideIMEList,WUBI_98))
       {
          var handle = document.getElementById("menuWubi98"); 
          if(handle) handle.style.display = "none"; 
          var handle = document.getElementById("imeWubi98"); 
          if(handle) handle.style.display = "none"; 

       }
       else
       {
          this.myEnabledIME.push(WUBI_98); 
          var handle = document.getElementById("menuWubi98"); 
          if(handle) handle.style.display = ""; 
          var handle = document.getElementById("imeWubi98"); 
          if(handle) handle.style.display = ""; 

       } 
       var cime = new Cangjie();
       if(!cime.isEnabled() || inArray(hideIMEList,CANGJIE_5))
       {
          var handle = document.getElementById("menuCangjie5");
          if(handle) handle.style.display = "none";
          var handle = document.getElementById("imeCangjie5");
          if(handle) handle.style.display = "none";
       }
       else
       {
          this.myEnabledIME.push(CANGJIE_5); 
          var handle = document.getElementById("menuCangjie5");
          if(handle) handle.style.display = "";
          var handle = document.getElementById("imeCangjie5");
          if(handle) handle.style.display = "";
       }
    
       if(!wime.isEnabled() && !cime.isEnabled())
       {
          // autoinsert is only for wubi or cangjie 
          var handle = document.getElementById("autoInsert"); 
          if(handle) handle.style.display = "none"; 
       }
       else
       {
          var handle = document.getElementById("autoInsert"); 
          if(handle) handle.style.display = ""; 
       }

       var sime = new SmartPinyin(); 
       if(!sime.isEnabled())
       {
          var handle = document.getElementById("fireinputAMB"); 
          if(handle) handle.style.display = "none";
       }
       else
       {
          var handle = document.getElementById("fireinputAMB"); 
          if(handle) handle.style.display = "";
       }

       if(!sime.isEnabled() || inArray(hideIMEList,SMART_PINYIN))
       {
          var handle = document.getElementById("menuPinyinQuan"); 
          if(handle) handle.style.display = "none"; 
          var handle = document.getElementById("imePinyinQuan"); 
          if(handle) handle.style.display = "none"; 
       }
       else 
       {
          this.myEnabledIME.push(SMART_PINYIN); 
          var handle = document.getElementById("menuPinyinQuan"); 
          if(handle) handle.style.display = ""; 
          var handle = document.getElementById("imePinyinQuan"); 
          if(handle) handle.style.display = ""; 
        
       }
   
       if(!sime.isEnabled() || inArray(hideIMEList,ZIGUANG_SHUANGPIN))
       {
          var handle = document.getElementById("menuPinyinShuangZiGuang"); 
          if(handle) handle.style.display = "none"; 
          var handle = document.getElementById("imePinyinShuangZiGuang"); 
          if(handle) handle.style.display = "none"; 
       }
       else 
       {
          this.myEnabledIME.push(ZIGUANG_SHUANGPIN); 
          var handle = document.getElementById("menuPinyinShuangZiGuang"); 
          if(handle) handle.style.display = ""; 
          var handle = document.getElementById("imePinyinShuangZiGuang"); 
          if(handle) handle.style.display = ""; 
       }
  
       if(!sime.isEnabled() || inArray(hideIMEList,MS_SHUANGPIN))
       {
          var handle = document.getElementById("menuPinyinShuangMS"); 
          if(handle) handle.style.display = "none"; 
          var handle = document.getElementById("imePinyinShuangMS"); 
          if(handle) handle.style.display = "none"; 
       }
       else 
       { 
          this.myEnabledIME.push(MS_SHUANGPIN); 
          var handle = document.getElementById("menuPinyinShuangMS"); 
          if(handle) handle.style.display = ""; 
          var handle = document.getElementById("imePinyinShuangMS"); 
          if(handle) handle.style.display = ""; 
       }
  
       if(!sime.isEnabled() || inArray(hideIMEList,CHINESESTAR_SHUANGPIN))
       {
          var handle = document.getElementById("menuPinyinShuangChineseStar"); 
          if(handle) handle.style.display = "none"; 
          var handle = document.getElementById("imePinyinShuangChineseStar"); 
          if(handle) handle.style.display = "none"; 
       }
       else
       {   
          this.myEnabledIME.push(CHINESESTAR_SHUANGPIN); 
          var handle = document.getElementById("menuPinyinShuangChineseStar"); 
          if(handle) handle.style.display = ""; 
          var handle = document.getElementById("imePinyinShuangChineseStar"); 
          if(handle) handle.style.display = ""; 
       }

       if(!sime.isEnabled() || inArray(hideIMEList,SMARTABC_SHUANGPIN))
       {
          var handle = document.getElementById("menuPinyinShuangSmartABC"); 
          if(handle) handle.style.display = "none"; 
          var handle = document.getElementById("imePinyinShuangSmartABC"); 
          if(handle) handle.style.display = "none"; 
       }
       else
       {
          this.myEnabledIME.push(SMARTABC_SHUANGPIN); 
          var handle = document.getElementById("menuPinyinShuangSmartABC"); 
          if(handle) handle.style.display = ""; 
          var handle = document.getElementById("imePinyinShuangSmartABC"); 
          if(handle) handle.style.display = ""; 
       }
    },

    // if certain IME has been disabled or enabled, we need to reload the list 
    reloadIMEMenu: function()
    {
       this.myEnabledIME = []; 
       this.toggleIMEMenu(); 
       // if default IME has been disabled, just choose next available one 
       if(!inArray(this.myEnabledIME, this.myIMESchema))
       {
          this.switchInputMethod(); 
       }
    }, 

    loadIMEPrefByID: function(id, strKey, attribute)
    {
       var defaultLanguage = fireinputPrefGetDefault("interfaceLanguage"); 
       var value = FireinputUtils.getLocaleString(strKey + defaultLanguage);
       var handle = document.getElementById(id);
       if(!handle)
          return; 

       // to check whether the shortcut keystring exists 
       var found =value.match(/%(.+)%/i); 
       if(found)
       {
          var keystring = FireinputKeyBinding.getKeyString(found[1]); 
          value = value.replace(found[0], keystring); 
       } 

       handle.setAttribute(attribute, value);
    }, 

    loadIMEPref: function(name)
    {
       // get default language first 

       if(!name || name == "interfaceLanguage")
       {
          var defaultLanguage = fireinputPrefGetDefault("interfaceLanguage");

          // update UI 
          for(var i =imeInterfaceUI.length-1; i>=0; i--)
          {
             var id = imeInterfaceUI[i].id;

             var handle = document.getElementById(id);
             if(!handle)
                continue;

             var strKey = imeInterfaceUI[i].strKey;
             var attr = imeInterfaceUI[i].attribute;

             var value = FireinputUtils.getLocaleString(strKey + defaultLanguage);
             // to check whether the shortcut keystring exists 
             var found =value.match(/%(\w+)%/ig); 
             if(found)
             {
                 for(var n=0; n<found.length; n++)
                 {
                   var keystring = FireinputKeyBinding.getKeyString(found[n].replace(/%/g, '')); 
                   value = value.replace(found[n], keystring); 
                 }
             } 
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
             FireinputHelp.refreshMenu();
             FireinputThemes.refreshMenu();
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
             value = fireinputPrefGetDefault("defaultInputMethod"); 
 
          var element = document.getElementById("inputMethod"); 
          element.setAttribute("label", FireinputUtils.getIMENameString(value)); 
          element.setAttribute("value", value); 

          // only toggle input method if the setting has been updated 
          if(name == "defaultInputMethod")
             this.toggleInputMethod();
       }

       if(!name || name == "saveHistory")
       { 
          this.mySaveHistory = fireinputPrefGetDefault("saveHistory"); 
       }

       if(name && name == 'IMEBarPosition')
       {
          this.toggleIMEBarPosition(); 
       }
       
       if(!name || name == "wordselectionNum")
       {
          // we don't have do this when defaultIME is created as it will be initialized here anyway 
          this.myIME.setNumWordSelection(fireinputPrefGetDefault("wordselectionNum")); 
       }

       // reset IMEPanel pref 
       FireinputIMEPanel.initPref();  
    },


    toggleFireinput: function(forceOpen, forceLoad)
    {
       var pos = fireinputPrefGetDefault("IMEBarPosition"); 
       var id = document.getElementById("fireinputIMEBar_" + pos); 
       var toggleOff = forceOpen == undefined ? !id.hidden : !forceOpen;
       id.hidden = toggleOff; 
       this.myRunStatus = !toggleOff;  	

       if(!toggleOff)
       {
          this.loadIMEPrefByID("fireinputStatusBar", "fireinput.statusbar.tooltip.close", "tooltiptext"); 

	  window.addEventListener('keypress', fireinput_onKeyPress, true);
//	  window.addEventListener('keydown', fireinput_onKeyDown, true);
	  window.addEventListener('keyup', fireinput_onKeyUp, true);
	  this.myInputStatus = true; 
          this.setInputMode(fireinputPrefGetDefault("defaultInputEncoding")); 
          this.displayAjaxService(forceLoad==undefined ? false : forceLoad);
       }
       else
       { 
          // close the IME inputbar 
          if(this.myIMEInputBarStatus)
          {
             FireinputIMEPanel.hideAndCleanInput(); 
          }
          this.resetIME(); 

          this.loadIMEPrefByID("fireinputStatusBar", "fireinput.statusbar.tooltip.open", "tooltiptext"); 
          window.removeEventListener('keypress', fireinput_onKeyPress, true);
//          window.removeEventListener('keydown', fireinput_onKeyDown, true);
          window.removeEventListener('keyup', fireinput_onKeyUp, true);
       }   
    },
   
    disableIME: function()
    {
       if(!this.myRunStatus)
	  return; 
       // if it's input enabled, disable it and turn off key listener 
       if(this.myInputStatus)
       {
          FireinputIMEPanel.hideAndCleanInput(); 
          this.resetIME();
          window.removeEventListener('keypress', fireinput_onKeyPress, true);
//          window.removeEventListener('keydown', fireinput_onKeyDown, true);
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
//          window.addEventListener('keydown', fireinput_onKeyDown, true);
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
    
    getInputBarStatus: function()
    {
       return this.myIMEInputBarStatus; 
    }, 
    
    // MIGHT NOT need 
    setInputBarStatus: function(status)
    {
       this.myIMEInputBarStatus = status; 
    },

    getCurrentIME: function()
    {
       return this.myIME; 
    }, 

    getTarget: function()
    {
       return this.myTarget; 
    }, 

    getEvent: function()
    {
       return this.myEvent; 
    }, 

    toggleInputMethod: function()
    {
       // close the IME inputbar 
       if(this.myIMEInputBarStatus)
       {
          FireinputIMEPanel.hideAndCleanInput(); 
       }
       this.myIMEInputBarStatus = false; 

       var method = document.getElementById("inputMethod").getAttribute("value"); 
       if(this.myIMESchema == method)
          return; 

       if(method == WUBI_86 || method == WUBI_98)
       {
          if(this.myIME)
             this.myIME.flushUserTable(); 
          this.myIME = null; 
          this.myIME = new Wubi(); 
          this.myIME.setSchema(method); 
          this.myIME.loadTable(); 
       }
       else if(method == CANGJIE_5)
       {
          if(this.myIME)
             this.myIME.flushUserTable(); 
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
          if(this.myIME)
             this.myIME.flushUserTable(); 
          this.myIME = null; 
          this.myIME = new SmartPinyin(); 
          this.myIME.setSchema(method); 
          this.myIME.loadTable(); 
       }   
       else
          this.myIME.setSchema(method); 
              
       this.myIMESchema = method; 

       // enable zh input 
       this.setInputMode(fireinputPrefGetDefault("defaultInputEncoding")); 

       // set num of word choice 
       this.myIME.setNumWordSelection(fireinputPrefGetDefault("wordselectionNum")); 

       this.myAllowInputKey = this.myIME.getAllowedInputKey(); 
       // disable conflict shortkey 
       FireinputKeyBinding.disableConflictKey(this.myAllowInputKey); 

       // notify to all regarding this change 
       this.notify(FIREINPUT_IME_CHANGED); 

       if(!this.myIME.isSchemaEnabled())
       { 
          alert("火输中文输入: 对不起,此输入法字库没有安装,请到http://www.fireinput.com/forum/ 去下载字库"); 
          return; 
       }
    }, 
 
    // loop through next enabled input method 
    switchInputMethod: function()
    {
       var method = document.getElementById("inputMethod").getAttribute("value"); 
       var i = 0; 
       for(; i<this.myEnabledIME.length; i++)
       {
          if(method == this.myEnabledIME[i])
             break; 
       }
       if(i >= this.myEnabledIME.length-1)
          i = -1; 

       // update ime/schema in pref 
       fireinputPrefSave('defaultInputMethod', this.myEnabledIME[i+1]); 
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
       if(!this.myInputStatus)
          return; 

       if(this.myIMEMode == IME_MODE_ZH)
          this.setIMEMode(IME_MODE_EN); 
       else
          this.setIMEMode(IME_MODE_ZH); 
    }, 

    toggleDisableIMEMode: function()
    {
       // if IME inputStatus is still true, disable it regardless of ime_mode 
       if(this.myInputStatus)
       {
          this.myInputStatus = false; 
          this.setIMEMode(IME_MODE_EN); 
       }
       else
       {
          this.myInputStatus = true; 
          this.setIMEMode(IME_MODE_ZH); 
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
          fireinputPrefSave("defaultInputEncoding", ENCODING_ZH);
          return; 
       }

       switch(this.myInputMode)
       {
          case ENCODING_ZH:
              this.setInputMode(ENCODING_BIG5); 
              // remember encoding 
              fireinputPrefSave("defaultInputEncoding", ENCODING_BIG5);
          break; 

          case ENCODING_BIG5:
              this.setInputMode(ENCODING_EN); 
          break; 
          default: 
              this.setInputMode(ENCODING_ZH); 
       }
    },

    toggleEncodingMode: function()
    {
       if(this.myIMEMode == IME_MODE_EN)
          return; 

       switch(this.myInputMode)
       {
          case ENCODING_ZH:
              this.setInputMode(ENCODING_BIG5); 
              // remember encoding 
              fireinputPrefSave("defaultInputEncoding", ENCODING_BIG5);
          break; 

          case ENCODING_BIG5:
              this.setInputMode(ENCODING_ZH); 
              fireinputPrefSave("defaultInputEncoding", ENCODING_ZH);
          break; 
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
          var defaultLanguage = fireinputPrefGetDefault("interfaceLanguage"); 
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
          FireinputLongTable.flushLongTable(); 
       }

       if(topic == "nsPref:changed" && data && data.indexOf(prefDomain) != -1)
       {
          var name = data.substr(prefDomain.length+1);
          this.updatePref(name);


          // we need to reload key settings just in case if anything has been changed 
          if(data && data.match(/Key$/))
          {
             FireinputKeyBinding.refreshKeySetting();
             // short key might have been changed, re-disable/enable conflict shortkeys 
             FireinputKeyBinding.disableConflictKey(this.myAllowInputKey); 
             // simulate a interface language  
             this.loadIMEPref('interfaceLanguage'); 
          }
   
          // if hiddenInputMethod option is changed, reload IME menu and settings 
          if(data == prefDomain + ".hiddenInputMethod")
             this.reloadIMEMenu(); 
       }
    },

    updatePref: function(name)
    {
	this.loadIMEPref(name);
    },
 
    notify: function(nevent)
    {
       switch(nevent)
       {
          case FIREINPUT_IME_CHANGED: 
            FireinputUtils.notify(null, "fireinput-ime-changed", this.getCurrentIME().getIMEType()+'');
          break; 
       }

       return true;
    },
    
    initIMEBarPosition: function()
    {
       var pos = fireinputPrefGetDefault("IMEBarPosition"); 
       var rempos = (pos == IME_BAR_BOTTOM) ? IME_BAR_TOP : IME_BAR_BOTTOM; 

       var el = document.getElementById("fireinputIMEBar_" + rempos); 
       if(el.firstChild) 
       {
          this.myRemovedFireinputPanel = el.removeChild(el.firstChild); 
       } 
    }, 

    toggleIMEBarPosition: function()
    {
       var pos = fireinputPrefGetDefault("IMEBarPosition"); 
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

       this.toggleIMEMenu();
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

       if(target.hasAttribute('_no_cjk_input') && 
          (target.getAttribute('_no_cjk_input') == "true" || target.getAttribute('_no_cjk_input')=="1"))
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

       if(event.keyCode == FireinputKeyBinding.getKeyActionCode("quickToggleIMEKey"))
       {
          if(this.myChangeIMEModeEvent)
          {
             this.myChangeIMEModeEvent = false;
             this.toggleIMEMode(); 
          }
          if(this.myDisableIMEModeEvent)
          {
             this.myDisableIMEModeEvent = false; 
             this.toggleDisableIMEMode(); 
          }
       }
    }, 

    keyDownListener: function(event)
    {
       // FireinputLog.debug(this, "this.myRunStatus: " + this.myRunStatus +", this.myIMEInputBarStatus: " + this.myIMEInputBarStatus); 
       // monitor key which has action associated. For those keys without action associated, 
       // it will be handled individually.  
       if(!this.myIMEInputBarStatus)
       {
          FireinputKeyBinding.checkKeyEvent(event); 
       }

       // if fireinput is not enabled, just return here 
       if(!this.myRunStatus)
	  return; 

       var keyCode = event.keyCode;
 
       if(event.keyCode == FireinputKeyBinding.getKeyActionCode("quickToggleIMEKey"))
       {
          var now = new Date().getTime(); 
          // let trigger a timer here. If two continuous quickToggleIMEKeys are pressed, it will disable fireinput in global manner. 
          // it could only be re-enabled by another two continuous presses 
          if(this.myChangeIMEModeEventTimer && (now - this.myChangeIMEModeEventTimer) < 500)
          {
             this.myDisableIMEModeEvent = true; 
          }
          else 
          {
             this.myChangeIMEModeEvent = true; 
          }
          // record timer 
          this.myChangeIMEModeEventTimer = now; 
       }

       // we don't use alt/shift key 
       // should be used to handle the long list string 
       if(event.altKey && !event.shiftKey)
       {
          // handle ctrl + alt + f to insert Fireinput Ad
          if(event.ctrlKey && keyCode == KeyEvent.DOM_VK_F)
          {
             this.displayADString(); 
	     return; 
          }

          if(keyCode == KeyEvent.DOM_VK_RETURN)
          {
             FireinputWebSearch.load(); 
	     return; 

          }
       }

       // handle alt + ctrl + shift + D to load debug panel 
       if(event.shiftKey && event.ctrlKey && event.altKey && keyCode == KeyEvent.DOM_VK_D)
       {
           FireinputLog.showDebug(); 
           return; 
       }
 
       // check some key if control is pressed 
       if(event.altKey && this.myIMEInputBarStatus)
       {
          // alt + number: choose a long table 
          if(keyCode > KeyEvent.DOM_VK_0 && keyCode <= KeyEvent.DOM_VK_5)
          {
             event.preventDefault();
             event.stopPropagation(); 
             FireinputLongTable.insertCharToTarget(String.fromCharCode(keyCode)); 
          } 
          return;
       }

       // return if these keys are pressed 
//       if(event.altKey || event.ctrlKey || event.shiftKey || event.metaKey)
//          return; 


	// ESC: close input window
	if(keyCode == KeyEvent.DOM_VK_ESCAPE)
	{
	  if(this.myIMEInputBarStatus)
	  {
             event.preventDefault();
             event.stopPropagation(); 
             FireinputIMEPanel.hideAndCleanInput(); 
             return; 
	  }
	  return; 	 
        }

       // HOME: display the first set of input (first 9)
       if(keyCode == KeyEvent.DOM_VK_HOME)
       {
          if(!this.myIMEInputBarStatus)
             return; 

          if(FireinputIMEPanel.getComposeEnabled() || FireinputIMEPanel.getIMEInputFieldFocusedStatus())
             return;

          event.preventDefault();

	  FireinputIMEPanel.prevSel("HOME"); 
	  return; 
       }
	
       // END: display the last set of input (last 9)
       if(keyCode == KeyEvent.DOM_VK_END)
       {
          if(!this.myIMEInputBarStatus)
             return; 

          if(FireinputIMEPanel.getComposeEnabled())
             return;

          if(FireinputIMEPanel.getIMEInputFieldFocusedStatus())
          {
             var idf = document.getElementById("fireinputField");
             if(idf.selectionEnd < idf.value.length)
             {
               FireinputIMEPanel.setInputChar(idf.value);
               FireinputIMEPanel.findCharWithDelay();
             }
             return;
          }

          event.preventDefault();
	  FireinputIMEPanel.nextSel("END"); 
	  return; 
       }
	

       // repeat last words 
       if(keyCode == KeyEvent.DOM_VK_F2)
       {
	  if(this.myIMEInputBarStatus)
             return; 

          event.preventDefault();
	  // FireinputLog.debug(this,"F2: " + FireinputIMEPanel.getLastSelectedElementValue()); 
          FireinputUtils.insertCharAtCaret(this.myTarget, FireinputIMEPanel.getLastSelectedElementValue());
          // add into long table 
          if(this.mySaveHistory)
             FireinputLongTable.addIntoLongTable(this.myTarget.target, FireinputIMEPanel.getLastSelectedElementValue());

	  return; 
       }

       //left arrow key. 
       if(keyCode == KeyEvent.DOM_VK_LEFT)
       {
          if(!this.myIMEInputBarStatus)
             return; 

          // inputField is focused 
          if(FireinputIMEPanel.getComposeEnabled())
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
                   FireinputIMEPanel.setInputChar(key); 
                   FireinputIMEPanel.findCharWithDelay();
                }
             }
          }
          else 
          {
             // there are still some room on the left. Show the selected word from 0 until this position 
             var subInputKeys = idf.value.substring(0, idf.selectionStart-1); 
	     // FireinputLog.debug(this,"subInputKeys:" + subInputKeys);
             FireinputIMEPanel.setInputChar(subInputKeys); 
             FireinputIMEPanel.findCharWithDelay(); 
          }

       }
   
       //right arrow key. 
       if(keyCode == KeyEvent.DOM_VK_RIGHT)
       {
          if(!this.myIMEInputBarStatus)
             return; 

          // inputField is focused 
          if(FireinputIMEPanel.getComposeEnabled())
             return; 
          var idf = document.getElementById("fireinputField");
          if((idf.selectionEnd+1) <= idf.value.length)
          {  
             // there are still some room on the right. Show the selected word from 0 until this position 
             var subInputKeys = idf.value.substring(0, idf.selectionEnd+1); 
             FireinputIMEPanel.setInputChar(subInputKeys); 
             FireinputIMEPanel.findCharWithDelay(); 
          }
       }  
 
           
       // backspace: remove the input bar. If the input bar is empty, remove target value 
       if(keyCode == KeyEvent.DOM_VK_BACK_SPACE)
       {
          // inputField is focused 
          if(FireinputIMEPanel.getComposeEnabled())
             return; 

	  if(this.myIMEInputBarStatus)
	  {
             var id = document.getElementById("fireinputIMEContainer"); 
	     var idf = document.getElementById("fireinputField");
	     if(idf.value.length ==0 && !FireinputComposer.hasSet())
             {
                id.hidePopup(); 
             }
             else
             {
                event.preventDefault();

                FireinputIMEPanel.setInputChar(idf.value); 

                if(FireinputIMEPanel.getInputChar().length > 0)
                {
                   var selectionEnd = idf.selectionEnd; 
                   idf.value = idf.value.substring(0, selectionEnd -1) + idf.value.substring(selectionEnd, idf.value.length);
                   FireinputIMEPanel.setInputChar(idf.value); 
                   FireinputUtils.setCaretTo(idf, selectionEnd-1);
                }
                // if the caret is not at the end of position, only select the char from 0 to this position 
                if(FireinputIMEPanel.getInputChar().length <= 0 || idf.selectionStart <= 0)
                {
                   var key = FireinputComposer.removeLastFromPanel(); 
                   if(key)
                   { 
                      idf.value = key + idf.value.substring(0, idf.value.length); 
                      FireinputIMEPanel.setInputChar(key); 
                      FireinputUtils.setCaretTo(idf, key.length);
                   }
                }
                else if(idf.selectionStart != idf.value.length)
                {
                   var subInputKeys = idf.value.substring(0, idf.selectionStart); 
                   FireinputIMEPanel.setInputChar(subInputKeys); 
                }

	        if(idf.value.length ==0)
                {
                   id.hidePopup(); 
                   return; 
                }
                FireinputIMEPanel.findCharWithDelay(); 
             }
	  }

          return; 
       }

       // page down for next 
       if(FireinputKeyBinding.isTrue("pageDownKey", event))
       {
          if(this.myIMEInputBarStatus)
          {
             event.preventDefault();
             event.stopPropagation(); 
             FireinputIMEPanel.nextSel(); 
          }
          return; 
       }
        // page up for previous 
       if(FireinputKeyBinding.isTrue("pageUpKey", event))
       {
          if(this.myIMEInputBarStatus)
          {
             event.preventDefault();
             event.stopPropagation(); 
             FireinputIMEPanel.prevSel(); 
          }

          return; 
       }

       this.KeyEventInsert(event); 

    },

    KeyEventInsert: function(event)
    {
       // if it enters from keyPress but keyDown has already captured this event, don't proceed 
       if(event.getPreventDefault())
          return; 
 
       // enter: select the highlight column. If the input bar is not activated, go to default action 
       if(FireinputKeyBinding.isTrue("selectFirstKey", event) || event.keyCode == KeyEvent.DOM_VK_RETURN)
       {
          // here we try to trim the long sentence. Surely we should have a better way to organize this. 
          // maybe a fast text search library or sth ? 
          if(!this.myIMEInputBarStatus && event.keyCode == KeyEvent.DOM_VK_RETURN)
          {
             if(this.mySaveHistory)
                FireinputLongTable.flush();
             return true; 
          }

          if(this.myIMEInputBarStatus)
          {
             FireinputIMEPanel.insertCharByIndex(event, 1);
          }
	  return true; 
       }

       // handle the second 
       if(FireinputKeyBinding.isTrue("selectSecondKey", event))
       {
          if(this.myIMEInputBarStatus)
          {
             FireinputIMEPanel.insertCharByIndex(event, 2);
          }

          return true;
       }

       if(FireinputKeyBinding.isTrue("selectThirdKey", event))
       {
          if(this.myIMEInputBarStatus)
          {
             FireinputIMEPanel.insertCharByIndex(event, 3);
          }
          return true;
       }

       return false; 
    },  

    keyPressListener: function(event)
    {
       if(!this.myRunStatus)
	  return; 

       var keyCode = event.keyCode;
       var charCode = event.charCode; 

        // if shift key and other key has been pressed together, reset the IMEmode back 
       if((event.shiftKey || event.altKey || event.ctrlKey) && (keyCode ||charCode))
       {
            this.myChangeIMEModeEvent = false; 
       }

       // return if these keys are pressed 
       if(event.altKey || event.ctrlKey || event.metaKey || (event.shiftKey && !(keyCode || charCode)))
          return; 

       // return here if the mode is non-chinese mode 
       if(this.myIMEMode != IME_MODE_ZH)
          return; 

       // somehow if the key is pressed too fast following a valid inputchar, the keydown event might not be triggered
       // we need to check them here again. Please note that the test shows the issue only show up in one-char press, 
       // so we are safe to just checking keyCode or charCode here 

       if(this.KeyEventInsert(event))
          return; 

       // if it's not printable char, just return here 
       if(charCode ==0)
	  return; 

       var targetInfo = this.isValidTarget(event); 
       if(!targetInfo.valid)      
          return; 

       var target = targetInfo.target; 
       var documentTarget = targetInfo.documentTarget; 

       // the IME mode needs to be reset if the target has changed 
       // if(this.myTarget && this.myTarget.target != target)
       //   this.setIMEMode(IME_MODE_ZH);
       // keep the real event and target if inputfield has been focused 
       if(!FireinputIMEPanel.getIMEInputFieldFocusedStatus() && !FireinputIMEPanel.getComposeEnabled() &&(!this.myTarget || (this.myTarget.target != target)))
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


       var key = String.fromCharCode(charCode);

       // 1..2..9
       if(charCode > KeyEvent.DOM_VK_0 && charCode <= KeyEvent.DOM_VK_9)
       {
          if(this.myIMEInputBarStatus)
          {
             FireinputIMEPanel.insertCharByIndex(event, key);
          }

	  return; 
       }

       // small case a-z 
       if(this.myAllowInputKey.indexOf(key) >= 0)
       { 
          // don't relay on input event. It's slow. 
          // return if compose is enabled 
          if(FireinputIMEPanel.getComposeEnabled())
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
                       FireinputUtils.getDocumentScrollLeft(document.commandDispatcher.focusedWindow.document); 
	        ypos = FireinputUtils.findPosY(target) - 
                       FireinputUtils.getDocumentScrollTop(document.commandDispatcher.focusedWindow.document); 

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

//	        if(ypos > (window.innerHeight - 20))
//                   ypos = window.innerHeight - 20; 

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

                // FireinputLog.debug(this, "p: " + p + ", tagname: " + p.tagName + ", id: " + p.id);
                // some iframes are inside of another iframe. To get the top iframe, we need to 
                // loop through the parentNode to find out whic one is first iframe. Not sure what the 
                // best way to do here 
                var parentNode = p ? p.parentNode : null;
                while(parentNode)
                {
                   // document node 
                   if (parentNode.nodeType == 9)
                   {
                      parentNode = parentNode.defaultView.frameElement; 
                      if(parentNode && parentNode.tagName == 'IFRAME')
                      {
                         xpos += FireinputUtils.findPosX(parentNode); 
                         ypos += FireinputUtils.findPosY(parentNode); 
                         p = parentNode; 
                      }
                      else 
                         break; 
                   }
                   else 
                      parentNode = parentNode.parentNode; 

                }
                
               // gmail main body is built of iframe. So we need to check both ownerDocument and contentDocument 
               // scroll attribute to ajust popup position 
 
                if(p != target.frameElement)
                {
	           xpos -= (FireinputUtils.getDocumentScrollLeft(p.ownerDocument) + FireinputUtils.getDocumentScrollLeft(p.contentDocument)); 
	           ypos -= (FireinputUtils.getDocumentScrollTop(p.ownerDocument) + FireinputUtils.getDocumentScrollTop(p.contentDocument));
                }
                else
                {
	           xpos -= FireinputUtils.getDocumentScrollLeft(p.ownerDocument); 
	           ypos -= FireinputUtils.getDocumentScrollTop(p.ownerDocument); 
                }

                // var frameHeight = p.contentDocument.height; 
                // ypos += p.clientHeight; 

                // get FF header height/position 
                var h = document.getElementById("navigator-toolbox");
	        xpos += h.boxObject.screenX; 
	        ypos += h.boxObject.screenY + h.boxObject.height; 

                // care about tab header 
                if(gBrowser.getStripVisibility())
                {
                   ypos += gBrowser.mStrip.boxObject.height;
                }

                // most rich editor has toolbar on top, put popup on top of toolbar 
                ypos -= 30; 

                if(ypos <= 20)
                  ypos = 20; 

	        var id = document.getElementById("fireinputIMEContainer"); 
                id.showPopup(document.documentElement, xpos, ypos, "popup", null, null); 
             }

             // we have to set this true immediately after showPopup as the onpopupshown handler might be slow to catch 
             // initial key event (which is trggered when fireinput was initialized first time)
             this.myIMEInputBarStatus = true; 

             // The reason I have put here is because textbox won't be able to initialize correctly without first assign the value 
             // thus either idf.selectionEnd or idf.value will throw exception. It only happens when fireinput is loaded first time 
	     var idf = document.getElementById("fireinputField");
             FireinputIMEPanel.setInputChar(key); 
	     idf.value = key; 
          } 
          else 
          {
             var idf = document.getElementById("fireinputField");	
             // see whether the caret is 
             if(idf.selectionEnd < idf.value.length)
             {
                var selectionEnd = idf.selectionEnd; 
                var fvalue = idf.value.substring(0, selectionEnd) + key; 
	        idf.value = fvalue + idf.value.substring(selectionEnd, idf.value.length); 
                FireinputIMEPanel.setInputChar(fvalue); 
                FireinputUtils.setCaretTo(idf, selectionEnd+1);
             }
             else 
             {
                FireinputIMEPanel.setInputChar(FireinputIMEPanel.getInputChar() + key); 
	        idf.value += key; 
             }
          }

	  // FireinputLog.debug(this,"idf.value:" + idf.value);
	  FireinputLog.debug(this,"call findChar when idf.value:" + idf.value);
	  //The findchar has to invoked here to resolve the performance issue 
	  FireinputIMEPanel.findChar();
	  return; 
       }
        
       // use single quot to separate pinyin input 
       if(this.myIMEInputBarStatus)
       {
          if(key == "'" && !FireinputIMEPanel.getComposeEnabled())
          {
             event.preventDefault();
	     var idf = document.getElementById("fireinputField");
             // only one is allowed
             if(idf.value.length > 0 && idf.value.substr(idf.value.length-1, 1) != "'")
	     {  
                if(idf.selectionEnd < idf.value.length)
                {
                   var selectionEnd = idf.selectionEnd;
                   var fvalue = idf.value.substring(0, selectionEnd) + key;
                   idf.value = fvalue + idf.value.substring(selectionEnd, idf.value.length);
                   FireinputIMEPanel.setInputChar(fvalue);
                   FireinputUtils.setCaretTo(idf, selectionEnd+1);
                }
                else
                {
                   FireinputIMEPanel.setInputChar(FireinputIMEPanel.getInputChar() + key); 
                   idf.value += key;
                }
                return; 
             }
          }

          // won't allow any other chars if IME inputbar is opened 
          if(key != "'")  // && (FireinputIMEPanel.getIMEInputFieldFocusedStatus() || FireinputIMEPanel.getComposeEnabled()))
          {
             event.preventDefault();
             event.stopPropagation(); 
          }
        }
        // convert to Full width letters. If the event has getPreventDefault true which might be set in keydown listener
        // we will ignore too  
        if(!this.myIMEInputBarStatus && !event.getPreventDefault())
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
             FireinputLongTable.flush();    
       }

       return; 
    },

    IMEWindowHidden: function()
    {
       // restore the focus to target if inputfield has been focused 
       if(FireinputIMEPanel.getIMEInputFieldFocusedStatus() || FireinputIMEPanel.getComposeEnabled())
       {
          FireinputUtils.setFocus(this.myTarget.target);           
          this.myTarget.focused = 1; 
       }

       FireinputComposer.reset(); 
       FireinputLongTable.hidePanel(); 
       this.myIMEInputBarStatus = false; 
       FireinputIMEPanel.setIMEInputFieldFocusedStatus(false); 
       FireinputIMEPanel.hideAndCleanInput(); 
    },

    IMEWindowShown: function()
    {
       // if the first few input key too fast, the hidden event is ahead of shown event(because of GUI time consuming). 
       // In this case, this.myIMEInputBarStatus might be false, and we certainly don't want to change focus again 
       if(this.myIMEInputBarStatus)
         FireinputUtils.setFocus(document.getElementById("fireinputField"));
    },

    IMEWindowShowing: function()
    {
       // the showing event is ahead of hidden event and shown event. It's safe to 
       // set inputbar status here 
       this.myIMEInputBarStatus = true; 
    }, 

    displayAjaxService: function(forceLoad)
    {
       FireinputSpecialChar.load(forceLoad); 
       FireinputThemes.load(forceLoad); 
       FireinputEmotions.load(forceLoad); 
       FireinputHelp.load(forceLoad); 
       FireinputTable.load(forceLoad); 
    }, 

    insertSpecialCharAt: function(event, sourceType, insertMode)
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

       if(target.setSelectionRange)
       {
          inputTarget.selectionStart = target.selectionStart;
          inputTarget.selectionEnd =  target.selectionEnd;
       }

       FireinputUtils.insertCharAtCaret(inputTarget, value, sourceType, insertMode); 
    },

    showConfig: function(module, param)
    {
       window.openDialog('chrome://fireinput/content/fireinputConfig.xul',
                    'fireinputConfigWindow',
                    'chrome,modal=no,resizable=no',
                    module, param);
    },

    showInputMethodSetting: function()
    {
       var param = this.myEnabledIME.join(",");
       this.showConfig('inputmethod', param);
    },

    showkeyConfigWindow: function()
    {
       var param = this.myEnabledIME.join(",");
       this.showConfig('keyconfig', param); 
    },

    showInputSettingWindow: function()
    {
       var param = this.myEnabledIME.join(",");
       this.showConfig('inputwindow', param); 
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
window.addEventListener('keydown', fireinput_onKeyDown, true);

// Add a function to window object to return Fireinput object 
window.getFireinput=  function()
{
  return this.Fireinput; 
}; 

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

