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
const prefNames =
[
    {name: "interfaceLanguage", type: "STRING"},
    {name: "defaultInputMethod", type: "STRING"},
    {name: "saveHistory", type: "BOOL"},
    {name: "autoInsert", type: "BOOL"},
    {name: "fireinputOpenKeyBinding", type: "STRING"},
    {name: "firstrun",type: "STRING"},
    {name: "IMEBarPosition", type: "STRING"},
    {name: "themeID", type: "STRING"},
    {name: "updateFreq", type: "BOOL"}
];

const prefInterfaceUI = [ 
            {id: "fireinputSettingMenu", strKey: "fireinput.menu.setting.label", attribute: "label"},           
            {id: "fireinputDefaultIMEBarPos", strKey: "fireinput.pref.imebar.position", attribute: "label"},           
            {id: "fireinputIMEBarPosTop", strKey: "fireinput.pref.imebar.position.top", attribute: "label"},           
            {id: "fireinputIMEBarPosBottom", strKey: "fireinput.pref.imebar.position.bottom", attribute: "label"},           
            {id: "autoInsert", strKey: "fireinput.pref.auto.insert", attribute: "label"},           
            {id: "autoInsert", strKey: "fireinput.pref.auto.insert.tooltip", attribute: "tooltiptext"},           
            {id: "fireinputDefaultInputMethod", strKey: "fireinput.pref.input.method", attribute: "label"},           
            {id: "saveHistory", strKey: "fireinput.pref.save.history", attribute: "label"},           
            {id: "updateFreq", strKey: "fireinput.pref.update.freq", attribute: "label"},           
            {id: "fireinputInterfaceLanguage", strKey: "fireinput.choose.interface.language", attribute: "label"},
            {id: "fireinputLanguageChinese", strKey: "fireinput.chinese.label", attribute: "label"},           
            {id: "fireinputLanguageEnglish", strKey: "fireinput.english.label", attribute: "label"},           
            {id: "imePinyinQuan", strKey: "fireinput.pinyin.quan.label", attribute: "label"},           
            {id: "imePinyinShuangZiGuang", strKey: "fireinput.pinyin.shuang.ziguang.label", attribute: "label"},
            {id: "imePinyinShuangMS", strKey: "fireinput.pinyin.shuang.ms.label", attribute: "label"},
            {id: "imePinyinShuangChineseStar", strKey: "fireinput.pinyin.shuang.chinesestar.label", attribute: "label"},
            {id: "imePinyinShuangSmartABC", strKey: "fireinput.pinyin.shuang.smartabc.label", attribute: "label"},
            {id: "imeWubi86", strKey: "fireinput.wubi86.label", attribute: "label"},
            {id: "imeWubi98", strKey: "fireinput.wubi98.label", attribute: "label"},
            {id: "imeCangjie5", strKey: "fireinput.cangjie5.label", attribute: "label"},
            {id: "fireinputAMB", strKey: "fireinput.pref.amb.label", attribute: "label"},
            {id: "fireinputOpenKeyBinding", strKey: "fireinput.pref.open.hotkey", attribute: "label"},
            {id: "fireinputOpenKeyBinding", strKey: "fireinput.pref.open.hotkey.tooltip", attribute: "tooltiptext"},
            {id: "fireinputOpenKeyBindingCtrlF12", strKey: "fireinput.pref.open.hotkey.tooltip", attribute: "tooltiptext"},
            {id: "fireinputOpenKeyBindingCtrlF11", strKey: "fireinput.pref.open.hotkey.tooltip", attribute: "tooltiptext"},
            {id: "fireinputOpenKeyBindingAltF12", strKey: "fireinput.pref.open.hotkey.tooltip", attribute: "tooltiptext"},
            {id: "fireinputOpenKeyBindingAltF11", strKey: "fireinput.pref.open.hotkey.tooltip", attribute: "tooltiptext"}
      ]; 


function fireinputPrefInit()
{
    // get default language first 
    var defaultLanguage = FireinputPrefDefault.getInterfaceLanguage(); 

    // update UI 
    for(var i =prefInterfaceUI.length-1; i>=0; i--)
    {
       var id = prefInterfaceUI[i].id; 
       var strKey = prefInterfaceUI[i].strKey; 
       var attr = prefInterfaceUI[i].attribute; 
 
       var value = FireinputUtils.getLocaleString(strKey + defaultLanguage); 
       var handle = document.getElementById(id); 
       if(!handle)
          handle = document.documentElement.getButton(id); 
       if(!handle) 
          continue; 
       handle.setAttribute(attr, value); 
    }
}

function fireinputPrefGetType(option)
{
   for(var i =prefNames.length-1; i>=0; i--)
    {
       if(option == prefNames[i].name)
       {
          return prefNames[i].type; 
       }
    }
 
    return 'STRING'; 
}

function fireinputPrefGetDefault(option)
{
    switch(option)
    {
       case "interfaceLanguage": 
          return FireinputPrefDefault.getLanguage(); 
       break; 
       case "defaultInputMethod": 
          return FireinputPrefDefault.getSchema(); 
       break; 
       case "saveHistory": 
          return FireinputPrefDefault.getSaveHistory(); 
       break; 
       case "autoInsert": 
          return FireinputPrefDefault.getAutoInsert(); 
       break; 
       case "fireinputOpenKeyBinding": 
          return FireinputPrefDefault.getOpenKeyBinding(); 
       break; 
       case "firstrun": 
          return FireinputPrefDefault.getFirstRun(); 
       break; 
       case "IMEBarPosition": 
          return FireinputPrefDefault.getIMEBarPosition(); 
       break; 
       case "themeID": 
          return FireinputPrefDefault.getThemeID(); 
       break; 
       case "updateFreq": 
          return FireinputPrefDefault.getUpdateFreq(); 
       break; 
       default: 
          return 'undefined'; 
       break; 
    }
}

    
function fireinputPrefShowing(popup)
{
    for (var child = popup.firstChild; child; child = child.nextSibling)
    {
       if (child.localName == "menuitem")
       {
          var option = child.getAttribute("option");
          if (option)
          {
             var type = child.getAttribute("type"); 
             if(type == "radio")
             { 
                var value = child.getAttribute("value"); 
                try
                {
                   var optionType = fireinputPrefGetType(option);
                   var savedValue = FireinputPref.getPref(option, optionType);
                   child.setAttribute("checked", savedValue == value ? true : false); 
                }
                catch(e)
                {
                   var defaultValue = fireinputPrefGetDefault(option); 
                   child.setAttribute("checked", defaultValue == value ? true : false); 
                }
             }

             if(type == "checkbox")
             { 
                // checkbox is BOOL type. 
                try
                {
                   var savedValue = FireinputPref.getPref(option, "BOOL");
                   child.setAttribute("checked", savedValue); 
                }
                catch(e)
                {
                   var defaultValue = fireinputPrefGetDefault(option); 
                   child.setAttribute("checked", defaultValue); 
                }
             }

          }
       } /* if menuitem */

    }
}

function fireinputPrefSave(menuitem, ovalue)
{
    
    var option = null; 
    if(menuitem.getAttribute)
        option = menuitem.getAttribute("option");

    if (option)
    {
       var type = menuitem.getAttribute("type");
       if(type == "radio")
       { 
          var value = menuitem.getAttribute("value");
          try 
          {
             FireinputPref.setPref(option,"STRING", value); 
          }
          catch(e) {}; 
       }

       if(type == "checkbox")
       { 
          try 
          {
             FireinputPref.setPref(option,"BOOL", menuitem.getAttribute("checked") == "true"); 
          }
          catch(e) {}; 
       }
    }
    else 
    {
       // might be real option 
       var type = fireinputPrefGetType(menuitem); 
       if(type != 'undefined')
       {
          try 
          {
             FireinputPref.setPref(menuitem,type, ovalue); 
          }
          catch(e) {}; 
       }
    }
   
    return true; 
}

var FireinputPrefDefault = {
    
    getInterfaceLanguage: function()
    {
       // get default language first 
       var defaultLanguage = LANGUAGE_ZH; 

       try {
          defaultLanguage = FireinputPref.getPref("interfaceLanguage", "STRING");
       }
       catch(e) 
       { };

       if(defaultLanguage.length > 0)
          defaultLanguage = "." + defaultLanguage; 

       return defaultLanguage; 
    },

    getLanguage: function()
    {
       // get default language first 
       var defaultLanguage = LANGUAGE_ZH; 

       try {
          defaultLanguage = FireinputPref.getPref("interfaceLanguage", "STRING");
       }
       catch(e) 
       { };

       return defaultLanguage; 
    },

    getSchema: function()
    {
       var defaultMethod = SMART_PINYIN; 
       try {
          defaultMethod = FireinputPref.getPref("defaultInputMethod", "STRING");
       }
       catch(e)
       { }

       return defaultMethod; 
    },
 
    getSaveHistory: function()
    {
       var saveHistory = true; 
       try {
          var value = FireinputPref.getPref("saveHistory", "BOOL");
          if(value == true)
             saveHistory = true; 
          else
             saveHistory = false;
       }
       catch(e) 
       { };

       return saveHistory; 
    },

    getUpdateFreq: function()
    {
       var updateFreq = true; 
       try {
          var value = FireinputPref.getPref("updateFreq", "BOOL");
          if(value == true)
             updateFreq = true; 
          else
             updateFreq = false;
       }
       catch(e) 
       { };

       return updateFreq; 
    }, 

    getAutoInsert: function()
    {
       var autoInsert = true;
       try {
          var value = FireinputPref.getPref("autoInsert", "BOOL");
          if(value == true)
             autoInsert = true;
          else
             autoInsert = false;
       }
       catch(e)
       { };

       return autoInsert;
    },

    getOpenKeyBinding: function()
    {
       var defaultOpenKeyBinding = "control,VK_F12"; 
       try {
          defaultOpenKeyBinding = FireinputPref.getPref("fireinputOpenKeyBinding", "STRING");
       }
       catch(e)
       { }

       return defaultOpenKeyBinding; 
    },

    getAMBOption: function(option)
    {
       var ambEnabled = false; 
       try {
          var value = FireinputPref.getPref(option, "BOOL");
          if(value == true)
             ambEnabled = true;
          else
             ambEnabled = false;
       }
       catch(e)
       { };

       return ambEnabled;
    },
 
    getFirstRun: function()
    {
       var value = ""; 
       try {
          value = FireinputPref.getPref("firstrun", "STRING");
       }
       catch(e) { }; 

       return value; 
    },

    getIMEBarPosition: function()
    {
       var defaultPos = IME_BAR_BOTTOM; 
       try {
          defaultPos = FireinputPref.getPref("IMEBarPosition", "STRING");
       }
       catch(e)
       { }

       return defaultPos; 
    },

    getThemeID: function()
    {
       var themeID = 'default'; 
       try {
          themeID = FireinputPref.getPref("themeID", "STRING");
       }
       catch(e)
       { }

       return themeID; 
    }
         

}; 
