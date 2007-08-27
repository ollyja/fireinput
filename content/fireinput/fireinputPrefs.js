const prefNames =
[
    "interfaceLanguage","defaultInputMethod", "saveHistory"
];

const prefInterfaceUI = [ 
            {id: "fireinputDefaultInputMethod", strKey: "fireinput.pref.input.method", attribute: "label"},           
            {id: "saveHistory", strKey: "fireinput.pref.save.history", attribute: "label"},           
            {id: "fireinputInterfaceLanguage", strKey: "fireinput.choose.interface.language", attribute: "label"},
            {id: "fireinputLanguageChinese", strKey: "fireinput.chinese.label", attribute: "label"},           
            {id: "fireinputLanguageEnglish", strKey: "fireinput.english.label", attribute: "label"},           
            {id: "imePinyinQuan", strKey: "fireinput.pinyin.quan.label", attribute: "label"},           
            {id: "imePinyinShuangZiGuang", strKey: "fireinput.pinyin.shuang.ziguang.label", attribute: "label"},
            {id: "imePinyinShuangMS", strKey: "fireinput.pinyin.shuang.ms.label", attribute: "label"},
            {id: "imePinyinShuangChineseStar", strKey: "fireinput.pinyin.shuang.chinesestar.label", attribute: "label"},
            {id: "imePinyinShuangSmartABC", strKey: "fireinput.pinyin.shuang.smartabc.label", attribute: "label"},
      ]; 


function fireinputPrefInit()
{
    // get default language first 
    var defaultLanguage = FireinputPrefDefault.getInterfaceLanguage(); 

    // update UI 
    for(var i =0; i<prefInterfaceUI.length; i++)
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

function fireinputPrefGetDefault(option)
{
    if(option == "interfaceLanguage")
       return FireinputPrefDefault.getLanguage(); 

    if(option == "defaultInputMethod")
       return FireinputPrefDefault.getSchema(); 

    return 'undefined'; 
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
                   var savedValue = FireinputPref.getPref(option, "STRING");
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
                try
                {
                   var savedValue = FireinputPref.getPref(option, "BOOL");
                   child.setAttribute("checked", savedValue); 
                }
                catch(e)
                {
                   child.setAttribute("checked", false); 
                }
             }

          }
       } /* if menuitem */

    }
}

function fireinputPrefSave(menuitem)
{
    var option = menuitem.getAttribute("option");
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
    }
}; 

