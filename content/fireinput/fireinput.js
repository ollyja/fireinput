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
Fireinput.namespace("Fireinput.main"); 

Fireinput.main.imeInterfaceUI = [ /* all button tooltips */ {
   id: "fireinputToggleHalfButton",
   strKey: "fireinput.toggle.half.button",
   attribute: "tooltiptext"
},
{
   id: "fireinputTogglePunctButton",
   strKey: "fireinput.toggle.punct.button",
   attribute: "tooltiptext"
},
{
   id: "fireinputToggleIMEButton",
   strKey: "fireinput.toggle.ime.button",
   attribute: "tooltiptext"
},
{
   id: "fireinputPrevSelButton",
   strKey: "fireinput.previous.selection",
   attribute: "tooltiptext"
},
{
   id: "fireinputNextSelButton",
   strKey: "fireinput.next.selection",
   attribute: "tooltiptext"
},
{
   id: "fireinputLongPrevSelButton",
   strKey: "fireinput.previous.selection",
   attribute: "tooltiptext"
},
{
   id: "fireinputLongNextSelButton",
   strKey: "fireinput.next.selection",
   attribute: "tooltiptext"
},
{
   id: "fireinputIMEBarCloseButton",
   strKey: "fireinput.close.IME",
   attribute: "tooltiptext"
},
{
   id: "fireinputInputMethod",
   strKey: "fireinput.switch.inputmethod.button",
   attribute: "tooltiptext"
},

{
   id: "menuPinyinQuan",
   strKey: "fireinput.pinyin.quan.label",
   attribute: "label"
},
{
   id: "menuPinyinShuangZiGuang",
   strKey: "fireinput.pinyin.shuang.ziguang.label",
   attribute: "label"
},
{
   id: "menuPinyinShuangMS",
   strKey: "fireinput.pinyin.shuang.ms.label",
   attribute: "label"
},
{
   id: "menuPinyinShuangChineseStar",
   strKey: "fireinput.pinyin.shuang.chinesestar.label",
   attribute: "label"
},
{
   id: "menuPinyinShuangSmartABC",
   strKey: "fireinput.pinyin.shuang.smartabc.label",
   attribute: "label"
},
{
   id: "menuWubi86",
   strKey: "fireinput.wubi86.label",
   attribute: "label"
},
{
   id: "menuWubi98",
   strKey: "fireinput.wubi98.label",
   attribute: "label"
},
{
   id: "menuCangjie5",
   strKey: "fireinput.cangjie5.label",
   attribute: "label"
},
{
   id: "menuZhengma",
   strKey: "fireinput.zhengma.label",
   attribute: "label"
},
{
   id: "inputHistoryList",
   strKey: "fireinput.history.list",
   attribute: "label"
},
{
   id: "fireinputHelp",
   strKey: "fireinput.help.label",
   attribute: "label"
},
{
   id: "fireinputSearchButton",
   strKey: "fireinput.search.label",
   attribute: "value"
}

];


Fireinput.main.imeInputModeValues = [{
   name: Fireinput.ENCODING_ZH,
   label: "fireinput.method.chinese.value"
},
{
   name: Fireinput.ENCODING_BIG5,
   label: "fireinput.method.big5.value"
},
{
   name: Fireinput.ENCODING_EN,
   label: "fireinput.method.english.value"
}];

Fireinput.main = Fireinput.extend(Fireinput.main, {
   // debug: 0 disable, non-zero enable 
   debug: 1,
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
   myIMEMode: Fireinput.IME_MODE_ZH,

   // Input mode. It will decide which encoding will be used(Simplified Chinese or Big5)
   myInputMode: Fireinput.ENCODING_ZH,

   // caret focus event 
   myEvent: null,
   // caret focus target 
   myTarget: {},

   // save user typing history 
   mySaveHistory: true,

   // allow Input Keys
   myAllowInputKey: "",

   // IME Schema 
   myIMESchema: Fireinput.SMART_PINYIN,

   // removed ime panel - used to position switch 
   myRemovedFireinputPanel: [],

   // a list of enabled IME 
   myEnabledIME: [],

   // event dispatch mode. 
   myEventDispatch: false, 

   //per tab setting 
   mySettingTabs: [], 
   //tab event added 
   myTabIMEPanelEventStatus: false, 

   // fireinput init function. 
   initialize: function () {
      Fireinput.util.pref.addObserver(this, false);
      this.registerFireinputObserver();

      // register event listener to trigger when context menu is invoked.
      try {
         document.getElementById('contentAreaContextMenu').addEventListener('popupshowing', this.fireinputContext.bind(this), false);
      } catch (e) {}

      // initialize  the open hotkey 
      var handle = document.getElementById("key_enableFireinput");
      var openKey = Fireinput.pref.getDefault("openKey");
      if (/,/.test(openKey)) {
         var openKeys = openKey.split(",");
         if (handle) handle.setAttribute("modifiers", openKeys[0]);
         if (handle) handle.setAttribute("keycode", openKeys[1]);
      }

      // initialize IME bar position 
      this.initIMEBarPosition();

      // load shortkey settings 
      Fireinput.keyBinding.init();

      // init user data directory if necessary 
      Fireinput.util.initUserDataDir();

      this.toggleIMEMenu();

      this.addToolbarButton(); 

      // initial default IME 
      this.myIME = this.getIME();

      // setup tooltips 
      this.loadIMEPref();

      // initialize Pref interfaces 
      Fireinput.pref.init();

      this.loadIMEPrefByID("fireinputStatusBar", "fireinput.statusbar.tooltip.open", "tooltiptext");

      // for first run only 
      Fireinput.version.checkFirstRun();

      // register 	
      var gs = Fireinput.util.xpc.getService("@fireinput.com/fireinput;1", "nsIFireinput");
      gs.register(window);

   },

   registerFireinputObserver: function () {
      // register an observer 
      var os = Fireinput.util.xpc.getService("@mozilla.org/observer-service;1", "nsIObserverService");
      // monitor application quit event 
      os.addObserver(this, "quit-application-requested", false);
   },

   addToolbarButton: function() {
      /* only add it by first run */
      var firstrun =  Fireinput.pref.getDefault("firstRun");
      if(firstrun == Fireinput.FIREINPUT_VERSION)
         return; 

      let buttonId = "fireinput-toolbarbutton";

      if (document.getElementById(buttonId))
         return;

      let toolbar = document.getElementById("TabsToolbar");
      let currentSet = toolbar.currentSet;
      currentSet += "," + buttonId; 
      toolbar.currentSet = currentSet;
      toolbar.setAttribute("currentset", currentSet);
      document.persist(toolbar.id, "currentset");
   },
   
   // Patch from christop...: In order to save memory we check if myIME was created in another window
   // already. Only if not, we create myIME in current window using getDefaultIME()
   getIME: function () {
      var gs = Fireinput.util.xpc.getService("@fireinput.com/fireinput;1", "nsIFireinput");

      var fi = gs.getChromeWindow() ? gs.getChromeWindow().getFireinput() : null;

      if (!fi) {
         window.getFireinput = function () {
            return Fireinput;
         }
         return this.getDefaultIME();
      }

      window.getFireinput = function () {
         return fi;
      }

      for (var s in fi) {
         if (typeof(fi[s]) != 'function') {
            this[s] = fi[s];
         }
      }

      return fi.getCurrentIME();
   },

   getDefaultIME: function () {
      this.myIMESchema = Fireinput.pref.getDefault("defaultInputMethod");

      var ime = null;

      switch (this.myIMESchema) {
      case Fireinput.ZHENGMA:
         ime = new Fireinput.zhengmaEngine();
         break;
      case Fireinput.CANGJIE_5:
         ime = new Fireinput.cangjieEngine();
         break;
      case Fireinput.WUBI_86:
      case Fireinput.WUBI_98:
         ime = new Fireinput.wubiEngine();
         break;
      default:
         ime = new Fireinput.smartPinyinEngine();
         break;
      }

      // we cannot save ourself if ime is null.
      if (!ime) return null;

      ime.setSchema(this.myIMESchema);
      ime.loadTable();
      this.myAllowInputKey = ime.getAllowedInputKey();
      // disable conflict shortkey 
      Fireinput.keyBinding.disableConflictKey(this.myAllowInputKey);
      return ime;
   },


   toggleIMEMenu: function () {
      var hideIMEList = Fireinput.pref.getDefault("hiddenInputMethod") || "";
      var supportIMEList = Fireinput.pref.getDefault("inputMethodList");
      supportIMEList = supportIMEList ? supportIMEList.split(",") : [];
      hideIMEList = hideIMEList.split(",");

      var doc = Fireinput.util.getDocument(); 
      if(!doc)
         return; 

      // hide autoInsert first. AutoInsert is only for Wubi or Canjie(not sure)
      var autoInsertHandle = Fireinput.util.getElementById(doc, "menuitem", "fireinputAutoInsert");
      autoInsertHandle.style.display = "none";

      // check for hidden IME list 
      if (!Fireinput.inArray(supportIMEList, Fireinput.ZHENGMA) || Fireinput.inArray(hideIMEList, Fireinput.ZHENGMA)) {
         var handle = Fireinput.util.getElementById(doc, "menuitem", "menuZhengma");
         if (handle) handle.style.display = "none";
         var handle = Fireinput.util.getElementById(doc, "menuitem", "imeZhengma");
         if (handle) handle.style.display = "none";
      }
      else {
         this.myEnabledIME.push(Fireinput.ZHENGMA);
         var handle = Fireinput.util.getElementById(doc, "menuitem", "menuZhengma");
         if (handle) handle.style.display = "";
         var handle = Fireinput.util.getElementById(doc, "menuitem", "imeZhengma");
         if (handle) handle.style.display = "";
         autoInsertHandle.style.display = "";
      }

      if (!Fireinput.inArray(supportIMEList, Fireinput.WUBI_86) || Fireinput.inArray(hideIMEList, Fireinput.WUBI_86)) {
         var handle = Fireinput.util.getElementById(doc, "menuitem", "menuWubi86");
         if (handle) handle.style.display = "none";
         var handle = Fireinput.util.getElementById(doc, "menuitem", "imeWubi86");
         if (handle) handle.style.display = "none";
      }
      else {
         this.myEnabledIME.push(Fireinput.WUBI_86);
         var handle = Fireinput.util.getElementById(doc, "menuitem", "menuWubi86");
         if (handle) handle.style.display = "";
         var handle = Fireinput.util.getElementById(doc, "menuitem", "imeWubi86");
         if (handle) handle.style.display = "";
         autoInsertHandle.style.display = "";
      }

      if (!Fireinput.inArray(supportIMEList, Fireinput.WUBI_98) || Fireinput.inArray(hideIMEList, Fireinput.WUBI_98)) {
         var handle = Fireinput.util.getElementById(doc, "menuitem", "menuWubi98");
         if (handle) handle.style.display = "none";
         var handle = Fireinput.util.getElementById(doc, "menuitem", "imeWubi98");
         if (handle) handle.style.display = "none";

      }
      else {
         this.myEnabledIME.push(Fireinput.WUBI_98);
         var handle = Fireinput.util.getElementById(doc, "menuitem", "menuWubi98");
         if (handle) handle.style.display = "";
         var handle = Fireinput.util.getElementById(doc, "menuitem", "imeWubi98");
         if (handle) handle.style.display = "";

         autoInsertHandle.style.display = "";
      }
      if (!Fireinput.inArray(supportIMEList, Fireinput.CANGJIE_5) || Fireinput.inArray(hideIMEList, Fireinput.CANGJIE_5)) {
         var handle = Fireinput.util.getElementById(doc, "menuitem", "menuCangjie5");
         if (handle) handle.style.display = "none";
         var handle = Fireinput.util.getElementById(doc, "menuitem", "imeCangjie5");
         if (handle) handle.style.display = "none";
      }
      else {
         this.myEnabledIME.push(Fireinput.CANGJIE_5);
         var handle = Fireinput.util.getElementById(doc, "menuitem", "menuCangjie5");
         if (handle) handle.style.display = "";
         var handle = Fireinput.util.getElementById(doc, "menuitem", "imeCangjie5");
         if (handle) handle.style.display = "";

         autoInsertHandle.style.display = "";
      }

      if (!Fireinput.inArray(supportIMEList, Fireinput.SMART_PINYIN)) {
         var handle = Fireinput.util.getElementById(doc, "menu", "fireinputAMB");
         if (handle) handle.style.display = "none";
      }
      else {
         var handle = Fireinput.util.getElementById(doc, "menu", "fireinputAMB");
         if (handle) handle.style.display = "";
      }

      if (!Fireinput.inArray(supportIMEList, Fireinput.SMART_PINYIN) || Fireinput.inArray(hideIMEList, Fireinput.SMART_PINYIN)) {
         var handle = Fireinput.util.getElementById(doc, "menuitem", "menuPinyinQuan");
         if (handle) handle.style.display = "none";
         var handle = Fireinput.util.getElementById(doc, "menuitem", "imePinyinQuan");
         if (handle) handle.style.display = "none";
      }
      else {
         this.myEnabledIME.push(Fireinput.SMART_PINYIN);
         var handle = Fireinput.util.getElementById(doc, "menuitem", "menuPinyinQuan");
         if (handle) handle.style.display = "";
         var handle = Fireinput.util.getElementById(doc, "menuitem", "imePinyinQuan");
         if (handle) handle.style.display = "";

      }

      if (!Fireinput.inArray(supportIMEList, Fireinput.ZIGUANG_SHUANGPIN) || Fireinput.inArray(hideIMEList, Fireinput.ZIGUANG_SHUANGPIN)) {
         var handle = Fireinput.util.getElementById(doc, "menuitem", "menuPinyinShuangZiGuang");
         if (handle) handle.style.display = "none";
         var handle = Fireinput.util.getElementById(doc, "menuitem", "imePinyinShuangZiGuang");
         if (handle) handle.style.display = "none";
      }
      else {
         this.myEnabledIME.push(Fireinput.ZIGUANG_SHUANGPIN);
         var handle = Fireinput.util.getElementById(doc, "menuitem", "menuPinyinShuangZiGuang");
         if (handle) handle.style.display = "";
         var handle = Fireinput.util.getElementById(doc, "menuitem", "imePinyinShuangZiGuang");
         if (handle) handle.style.display = "";
      }

      if (!Fireinput.inArray(supportIMEList, Fireinput.MS_SHUANGPIN) || Fireinput.inArray(hideIMEList, Fireinput.MS_SHUANGPIN)) {
         var handle = Fireinput.util.getElementById(doc, "menuitem", "menuPinyinShuangMS");
         if (handle) handle.style.display = "none";
         var handle = Fireinput.util.getElementById(doc, "menuitem", "imePinyinShuangMS");
         if (handle) handle.style.display = "none";
      }
      else {
         this.myEnabledIME.push(Fireinput.MS_SHUANGPIN);
         var handle = Fireinput.util.getElementById(doc, "menuitem", "menuPinyinShuangMS");
         if (handle) handle.style.display = "";
         var handle = Fireinput.util.getElementById(doc, "menuitem", "imePinyinShuangMS");
         if (handle) handle.style.display = "";
      }

      if (!Fireinput.inArray(supportIMEList, Fireinput.CHINESESTAR_SHUANGPIN) || Fireinput.inArray(hideIMEList, Fireinput.CHINESESTAR_SHUANGPIN)) {
         var handle = Fireinput.util.getElementById(doc, "menuitem", "menuPinyinShuangChineseStar");
         if (handle) handle.style.display = "none";
         var handle = Fireinput.util.getElementById(doc, "menuitem", "imePinyinShuangChineseStar");
         if (handle) handle.style.display = "none";
      }
      else {
         this.myEnabledIME.push(Fireinput.CHINESESTAR_SHUANGPIN);
         var handle = Fireinput.util.getElementById(doc, "menuitem", "menuPinyinShuangChineseStar");
         if (handle) handle.style.display = "";
         var handle = Fireinput.util.getElementById(doc, "menuitem", "imePinyinShuangChineseStar");
         if (handle) handle.style.display = "";
      }

      if (!Fireinput.inArray(supportIMEList, Fireinput.SMARTABC_SHUANGPIN) || Fireinput.inArray(hideIMEList, Fireinput.SMARTABC_SHUANGPIN)) {
         var handle = Fireinput.util.getElementById(doc, "menuitem", "menuPinyinShuangSmartABC");
         if (handle) handle.style.display = "none";
         var handle = Fireinput.util.getElementById(doc, "menuitem", "imePinyinShuangSmartABC");
         if (handle) handle.style.display = "none";
      }
      else {
         this.myEnabledIME.push(Fireinput.SMARTABC_SHUANGPIN);
         var handle = Fireinput.util.getElementById(doc, "menuitem", "menuPinyinShuangSmartABC");
         if (handle) handle.style.display = "";
         var handle = Fireinput.util.getElementById(doc, "menuitem", "imePinyinShuangSmartABC");
         if (handle) handle.style.display = "";
      }
   },

   // if certain IME has been disabled or enabled, we need to reload the list 
   reloadIMEMenu: function () {
      this.myEnabledIME = [];
      this.toggleIMEMenu();
      // if default IME has been disabled, just choose next available one 
      if (!Fireinput.inArray(this.myEnabledIME, this.myIMESchema)) {
         this.switchInputMethod();
      }
   },

   loadIMEPrefByID: function (id, strKey, attribute) {
      var defaultLanguage = Fireinput.pref.getDefault("interfaceLanguage");
      var value = Fireinput.util.getLocaleString(strKey + defaultLanguage);
      var handle = document.getElementById(id);
      if (!handle) return;

      // to check whether the shortcut keystring exists 
      var found = value.match(/%(.+)%/i);
      if (found) {
         var keystring = Fireinput.keyBinding.getKeyString(found[1]);
         value = value.replace(found[0], keystring);
      }

      handle.setAttribute(attribute, value);
   },

   loadIMEPanelPrefByID: function (id, strKey, attribute) {
      var defaultLanguage = Fireinput.pref.getDefault("interfaceLanguage");
      var value = Fireinput.util.getLocaleString(strKey + defaultLanguage);
      var doc =  Fireinput.util.getDocument(); 
      if(!doc)
         return; 

      var handle = Fireinput.util.getElementById(doc, "*", id); 
      if (!handle) return;

      // to check whether the shortcut keystring exists 
      var found = value.match(/%(.+)%/i);
      if (found) {
         var keystring = Fireinput.keyBinding.getKeyString(found[1]);
         value = value.replace(found[0], keystring);
      }

      handle.setAttribute(attribute, value);
   }, 

   loadIMEPref: function (name) {


      /* toggle before any proceeding to avoid id duplication */
      if (name && name == 'IMEBarPosition') {
         this.toggleIMEBarPosition();
      }

      var doc = Fireinput.util.getDocument(); 
      if(!doc)
         return; 

      // get default language first 
      if (!name || name == "interfaceLanguage") {
         var defaultLanguage = Fireinput.pref.getDefault("interfaceLanguage");

      
         // update UI 
         for (var i = this.imeInterfaceUI.length - 1; i >= 0; i--) {
            var id = this.imeInterfaceUI[i].id;

            var handle = Fireinput.util.getElementById(doc, "*", id);
            if (!handle) continue;

            var strKey = this.imeInterfaceUI[i].strKey;
            var attr = this.imeInterfaceUI[i].attribute;

            var value = Fireinput.util.getLocaleString(strKey + defaultLanguage);
            // to check whether the shortcut keystring exists 
            var found = value.match(/%(\w+)%/ig);
            if (found) {
               for (var n = 0; n < found.length; n++) {
                  var keystring = Fireinput.keyBinding.getKeyString(found[n].replace(/%/g, ''));
                  value = value.replace(found[n], keystring);
               }
            }
            handle.setAttribute(attr, value);
         }

         // update icon status text 
         if (this.myRunStatus) this.loadIMEPrefByID("fireinputStatusBar", "fireinput.statusbar.tooltip.close", "tooltiptext");
         else this.loadIMEPrefByID("fireinputStatusBar", "fireinput.statusbar.tooltip.open", "tooltiptext");

         // refresh menu if language is changed 
         if (name) {
            Fireinput.help.refreshMenu();
            Fireinput.themes.refreshMenu();
            Fireinput.specialChar.refreshMenu();
            Fireinput.emotions.refreshMenu();
            Fireinput.pref.init();
         }

         this.loadIMEPanelPrefByID("fireinputToggleIMEButton", "fireinput.method.chinese.value", "label");
      }

      //update value. The label of menu should be updated if language is changed  
      if (!name || name == "defaultInputMethod" || name == "interfaceLanguage") {
         var value = this.myIMESchema;
         if (name == "defaultInputMethod") value = Fireinput.pref.getDefault("defaultInputMethod");

         
         var element = Fireinput.util.getElementById(doc, "toolbarbutton", "fireinputInputMethod"); 
         if(element) {
            element.setAttribute("label", Fireinput.util.getIMENameString(value));
            element.setAttribute("value", value);
         }

         // only toggle input method if the setting has been updated 
         if (name == "defaultInputMethod") this.toggleInputMethod();
      }

      if (!name || name == "saveHistory") {
         this.mySaveHistory = Fireinput.pref.getDefault("saveHistory");
      }


      if (!name || name == "wordselectionNum") {
         // we don't have do this when defaultIME is created as it will be initialized here anyway 
         this.myIME.setNumWordSelection(Fireinput.pref.getDefault("wordselectionNum"));
      }

      // reset IMEPanel pref 
      Fireinput.imePanel.initPref();
   },


   toggleFireinput: function (forceOpen, forceLoad) {
      var pos = Fireinput.pref.getDefault("IMEBarPosition");

      var toggleOff =  false; 
      if(pos == Fireinput.IME_BAR_FLOATING) {
         var tabIndex = gBrowser.getBrowserIndexForDocument(gBrowser.selectedBrowser.contentWindow.document);
         var imePanel = document.getElementById("fireinputIMEBar_" + Fireinput.IME_BAR_FLOATING + "_" + tabIndex); 

         if(imePanel && !imePanel.hidden) {
            imePanel.hidden = true; 
            this.updateIMETabSetting("inputstatus", false); 
            this.updateIMETabSetting("runstatus", false); 
            this.myInputStatus = false; 
            this.myRunStatus = false; 
         }
         else {

            /* show panel */
            var newBar = this.showFloatingIMEBar(); 
            if(newBar) {
               /* reset old setting */
               this.mySettingTabs[tabIndex] = [];

               /* reload all other modules */
               this.toggleIMEMenu();
               this.loadIMEPref();
               // initialize Pref interfaces 
               Fireinput.pref.init();

               this.setLetterMode(); 
               this.setPunctMode(); 
               this.displayAjaxService(true);
            }

            this.setInputMode(Fireinput.pref.getDefault("defaultInputEncoding"));
            this.myInputStatus = this.myIMEMode != Fireinput.IME_MODE_EN; 
            this.updateIMETabSetting("inputstatus", this.myInputStatus); 
            this.updateIMETabSetting("runstatus", true); 
            this.myRunStatus = true; 

            /* adjust position accordingly */
            this.floatingIMEBarWindowResizeListener(); 
         }

      }
      else {
         var id = document.getElementById("fireinputIMEBar_" + pos);
         var toggleOff = forceOpen == undefined ? !id.hidden : !forceOpen;
         id.hidden = toggleOff;
      }

      /* record a binding reference so we can remove it later */
      if(!Fireinput.main.keyPressListenerBinding) {
         Fireinput.main.keyPressListenerBinding = Fireinput.main.keyPressListener.bind(Fireinput.main); 
         Fireinput.main.keyUpListenerBinding = Fireinput.main.keyUpListener.bind(Fireinput.main); 
         Fireinput.main.tabSelectListenerBinding = Fireinput.main.tabSelectListener.bind(Fireinput.main); 
      }

      if(pos == Fireinput.IME_BAR_FLOATING ) {
         /* we only add event once for floating ime panel */
         if(this.myTabIMEPanelEventStatus == false) {
            this.loadIMEPrefByID("fireinputStatusBar", "fireinput.statusbar.tooltip.close", "tooltiptext");
            window.addEventListener('keypress', Fireinput.main.keyPressListenerBinding, true);
            //	  window.addEventListener('keydown', this.keyDownListener.bind(this), true);
            window.addEventListener('keyup', Fireinput.main.keyUpListenerBinding, true);

            // monitor tab select 
            gBrowser.tabContainer.addEventListener("TabSelect", Fireinput.main.tabSelectListenerBinding, true);

            // add drag and move capability for floating ime bar 
            Fireinput.main.floatingMouseMoveListenerBinding = Fireinput.main.floatingIMEBarMouseMoveListener.bind(Fireinput.main);
            Fireinput.main.floatingMouseDownListenerBinding = Fireinput.main.floatingIMEBarMouseDownListener.bind(Fireinput.main);
            Fireinput.main.floatingMouseUpListenerBinding = Fireinput.main.floatingIMEBarMouseUpListener.bind(Fireinput.main);
            Fireinput.main.floatingWindowResizeListernerBinding = Fireinput.main.floatingIMEBarWindowResizeListener.bind(Fireinput.main);

            window.addEventListener("mousedown", Fireinput.main.floatingMouseDownListenerBinding, false);
            window.addEventListener("mousemove", Fireinput.main.floatingMouseMoveListenerBinding, false);
            window.addEventListener("mouseup", Fireinput.main.floatingMouseUpListenerBinding, false);
            window.addEventListener("resize", Fireinput.main.floatingWindowResizeListernerBinding, false);

            // set it to true to only enter here once 
            this.myTabIMEPanelEventStatus = true; 
         }

         return; 
      }
      else  if (!toggleOff) {
         this.myRunStatus = !toggleOff;
         this.loadIMEPrefByID("fireinputStatusBar", "fireinput.statusbar.tooltip.close", "tooltiptext");
         window.addEventListener('keypress', Fireinput.main.keyPressListenerBinding, true);
         //	  window.addEventListener('keydown', this.keyDownListener.bind(this), true);
         window.addEventListener('keyup', Fireinput.main.keyUpListenerBinding, true);
         gBrowser.tabContainer.addEventListener("TabSelect", Fireinput.main.tabSelectListenerBinding, true);
         this.myInputStatus = true;
         this.setInputMode(Fireinput.pref.getDefault("defaultInputEncoding"));
         this.displayAjaxService(forceLoad == undefined ? false : forceLoad);
      }
      else {
         this.myRunStatus = !toggleOff;
         // close the IME inputbar 
         if (this.myIMEInputBarStatus) {
            Fireinput.imePanel.hideAndCleanInput();
         }
         this.resetIME();

         this.loadIMEPrefByID("fireinputStatusBar", "fireinput.statusbar.tooltip.open", "tooltiptext");
         window.removeEventListener('keypress', Fireinput.main.keyPressListenerBinding, true);
         //          window.removeEventListener('keydown', this.keyDownListener.bind(this), true);
         window.removeEventListener('keyup', Fireinput.main.keyUpListenerBinding, true);
         gBrowser.tabContainer.removeEventListener("TabSelect", Fireinput.main.tabSelectListenerBinding, true);
      }
   },

   disableIME: function () {
      if (!this.myRunStatus) return;
      // if it's input enabled, disable it and turn off key listener 
      if (this.myInputStatus) {
         Fireinput.imePanel.hideAndCleanInput();
         this.resetIME();
         window.removeEventListener('keypress', this.keyPressListener.bind(this), true);
         //          window.removeEventListener('keydown', this.keyDownListener.bind(this), true);
         window.removeEventListener('keyup', this.keyUpListener.bind(this), true);
      }
   },

   enableIME: function () {
      if (!this.myRunStatus) return;

      if (!this.myInputStatus) {
         this.myInputStatus = true;
         window.addEventListener('keypress', this.keyPressListener.bind(this), true);
         //          window.addEventListener('keydown', this.keyDownListener.bind(this), true);
         window.addEventListener('keyup', this.keyUpListener.bind(this), true);
      }
   },

   reloadIME: function () {
      var pos = Fireinput.pref.getDefault("IMEBarPosition");
      if(pos != Fireinput.IME_BAR_FLOATING && !this.myRunStatus) return;

      this.myIMESchema = -1;

      this.toggleInputMethod();
   },

   toggleIME: function () {
      if (!this.myRunStatus) return;

      if (this.myInputStatus) this.setInputMode(Fireinput.ENCODING_EN);
      else this.setInputMode(this.myInputMode);
   },

   resetIME: function () {
      this.myInputStatus = false;
      this.myIMEInputBarStatus = false;
   },

   getInputBarStatus: function () {
      return this.myIMEInputBarStatus;
   },

   // MIGHT NOT need 
   setInputBarStatus: function (status) {
      this.myIMEInputBarStatus = status;
   },

   getCurrentIME: function () {
      return this.myIME;
   },

   getTarget: function () {
      return this.myTarget;
   },

   getEvent: function () {
      return this.myEvent;
   },

   setEventDispathMode: function(b) {
      this.myEventDispatch = b; 
   },

   isIMESchemaEnabled: function () {
      if (!this.myIME) return;
      var pos = Fireinput.pref.getDefault("IMEBarPosition");
      if(pos == Fireinput.IME_BAR_FLOATING) {
         if (!this.myIME.isSchemaEnabled()) {
            window.openUILinkIn("chrome://fireinput/content/tablemgr/installtable.html", "tab");
         }
      }
      else 
      if (!this.myIME.isSchemaEnabled()) {


         var h = document.getElementById('fireinputMessagePanel');
         h.style.display = "";

         h = document.getElementById('fireinputMessage');
         var str = document.getElementById("fireinputInputMethod").getAttribute("label");
         str = str + "输入法字库没有安装, 点击安装词库";
         h.setAttribute("label", str);
         h.onclick = function () {
            window.openUILinkIn("chrome://fireinput/content/tablemgr/installtable.html", "tab");
         };
      }
      else {
         var h = document.getElementById('fireinputMessagePanel');
         h.style.display = "none";
      }
   },

   toggleInputMethod: function () {
      // close the IME inputbar 
      if (this.myIMEInputBarStatus) {
         Fireinput.imePanel.hideAndCleanInput();
      }
      this.myIMEInputBarStatus = false;

      var method = Fireinput.pref.getDefault("defaultInputMethod");
      var doc = Fireinput.util.getDocument(); 
      if(doc) {
         var inputMethodButton = Fireinput.util.getElementById(doc, "toolbarbutton", "fireinputInputMethod"); 
         if(inputMethodButton)
           method = inputMethodButton.getAttribute("value")  ; 
      }


      if (this.myIMESchema == method) return;

      if (method == Fireinput.WUBI_86 || method == Fireinput.WUBI_98) {
         if (this.myIME) this.myIME.flushUserTable();
         this.myIME = null;
         this.myIME = new Fireinput.wubiEngine();
         this.myIME.setSchema(method);
         this.myIME.loadTable();
      }
      else if (method == Fireinput.CANGJIE_5) {
         if (this.myIME) this.myIME.flushUserTable();
         this.myIME = null;
         this.myIME = new Fireinput.cangjieEngine();
         this.myIME.setSchema(method);
         this.myIME.loadTable();
      }
      else if (method == Fireinput.ZHENGMA) {
         if (this.myIME) this.myIME.flushUserTable();
         this.myIME = null;
         this.myIME = new Fireinput.zhengmaEngine();
         this.myIME.setSchema(method);
         this.myIME.loadTable();
      }
      else if (this.myIMESchema > Fireinput.SMARTABC_SHUANGPIN || this.myIMESchema < Fireinput.SMART_PINYIN) {
         // we need to load table only if the current schema is not pinyin schema. Otherwise just set new schema 
         if (this.myIME) this.myIME.flushUserTable();
         this.myIME = null;
         this.myIME = new Fireinput.smartPinyinEngine();
         this.myIME.setSchema(method);
         this.myIME.loadTable();
      }
      else this.myIME.setSchema(method);

      this.myIMESchema = method;

      // enable zh input 
      this.setInputMode(Fireinput.pref.getDefault("defaultInputEncoding"));

      // set num of word choice 
      this.myIME.setNumWordSelection(Fireinput.pref.getDefault("wordselectionNum"));

      this.myAllowInputKey = this.myIME.getAllowedInputKey();
      // disable conflict shortkey 
      Fireinput.keyBinding.disableConflictKey(this.myAllowInputKey);

      // notify to all regarding this change 
      this.notify(Fireinput.FIREINPUT_IME_CHANGED);
   },

   // loop through next enabled input method 
   switchInputMethod: function () {
      var doc = Fireinput.util.getDocument(); 
      if(!doc) 
         return; 
      var method = Fireinput.util.getElementById(doc, "toolbarbutton", "fireinputInputMethod").getAttribute("value");
      var i = 0;
      for (; i < this.myEnabledIME.length; i++) {
         if (method == this.myEnabledIME[i]) break;
      }
      if (i >= this.myEnabledIME.length - 1) i = -1;

      // update ime/schema in pref 
      Fireinput.pref.save('defaultInputMethod', this.myEnabledIME[i + 1]);
   },

   getModeString: function (mode) {
      for (var i = this.imeInputModeValues.length - 1; i >= 0; i--) {
         if (mode == this.imeInputModeValues[i].name) return this.imeInputModeValues[i].label;
      }

      // otherwise return first one 
      return this.imeInputModeValues[0].label;

   },

   // set IME mode - not disable keyboard listening 
   setIMEMode: function (mode) {
      if (this.myIMEMode == mode) return;

      this.myIMEMode = mode;

      switch (mode) {
      case Fireinput.IME_MODE_ZH:
         var modeString = this.getModeString(this.myInputMode);
         this.loadIMEPanelPrefByID("fireinputToggleIMEButton", modeString, "label");
         // we need to check whether the schema has been enabled or not 
         this.isIMESchemaEnabled();
         break;
      case Fireinput.IME_MODE_EN:
         var modeString = this.getModeString(mode);
         this.loadIMEPanelPrefByID("fireinputToggleIMEButton", modeString, "label");
         break;
      default:
         return;
      }
      this.updateIMETabSetting("imemode", this.myIMEMode); 
   },

   toggleIMEMode: function () {
      if (!this.myInputStatus) return;

      if (this.myIMEMode == Fireinput.IME_MODE_ZH) this.setIMEMode(Fireinput.IME_MODE_EN);
      else this.setIMEMode(Fireinput.IME_MODE_ZH);
   },

   toggleDisableIMEMode: function () {
      // if IME inputStatus is still true, disable it regardless of ime_mode 
      if (this.myInputStatus) {
         this.myInputStatus = false;
         this.setIMEMode(Fireinput.IME_MODE_EN);
      }
      else {
         this.myInputStatus = true;
         this.setIMEMode(Fireinput.IME_MODE_ZH);
      }
   },

   setInputMode: function (mode) {
      var modeString = this.getModeString(mode);
      this.loadIMEPanelPrefByID("fireinputToggleIMEButton", modeString, "label");
      switch (mode) {
      case Fireinput.ENCODING_ZH:
      case Fireinput.ENCODING_BIG5:
         this.myInputMode = mode;
         this.myIMEMode = Fireinput.IME_MODE_ZH;
         this.myIME.setEncoding(mode);
         // this.enableIME(); 
         this.isIMESchemaEnabled();
         break;
      case Fireinput.ENCODING_EN:
         this.myIMEMode = Fireinput.IME_MODE_EN;
         // this.disableIME(); 
         break;
      default:
         return;
      }

      /* update per tab setting if necessary */
      this.updateIMETabSetting("inputmode", this.myInputMode); 
      this.updateIMETabSetting("imemode", this.myIMEMode); 
   },

   toggleInputMode: function () {
      if (this.myIMEMode == Fireinput.IME_MODE_EN) {
         this.setInputMode(Fireinput.ENCODING_ZH);
         Fireinput.pref.save("defaultInputEncoding", Fireinput.ENCODING_ZH);

         return;
      }

      switch (this.myInputMode) {
      case Fireinput.ENCODING_ZH:
         this.setInputMode(Fireinput.ENCODING_BIG5);
         // remember encoding 
         Fireinput.pref.save("defaultInputEncoding", Fireinput.ENCODING_BIG5);
         break;

      case Fireinput.ENCODING_BIG5:
         this.setInputMode(Fireinput.ENCODING_EN);
         break;
      default:
         this.setInputMode(Fireinput.ENCODING_ZH);
      }
   },

   toggleEncodingMode: function () {
      if (this.myIMEMode == Fireinput.IME_MODE_EN) return;

      switch (this.myInputMode) {
      case Fireinput.ENCODING_ZH:
         this.setInputMode(Fireinput.ENCODING_BIG5);
         // remember encoding 
         Fireinput.pref.save("defaultInputEncoding", Fireinput.ENCODING_BIG5);
         break;

      case Fireinput.ENCODING_BIG5:
         this.setInputMode(Fireinput.ENCODING_ZH);
         Fireinput.pref.save("defaultInputEncoding", Fireinput.ENCODING_ZH);
         break;
      }

   },

   setLetterMode: function() {
     var doc = Fireinput.util.getDocument();
      if(!doc)
         return;
      if (this.myIME.isHalfLetterMode()) {
         var id = Fireinput.util.getElementById(doc, "toolbarbutton", "fireinputToggleHalfButton");
         if (id) {
            id.style.listStyleImage = "url('chrome://fireinput/skin/half-letter.png')";
         }
      }
      else {
         var id = Fireinput.util.getElementById(doc, "toolbarbutton", "fireinputToggleHalfButton");
         if (id) {
            id.style.listStyleImage = "url('chrome://fireinput/skin/full-letter.png')";
         }

      }

   },

   toggleLetterMode: function () {
      var doc = Fireinput.util.getDocument(); 
      if(!doc) 
         return; 
      if (this.myIME.isHalfLetterMode()) {
         var id = Fireinput.util.getElementById(doc, "toolbarbutton", "fireinputToggleHalfButton");
         if (id) {
            id.style.listStyleImage = "url('chrome://fireinput/skin/full-letter.png')";
            this.myIME.setFullLetterMode();
         }
      }
      else {
         var id = Fireinput.util.getElementById(doc, "toolbarbutton", "fireinputToggleHalfButton");
         if (id) {
            id.style.listStyleImage = "url('chrome://fireinput/skin/half-letter.png')";
            this.myIME.setHalfLetterMode();
         }

      }
      /* update letter mode */
      this.updateIMETabSetting("lettermode", this.myIME.isHalfLetterMode()); 
   },

   setPunctMode: function() {
      var doc = Fireinput.util.getDocument();
      if(!doc)
         return;
      if (this.myIME.isHalfPunctMode()) {
         var id = Fireinput.util.getElementById(doc, "toolbarbutton", "fireinputTogglePunctButton");
         if (id) {
            id.style.listStyleImage = "url('chrome://fireinput/skin/half-punct.png')";
         }
      }
      else {
         var id = Fireinput.util.getElementById(doc, "toolbarbutton", "fireinputTogglePunctButton");
         if (id) {
            id.style.listStyleImage = "url('chrome://fireinput/skin/full-punct.png')";
         }

      }
   },

   togglePunctMode: function () {
      var doc = Fireinput.util.getDocument(); 
      if(!doc)
         return; 
      if (this.myIME.isHalfPunctMode()) {
         var id = Fireinput.util.getElementById(doc, "toolbarbutton", "fireinputTogglePunctButton");
         if (id) {
            id.style.listStyleImage = "url('chrome://fireinput/skin/full-punct.png')";
            this.myIME.setFullPunctMode();
         }
      }
      else {
         var id = Fireinput.util.getElementById(doc, "toolbarbutton", "fireinputTogglePunctButton");
         if (id) {
            id.style.listStyleImage = "url('chrome://fireinput/skin/half-punct.png')";
            this.myIME.setHalfPunctMode();
         }

      }
      /* update punct mode */
      this.updateIMETabSetting("punctmode", this.myIME.isHalfPunctMode());
   },

   onClickStatusIcon: function (event) {
      if (event.button != 0) return;
      this.toggleFireinput();
   },

   fireinputContext: function () {
      this.loadIMEPrefByID("fireinputContextSwitchBGToZH", "fireinput.encoding.bgtozh", "label");  
      this.loadIMEPrefByID("fireinputContextSwitchZHToBG", "fireinput.encoding.zhtobg", "label");  
      this.loadIMEPrefByID("fireinputContextEnableIME", "fireinput.show.IME", "label");  
      this.loadIMEPrefByID("fireinputContextEnhanceWordTable", "fireinput.wordtable.enhance", "label");  
      this.loadIMEPrefByID("fireinputContextSwitchEncoding", "fireinput.encoding.switch", "label");  
      this.loadIMEPrefByID("fireinputContextSelectImage", "fireinput.context.select.image", "label");  

      document.getElementById('fireinputContextEnableIME').hidden = (!(gContextMenu.onTextInput) || Fireinput.myRunStatus);
      document.getElementById('fireinputContextSelectImage').hidden = !(gContextMenu.onImage);
      // init add table menu 
      var hidden = !(gContextMenu.isTextSelected);
      if (!hidden) {
         var selectedText = Fireinput.longTable.showSelection();
         if (!selectedText) {
            document.getElementById('fireinputContextEnhanceWordTable').hidden = !hidden;
            return;
         }
         var defaultLanguage = Fireinput.pref.getDefault("interfaceLanguage");
         var value = Fireinput.util.getLocaleString("fireinput.wordtable.enhance" + defaultLanguage);

         var handle = document.getElementById('fireinputContextEnhanceWordTable');
         label = value + '"' + selectedText + '"';
         handle.setAttribute("label", label);
         handle.hidden = hidden;
      }
      else document.getElementById('fireinputContextEnhanceWordTable').hidden = hidden;
   },

   // all Observers
   observe: function (subject, topic, data) {

      if (topic == "quit-application-requested") {
         if (this.myIME) this.myIME.flushUserTable();
      }

      if (topic == "nsPref:changed" && data && data.indexOf(Fireinput.prefDomain) != -1) {
         var name = data.substr(Fireinput.prefDomain.length + 1);
         this.updatePref(name);


         // we need to reload key settings just in case if anything has been changed 
         if (data && data.match(/Key$/)) {
            Fireinput.keyBinding.refreshKeySetting();
            // short key might have been changed, re-disable/enable conflict shortkeys 
            Fireinput.keyBinding.disableConflictKey(this.myAllowInputKey);
            // simulate a interface language  
            this.loadIMEPref('interfaceLanguage');
         }

         // if hiddenInputMethod option is changed, reload IME menu and settings 
         if (data == Fireinput.prefDomain + ".hiddenInputMethod") this.reloadIMEMenu();
      }
   },

   updatePref: function (name) {
      this.loadIMEPref(name);
   },

   notify: function (nevent) {
      switch (nevent) {
      case Fireinput.FIREINPUT_IME_CHANGED:
         Fireinput.util.notify(null, "fireinput-ime-changed", this.getCurrentIME().getIMEType() + '');
         break;
      }

      return true;
   },

   floatingIMEBarMouseDownListener: function(event) {
      if(!this.myRunStatus) return; 

            var boxHeight = Fireinput.util.getBrowserBoxesHeight();
      var target = event.originalTarget; 
      if(target.id == "fireinputMoveButton") {
         target = target.parentNode.parentNode;
         this.floatingIMEBarMoving = {x:target.boxObject.x,y:target.boxObject.y,ex:event.screenX,ey:event.screenY};
      }
   },

   floatingIMEBarMouseMoveListener: function(event) {
      if(!this.myRunStatus) return; 

      if(this.floatingIMEBarMoving) {
         var tabIndex = gBrowser.getBrowserIndexForDocument(gBrowser.selectedBrowser.contentWindow.document);
         var id = "fireinputIMEBar_" + Fireinput.IME_BAR_FLOATING + "_" + tabIndex;
         var imeBar = document.getElementById(id); 
         if(imeBar) {
            var x = this.floatingIMEBarMoving.x + event.screenX - this.floatingIMEBarMoving.ex; 
            var y = this.floatingIMEBarMoving.y + event.screenY - this.floatingIMEBarMoving.ey; 
            imeBar.style.top =  y + "px";
            imeBar.style.left = x + "px";
            this.floatingIMEBarMoving.nx = x; 
            this.floatingIMEBarMoving.ny = y; 
         }
      }
   },

   floatingIMEBarMouseUpListener: function(event) {
      if(!this.myRunStatus) return; 
      var target = event.target;
      if(this.floatingIMEBarMoving) {
         if(typeof(this.floatingIMEBarMoving.nx) != 'undefined') {
            var dx = window.innerWidth - this.floatingIMEBarMoving.nx; 
            var dy = window.innerHeight - this.floatingIMEBarMoving.ny; 
            var lastPos = {x: this.floatingIMEBarMoving.nx, y: this.floatingIMEBarMoving.ny, dx: dx, dy: dy};
            Fireinput.pref.save("floatingIMEPanelPos", JSON.stringify(lastPos));
         }

         this.floatingIMEBarMoving = false;  
      }
   },

   floatingIMEBarWindowResizeListener: function(event) {
      if(!this.myRunStatus) return; 

      var lastPos = Fireinput.pref.getDefault("floatingIMEPanelPos"); 
      if(lastPos) {
         lastPos = JSON.parse(lastPos); 

         var tabIndex = gBrowser.getBrowserIndexForDocument(gBrowser.selectedBrowser.contentWindow.document);
         var id = "fireinputIMEBar_" + Fireinput.IME_BAR_FLOATING + "_" + tabIndex;
         var el = document.getElementById(id); 
         if(el) {
            var objectWidth = el.boxObject.width < 210 ? 210 : el.boxObject.width; 
            var objectHeight = el.boxObject.height < 32 ? 32 : el.boxObject.height; 
            if(lastPos.dx < (objectWidth + 50) || lastPos.x > window.innerWidth) 
               el.style.left = (window.innerWidth - lastPos.dx) + "px"; 
            else
               el.style.left = lastPos.x + "px"; 

            if(lastPos.dy < (objectHeight + 50) || lastPos.y > window.innerHeight)
               el.style.top = (window.innerHeight - lastPos.dy) + "px"; 
            else 
               el.style.top = lastPos.y + "px";
         }
      }


   }, 

   showFloatingIMEBar: function() {
      /* create floating panel */
      var browserEl = gBrowser.selectedBrowser.parentNode.parentNode;
      var tabIndex = gBrowser.getBrowserIndexForDocument(gBrowser.selectedBrowser.contentWindow.document);
      var id = "fireinputIMEBar_" + Fireinput.IME_BAR_FLOATING + "_" + tabIndex;
      var el = document.getElementById(id); 
      if(el) {
         el.hidden = false; 
         return false; 
      }

      el =  document.createElement("vbox"); 
      el.id  = id; 
      el.setAttribute("layer", true); 
      el.appendChild(this.myRemovedFireinputPanel[Fireinput.IME_BAR_TOP].cloneNode(true)); 
      var e = browserEl.insertBefore(el, gBrowser.selectedBrowser.parentNode);   
      e.className = "fireinputIMEBar_" + Fireinput.IME_BAR_FLOATING + " left";
      e.style.top = Fireinput.util.getBrowserBoxesHeight() + "px";


      return true; 
   },
   
   closeAllFloatingBars: function() {

      for (var i = 0; i < gBrowser.browsers.length; ++i) {
         var browser = gBrowser.getBrowserAtIndex(i);
         var floatingPanels = browser.parentNode.parentNode.getElementsByClassName("fireinputIMEBar_" + Fireinput.IME_BAR_FLOATING); 

         if(floatingPanels && floatingPanels.length > 0) {
            for(var j=0; j<floatingPanels.length; j++) {
               floatingPanels[j].parentNode.removeChild(floatingPanels[j]); 
            }
         }

      }

      // also disable all listening events 
      window.removeEventListener('keypress', Fireinput.main.keyPressListenerBinding, true);
      window.removeEventListener('keyup', Fireinput.main.keyUpListenerBinding, true);
      gBrowser.tabContainer.removeEventListener("TabSelect", Fireinput.main.tabSelectListenerBinding, false);

      window.removeEventListener("mousedown", Fireinput.main.floatingMouseDownListenerBinding, false);
      window.removeEventListener("mousemove", Fireinput.main.floatingMouseMoveListenerBinding, false);
      window.removeEventListener("mouseup", Fireinput.main.floatingMouseUpListenerBinding, false);
      window.removeEventListener("resize", Fireinput.main.floatingWindowResizeListernerBinding, false); 

      this.myTabIMEPanelEventStatus = false; 
   },

   updateIMETabSetting: function(key, value) {
      var tabIndex = gBrowser.getBrowserIndexForDocument(gBrowser.selectedBrowser.contentWindow.document);
      if(typeof(this.mySettingTabs[tabIndex]) == 'undefined')
         this.mySettingTabs[tabIndex] = []; 

      this.mySettingTabs[tabIndex][key] = value;
   },

   initIMEBarPosition: function () {
      var pos = Fireinput.pref.getDefault("IMEBarPosition");
      if(pos == Fireinput.IME_BAR_FLOATING) {
         /* remove all others */
         var imeEl = document.getElementById("fireinputIMEBar_" + Fireinput.IME_BAR_TOP);
         this.myRemovedFireinputPanel[Fireinput.IME_BAR_TOP] = imeEl.removeChild(imeEl.firstChild);
         imeEl = document.getElementById("fireinputIMEBar_" + Fireinput.IME_BAR_BOTTOM);
         this.myRemovedFireinputPanel[Fireinput.IME_BAR_BOTTOM] = imeEl.removeChild(imeEl.firstChild);

         return; 
      }

      /* top or bottom position, just hide one */
      var rempos = (pos == Fireinput.IME_BAR_BOTTOM) ? Fireinput.IME_BAR_TOP : Fireinput.IME_BAR_BOTTOM;

      var el = document.getElementById("fireinputIMEBar_" + rempos);
      if (el.firstChild) {
         this.myRemovedFireinputPanel[rempos] = el.removeChild(el.firstChild);
      }
   },

   toggleIMEBarPosition: function () {
      var pos = Fireinput.pref.getDefault("IMEBarPosition");
      if(pos == Fireinput.IME_BAR_FLOATING) {
         var imeEl = document.getElementById("fireinputIMEBar_" + Fireinput.IME_BAR_TOP);
         if(imeEl.firstChild) 
            this.myRemovedFireinputPanel[Fireinput.IME_BAR_TOP] = imeEl.removeChild(imeEl.firstChild);

         imeEl.hidden = true; 

         imeEl = document.getElementById("fireinputIMEBar_" + Fireinput.IME_BAR_BOTTOM);
         if(imeEl.firstChild) 
            this.myRemovedFireinputPanel[Fireinput.IME_BAR_BOTTOM] = imeEl.removeChild(imeEl.firstChild);
         imeEl.hidden = true; 
      }
      else {
 
         /* close all floating bars */           
         this.closeAllFloatingBars(); 

         var rempos = (pos == Fireinput.IME_BAR_BOTTOM) ? Fireinput.IME_BAR_TOP : Fireinput.IME_BAR_BOTTOM;

         var oldPanel = null;
         var el = document.getElementById("fireinputIMEBar_" + rempos);
         if (el.firstChild) {
            oldPanel = el.removeChild(el.firstChild);
         }
         else if(this.myRemovedFireinputPanel[rempos]) {
            oldPanel = this.myRemovedFireinputPanel[rempos]; 
         }

         el.hidden = true;

         // if sth wrong. don't proceed 
         if (!oldPanel) return;

         // new position 
         el = document.getElementById("fireinputIMEBar_" + pos);
         if (!el.firstChild) {
            el.appendChild(this.myRemovedFireinputPanel[pos]);
         }
         el.hidden = false;

         this.myRemovedFireinputPanel[rempos] = oldPanel;
         this.toggleIMEMenu();
         this.loadIMEPref();

         // initialize Pref interfaces 
         Fireinput.pref.init();
      }

      this.toggleFireinput(true, true);

   },

   isTargetATextBox: function (node) {
      if (!node) return 0;

      if (node instanceof HTMLInputElement) return (node.type == "text" || node.type == "password")

      return (node instanceof HTMLTextAreaElement);
   },

   isValidTarget: function (event) {
      var documentTarget = false;
      var target = event.explicitOriginalTarget;
      var originalTarget = event.originalTarget; 

      if (target == null) target = event.target;

      if (target == null || (target && target.type == "password")) return {
         target: target,
         originalTarget: originalTarget,
         valid: false,
         documentTarget: documentTarget
      };

      if (target instanceof XULElement && target.id == "urlbar") {
         if (Fireinput.pref.getDefault("enableUrlbarInput")) return {
            target: target,
            originalTarget: originalTarget,
            valid: true,
            documentTarget: documentTarget
         };
         else return {
            target: target,
            originalTarget: originalTarget,
            valid: false,
            documentTarget: documentTarget
         };
      }

      if (target.hasAttribute('_no_cjk_input') && (target.getAttribute('_no_cjk_input') == "true" || target.getAttribute('_no_cjk_input') == "1")) return {
         target: target,
         originalTarget: originalTarget,
         valid: false,
         documentTarget: documentTarget
      };

      if (target.hasAttribute('noime') && (target.getAttribute('noime') == "true" || target.getAttribute('noime') == "1")) return {
         target: target,
         originalTarget: originalTarget,
         valid: false,
         documentTarget: documentTarget
      };

      if (!target.setSelectionRange) {
         var wrappedTarget = document.commandDispatcher.focusedElement;

         if (wrappedTarget instanceof HTMLInputElement || wrappedTarget instanceof HTMLTextAreaElement) {
            if (!this.isTargetATextBox(wrappedTarget)) return {
               target: target,
               originalTarget: originalTarget,
               valid: false,
               documentTarget: documentTarget
            };
            else if (wrappedTarget.tagName == 'html:input' || wrappedTarget.tagName == 'html:textarea') {
               //xul window input element 
               wrappedTarget.boxObject = target.boxObject;
               if (wrappedTarget.type == 'password') return {
                  target: wrappedTarget,
                  originalTarget: originalTarget,
                  valid: false,
                  documentTarget: documentTarget
               };
               else return {
                  target: wrappedTarget,
                  originalTarget: originalTarget,
                  valid: true,
                  documentTarget: documentTarget
               };
            }

         }
         else {
            var twin = document.commandDispatcher.focusedWindow;
            if (twin) {
               var editingSession = twin.QueryInterface(Components.interfaces.nsIInterfaceRequestor).
                                    getInterface(Components.interfaces.nsIWebNavigation).
                                    QueryInterface(Components.interfaces.nsIInterfaceRequestor).
                                    getInterface(Components.interfaces.nsIEditingSession);
               if (!editingSession.windowIsEditable(twin)) return {
                  target: target,
                  originalTarget: originalTarget,
                  valid: false,
                  documentTarget: documentTarget
               };

               documentTarget = true;
            }
            // oTarget is only will be used in editor mode 
            return {
               target: twin,
               originalTarget: originalTarget,
               valid: true,
               documentTarget: documentTarget
            };
         }
      }
      else if (target.readOnly) return {
         target: target,
         originalTarget: originalTarget,
         valid: false,
         documentTarget: documentTarget
      };

      return {
         target: target,
         originalTarget: originalTarget,
         valid: true,
         documentTarget: documentTarget
      };

   },

   tabSelectListener: function(event) {
      var tabIndex = gBrowser.getBrowserIndexForDocument(gBrowser.selectedBrowser.contentWindow.document);
      if(typeof(this.mySettingTabs[tabIndex]) != 'undefined') {
         var doc = Fireinput.util.getDocument();
         if(!doc)
            return;

         //always input method keep to default, no matter what  
         var schema = Fireinput.pref.getDefault("defaultInputMethod");
         var element = Fireinput.util.getElementById(doc, "toolbarbutton", "fireinputInputMethod");
         if(element) {
            element.setAttribute("label", Fireinput.util.getIMENameString(schema));
            element.setAttribute("value", schema);
         }

         // zh/big5/en encoding can be anything 
         this.myInputMode = typeof(this.mySettingTabs[tabIndex].inputmode) == 'undefined' ? 
                            Fireinput.pref.getDefault("defaultInputEncoding") : this.mySettingTabs[tabIndex].inputmode; 

         var modeString = this.getModeString(this.myInputMode);
         this.loadIMEPanelPrefByID("fireinputToggleIMEButton", modeString, "label");

         /* update encoding */
         if(this.myInputMode != Fireinput.ENCODING_EN)
            this.myIME.setEncoding(this.myInputMode);

         /* zh or en */
         this.myIMEMode   = typeof(this.mySettingTabs[tabIndex].imemode) == 'undefined' ? 
                            this.myInputMode : this.mySettingTabs[tabIndex].imemode;
         this.myIMEMode = this.myInputMode== Fireinput.ENCODING_EN ? Fireinput.IME_MODE_EN : Fireinput.IME_MODE_ZH;

         /* input status */
         this.myInputStatus = typeof(this.mySettingTabs[tabIndex].inputstatus) == 'undefined' ?
                              this.myInputMode != Fireinput.ENCODING_EN : this.mySettingTabs[tabIndex].inputstatus; 

         this.myRunStatus   = typeof(this.mySettingTabs[tabIndex].runstatus) == 'undefined' ?
                              true : this.mySettingTabs[tabIndex].runstatus; 

         var halflettermode   = typeof(this.mySettingTabs[tabIndex].lettermode) == 'undefined' ? 
                              this.myIME.isHalfLetterMode() : this.mySettingTabs[tabIndex].lettermode; 

         halflettermode ? this.myIME.setHalfLetterMode() : this.myIME.setFullLetterMode(); 
         this.setLetterMode(); 

         var halfpunctmode   = typeof(this.mySettingTabs[tabIndex].punctmode) == 'undefined' ? 
                              this.myIME.isHalfPunctMode() : this.mySettingTabs[tabIndex].punctmode; 

         halfpunctmode ? this.myIME.setHalfPunctMode() : this.myIME.setFullPunctMode(); 
         this.setPunctMode(); 

      }

   },

   mouseDownListener: function (event) {
      if (!this.myRunStatus || this.myIMEInputBarStatus) return;

      this.myTarget.screenX = event.screenX; 
      this.myTarget.screenY = event.screenY; 
   },

   keyUpListener: function (event) {
      if (!this.myRunStatus || this.myIMEInputBarStatus) return;

      if (this.myEventDispatch) return; 

      if (event.keyCode == Fireinput.keyBinding.getKeyActionCode("quickToggleIMEKey")) {
         if (this.myChangeIMEModeEvent) {
            this.myChangeIMEModeEvent = false;
            this.toggleIMEMode();
         }
         if (this.myDisableIMEModeEvent) {
            this.myDisableIMEModeEvent = false;
            this.toggleDisableIMEMode();
         }
      }
   },

   keyDownListener: function (event) {
      if (this.myEventDispatch) return; 

      // Fireinput.log.debug(this, "this.myRunStatus: " + this.myRunStatus +", this.myIMEInputBarStatus: " + this.myIMEInputBarStatus); 
      // monitor key which has action associated. For those keys without action associated, 
      // it will be handled individually.  
      if (!this.myIMEInputBarStatus) {
         Fireinput.keyBinding.checkKeyEvent(event);
      }

      // if fireinput is not enabled, just return here 
      if (!this.myRunStatus) return;

      var keyCode = event.keyCode;

      if (event.keyCode == Fireinput.keyBinding.getKeyActionCode("quickToggleIMEKey")) {
         var now = new Date().getTime();
         // let trigger a timer here. If two continuous quickToggleIMEKeys are pressed, it will disable fireinput in global manner. 
         // it could only be re-enabled by another two continuous presses 
         if (this.myChangeIMEModeEventTimer && (now - this.myChangeIMEModeEventTimer) < 500) {
            this.myDisableIMEModeEvent = true;
         }
         else {
            this.myChangeIMEModeEvent = true;
         }
         // record timer 
         this.myChangeIMEModeEventTimer = now;
      }

      // we don't use alt/shift key 
      // should be used to handle the long list string 
      if (event.altKey && !event.shiftKey) {
         // handle ctrl + alt + f to insert Fireinput Ad
         if (event.ctrlKey && keyCode == KeyEvent.DOM_VK_F) {
            this.displayADString();
            return;
         }

         if (keyCode == KeyEvent.DOM_VK_RETURN) {
            Fireinput.webSearch.load();
            return;

         }
      }

      // handle alt + ctrl + shift + D to load debug panel 
      if (event.shiftKey && event.ctrlKey && event.altKey && keyCode == KeyEvent.DOM_VK_D) {
         Fireinput.log.showDebug();
         return;
      }

      // check some key if control is pressed 
      if (event.altKey && this.myIMEInputBarStatus) {
         // alt + number: choose a long table 
         if (keyCode > KeyEvent.DOM_VK_0 && keyCode <= KeyEvent.DOM_VK_5) {
            event.preventDefault();
            event.stopPropagation();
         }
         return;
      }

      // return if these keys are pressed 
      //       if(event.altKey || event.ctrlKey || event.shiftKey || event.metaKey)
      //          return; 
      // ESC: close input window
      if (keyCode == KeyEvent.DOM_VK_ESCAPE) {
         if (this.myIMEInputBarStatus) {
            event.preventDefault();
            event.stopPropagation();
            Fireinput.imePanel.hideAndCleanInput();
            return;
         }
         return;
      }

      // HOME: display the first set of input (first 9)
      if (keyCode == KeyEvent.DOM_VK_HOME) {
         if (!this.myIMEInputBarStatus) return;

         if (Fireinput.imePanel.getComposeEnabled() || Fireinput.imePanel.getIMEInputFieldFocusedStatus()) return;

         event.preventDefault();

         Fireinput.imePanel.prevSel("HOME");
         return;
      }

      // END: display the last set of input (last 9)
      if (keyCode == KeyEvent.DOM_VK_END) {
         if (!this.myIMEInputBarStatus) return;

         if (Fireinput.imePanel.getComposeEnabled()) return;

         if (Fireinput.imePanel.getIMEInputFieldFocusedStatus()) {
            var idf = document.getElementById("fireinputField");
            if (idf.selectionEnd < idf.value.length) {
               Fireinput.imePanel.setInputChar(idf.value);
               Fireinput.imePanel.findCharWithDelay();
            }
            return;
         }

         event.preventDefault();
         Fireinput.imePanel.nextSel("END");
         return;
      }


      // repeat last words 
      if (keyCode == KeyEvent.DOM_VK_F2) {
         if (this.myIMEInputBarStatus) return;

         event.preventDefault();
         // Fireinput.log.debug(this,"F2: " + Fireinput.imePanel.getLastSelectedElementValue()); 
         Fireinput.util.insertCharAtCaret(this.myTarget, Fireinput.imePanel.getLastSelectedElementValue());
         // add into long table 
         if (this.mySaveHistory) Fireinput.longTable.notify(this.myTarget);

         return;
      }

      //left arrow key. 
      if (keyCode == KeyEvent.DOM_VK_LEFT) {
         if (!this.myIMEInputBarStatus) return;

         // inputField is focused 
         if (Fireinput.imePanel.getComposeEnabled()) return;
         var idf = document.getElementById("fireinputField");
         //Fireinput.log.debug(this,"idf.value:" + idf.value);
         if (idf.selectionStart <= 1) {
            // it's at the beginning 
            if (Fireinput.composer.hasSet()) {
               // the composer is formed. Now we need to disable last composed word 
               var key = Fireinput.composer.removeLastFromPanel();
               if (key) {
                  var pos = key.length + 1;
                  idf.value = key + idf.value;
                  idf.setSelectionRange(pos, pos)
                  Fireinput.imePanel.setInputChar(key);
                  Fireinput.imePanel.findCharWithDelay();
               }
            }
         }
         else {
            // there are still some room on the left. Show the selected word from 0 until this position 
            var subInputKeys = idf.value.substring(0, idf.selectionStart - 1);
            // Fireinput.log.debug(this,"subInputKeys:" + subInputKeys);
            Fireinput.imePanel.setInputChar(subInputKeys);
            Fireinput.imePanel.findCharWithDelay();
         }

      }

      //right arrow key. 
      if (keyCode == KeyEvent.DOM_VK_RIGHT) {
         if (!this.myIMEInputBarStatus) return;

         // inputField is focused 
         if (Fireinput.imePanel.getComposeEnabled()) return;
         var idf = document.getElementById("fireinputField");
         if ((idf.selectionEnd + 1) <= idf.value.length) {
            // there are still some room on the right. Show the selected word from 0 until this position 
            var subInputKeys = idf.value.substring(0, idf.selectionEnd + 1);
            Fireinput.imePanel.setInputChar(subInputKeys);
            Fireinput.imePanel.findCharWithDelay();
         }
      }


      // backspace: remove the input bar. If the input bar is empty, remove target value 
      if (keyCode == KeyEvent.DOM_VK_BACK_SPACE) {
         // inputField is focused 
         if (Fireinput.imePanel.getComposeEnabled()) return;

         if (this.myIMEInputBarStatus) {
            var id = document.getElementById("fireinputIMEContainer");
            var idf = document.getElementById("fireinputField");
            if (idf.value.length == 0 && !Fireinput.composer.hasSet()) {
               id.hidePopup();
            }
            else {
               event.preventDefault();

               Fireinput.imePanel.setInputChar(idf.value);

               if (Fireinput.imePanel.getInputChar().length > 0) {
                  var selectionEnd = idf.selectionEnd;
                  idf.value = idf.value.substring(0, selectionEnd - 1) + idf.value.substring(selectionEnd, idf.value.length);
                  Fireinput.imePanel.setInputChar(idf.value);
                  Fireinput.util.setCaretTo(idf, selectionEnd - 1);
               }
               // if the caret is not at the end of position, only select the char from 0 to this position 
               if (Fireinput.imePanel.getInputChar().length <= 0 || idf.selectionStart <= 0) {
                  var key = Fireinput.composer.removeLastFromPanel();
                  if (key) {
                     idf.value = key + idf.value.substring(0, idf.value.length);
                     Fireinput.imePanel.setInputChar(key);
                     Fireinput.util.setCaretTo(idf, key.length);
                  }
               }
               else if (idf.selectionStart != idf.value.length) {
                  var subInputKeys = idf.value.substring(0, idf.selectionStart);
                  Fireinput.imePanel.setInputChar(subInputKeys);
               }

               if (idf.value.length == 0) {
                  id.hidePopup();
                  return;
               }
               Fireinput.imePanel.findCharWithDelay();
            }
         }

         return;
      }

      // page down for next 
      if (Fireinput.keyBinding.isTrue("pageDownKey", event)) {
         if (this.myIMEInputBarStatus) {
            event.preventDefault();
            event.stopPropagation();
            Fireinput.imePanel.nextSel();
         }
         return;
      }
      // page up for previous 
      if (Fireinput.keyBinding.isTrue("pageUpKey", event)) {
         if (this.myIMEInputBarStatus) {
            event.preventDefault();
            event.stopPropagation();
            Fireinput.imePanel.prevSel();
         }

         return;
      }

      this.KeyEventInsert(event);

   },

   KeyEventInsert: function (event) {
      // if it enters from keyPress but keyDown has already captured this event, don't proceed 
      if (event.getPreventDefault()) return;

      // enter: select the highlight column. If the input bar is not activated, go to default action 
      if (Fireinput.keyBinding.isTrue("selectFirstKey", event) || event.keyCode == KeyEvent.DOM_VK_RETURN) {
         // here we try to trim the long sentence. Surely we should have a better way to organize this. 
         // maybe a fast text search library or sth ? 
         if (!this.myIMEInputBarStatus && event.keyCode == KeyEvent.DOM_VK_RETURN) {
            if (this.mySaveHistory) Fireinput.longTable.notify(this.myTarget);
            return true;
         }

         if (this.myIMEInputBarStatus) {
            Fireinput.imePanel.insertCharByIndex(event, 1);
         }
         return true;
      }

      // handle the second 
      if (Fireinput.keyBinding.isTrue("selectSecondKey", event)) {
         if (this.myIMEInputBarStatus) {
            Fireinput.imePanel.insertCharByIndex(event, 2);
         }

         return true;
      }

      if (Fireinput.keyBinding.isTrue("selectThirdKey", event)) {
         if (this.myIMEInputBarStatus) {
            Fireinput.imePanel.insertCharByIndex(event, 3);
         }
         return true;
      }

      return false;
   },

   keyPressListener: function (event) {
      if (!this.myRunStatus) return;
      if (this.myEventDispatch) return ; 

      var keyCode = event.keyCode;
      var charCode = event.charCode;

      // if shift key and other key has been pressed together, reset the IMEmode back 
      if ((event.shiftKey || event.altKey || event.ctrlKey) && (keyCode || charCode)) {
         this.myChangeIMEModeEvent = false;
      }

      // return if these keys are pressed 
      if (event.altKey || event.ctrlKey || event.metaKey || (event.shiftKey && !(keyCode || charCode))) return;

      // return here if the mode is non-chinese mode 
      if (this.myIMEMode != Fireinput.IME_MODE_ZH) return;

      // somehow if the key is pressed too fast following a valid inputchar, the keydown event might not be triggered
      // we need to check them here again. Please note that the test shows the issue only show up in one-char press, 
      // so we are safe to just checking keyCode or charCode here 
      if (this.KeyEventInsert(event)) return;

      // if it's not printable char, just return here 
      if (charCode == 0) return;
 
      var targetInfo = this.isValidTarget(event);
      if (!targetInfo.valid) return;

      var target = targetInfo.target;
      var documentTarget = targetInfo.documentTarget;

      // the IME mode needs to be reset if the target has changed 
      // if(this.myTarget && this.myTarget.target != target)
      //   this.setIMEMode(Fireinput.IME_MODE_ZH);
      // keep the real event and target if inputfield has been focused 
      if (!Fireinput.imePanel.getIMEInputFieldFocusedStatus() && !Fireinput.imePanel.getComposeEnabled() && 
          (typeof(this.myTarget.target) == 'undefined' || this.myTarget.target != target)) {
         this.myEvent = event;
         this.myTarget.event = event;
         this.myTarget.target = target; 
         this.myTarget.originalTarget = targetInfo.originalTarget;
         this.myTarget.documentTarget = documentTarget; 
      }

      // remember the caret position before focus switch 
      // only for HTMLInputElement or TextAreaElement 
      if (this.myTarget.target.setSelectionRange) {
         this.myTarget.selectionStart = this.myTarget.target.selectionStart;
         this.myTarget.selectionEnd = this.myTarget.target.selectionEnd;

         if (typeof(this.myTarget.focused) == 'undefined') this.myTarget.focused = 0;
      }


      var key = String.fromCharCode(charCode);

      // 1..2..9
      if (charCode > KeyEvent.DOM_VK_0 && charCode <= KeyEvent.DOM_VK_9) {
         if (this.myIMEInputBarStatus) {
            Fireinput.imePanel.insertCharByIndex(event, key);
         }

         return;
      }

      // small case a-z 
      if (this.myAllowInputKey.indexOf(key) >= 0) {
         // don't relay on input event. It's slow. 
         // return if compose is enabled 
         if (Fireinput.imePanel.getComposeEnabled()) {
            return;
         }

         event.preventDefault();
         event.stopPropagation();
         // open IME input window 
         if (!this.myIMEInputBarStatus) {
            // reset popupNode to fix inputbar popup position issue 
            document.popupNode = null;
            var xpos = 0;
            var ypos = 0;

            // for XBL element, use explicitOriginalTarget for alignment 
            if (target.boxObject) {
               var id = document.getElementById("fireinputIMEContainer");
               id.openPopup(target, "after_pointer", 0, 5);
            }
            else if (!documentTarget) {
               // HTML input/textarea element 
               xpos = Fireinput.util.findPosX(target) - Fireinput.util.getDocumentScrollLeft(document.commandDispatcher.focusedWindow.document);
               ypos = Fireinput.util.findPosY(target) - Fireinput.util.getDocumentScrollTop(document.commandDispatcher.focusedWindow.document);

               ypos += target.clientHeight;

               // get FF header height/position 
               var h = document.getElementById("navigator-toolbox");
               ypos += h.boxObject.height;
               // care about tab header 
               if (gBrowser.getStripVisibility()) {
                  if (typeof(gBrowser.mStrip.boxObject) != 'undefined') {
                     // old FF < 4.0
                     ypos += gBrowser.mStrip.boxObject.height;
                  }

                  // FF 4.0 or above won't need ajustment 
               }

               // handle notification panel height
               if(gBrowser.getNotificationBox()) {
                  var aNotification = gBrowser.getNotificationBox(); 
                  var notifications = aNotification.allNotifications;
                  for (var n = notifications.length - 1; n >= 0; n--) {
                     if(typeof(notifications[n].boxObject) != 'undefined')
                       ypos += notifications[n].boxObject.height; 
                  }
               }

               //	        if(ypos > (window.innerHeight - 20))
               //                   ypos = window.innerHeight - 20; 
               if (ypos <= 20) ypos = 20;
               //Fireinput.log.debug(this,"xpos:" + xpos); 
               //Fireinput.log.debug(this,"ypos:" + ypos); 
               var id = document.getElementById("fireinputIMEContainer");
               id.openPopup(document.documentElement, "after_pointer", xpos, ypos);
            }
            else {
               // rich editor 
               var p = target.frameElement;

               xpos = Fireinput.util.findPosX(p);
               ypos = Fireinput.util.findPosY(p);
               // Fireinput.log.debug(this, "p: " + p + ", tagname: " + p.tagName + ", id: " + p.id);
               // some iframes are inside of another iframe. To get the top iframe, we need to 
               // loop through the parentNode to find out whic one is first iframe. Not sure what the 
               // best way to do here 
               var parentNode = p ? p.parentNode : null;
               while (parentNode) {
                  // document node 
                  if (parentNode.nodeType == 9) {
                     parentNode = parentNode.defaultView.frameElement;
                     if (parentNode && parentNode.tagName == 'IFRAME') {
                        xpos += Fireinput.util.findPosX(parentNode);
                        ypos += Fireinput.util.findPosY(parentNode);
                        p = parentNode;
                     }
                     else break;
                  }
                  else parentNode = parentNode.parentNode;

               }

               xpos += window.screenX;
               ypos += window.screenY;

               // gmail main body is built of iframe. So we need to check both ownerDocument and contentDocument 
               // scroll attribute to ajust popup position 
               if (p != target.frameElement) {
                  xpos -= (Fireinput.util.getDocumentScrollLeft(p.ownerDocument) + Fireinput.util.getDocumentScrollLeft(p.contentDocument));
                  ypos -= (Fireinput.util.getDocumentScrollTop(p.ownerDocument) + Fireinput.util.getDocumentScrollTop(p.contentDocument));
               }
               else {
                  xpos -= Fireinput.util.getDocumentScrollLeft(p.ownerDocument);
                  ypos -= Fireinput.util.getDocumentScrollTop(p.ownerDocument);
               }

               // var frameHeight = p.contentDocument.height; 
               // ypos += p.clientHeight; 
               // get FF header height/position 
               var h = document.getElementById("navigator-toolbox");
               ypos += h.boxObject.height;

               // care about tab header 
               if (gBrowser.getStripVisibility()) {
                  if (typeof(gBrowser.mStrip.boxObject) != 'undefined') 
                     ypos += gBrowser.mStrip.boxObject.height;
               }

               // handle notification panel height
               if(gBrowser.getNotificationBox()) {
                  var aNotification = gBrowser.getNotificationBox(); 
                  var notifications = aNotification.allNotifications;
                  for (var n = notifications.length - 1; n >= 0; n--) {
                     if(typeof(notifications[n].boxObject) != 'undefined')
                       ypos += notifications[n].boxObject.height; 
                  }
               }

               // most of rich editors have toolbar on top, put popup on top of toolbar 
               // ypos -= 30;

               if (ypos <= 20) ypos = 20;

               var id = document.getElementById("fireinputIMEContainer");
               if(!this.myTarget.screenX)
                  id.openPopupAtScreen(xpos, ypos);
               else 
                  id.openPopupAtScreen(this.myTarget.screenX, this.myTarget.screenY+10);
            }

            // we have to set this true immediately after showPopup as the onpopupshown handler might be slow to catch 
            // initial key event (which is trggered when fireinput was initialized first time)
            this.myIMEInputBarStatus = true;

            // The reason I have to put here is because textbox won't be able to initialize correctly without first assign the value 
            // thus either idf.selectionEnd or idf.value will throw exception. It only happens when fireinput is loaded first time 
            var idf = document.getElementById("fireinputField");
            Fireinput.imePanel.setInputChar(key);
            idf.value = key;
         }
         else {
            var idf = document.getElementById("fireinputField");
            // if the input field meets the maxAllowedKeys, don't append 
            if (this.myIME.getMaxAllowedKeys() > 0 && idf.value.length >= this.myIME.getMaxAllowedKeys()) {
               return;
            }

            // see whether the caret is 
            if (idf.selectionEnd < idf.value.length) {
               var selectionEnd = idf.selectionEnd;
               var fvalue = idf.value.substring(0, selectionEnd) + key;
               idf.value = fvalue + idf.value.substring(selectionEnd, idf.value.length);
               Fireinput.imePanel.setInputChar(fvalue);
               Fireinput.util.setCaretTo(idf, selectionEnd + 1);
            }
            else {
               Fireinput.imePanel.setInputChar(Fireinput.imePanel.getInputChar() + key);
               idf.value += key;
            }
         }

         // Fireinput.log.debug(this,"idf.value:" + idf.value);
         Fireinput.log.debug(this, "call findChar when idf.value:" + idf.value);
         //The findchar has to invoked here to resolve the performance issue 
         
         //set tab index, so it has chance to take this browser's on-demand data as high priority 
         var tabIndex = gBrowser.getBrowserIndexForDocument(gBrowser.selectedBrowser.contentWindow.document);
         this.myIME.setBrowserIndex(tabIndex);

         Fireinput.imePanel.findChar(true);
         return;
      }

      // use single quot to separate pinyin input 
      if (this.myIMEInputBarStatus) {
         if (key == "'" && !Fireinput.imePanel.getComposeEnabled()) {
            event.preventDefault();
            var idf = document.getElementById("fireinputField");
            // only one is allowed
            if (idf.value.length > 0 && idf.value.substr(idf.value.length - 1, 1) != "'") {
               if (idf.selectionEnd < idf.value.length) {
                  var selectionEnd = idf.selectionEnd;
                  var fvalue = idf.value.substring(0, selectionEnd) + key;
                  idf.value = fvalue + idf.value.substring(selectionEnd, idf.value.length);
                  Fireinput.imePanel.setInputChar(fvalue);
                  Fireinput.util.setCaretTo(idf, selectionEnd + 1);
               }
               else {
                  Fireinput.imePanel.setInputChar(Fireinput.imePanel.getInputChar() + key);
                  idf.value += key;
               }
               return;
            }
         }

         // won't allow any other chars if IME inputbar is opened 
         if (key != "'") // && (Fireinput.imePanel.getIMEInputFieldFocusedStatus() || Fireinput.imePanel.getComposeEnabled()))
         {
            event.preventDefault();
            event.stopPropagation();
         }
      }
      // convert to Full width letters. If the event has getPreventDefault true which might be set in keydown listener
      // we will ignore too  
      if (!this.myIMEInputBarStatus && !event.getPreventDefault()) {
         var fullLetter = this.myIME.convertLetter(charCode);
         if (typeof(fullLetter) == "object") {
            event.preventDefault();
            event.stopPropagation();
            for (var s in fullLetter) {
               Fireinput.util.insertCharAtCaret(this.myTarget, fullLetter[s]);
            }
         }
         else if (typeof(fullLetter) != "undefined") {
            event.preventDefault();
            event.stopPropagation();
            Fireinput.util.insertCharAtCaret(this.myTarget, fullLetter);
         }

         // time to flush long table 
         if (this.mySaveHistory) Fireinput.longTable.notify(this.myTarget);
      }

      return;
   },

   IMEWindowHidden: function () {
      // restore the focus to target if inputfield has been focused 
      if (Fireinput.imePanel.getIMEInputFieldFocusedStatus() || Fireinput.imePanel.getComposeEnabled()) {
         Fireinput.util.setFocus(this.myTarget.target);
         this.myTarget.focused = 1;
      }

      Fireinput.composer.reset();
      this.myIMEInputBarStatus = false;
      Fireinput.imePanel.setIMEInputFieldFocusedStatus(false);
      Fireinput.imePanel.hideAndCleanInput();
   },

   IMEWindowShown: function () {
      // if the first few input key too fast, the hidden event is ahead of shown event(because of GUI time consuming). 
      // In this case, this.myIMEInputBarStatus might be false, and we certainly don't want to change focus again 
      if (this.myIMEInputBarStatus) Fireinput.util.setFocus(document.getElementById("fireinputField"));
   },

   IMEWindowShowing: function () {
      // the showing event is ahead of hidden event and shown event. It's safe to 
      // set inputbar status here 
      this.myIMEInputBarStatus = true;
   },

   displayAjaxService: function (forceLoad) {
      Fireinput.specialChar.load(forceLoad);
      Fireinput.themes.load(forceLoad);
      Fireinput.emotions.load(forceLoad);
      Fireinput.help.load(forceLoad);
      Fireinput.table.load(forceLoad);
   },

   insertSpecialCharAt: function (event, sourceType, insertMode) {
      var clickTarget = event.target;
      // Fireinput.log.debug(this, "value=" + clickTarget.value); 
      var target = document.commandDispatcher.focusedElement;
      var documentTarget = false;
      if (target) {
         if (!this.isTargetATextBox(target)) return;
      }
      else {
         // editable DOM document(iframe:designMode=On) 
         target = document.commandDispatcher.focusedWindow;
         if (target) {
            var editingSession = target.QueryInterface(Components.interfaces.nsIInterfaceRequestor).
                                        getInterface(Components.interfaces.nsIWebNavigation).
                                        QueryInterface(Components.interfaces.nsIInterfaceRequestor).
                                        getInterface(Components.interfaces.nsIEditingSession);
            if (!editingSession.windowIsEditable(target)) return;

            documentTarget = true;
         }
      }

      var inputTarget = {
         target: target,
         event: event, 
         originalTarget: target,
         documentTarget: documentTarget,
         focused: 0
      };

      var value = clickTarget.getAttribute("hiddenvalue");
      if (!value) value = clickTarget.getAttribute("value");

      if (target.setSelectionRange) {
         inputTarget.selectionStart = target.selectionStart;
         inputTarget.selectionEnd = target.selectionEnd;
      }

      Fireinput.util.insertCharAtCaret(inputTarget, value, sourceType, insertMode);
   },

   showConfig: function (module, param) {
      window.openDialog('chrome://fireinput/content/fireinputConfig.xul', 'fireinputConfigWindow', 'chrome,modal=no,resizable=no', module, param);
   },

   showInputMethodSetting: function () {
      var param = this.myEnabledIME.join(",");
      this.showConfig('inputmethod', param);
   },

   showkeyConfigWindow: function () {
      var param = this.myEnabledIME.join(",");
      this.showConfig('keyconfig', param);
   },

   showInputSettingWindow: function () {
      var param = this.myEnabledIME.join(",");
      this.showConfig('inputwindow', param);
   },

   displayADString: function () {
      var ADString = "\n——————————————————————————\n";
      ADString += "火输中文输入法(Fireinput.com)";
      Fireinput.util.insertCharAtCaret(this.myTarget, ADString);
   }


});

// link getCurrentIME to Fireinput, so the component leve will be okay */
Fireinput.getCurrentIME = function() {
   return Fireinput.main.getCurrentIME(); 
}; 

// Create event listener.
window.addEventListener('keydown', Fireinput.main.keyDownListener.bind(Fireinput.main), true);
window.addEventListener('mousedown', Fireinput.main.mouseDownListener.bind(Fireinput.main), true);

// init Fireinput and monitor page loads and switches 
window.addEventListener("load", function (e) {
   // delay load to have better performance 
   window.setTimeout(function() {
      Fireinput.main.initialize(); 
      Fireinput.contextReader.init();
   }, 1000); 

}, false);

