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

Fireinput.namespace("Fireinput.util");

Fireinput.util.xpc = 
{
    CC: function(cName)
    {
       return Components.classes[cName];
    },

    CI: function(ifaceName)
    {
       return Components.interfaces[ifaceName];
    },

    getService: function(cName, ifaceName)
    { 
       if(ifaceName)
          return this.CC(cName).getService(this.CI(ifaceName));
       else 
          return this.CC(cName).getService();
    },

    createInstance: function(cName, ifaceName)
    {
       return this.CC(cName).createInstance(this.CI(ifaceName));
    },

    QueryInterface: function(obj, iface)
    {
       return obj.QueryInterface(iface);
    },
 
    getIOService: function()
    {
       return this.getService("@mozilla.org/network/io-service;1", "nsIIOService");
    } 
 
    
}; 


Fireinput.util.env = 
{
    getEnv: function(name)
    {
       var gEnv = Fireinput.util.xpc.getService("@mozilla.org/process/environment;1", "nsIEnvironment");
       return gEnv.get(name);
    },

    getOS: function()
    {
       var gOS = Fireinput.util.xpc.getService("@mozilla.org/network/protocol;1?name=http", "nsIHttpProtocolHandler");
       var oscpu = gOS.oscpu; 
       if(/linux/i.test(oscpu))
          return "Linux"; 
       if(/Mac/i.test(oscpu))
          return "Mac"; 
       if(/Windows/i.test(oscpu))
          return "Windows"; 

       return "Linux";
    },
    
    isLinux: function()
    {
       return this.getOS() == 'Linux'; 
    },

    isWindows: function()
    {
       return this.getOS() == 'Windows'; 
    },

    isMac: function()
    {
       return this.getOS() == 'Mac'; 
    }

}; 


Fireinput.util.pref = 
{
    gPref: null, 

    getPref: function(name, type)
    {
       if(!this.gPref)
         this.gPref = Fireinput.util.xpc.getService("@mozilla.org/preferences-service;1", "nsIPrefBranch"); 

       var prefName = Fireinput.prefDomain + "." + name;

       if(type == 'undefined')
          type = this.gPref.getPrefType(prefName);

       if (type == "INT" || type == this.gPref.PREF_INT)
          return this.gPref.getIntPref(prefName);
       else if (type == "BOOL" || type == this.gPref.PREF_BOOL)
          return this.gPref.getBoolPref(prefName);
       else if(type == "STRING" || type == this.gPref.PREF_STRING)
          return this.gPref.getCharPref(prefName); 
       else
          return null; 
    },

    setPref: function(name, type,  value)
    {
       if(!this.gPref)
         this.gPref = Fireinput.util.xpc.getService("@mozilla.org/preferences-service;1", "nsIPrefBranch"); 
       var prefName = Fireinput.prefDomain + "." + name;

       if(type == 'undefined')
          type = this.gPref.getPrefType(prefName);

       if (type == "INT" || type == this.gPref.PREF_INT)
          this.gPref.setIntPref(prefName, value);
       else if (type == "BOOL" || type == this.gPref.PREF_BOOL)
          this.gPref.setBoolPref(prefName, value);
       else 
          this.gPref.setCharPref(prefName, value);
    },

    addObserver: function(aTopic, aOwnsWeak)
    {
       if(!this.gPref)
          this.gPref = Fireinput.util.xpc.getService("@mozilla.org/preferences-service;1", "nsIPrefBranch"); 
       var pbi =  this.gPref.QueryInterface(Components.interfaces.nsIPrefBranch2);
       pbi.addObserver(Fireinput.prefDomain, aTopic, aOwnsWeak);
    }

}; 

Fireinput.util.unicode = 
{
    gUnicode: null, 

    getUnicodeString: function(text, charset)
    {
       if(!this.gUnicode)
         this.gUnicode = Fireinput.util.xpc.createInstance("@mozilla.org/intl/scriptableunicodeconverter", "nsIScriptableUnicodeConverter"); 
       this.gUnicode.charset = charset ? charset : "UTF-8";
       try
       {
          return this.gUnicode.ConvertToUnicode(text);
       }
       catch(ex) 
       {
         return text; 
       }
    },
    
    convertFromUnicode: function(text, charset)
    {
       try 
       {
          if(!this.gUnicode)
             this.gUnicode = Fireinput.util.xpc.createInstance("@mozilla.org/intl/scriptableunicodeconverter", "nsIScriptableUnicodeConverter"); 
          this.gUnicode.charset = charset ? charset : "UTF-8";
          text = this.gUnicode.ConvertFromUnicode(text);
          return text + this.gUnicode.Finish();
       }
       catch(ex) 
       {
         return text; 
       }
    },
    getByteArray: function(text, charset)
    {
       if(!this.gUnicode)
         this.gUnicode = Fireinput.util.xpc.createInstance("@mozilla.org/intl/scriptableunicodeconverter", "nsIScriptableUnicodeConverter");
       this.gUnicode.charset = charset ? charset : "UTF-8";
       try
       {
          var dataArray = {};
          return this.gUnicode.convertToByteArray(text, dataArray); 
       }
       catch(ex)
       {
         return text;
       }
    },

};

Fireinput.util = Fireinput.extend(Fireinput.util, {
    debug: 1, 

    $STR: function(name)
    {
       return document.getElementById("strings_fireinput").getString(name);
    },

    $STRF: function(name, args)
    {
       return document.getElementById("strings_fireinput").getFormattedString(name, args);
    },
 
    loadURI: function(url)
    {
      if(gBrowser.currentURI.spec == 'about:blank' || gBrowser.currentURI.spec == '')
          gBrowser.loadURI(url); 
       else
          gBrowser.selectedTab = gBrowser.addTab(url); 
    }, 

    setFocus: function(target)
    {
       try {
          target.focus();
       }
       catch(e)
       {
       }
    }, 

    insertCharAtCaret: function (element, text, sourceType, insertMode) 
    {
       if(!element)
          return; 

       // text field. We can only insert bb code here  	
       if(element.target.setSelectionRange) 
       {
          // setFocus before set any values to avoid being reset by target onfocus event -  normally happens to textfield or textarea  
          this.setFocus(element.originalTarget); 
          var end   = element.selectionEnd;
          var start = element.selectionStart;

          element.originalTarget.setSelectionRange(start, end);

          if(typeof(sourceType) != 'undefined' && sourceType == Fireinput.IMAGE_SOURCE_TYPE)
          {
             if(insertMode == Fireinput.IMAGE_INSERT_BBCODE_URL) 
      	        text = "[img]" + text + "[/img]"; 
          }

          // trigger custom-event 
          Fireinput.main.setEventDispathMode(true);
          for(var i=0; i<text.length; i++) {
            var newEvent = document.createEvent("KeyEvents")
            newEvent.initKeyEvent("keypress", true, false, document.defaultView,
                        false, false, false, false, 
                        0, text.charCodeAt(i));

            element.originalTarget.dispatchEvent(newEvent);
          }
          Fireinput.main.setEventDispathMode(false);

          return;
       }
       else if(element.documentTarget)
       {
          var win = element.target; 
          var doc = win.content.document; 
          var selection =  win.getSelection();

          if(!selection.focusNode)
             return; 

          // Fireinput.log.debug(this, "selection.focusNode.nodeType: " + selection.focusNode.nodeType); 
          // Fireinput.log.debug(this, "selection.focusNode.name: " + selection.focusNode.nodeName); 
          // Fireinput.log.debug(this, "selection.focusNode.value: " + selection.focusNode.nodeValue); 
          // Fireinput.log.debug(this, "selection.focusOffset: " + selection.focusOffset); 

          // get the first range of the selection
          // delete content if the collpase is not true 
          var range = selection.getRangeAt(0);
          if(!range.collapsed)
              range.deleteContents();

          if (selection.focusNode.nodeType==Node.ELEMENT_NODE || selection.focusNode.nodeType == Node.TEXT_NODE)
          {

             if(typeof(sourceType) != 'undefined' && sourceType == Fireinput.IMAGE_SOURCE_TYPE)
             {
                var imgNode = doc.createElement("img");
                imgNode.setAttribute("src", text); 

                var startContainer = range.startContainer;
                var startOffset = range.startOffset;
                if(startContainer.nodeType == Node.TEXT_NODE) {
                  var beforeNode = startContainer.splitText(startOffset);
                  var parentNode = beforeNode.parentNode;
                  parentNode.insertBefore(imgNode, beforeNode);
                  selection.collapse(beforeNode, 0); 
                }
                else {
                  startContainer.appendChild(imgNode); 
                }
                return; 
             }
          }
        }

        // complex document. It's highly possible that the editor is not using designMode. 
        // As such we emulate keypress event to send out text value. By doing this way, 
        // google doc works great 
             
        Fireinput.main.setEventDispathMode(true);
        for(var i=0; i<text.length; i++) {
            var newEvent = document.createEvent("KeyEvents")
            newEvent.initKeyEvent("keypress", true, false, document.defaultView,
                        false, false, false, false, 
                        0, text.charCodeAt(i));
            // don't use element.target since it's originalTarget which won't work 
            var target = element.event.target; 

            if(typeof(element.event.button) != 'undefined') {
               // originally mouse event. use target.document which is pointed to iframe 
               // Teh target.content.document is pointed to iframe parent window 
               target = element.target.document.documentElement;
            }

            target.dispatchEvent(newEvent);             
        }
        Fireinput.main.setEventDispathMode(false);
    },

    setCaretTo: function (obj, pos) 
    {
       if(obj.selectionStart) 
       {
	      // should turn on focus ? 
	      // obj.focus();
	      obj.setSelectionRange(pos, pos);
       }
    },

    getCaretPos: function(obj)
    {
       return obj.selectionEnd; 
    },

    insertAtSelection: function(selection, text, sourceType)
    {
       var range = selection.getRangeAt(0);
       var ancestorContainer = range.commonAncestorContainer;
       var doc = ancestorContainer.ownerDocument;

       var startContainer = range.startContainer;
       var startOffset = range.startOffset;

       try {
          if (ancestorContainer == doc.body)
          ancestorContainer = doc.documentElement;
       } catch (e) { }
    

       // each path is a "child sequence" (a.k.a. "tumbler") that
       // descends from the ancestor down to the boundary point
       var startPath = this.getPath(ancestorContainer, startContainer);

       startContainer = ancestorContainer;

       var canInsert = ancestorContainer.hasChildNodes();
       if (canInsert)
       {
          var i;
          for (i = startPath ? startPath.length-1 : -1; i >= 0; i--) 
          {
             startContainer = startContainer.childNodes.item(startPath[i]);
          }

          var tmpNode = "";
          if(typeof(sourceType) != 'undefined' && sourceType == Fireinput.IMAGE_SOURCE_TYPE)
          {
             tmpNode = doc.createElement("img");
             tmpNode.setAttribute("src", text);
          }
          else 
             tmpNode = doc.createTextNode(text);

          startContainer.insertBefore(tmpNode, startContainer.childNodes.item(startOffset));
          selection.collapse(startContainer, startOffset+1);
      }
    }, 

    getPath: function (ancestor, node)
    {
       var n = node;
       var p = n.parentNode;
       if (n == ancestor || !p)
          return null;

       var path = new Array();
       if (!path)
          return null;
       do 
       {
          for (var i = 0; i < p.childNodes.length; i++) 
          {
             if (p.childNodes.item(i) == n) 
             {
                path[path.length] = i; 
                break;
             }
          }
          n = p;
          p = n.parentNode;
       } while (n != ancestor && p);

       return path;
    },

    findPosX: function(obj)
    {
       if(!obj)
         return 0; 

       var curleft = obj.offsetLeft;
       if(obj.offsetParent)
       { 
          var osParent = obj.offsetParent; 
          while(osParent)
          {
             curleft += osParent.offsetLeft;
             osParent = osParent.offsetParent;
          }
       }        
       else if(obj.x)
          curleft += obj.x;
       return curleft;
    },

    findPosY: function(obj)
    {
       if(!obj)
         return 0; 
       var curtop = obj.offsetTop;
       if(obj.offsetParent)
       {
          var osParent = obj.offsetParent; 
          while(osParent)
          {
             curtop += osParent.offsetTop;
             osParent = osParent.offsetParent;
          }
       }
       else if(obj.y)
          curtop += obj.y;
       return curtop;
    },

    getDocumentScrollTop: function(document)
    {
       if(!document) 
          return 0; 
       return document.documentElement.scrollTop || 
       (document.body ? document.body.scrollTop : 0); 
    }, 

    getDocumentScrollLeft: function(document)
    {
       if(!document) 
          return 0; 

       return document.documentElement.scrollLeft || 
       (document.body ? document.body.scrollLeft : 0); 
    }, 

    getExtensionPath : function() 
    {
       try 
       {

          var chromeRegistry = Fireinput.util.xpc.getService("@mozilla.org/chrome/chrome-registry;1", "nsIChromeRegistry");
          var uri = Fireinput.util.xpc.createInstance("@mozilla.org/network/standard-url;1", "nsIURI");
					
          uri.spec = "chrome://fireinput/content/";
			
          var path = chromeRegistry.convertChromeURL(uri);
          if (typeof(path) == "object") path = path.spec
/*
          if (path.length >= 4 && path.substr(0, 4) == "jar:") 
          {
             path = path.substring(4); // remove "jar:" at the beginning
          }
*/

          return path; 
       }
       catch (e) 
       {
       }

       return undefined; 
    },

    getUserFile: function(filename)
    {
       this.moveOldUserDataFile(filename);
       var dirService = Fireinput.util.xpc.getService("@mozilla.org/file/directory_service;1", "nsIProperties");

       var file = dirService.get("ProfD", Components.interfaces.nsIFile);
       file.append("fireinput"); 
       file.append(filename);
       return file; 
    }, 

    moveOldUserDataFile: function(filename)
    {
       var dirService = Fireinput.util.xpc.getService("@mozilla.org/file/directory_service;1", "nsIProperties");

       var sfile = dirService.get("ProfD", Components.interfaces.nsIFile);
       sfile.append(filename);
       if(sfile.exists()) {
          var dfile = dirService.get("ProfD", Components.interfaces.nsIFile);
          dfile.append("fireinput"); 
          sfile.moveTo(dfile, filename); 
       }
    }, 

    initUserDataDir: function()
    {
       var dirService = Fireinput.util.xpc.getService("@mozilla.org/file/directory_service;1", "nsIProperties");

       var file = dirService.get("ProfD", Components.interfaces.nsIFile);
       file.append("fireinput"); 
       if( !file.exists() || !file.isDirectory() ) {   // if it doesn't exist, create  
           file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);  
       }  
    }, 

    getAppRootPath: function()
    {
       var dirService = Fireinput.util.xpc.getService("@mozilla.org/file/directory_service;1", "nsIProperties");

       var file = dirService.get("ProfD", Components.interfaces.nsIFile);
       return file.path; 
    },

    trimString: function(str)
    {
       return str.replace(/^\s+/g, '').replace(/\s+$/g, '');
    },

    getLocaleString: function (stringKey)
    {
       if(!this.stringBundle)
          this.stringBundle = Fireinput.util.xpc.getService("@mozilla.org/intl/stringbundle;1", "nsIStringBundleService");
       if(!this.stringBundle)
            return stringKey; 

       var propertyBundle  = "chrome://fireinput/locale/fireinput.properties";
       var bundle = this.stringBundle.createBundle(propertyBundle);
       var str = ""; 
       try 
       {
          str = bundle.GetStringFromName(stringKey);
       }
       catch (e) 
       {
       }
 
       return str; 
    },

    getIMENameString: function(value)
    {
       var defaultLanguage = Fireinput.pref.getDefault("interfaceLanguage"); 
       switch(value)
       {
          case Fireinput.SMART_PINYIN:
          default:
             return this.getLocaleString('fireinput.pinyin.quan.label' + defaultLanguage);
          break;
          case Fireinput.ZIGUANG_SHUANGPIN:
             return this.getLocaleString('fireinput.pinyin.shuang.ziguang.label' + defaultLanguage);
          break;
          case Fireinput.MS_SHUANGPIN:
             return this.getLocaleString('fireinput.pinyin.shuang.ms.label' + defaultLanguage);
          break;
          case Fireinput.CHINESESTAR_SHUANGPIN:
             return this.getLocaleString('fireinput.pinyin.shuang.chinesestar.label' + defaultLanguage);
          break;
          case Fireinput.SMARTABC_SHUANGPIN:
             return this.getLocaleString('fireinput.pinyin.shuang.smartabc.label' + defaultLanguage);
          break;
          case Fireinput.WUBI_86:
             return this.getLocaleString('fireinput.wubi86.label' + defaultLanguage);
          break;
          case Fireinput.WUBI_98:
             return this.getLocaleString('fireinput.wubi98.label' + defaultLanguage);
          break;
          case Fireinput.CANGJIE_5:
             return this.getLocaleString('fireinput.cangjie5.label' + defaultLanguage);
          break;
          case Fireinput.ZHENGMA:
             return this.getLocaleString('fireinput.zhengma.label' + defaultLanguage);
          break;
       }

       return "";
    },

    isValidForDirectInput: function(str)
    {
       if(!str) 
          return false; 
       // check whether it's email 
       if(str.indexOf(".") > 0 && str.indexOf("@") > 0)
          return true; 
   
       // check whether it's url 
       var reg = new RegExp("^[A-Za-z]+://[A-Za-z0-9-]+\.[A-Za-z0-9]+"); 
       if(reg.test(str))
          return true; 

       return false; 
    }, 

    notify: function(aSubject, aTopic, aData)
    {
       var os = Fireinput.util.xpc.getService("@mozilla.org/observer-service;1", "nsIObserverService");
       os.notifyObservers(aSubject, aTopic, aData); 
       return true;
    }, 

    getCurrentIME: function()
    {
       /* If we are being called inside of Fireinput, don't lookup XPCOM */
       if(typeof(Fireinput.main) != 'undefined')
       {
          return Fireinput.main.getCurrentIME();
       }
       else
       {
          var gs =  Fireinput.util.xpc.getService("@fireinput.com/fireinput;1", "nsIFireinput");
          return gs.getChromeWindow().getFireinput().getCurrentIME();
       }
    },

    getBrowserBoxesHeight: function() {
       var topPos = 1;
       var h = document.getElementById("navigator-toolbox");
       if(h)
         topPos += h.boxObject.height;

       if(gBrowser.getNotificationBox()) {
         var aNotification = gBrowser.getNotificationBox();
         var notifications = aNotification.allNotifications;
         for (var n = notifications.length - 1; n >= 0; n--) {
              if(typeof(notifications[n].boxObject) != 'undefined')
                topPos += notifications[n].boxObject.height;
         }
       }
       return topPos;
    },

    getBrowserUniqueId: function() {
       return gBrowser.selectedBrowser.parentNode.parentNode.id;
    },
    
    getDocument: function()
    {
       var pos = Fireinput.pref.getDefault("IMEBarPosition");
       if(pos == Fireinput.IME_BAR_FLOATING) {
          var tabId = Fireinput.util.getBrowserUniqueId(); 
          var imePanel = document.getElementById("fireinputIMEBar_" + Fireinput.IME_BAR_FLOATING + "_" + tabId);
          if(imePanel)
            return imePanel; 
          else 
            return null;     
       }
       else 
          return document; 
    },

    getElementsBy: function(method, tag, root, firstOnly) {
       tag = tag || '*';
       root = (root) ? root : document;
       if (!root) {
         return [];
       }

       var nodes = [],
           elements = root.getElementsByTagName(tag);

       for (var i = 0, len = elements.length; i < len; ++i) {
           if ( method(elements[i]) ) {
               if (firstOnly) {
                   nodes = elements[i];
                   break;
               } else {
                   nodes[nodes.length] = elements[i];
               }
           }
       }

      return nodes;
    },

    getElementBy: function(method, tag, root) {
      return Fireinput.util.getElementsBy(method, tag, root, true);
    },

    getElementById: function(root, tag, id) {
      var pos = Fireinput.pref.getDefault("IMEBarPosition");
      if(pos == Fireinput.IME_BAR_FLOATING) {
         var node = Fireinput.util.getElementBy(function(el) { return el.id == id}, tag, root); 
         return Array.isArray(node) ? null : node; 
      }
      else
         return document.getElementById(id); 
    }

}); 

Fireinput.util.hash = function() 
{
    this.items = new Array();
    this.length = 0;
}; 

Fireinput.util.hash.prototype = 
{
    foreach: function(callback) 
    {
       for (var k in this.items) 
       {
          if(callback) callback(k, this.items[k]);
       }
    },

    removeItem: function(in_key) 
    {
       var tmp_value;
       if (typeof(this.items[in_key]) != 'undefined') 
       {
          this.length--;
          var tmp_value = this.items[in_key];
          delete this.items[in_key];
       }

       return tmp_value;
    },

    getItem: function(in_key) 
    {
       if (typeof(this.items[in_key]) == 'undefined')
          return null; 
       else 
          return this.items[in_key];
    },

    setItem: function(in_key, in_value) 
    {
       if (typeof(in_value) != 'undefined') 
       {
          if (typeof(this.items[in_key]) == 'undefined') 
          {
             this.length++;
          }

          this.items[in_key] = in_value;
       }

       return in_value;
    },

    hasItem: function(in_key) {
       return typeof(this.items[in_key]) != 'undefined';
    }
};

Fireinput.util.ajax = function() {};
Fireinput.util.ajax.Events = ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];

Fireinput.util.ajax.prototype = 
{
    transport: null, 

    setOptions: function(options) 
    {
       this.options = 
       {
          method:       'post',
          asynchronous: true,
          contextType:  'application/x-www-form-urlencoded',
          parameters:   ''
       }

       Fireinput.extend(this.options, options || {})
    },

    responseIsSuccess: function() 
    {
       return this.transport.status == undefined
        || this.transport.status == 0
        || (this.transport.status >= 200 && this.transport.status < 300);
    },
  
    responseIsFailure: function() 
    {
       return !this.responseIsSuccess();
    }, 

    request: function(url) 
    {
       this.transport = new XMLHttpRequest(); 

       var parameters = this.options.parameters || '';
       if (parameters.length > 0) parameters += '&_=';

       try 
       {
          this.url = url;
          if (this.options.method == 'get' && parameters.length > 0)
             this.url += (this.url.match(/\?/) ? '&' : '?') + parameters;

          this.transport.open(this.options.method, this.url,
             this.options.asynchronous);
          if (this.options.asynchronous) 
          {
             this.transport.onreadystatechange = this.onStateChange.bind(this); 
             setTimeout((function() {this.respondToReadyState(1)}).bind(this), 10);
          }

          this.setRequestHeaders();

          var body = this.options.postBody ? this.options.postBody : parameters;
          this.transport.send(this.options.method == 'post' ? body : null);

       } 
       catch (e) 
       {
          this.dispatchException(e);
       }
    },

    setRequestHeaders: function() 
    {
       var requestHeaders =
          ['X-Requested-With', 'XMLHttpRequest',
           'X-Prototype-Version', '1.0',
           'Accept', 'text/javascript, text/html, application/xml, text/xml, */*'];

       if (this.options.method == 'post') 
       {
          requestHeaders.push('Content-type', this.options.contentType);

          if (this.transport.overrideMimeType)
             requestHeaders.push('Connection', 'close');
       }

       if (this.options.requestHeaders)
          requestHeaders.push.apply(requestHeaders, this.options.requestHeaders);

       for (var i = 0; i < requestHeaders.length; i += 2)
          this.transport.setRequestHeader(requestHeaders[i], requestHeaders[i+1]);
    },

    onStateChange: function() 
    {
       var readyState = this.transport.readyState;
       if (readyState != 1)
          this.respondToReadyState(this.transport.readyState);
    },

    header: function(name) 
    {
       try {
          return this.transport.getResponseHeader(name);
       }
       catch (e) {}

       return null; 
    },

    respondToReadyState: function(readyState) 
    {
       var event = Fireinput.util.ajax.Events[readyState];
       var transport = this.transport; 

       if (event == 'Complete') 
       {
          try {
             (this.options['on' + this.transport.status]
             || this.options['on' + (this.responseIsSuccess() ? 'Success' : 'Failure')]
             )(transport);
          } 
          catch (e) 
          {
             this.dispatchException(e);
          }
       }

       try {
          if(typeof(this.options['on' + event]) != "undefined")
             (this.options['on' + event])(transport);
       }
       catch (e) {
          this.dispatchException(e);
       }

    },
    dispatchException: function(exception) 
    {
       if(this.options.onException)
          (this.options.onException)(this, exception);
    }
};

Fireinput.util.time  =
{
    starttime: 0,

    setStartTime:function (){
       var d = new Date();
       this.starttime  = d.getTime();
    },

    getDiff:function (){
       var d = new Date();
       return (d.getTime()-this.starttime);
    },

    prettyDate: function(date_str)
    {
       var time_formats = [
                [60, '几秒钟'],
                [90, '1分钟'], // 60*1.5
                [3600, '分钟', 60], // 60*60, 60
                [5400, '1小时'], // 60*60*1.5
                [86400, '小时', 3600], // 60*60*24, 60*60
                [129600, '1天'], // 60*60*24*1.5
                [604800, '天', 86400], // 60*60*24*7, 60*60*24
                [907200, '1星期'], // 60*60*24*7*1.5
                [2628000, '星期', 604800], // 60*60*24*(365/12), 60*60*24*7
                [3942000, '1月'], // 60*60*24*(365/12)*1.5
                [31536000, '月', 2628000], // 60*60*24*365, 60*60*24*(365/12)
                [47304000, '1年'], // 60*60*24*365*1.5
                [3153600000, '几年', 31536000], // 60*60*24*365*100, 60*60*24*365
                [4730400000, '1世纪'], // 60*60*24*365*100*1.5
        ];

        var time = ('' + date_str).replace(/-/g,"/").replace(/[TZ]/g," "),
                dt = new Date,
                seconds = ((dt - new Date(time) + (dt.getTimezoneOffset() * 60000)) / 1000),
                token = '前',
                i = 0,
                format;

        if (seconds < 0) {
                seconds = Math.abs(seconds);
                token = '';
        }

        while (format = time_formats[i++]) {
                if (seconds < format[0]) {
                        if (format.length == 2) {
                                return format[1] + (i > 1 ? token : ''); // Conditional so we don't return Just Now Ago
                        } else {
                                return Math.round(seconds / format[2]) + ' ' + format[1] + (i > 1 ? token : '');
                        }
                }
        }
        if(seconds > 4730400000)
                return Math.round(seconds / 4730400000) + ' Centuries' + token;

        return date_str;
    }
};
 
