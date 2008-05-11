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
//const THEMES_URL = "http://www.fireinput.com/themes/themes.html"; 
const THEMES_URL = "http://www.fireinput.com/themes/themes.html"; 

const themeUI = [
    {id: "fireinputThemeUser", strKey: "fireinput.theme.mime.label", attribute: "label"},
    {id: "fireinputThemeMenu", strKey: "fireinput.theme.menu.label", attribute: "label"},
    {id: "fireinputThemeDefault", strKey: "fireinput.theme.default.label", attribute: "label"}
];


var FireinputThemes = 
{
    initialized: false, 
    
    userEmotionList: [], 

    load: function(forceLoad)
    {
       if(!this.initialized || forceLoad) 
       {
          // get default language first 
          var defaultLanguage = FireinputPrefDefault.getInterfaceLanguage();
          for(var i =0; i<themeUI.length; i++)
          {
             var id = themeUI[i].id;
             var strKey = themeUI[i].strKey;
             var attr = themeUI[i].attribute;

             var value = FireinputUtils.getLocaleString(strKey + defaultLanguage);
             var handle = document.getElementById(id);
             if(!handle)
                continue;
             handle.setAttribute(attr, value);
          }

          this.initialized = true; 
          this.loadRemoteThemes(); 

          // if forceLoad happens, don't register observer second time 
          if(forceLoad)
             return; 
 
          // register an observer 
          var os = Components.classes["@mozilla.org/observer-service;1"]
                       .getService(Components.interfaces.nsIObserverService);

          os.addObserver(this, "user-theme-changed", false);
       }

    },

    loadRemoteThemes: function()
    {
       var ajax = new Ajax(); 
       if(!ajax)
          return; 

       var self = this; 
       ajax.setOptions(
          { 
             method: 'get',
             onSuccess: function(p) { self.displayThemeMenu(p); },
             onFailure: function(p) { self.displayThemeMenu(p); }
          }); 
       ajax.request(THEMES_URL); 
    }, 

    displayThemeMenu: function(p)
    {
       if(!p)
          return; 
       if(p.responseText.length <= 0)
          return; 

       var jsonArray; 
       try {
          jsonArray = eval('(' + p.responseText + ')'); 
       }
       catch(e) { }; 

       if(typeof(jsonArray) == 'undefined')
          return; 

       this.addGroup(jsonArray);
    },

    //FIXME: here 
    refreshMenu: function()
    {
       if(!this.initialized)
          return; 

       var defaultLanguage = FireinputPrefDefault.getInterfaceLanguage();

       this.mouseTooltip = FireinputUtils.getLocaleString("fireinput.emotion.mouse.tooltips" + defaultLanguage); 

       var myMenuID = document.getElementById("fireinput.emotion.user.list");
       var myLabel = FireinputUtils.getLocaleString("fireinput.emotion.user.list" + defaultLanguage);
       myMenuID.setAttribute("label", myLabel);

       var actionMenuID = document.getElementById("fireinput.emotion.user.action");
       var aLabel = FireinputUtils.getLocaleString("fireinput.emotion.user.action" + defaultLanguage);
       actionMenuID.setAttribute("label", aLabel);

       var element = document.getElementById("fireinputEmotionMenu"); 
       var label = FireinputUtils.getLocaleString("fireinput.emotion.label" + defaultLanguage);
       element.setAttribute("label", label);

       element = document.getElementById("fireinputEmotionMenuItems");

       for (var child = element.firstChild; child; child = child.nextSibling)
       {
          var label = ""; 
          if(defaultLanguage != "")
             label = child.getAttribute("categoryname"); 
          else
             label = child.getAttribute("category"); 

          if(label && label.length > 0)
             child.setAttribute("label", label); 

          var images = child.getElementsByTagName("image"); 
          if(!images)
             continue; 

          for(var i=images.length-1; i>=0; i--)
          {
             images[i].setAttribute("tooltiptext", this.mouseTooltip); 
          }
       }
    },


    addGroup: function(jsonArray)
    {
       // get default language first 
       var defaultLanguage = FireinputPrefDefault.getLanguage();
       var openingSeparator = document.getElementById("themeOpenSeparator");
       var closingSeparator = document.getElementById("themeCloseSeparator");
       var themeMenu =  document.getElementById("fireinputThemeMenus");

       while(openingSeparator.nextSibling && openingSeparator.nextSibling != closingSeparator)
         themeMenu.removeChild(openingSeparator.nextSibling);
    
       // Check configured theme id 
       var currentTheme = FireinputPrefDefault.getThemeID(); 

       for(var i=0; i < jsonArray.length; i++)
       {
          var data = jsonArray[i]; 
 
          var id = "fireinput.theme." + data.id; 
          var menuID = document.getElementById(id); 
          var label = data.name; 
          if(!menuID)
          { 
             var item = document.createElement("menuitem"); 
             item.setAttribute("label", label); 
             item.setAttribute("class", "menuitem-iconic");
             item.setAttribute("type", "checkbox");
             item.setAttribute("autocheck", "false");
             item.setAttribute("themeid", data.id); 
             item.setAttribute("fontcolor", data.fontcolor); 
             item.setAttribute("furl", data.furl); 
             item.setAttribute("iurl", data.iurl); 
             item.setAttribute("id", id); 
             item.setAttribute("oncommand", "FireinputThemes.applyTheme(event.target);");
             item.setAttribute("checked", (currentTheme == data.id)); 

             themeMenu.insertBefore(item, closingSeparator); 
          }

          // enable the currentTheme 
          if(currentTheme == data.id)
             this.applyThisTheme(data.fontcolor, data.furl, data.iurl); 
       }
    },

    userChooseTheme: function()
    {
       return false; 
    }, 

    applyDefault: function()
    {
/*
       var containerBox = document.getElementById('fireinputIMEContainerBox');
       containerBox.removeAttribute('fireinputtheme'); 
       containerBox.style.removeProperty('background-image'); 
       containerBox.style.removeProperty('color');
*/
       var pos = FireinputPrefDefault.getIMEBarPosition(); 
       var imeBar = document.getElementById('fireinputIMEBar_' + pos); 
       imeBar.removeAttribute('fireinputtheme'); 
       imeBar.style.removeProperty('background-image'); 

       // deselect the menu item 
       var currentTheme = FireinputPrefDefault.getThemeID(); 
       var menuitemSelected = document.getElementById("fireinput.theme." + currentTheme); 
       if(menuitemSelected)
          menuitemSelected.setAttribute("checked", false); 

       // update the pref 
       fireinputPrefSave('themeID', 'default'); 
    }, 

    applyTheme: function(target)
    {
       // deselect the menu first 
       var currentTheme = FireinputPrefDefault.getThemeID(); 
       var menuitemSelected = document.getElementById("fireinput.theme." + currentTheme); 
       if(menuitemSelected)
          menuitemSelected.setAttribute("checked", false); 

       // update theme 
       var fontcolor = target.getAttribute("fontcolor"); 
       var furl = target.getAttribute("furl"); 
       var iurl = target.getAttribute("iurl"); 
       this.applyThisTheme(fontcolor, furl, iurl); 

       // select the menu 
       target.setAttribute("checked", true); 
       // update pref 
       fireinputPrefSave('themeID', target.getAttribute('themeid')); 
    }, 

    applyThisTheme: function(fontcolor, furl, iurl)
    {
/*
       var containerBox = document.getElementById('fireinputIMEContainerBox');
       containerBox.setAttribute('fireinputtheme', true);
       // call setProperty because the traditional way won't work 
       containerBox.style.setProperty('background-image', "url('" + iurl + "')", "important"); 
       containerBox.style.color = fontcolor; 
*/
       var pos = FireinputPrefDefault.getIMEBarPosition(); 
       var imeBar = document.getElementById('fireinputIMEBar_' + pos); 
       imeBar.setAttribute('fireinputtheme', true); 
       imeBar.style.setProperty('background-image', "url('" + furl + "')", "important"); 
    }, 

    observe: function(subject, topic, data)
    {
       if(topic != 'user-emotion-changed')
          return; 

       this.loadUserEmotionURL(); 
    }
};              

