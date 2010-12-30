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
const EMOTION_URL = SERVER_URL + "/emotions/emotion.html"; 

var FireinputEmotions = 
{
    initialized: false, 
    
    initializeRemote: false, 

    mouseTooltips: "", 

    userEmotionList: [], 

    addContextSelectedImage: function()
    {
       if(FireinputEmotionUpdater.save(gContextMenu.imageURL))
       {
          this.loadUserEmotionURL();
       }
    }, 

    load: function(forceLoad)
    {
       if(!this.initialized || forceLoad) 
       {
          // get default language first 
          var defaultLanguage = fireinputPrefGetDefault("interfaceLanguage"); 
          this.mouseTooltip = FireinputUtils.getLocaleString("fireinput.emotion.mouse.tooltips" + defaultLanguage); 

          var element = document.getElementById("fireinputEmotionMenu"); 
          var label = FireinputUtils.getLocaleString("fireinput.emotion.label" + defaultLanguage);
          element.setAttribute("label", label);

          this.initialized = true; 
          this.initializeRemote = false; 
          this.loadUserEmotionURL(); 

          // if forceLoad happens, don't register observer second time 
          if(forceLoad)
             return;

          // register an observer 
          var os = FireinputXPC.getService("@mozilla.org/observer-service;1", "nsIObserverService");
          os.addObserver(this, "fireinput-user-emotion-changed", false);
       }

    },

    addUserEmotionMenu: function()
    {
       var defaultLanguage = fireinputPrefGetDefault("interfaceLanguage");
       var menuElement = document.getElementById("fireinputEmotionMenuItems");

       // user action menu 
       var id = "fireinput.emotion.user.action"; 
       var label = FireinputUtils.getLocaleString(id + defaultLanguage); 
       var menuID = document.getElementById(id); 
       if(!menuID)
       {
          var subMenu = document.createElement("menuitem");
          subMenu.setAttribute("label", label);
          subMenu.setAttribute("id", id);
          subMenu.onclick=bind(function(event)
                                { 
                                    this.showAddEmotionDialog(event);
                                }, this);

          menuElement.appendChild(subMenu);

       }

       // user img list 
       id = "fireinput.emotion.user.list"; 
       menuID = document.getElementById(id);
       label = FireinputUtils.getLocaleString(id + defaultLanguage); 
       if(!menuID)
       {
          var subMenu = document.createElement("menu");
          var subMenupopup = document.createElement("menupopup");
          subMenu.setAttribute("label", label);
          subMenu.setAttribute("id", id);

          this.addGroupEmotion(subMenupopup, this.userEmotionList);
          subMenupopup.setAttribute("id", id + "_popupmenu");

          subMenu.appendChild(subMenupopup);
          menuElement.appendChild(subMenu);
       }
       else 
       {
          while(menuID.hasChildNodes())
          {
             menuID.removeChild(menuID.lastChild);
          }

          var subMenupopup = document.createElement("menupopup");

          this.addGroupEmotion(subMenupopup, this.userEmotionList);
          subMenupopup.setAttribute("id", id + "_popupmenu");
          menuID.appendChild(subMenupopup);

       }

       // remote emotion 
       if(!this.initializeRemote)
         this.loadRemoteEmotions(); 
    }, 

    loadUserEmotionURL: function()
    {
       var ios = FireinputXPC.getIOService(); 
       var fileHandler = ios.getProtocolHandler("file")
                         .QueryInterface(Components.interfaces.nsIFileProtocolHandler);

       var datafile = FireinputUtils.getUserFile("useremotion.fireinput"); 
       this.userEmotionList.length = 0; 
       if(!datafile.exists())
       {
          // add user's other menu 
          this.addUserEmotionMenu(); 
          return;
       }
 
       var options = {
          caller: this,
          oncomplete: this.addUserEmotionMenu, 
          onavailable: this.getUserEmotionURL
       };
       FireinputStream.loadDataAsync(ios.newFileURI(datafile), options);
    }, 

    getUserEmotionURL: function(str)
    {
       this.userEmotionList[this.userEmotionList.length] = str; 
    }, 

    showAddEmotionDialog: function()
    {
       FireinputUtils.loadURI("chrome://fireinput/content/emotionmgr/emotionmgr.html"); 
    },

    loadRemoteEmotions: function()
    {
       var ajax = new Ajax(); 
       if(!ajax)
          return; 

       var self = this; 

       ajax.setOptions(
          { 
             method: 'get',
             onSuccess: function(p) { self.displayEmotionMenu(p); },
             onFailure: function(p) { self.displayEmotionMenu(p); }
          }); 
       ajax.request(EMOTION_URL); 
    }, 

    displayEmotionMenu: function(p)
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

       this.initializeRemote = true; 
       this.addGroup(jsonArray);
    },

    refreshMenu: function()
    {
       if(!this.initialized)
          return; 

       var defaultLanguage = fireinputPrefGetDefault("interfaceLanguage");

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
       var defaultLanguage = fireinputPrefGetDefault("interfaceLanguage");
       var menuElement = document.getElementById("fireinputEmotionMenuItems");

       for(var i=0; i < jsonArray.length; i++)
       {
          var data = jsonArray[i]; 
          var groupName = data.name; 

          if(defaultLanguage.indexOf(LANGUAGE_ZH) < 0)
             groupName = data.category; 

          var id = "fireinput.emotion." + data.category; 
          var menuID = document.getElementById(id); 
          var label = groupName; 
          if(!menuID)
          { 
             var subMenu = document.createElement("menu"); 
             var subMenupopup = document.createElement("menupopup"); 
             subMenu.setAttribute("label", label); 
             subMenu.setAttribute("categoryname", data.name); 
             subMenu.setAttribute("category", data.category); 
             subMenu.setAttribute("id", id); 

             this.addGroupEmotion(subMenupopup, data.urllist); 
             subMenupopup.setAttribute("id", id +"_menupopup"); 

             subMenu.appendChild(subMenupopup); 
             menuElement.appendChild(subMenu); 

          }
          else 
          {
             menuID.setAttribute("label", label); 
          }
       }
    },

    addGroupEmotion: function(menuItem, urllist)
    {
       var num = 5; 

       if(urllist.length > 50)
           num = 10; 

       for(var i=urllist.length-1; i>=0;)
       {
 
          var toolbar = document.createElement("toolbar"); 
          toolbar.setAttribute("class", "specialcharbar"); 
          var j=0; 
          for(j=0; j<num && (i-j) >=0; j++)
          {
             var label = document.createElement("label"); 
             label.setAttribute("class", "specialcharlabel");
             label.setAttribute("hiddenvalue", urllist[i-j]);
                  
             label.onclick=bind(function(event) 
                                { if(event.button == 2) 
                                    Fireinput.insertSpecialCharAt(event, IMAGE_SOURCE_TYPE, IMAGE_INSERT_BBCODE_URL); 
                                  else 
                                    Fireinput.insertSpecialCharAt(event, IMAGE_SOURCE_TYPE, IMAGE_INSERT_URL); 
                                }, this); 
             var img = document.createElement("image");
             img.setAttribute("src", urllist[i-j]);
             img.setAttribute("height", 32);
             img.setAttribute("width", 32);
             img.setAttribute("value", urllist[i-j]);
             img.setAttribute("tooltiptext", this.mouseTooltip); 
             label.appendChild(img);
             toolbar.appendChild(label); 
          }
          i-= j; 
          
          menuItem.appendChild(toolbar); 
       }
    },

    copyIntoClipboard: function(event)
    {
       var clickTarget = event.target;
       var value = clickTarget.getAttribute("hiddenvalue");
       if(!value)
          value = clickTarget.getAttribute("value");

       try 
       {
          var clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"]
                                    .getService(Components.interfaces.nsIClipboardHelper);
          clipboard.copyString(value); 
       } 
       catch(e) {}
    },

    observe: function(subject, topic, data)
    {
       if(topic != 'fireinput-user-emotion-changed')
          return; 

       this.loadUserEmotionURL(); 
    }
};              

