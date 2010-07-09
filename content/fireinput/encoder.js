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

var FireinputEncoding = 
{
    // debug option 
    debug: 0, 

    // pinyinEncodingTable object. 
    encoder: null, 

    // default encoding: simplified Chinese 
    encodingName: ENCODING_ZH, 

    // max chars one call can handle 
    maxStep: 3000, 
 
    // timer handler 
    stepTimer: null, 

    // current chars which have been encoded 
    currentStep: 0, 
   
    // the given string from focusedElement or focusedWindow 
    origString: "", 

    // the encoded string 
    encodedString: null, 

    // the callback option 
    options: null, 
  
    init: function()
    {
       if(!this.encoder)
          this.encoder = new PinyinEncodingTable();
    }, 

    getEncodedString: function(origStr, encoding)
    {
       var str = "";
       // our table is simplified based, no need to switch 
       try {
          str = FireinputUnicode.getUnicodeString(origStr); 
       } 
       catch(e) { return origStr; }

       if(encoding != ENCODING_BIG5)
          return str; 

       var eString = new Array(); 

       if(!this.encoder)
          this.encoder = new PinyinEncodingTable();

       if(this.encoder.hasBig5Encoding(str)) {
          return this.encoder.switchToBig5(str); 
       }

       for (var i =0; i <str.length; i++)
       {
          eString[eString.length] = this.encoder.switchToBig5(str[i]); 
       }
       return eString.join(""); 
    },

    switchToZH: function()
    {
       this.switchEncoding(ENCODING_ZH); 
    }, 

    switchToBig5: function()
    {
       this.switchEncoding(ENCODING_BIG5); 
    }, 

    switchEncoding: function(encoding)
    {
       var target = document.popupNode; 
       var documentTarget = false; 

       // clean global variable before starting 
       this.currentStep = 0; 
       this.origString = ""; 
       this.encodedString = new Array(); 
       this.options = null; 

       if(Fireinput.isTargetATextBox(target))
       {
           this.switchEncodingAsync(target.value, encoding, 
                                     { oncomplete: function(p) { target.value = p; }});
           return; 
       }

       var win = target.ownerDocument.defaultView;
       if (win) 
       {
          var editingSession = win.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                                  .getInterface(Components.interfaces.nsIWebNavigation)
                                  .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                                  .getInterface(Components.interfaces.nsIEditingSession);
          if (!editingSession.windowIsEditable(win)) 
             target = content.document.body; 

          this.switchEncodingAsync(target.innerHTML, encoding, 
                                   { oncomplete: function(p) { target.innerHTML = p;}}); 
       }
    }, 

    switchEncodingAsync: function(str, encoding, options)
    {
      if(!this.encoder)
          this.encoder = new PinyinEncodingTable();

       if(this.stepTimer)
          clearTimeout(this.stepTimer); 
    
       if(typeof(str) == 'undefined')
          str =  this.origString;
       
       if(typeof(encoding) != 'undefined')
          this.encodingName = encoding;

       if(typeof(options) != 'undefined')
          this.options = options;

       var strLength = str.length; 
       for(var i=this.maxStep; this.currentStep<strLength && i>0; this.currentStep++)
       {
          var charCode = str.charAt(this.currentStep);
          if(charCode >= '\u4e00')
          {
             if(this.encodingName == ENCODING_ZH)
                this.encodedString[this.encodedString.length] = this.encoder.switchToZH(charCode);
             else 
                this.encodedString[this.encodedString.length] = this.encoder.switchToBig5(charCode);

             // control how many chars can still be translated 
             i--; 
          }
          else 
          { 
             this.encodedString[this.encodedString.length] = charCode; 
          }
       }

       if(this.currentStep < strLength)
       {
          this.origString = str;
          var self = this; 
          this.stepTimer = setTimeout(function(){ self.switchEncodingAsync(); }, 500);
       }
       else if(this.options)
       {
          if(this.options.oncomplete)
             this.options.oncomplete(this.encodedString.join(""));

          this.encodedString.length = 0; 
       }
    },

    validEncoding: function(charCode, encoding)
    {
       if(!this.encoder)
          this.encoder = new PinyinEncodingTable();

       return this.encoder.validEncoding(charCode, encoding); 
    }

}
