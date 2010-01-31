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

const RELEASE_NEW = "http://www.fireinput.com/wiki/Release_Page"; 
const DEVRELEASE_NEW = "http://www.fireinput.com/releases/test.html"; 

const helpUI = [
    {id: "helpMenuHome", strKey: "fireinput.help.home", attribute: "label"},
    {id: "helpMenuDoc", strKey: "fireinput.help.document", attribute: "label"},
    {id: "helpMenuKey", strKey: "fireinput.help.shortkey", attribute: "label"},
    {id: "helpMenuEditor", strKey: "fireinput.help.editor", attribute: "label"},
    {id: "helpNewRelease", strKey: "fireinput.help.newrelease", attribute: "label"},
    {id: "helpMenuAbout", strKey: "fireinput.help.about", attribute: "label"},
    {id: "helpMenuDonate", strKey: "fireinput.help.donate", attribute: "label"}
]; 

const helpSite = {
    home: "http://www.fireinput.com",
    release: RELEASE_NEW, 
    devrelease: DEVRELEASE_NEW, 
    docs: "http://www.fireinput.com/wiki/Document_Page",
    shortkey: "chrome://fireinput/content/shortkey.html",
    contribute: "http://www.fireinput.com/contribute.html"
}; 


var FireinputHelp = 
{
    initialized: false,

    load: function(forceLoad)
    {
       if(this.initialized && !forceLoad)
          return;

       this.refreshMenu(); 

       // check new releases
       this.checkNewRelease(); 
       // check if it's running dev version 
       this.checkNewDevRelease(); 

       this.initialized = true; 
    },

    refreshMenu: function()
    {
       // get default language first 
       var defaultLanguage = fireinputPrefGetDefault("interfaceLanguage");
       // update UI 
       for(var i =0; i<helpUI.length; i++)
       {
          var id = helpUI[i].id;
          var handle = document.getElementById(id);
          if(!handle)
             continue;

          var strKey = helpUI[i].strKey;
          var attr = helpUI[i].attribute;

          var value = FireinputUtils.getLocaleString(strKey + defaultLanguage);
          // to check whether the shortcut keystring exists 
          var found =value.match(/%(.+)%/i);
          if(found)
          {
             var keystring = FireinputKeyBinding.getKeyString(found[1]);
             value = value.replace(found[0], keystring);
          }

          handle.setAttribute(attr, value);
       }
    }, 


    showSite: function(site)
    {
       var url = helpSite[site]; 
       if (url)
          FireinputUtils.loadURI(url); 
    },

    showRelease: function()
    {
       var element = document.getElementById("helpNewRelease");
       this.showSite(element.getAttribute("release")); 
    }, 

    openEditor: function()
    {
       FireinputUtils.loadURI("chrome://fireinput/content/editor.html"); 
    },
    
    showAbout: function()
    {
       FireinputUtils.loadURI("chrome://fireinput/content/about.html"); 
    }, 

    checkNewRelease: function()
    {
       var ajax = new Ajax();
       if(!ajax)
          return;

       var self = this;

       ajax.setOptions(
          {
             method: 'get',
             onSuccess: function(p) { self.displayNewReleaseMenuItem(p); }
          });

       ajax.request(RELEASE_NEW);
    },

    displayNewReleaseMenuItem: function(p)
    {
       if(!p)
          return;
       if(p.responseText.length <= 0)
          return;

       var version = p.responseText.match(/latestrelease_([\d\.]+)/);
       if(!version || version.length < 2)
          return; 

       version = version[1]; 
       var newVersionArray = version.split('.'); 
       var curVersionArray = FIREINPUT_VERSION.split('.'); 

       if(curVersionArray.length <= 1) 
          return; 

       var curVersionMinor = curVersionArray[1]; 
       curVersionMinor = curVersionMinor.replace(/\D+/, ""); 

       // major version 
       if(newVersionArray[0] < curVersionArray[0])
          return;         

       // minor version 
       if(newVersionArray[1] < parseInt(curVersionMinor))
          return; 

       if(newVersionArray[1] > parseInt(curVersionMinor))
       {
          this.showNewRelease(version); 
          return; 
       }

       if(newVersionArray.length <= 2) 
          return; 

       // development version 
       if(newVersionArray.length > curVersionArray.length)
       {
          this.showNewRelease(version); 
          return; 
       }
       else if(newVersionArray.length == curVersionArray.length)
       {
          var devNewVersion = newVersionArray[newVersionArray.length -1];   
          var devCurVersion = curVersionArray[curVersionArray.length -1];   
          if(parseInt(devNewVersion) > parseInt(devCurVersion))
          {
             this.showNewRelease(version); 
             return; 
          }
       } 
    }, 
   
    showNewRelease: function(version)
    {   
       var element = document.getElementById("helpNewRelease"); 
       element.style.display = ""; 
       element.style.color = "red"; 
       element.setAttribute("label", element.getAttribute("label") + " " + version);
       element.setAttribute("release", "release");

       element = document.getElementById("fireinputHelp"); 
       element.style.color = "red"; 

       var defaultLanguage = fireinputPrefGetDefault("interfaceLanguage");

       element = document.getElementById("fireinputNewVersion");
       var msg = FireinputUtils.getLocaleString("fireinput.help.newrelease.text" + defaultLanguage);
       msg = msg.replace(/%VERSION%/, version); 
       element.setAttribute("label", msg); 

       
       element = document.getElementById("fireinputNewVersionPanel");
       element.style.display = "";
    }, 

    checkNewDevRelease: function()
    {
       var buildDateArray = FIREINPUT_VERSION.match(/[\d\.]+_(\d{4})(\d{2})(\d{2})/); 
       // just return if it's not dev release 
       if(!buildDateArray || buildDateArray.length < 4)
          return; 

       var ajax = new Ajax();
       if(!ajax)
          return;

       var self = this;

       ajax.setOptions(
          {
             method: 'get',
             onSuccess: function(p) { self.displayNewDevReleaseMenuItem(p); }
          });

       ajax.request(DEVRELEASE_NEW);
    },

    displayNewDevReleaseMenuItem: function(p)
    {
       if(!p)
          return;
       if(p.responseText.length <= 0)
          return;

       var version = p.responseText.match(/latestrelease_([\d\.]+)_([\d]+)/);
       if(!version || version.length < 3)
          return; 

       var newBuildDateArray = version[2].match(/(\d{4})(\d{2})(\d{2})/); 
       var curBuildDateArray = FIREINPUT_VERSION.match(/[\d\.]+_(\d{4})(\d{2})(\d{2})/); 
       if(!newBuildDateArray || newBuildDateArray.length < 3)
          return; 

       // it may not dev release. 
       if(!curBuildDateArray || curBuildDateArray.length < 4)
          return; 

       if(parseInt(version[2]) > parseInt(curBuildDateArray[1] + "" + curBuildDateArray[2] + "" + curBuildDateArray[3]))
       {
          // new dev release 
          newBuildDateArray.shift(); 
          this.showNewDevRelease(version[1], newBuildDateArray); 
       } 
    }, 
   
    showNewDevRelease: function(version, buildDateArray)
    {   
       var element = document.getElementById("helpNewRelease"); 
       element.style.display = ""; 
       element.style.color = "red"; 
       element.setAttribute("label", element.getAttribute("label") + " " + version + " " + buildDateArray.join("/"));
       element.setAttribute("release", "devrelease");

       element = document.getElementById("fireinputHelp"); 
       element.style.color = "red"; 

       var defaultLanguage = fireinputPrefGetDefault("interfaceLanguage");

       element = document.getElementById("fireinputNewVersion");
       var msg = FireinputUtils.getLocaleString("fireinput.help.newdevrelease.text" + defaultLanguage);
       msg = msg.replace(/%VERSION%/, version + " " + buildDateArray.join("/")); 
       element.setAttribute("label", msg); 

       
       element = document.getElementById("fireinputNewVersionPanel");
       element.style.display = "";
    }
}; 


