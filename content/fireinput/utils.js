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

// Preference handling 
const CC = Components.classes;
const CR = Components.results;

const PrefService = CC["@mozilla.org/preferences-service;1"];
const EnvService = CC["@mozilla.org/process/environment;1"];
const UnicodeService = CC["@mozilla.org/intl/scriptableunicodeconverter"]; 

const LocaleService = CC["@mozilla.org/intl/nslocaleservice;1"]; 
const StringBundleService = CC["@mozilla.org/intl/stringbundle;1"]; 
const OSService = CC["@mozilla.org/network/protocol;1?name=http"]; 

const nsISelectionPrivate = Components.interfaces.nsISelectionPrivate;
const nsISelectionController = Components.interfaces.nsISelectionController;

var   gPref = PrefService.getService(Components.interfaces.nsIPrefBranch);
var   gEnv = EnvService.getService(Components.interfaces.nsIEnvironment);
var   gUnicode = UnicodeService.getService(Components.interfaces.nsIScriptableUnicodeConverter); 
var   gOS = OSService.getService(Components.interfaces.nsIHttpProtocolHandler);

var FireinputEnv = 
{
    getEnv: function(name)
    {
       return gEnv.get(name);
    },

    getOS: function()
    {
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


var FireinputPref = 
{
    
    getPref: function(name, type)
    {
       var prefName = prefDomain + "." + name;

       if(type == 'undefined')
          type = gPref.getPrefType(prefName);

       if (type == "INT" || type == gPref.PREF_INT)
          return gPref.getIntPref(prefName);
       else if (type == "BOOL" || type == gPref.PREF_BOOL)
          return gPref.getBoolPref(prefName);
       else if(type == "STRING" || type == gPref.PREF_STRING)
          return gPref.getCharPref(prefName); 
       else
          return null; 
    },

    setPref: function(name, type,  value)
    {
       var prefName = prefDomain + "." + name;

       if(type == 'undefined')
          type = gPref.getPrefType(prefName);

       if (type == "INT" || type == gPref.PREF_INT)
          gPref.setIntPref(prefName, value);
       else if (type == "BOOL" || type == gPref.PREF_BOOL)
          gPref.setBoolPref(prefName, value);
       else 
          gPref.setCharPref(prefName, value);
    },

    addObserver: function(aTopic, aOwnsWeak)
    {
       var pbi =  gPref.QueryInterface(Components.interfaces.nsIPrefBranch2);
       pbi.addObserver(prefDomain, aTopic, aOwnsWeak);
    }

}; 

var FireinputUnicode = 
{
    getUnicodeString: function(text, charset)
    {
       gUnicode.charset = charset ? charset : "UTF-8";
       try
       {
          return gUnicode.ConvertToUnicode(text);
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
          gUnicode.charset = charset ? charset : "UTF-8";
          text = gUnicode.ConvertFromUnicode(text);
          return text + gUnicode.Finish();
       }
       catch(ex) 
       {
         return text; 
       }
    }
};


var FireinputUtils = 
{
    debug: 0, 

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

    insertCharAtCaret: function (element, text, sourceType) 
    {
       if(!element)
          return; 

       // setFocus before set any values to avoid being reset by target onfocus event 
       this.setFocus(element.target); 
       // text field. We can only insert bb code here  	
       if(element.target.setSelectionRange) 
       {
	  var start = element.target.selectionStart; 
	  var end   = element.target.selectionEnd; 
          var target = element.target; 

          // hack: the onfocus event will select all. We try to avoid this. 
          if(element.focused == 0 && start != end && end == target.value.length)
          {
             start = end; 
          }

          var scrollTop = target.scrollTop;
          var scrollLeft = target.scrollLeft; 
          var isBottom = (scrollTop + target.clientHeight) == target.scrollHeight;
          if(typeof(sourceType) != 'undefined' && sourceType == IMAGE_SOURCE_TYPE)
	      text = "[img]" + text + "[/img]"; 

	  if(start != null) 
	  {
	     target.value = target.value.substr(0, start) 
			   + text + target.value.substr(end, target.value.length);
	     this.setCaretTo(target, start + text.length);
	  }
          else 
   	  {
	     target.value += text;
	     this.setCaretTo(target, target.value.length);
	  }
          
          if(typeof(scrollLeft) != "undefined")
             target.scrollLeft = scrollLeft;
          if(typeof(scrollTop) != "undefined")
          {
             if(!isBottom)
               target.scrollTop = scrollTop;
             else  
               target.scrollTop = target.scrollHeight;
          }

          // some target might have oninput event. Since the value is changed by script programmatically, 
          // this event won't fire 
          // Why do this way: the oninput won't show up as item of target. It must go to DOM tree to find 
          // the attribute. Unfortunately if it's added by addEventListener, it won't be executed 
          if(target.id != '')
          {
             var win = target.ownerDocument.defaultView; 
             while (win.parent != win)
                win = window.parent;

             if(win.document)
             {
                 var node = win.document.getElementById(target.id); 
                 if(node.hasAttribute("oninput"))
                 {
                     var f = node.getAttribute("oninput"); 
                     try {
                        eval(f); 
                     } catch(e) { }
                 }
             }
          }
       }
       else if(element.documentTarget)
       {
          var win = element.target; 
          var doc = win.content.document; 
          var selection =  win.getSelection();

          if(!selection.focusNode)
             return; 

          //FireinputLog.debug(this, "selection.focusNode.nodeType: " + selection.focusNode.nodeType); 
          //FireinputLog.debug(this, "selection.focusNode.name: " + selection.focusNode.nodeName); 
          //FireinputLog.debug(this, "selection.focusNode.value: " + selection.focusNode.nodeValue); 
          //FireinputLog.debug(this, "selection.focusOffset: " + selection.focusOffset); 

          // get the first range of the selection
          // delete content if the collpase is not true 
          var range = selection.getRangeAt(0);
          range.deleteContents();

          if (selection.focusNode.nodeType == Node.TEXT_NODE)
          {
             var endOffset = selection.focusOffset;
             var nodeValue = selection.focusNode.nodeValue; 

             if(typeof(sourceType) != 'undefined' && sourceType == IMAGE_SOURCE_TYPE)
             {
                var imgNode = doc.createElement("img");
                imgNode.setAttribute("src", text); 

                var startContainer = range.startContainer;
                var startOffset = range.startOffset;
                var beforeNode = startContainer.splitText(startOffset);
                var parentNode = beforeNode.parentNode;
                parentNode.insertBefore(imgNode, beforeNode);
                selection.collapse(beforeNode, 0); 
             }
             else 
             {
                nodeValue = nodeValue.substr(0,endOffset) + text + 
                          nodeValue.substr(endOffset, nodeValue.length); 
                selection.focusNode.nodeValue = nodeValue; 
                selection.collapse(selection.focusNode, endOffset+text.length); 
             }

          }
          else
          {
             this.insertAtSelection(selection, text, sourceType);
          }
       }
       else 
       {
          element.target.value += text;
       }
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
          if(typeof(sourceType) != 'undefined' && sourceType == IMAGE_SOURCE_TYPE)
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

    getDocumentScrollTop: function(window)
    {
       if(!window) 
          return 0; 
       return window.top.document.documentElement.scrollTop || 
       (window.top.document.body ? window.top.document.body.scrollTop : 0); 
    }, 

    getDocumentScrollLeft: function(window)
    {
       if(!window) 
          return 0; 

       return window.top.document.documentElement.scrollLeft || 
       (window.top.document.body ? window.top.document.body.scrollLeft : 0); 
    }, 

    getExtensionPath : function() 
    {
       try 
       {
          var chromeRegistry = Components.classes["@mozilla.org/chrome/chrome-registry;1"]
                               .getService(Components.interfaces.nsIChromeRegistry);
          var uri = Components.classes["@mozilla.org/network/standard-url;1"]
		    .createInstance(Components.interfaces.nsIURI);
					
          uri.spec = "chrome://fireinput/content/";
			
          var path = chromeRegistry.convertChromeURL(uri);
          if (typeof(path) == "object") path = path.spec

          if (path.length >= 4 && path.substr(0, 4) == "jar:") 
          {
             path = path.substring(4); // remove "jar:" at the beginning
          }

          return path; 
       }
       catch (e) 
       {
       }

       return undefined; 
    },

    getAppRootPath: function()
    {
       var path = this.getExtensionPath();

       path =  path.substring(0, path.lastIndexOf("/extensions/fireinput@software"));
       return path;
    },

    trimString: function(str)
    {
       return str.replace(/^\s+/g, '').replace(/\s+$/g, '');
    },

    getLocaleString: function (stringKey)
    {
       var stringBundle = StringBundleService.getService(Components.interfaces.nsIStringBundleService);
       var propertyBundle  = "chrome://fireinput/locale/fireinput.properties";
       var bundle = stringBundle.createBundle(propertyBundle);
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

    isValidForDirectInput: function(str)
    {
       if(!str) 
          return false; 
       // check whether it's email 
       if(str.indexOf(".") > 0 && str.indexOf("@") > 0)
          return true; 
   
       // check whether it's url 
       var reg = new RegExp("^[A-Za-z]+://[A-Za-z0-9-]+\.[A-Za-z0-9]+"); 
       if(str.test(reg))
          return true; 

       return false; 
    } 
}; 

var FireinputHash = function() 
{
    this.items = new Array();
    this.length = 0;
}; 

FireinputHash.prototype = 
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

var Ajax = function() {};
Ajax.Events = ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];

Ajax.prototype = 
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

       extend(this.options, options || {})
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
             this.transport.onreadystatechange = bind(this.onStateChange, this); 
             setTimeout(bind(function() {this.respondToReadyState(1)}, this), 10);
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

    evalJSON: function() 
    {
       try {
          return eval('(' + this.header('X-JSON') + ')');
       } catch (e) {}

       return null; 
    },

    evalResponse: function() 
    {
       try {
          return eval(this.transport.responseText);
       }
       catch (e) 
       {
          this.dispatchException(e);
       }

       return null; 
    },


    respondToReadyState: function(readyState) 
    {
       var event = Ajax.Events[readyState];
       var transport = this.transport, json = this.evalJSON();

       if (event == 'Complete') 
       {
          try {
             (this.options['on' + this.transport.status]
             || this.options['on' + (this.responseIsSuccess() ? 'Success' : 'Failure')]
             )(transport, json);
          } 
          catch (e) 
          {
             this.dispatchException(e);
          }
          if ((this.header('Content-type') || '').match(/^text\/javascript/i))
             this.evalResponse();
       }

       try {
          if(typeof(this.options['on' + event]) != "undefined")
             (this.options['on' + event])(transport, json);
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

 
