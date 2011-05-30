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

Fireinput.namespace("Fireinput.themes"); 

Fireinput.themes.themes_url = Fireinput.SERVER_URL + "/themes/themes.html"; 

Fireinput.themes.themeUI = [
    {id: "fireinputThemeUser", strKey: "fireinput.theme.mime.label", attribute: "label"},
    {id: "fireinputThemeMenu", strKey: "fireinput.theme.menu.label", attribute: "label"},
    {id: "fireinputThemeDefault", strKey: "fireinput.theme.default.label", attribute: "label"}
];

Fireinput.themes = Fireinput.extend(Fireinput.themes, {
    initialized: false, 
    
    userEmotionList: [], 

    load: function(forceLoad)
    {
       if(!this.initialized || forceLoad) 
       {
          this.refreshMenu(); 

          this.initialized = true; 
          this.loadRemoteThemes(); 

          // if forceLoad happens, don't register observer second time 
          if(forceLoad)
             return; 
 
          // register an observer 
          var os = Fireinput.util.xpc.getService("@mozilla.org/observer-service;1", "nsIObserverService");
          os.addObserver(this, "user-theme-changed", false);
       }

    },

    refreshMenu: function()
    {
       var doc = Fireinput.util.getDocument();
       if(!doc)
         return;
       
       // get default language first 
       var defaultLanguage = Fireinput.pref.getDefault("interfaceLanguage");
       for(var i =0; i<this.themeUI.length; i++)
       {
          var id = this.themeUI[i].id;
          var strKey = this.themeUI[i].strKey;
          var attr = this.themeUI[i].attribute;

          var value = Fireinput.util.getLocaleString(strKey + defaultLanguage);
          var handle = Fireinput.util.getElementById(doc, "*", id);
          if(!handle)
             continue;
          handle.setAttribute(attr, value);
       }

    }, 

    loadRemoteThemes: function()
    {
       var ajax = new Fireinput.util.ajax(); 
       if(!ajax)
          return; 

       var self = this; 
       ajax.setOptions(
          { 
             method: 'get',
             onSuccess: function(p) { self.displayThemeMenu(p); },
             onFailure: function(p) { self.displayThemeMenu(p); }
          }); 
       ajax.request(this.themes_url); 
    }, 

    displayThemeMenu: function(p)
    {
       if(!p)
          return; 
       if(p.responseText.length <= 0)
          return; 

       var jsonArray; 
       try {
          jsonArray = JSON.parse(p.responseText);
       }
       catch(e) { }; 

       if(typeof(jsonArray) == 'undefined')
          return; 

       this.addGroup(jsonArray);
    },

    addGroup: function(jsonArray)
    {
       var doc = Fireinput.util.getDocument();
       if(!doc)
         return;
       // get default language first 
       var defaultLanguage = Fireinput.pref.getDefault("interfaceLanguage");
       var openingSeparator = Fireinput.util.getElementById(doc, "*", "fireinputThemeOpenSeparator");
       var closingSeparator = Fireinput.util.getElementById(doc, "*", "fireinputThemeCloseSeparator");
       var themeMenu =  Fireinput.util.getElementById(doc, "*", "fireinputThemeMenus");

       while(openingSeparator.nextSibling && openingSeparator.nextSibling != closingSeparator)
         themeMenu.removeChild(openingSeparator.nextSibling);
    
       // Check configured theme id 
       var currentTheme = Fireinput.pref.getDefault("themeID");

       for(var i=0; i < jsonArray.length; i++)
       {
          var data = jsonArray[i]; 
 
          var id = "fireinput.theme." + data.id; 
          var menuID = Fireinput.util.getElementById(doc, "menuitem", id); 
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
             item.setAttribute("oncommand", "Fireinput.themes.applyTheme(event.target);");
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
       var doc = Fireinput.util.getDocument();
       if(!doc)
         return;
/*
       var containerBox = document.getElementById('fireinputIMEContainerBox');
       containerBox.removeAttribute('fireinputtheme'); 
       containerBox.style.removeProperty('background-image'); 
       containerBox.style.removeProperty('color');
*/
       var pos = Fireinput.pref.getDefault("IMEBarPosition");
       if(pos == Fireinput.IME_BAR_FLOATING) {
         var floatingPanels = gBrowser.selectedBrowser.parentNode.parentNode.getElementsByClassName("fireinputIMEBar_" + Fireinput.IME_BAR_FLOATING);
         if(floatingPanels && floatingPanels.length > 0) {
            for(var i=0; i<floatingPanels.length; i++) {
               floatingPanels[i].removeAttribute('fireinputtheme'); 
               floatingPanels[i].style.removeProperty('background-image'); 
            }
         }
         
       }
       else {
          var imeBar = document.getElementById('fireinputIMEBar_' + pos); 
          imeBar.removeAttribute('fireinputtheme'); 
          imeBar.style.removeProperty('background-image'); 
       }


       // deselect the menu item 
       var currentTheme = Fireinput.pref.getDefault("themeID");
       var menuitemSelected = Fireinput.util.getElementById(doc, "*", "fireinput.theme." + currentTheme); 
       if(menuitemSelected)
          menuitemSelected.setAttribute("checked", false); 

       // update the pref 
       Fireinput.pref.save('themeID', 'default'); 
    }, 

    applyTheme: function(target)
    {
       var doc = Fireinput.util.getDocument();
       if(!doc)
         return;
       // deselect the menu first 
       var currentTheme = Fireinput.pref.getDefault("themeID");
       var menuitemSelected = Fireinput.util.getElementById(doc, "*", "fireinput.theme." + currentTheme); 
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
       Fireinput.pref.save('themeID', target.getAttribute('themeid')); 
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
       var pos = Fireinput.pref.getDefault("IMEBarPosition");
       if(pos == Fireinput.IME_BAR_FLOATING) {
         var floatingPanels = gBrowser.selectedBrowser.parentNode.parentNode.getElementsByClassName("fireinputIMEBar_" + Fireinput.IME_BAR_FLOATING);
         if(floatingPanels && floatingPanels.length > 0) {
            for(var i=0; i<floatingPanels.length; i++) {
               floatingPanels[i].setAttribute('fireinputtheme', true); 
               floatingPanels[i].style.setProperty('background-image', "url('" + furl + "')", "important"); 
            }
         }
        
       }
       else {
         var imeBar = document.getElementById('fireinputIMEBar_' + pos); 
         imeBar.setAttribute('fireinputtheme', true); 
         imeBar.style.setProperty('background-image', "url('" + furl + "')", "important"); 
       }
    }, 

    observe: function(subject, topic, data)
    {
       if(topic != 'fireinput-user-emotion-changed')
          return; 

       // this.loadUserEmotionURL(); 
    }
});              

