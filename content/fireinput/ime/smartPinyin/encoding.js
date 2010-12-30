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

 
var PinyinEncodingTable = function() { this.initialize(); }; 

PinyinEncodingTable.prototype = extend(new FireinputIME(), 
{
    debug: 0, 

    big5EncodingHash: null, 

    simpEncodingHash: null, 

    initialize: function()
    {
       var ios = FireinputXPC.getIOService(); 
       var path = this.getDataPath();
       var datafile = ios.newURI(path + this.getPinyinTransformFile(), null, null);

       this.big5EncodingHash = new FireinputHash();
       this.simpEncodingHash = new FireinputHash();

       var options = {
          caller: this,
          onavailable: this.getCodeLine
       };

       FireinputStream.loadDataAsync(datafile, options);
    },

    getCodeLine: function(str)
    {
       var strArray = new Array();
       strArray = str.split('=>');
       if(strArray.length < 2)
          return;

       var str0 = FireinputUnicode.getUnicodeString(strArray[0]); 
       var str1 = FireinputUnicode.getUnicodeString(strArray[1]); 
       
       this.simpEncodingHash.setItem(str0, str1);
       this.big5EncodingHash.setItem(str1, str0);
    },

    switchToZH: function(charCode)
    {
       if(this.big5EncodingHash.hasItem(charCode))
          return this.big5EncodingHash.getItem(charCode); 
       else
          return charCode; 
    }, 

    hasBig5Encoding: function(charCode)
    {
       return this.simpEncodingHash.hasItem(charCode); 
    },

    switchToBig5: function(charCode)
    {
       if(this.simpEncodingHash.hasItem(charCode))
          return this.simpEncodingHash.getItem(charCode); 
       else
          return charCode; 
    },

    validEncoding: function(charCode, encoding)
    {
       charCode = FireinputUnicode.getUnicodeString(charCode); 

       switch(encoding)
       {
          case ENCODING_ZH: 
             return (this.simpEncodingHash.hasItem(charCode) || 
                !this.big5EncodingHash.hasItem(charCode)); 
              
          break; 
          case ENCODING_BIG5: 
             return (!this.simpEncodingHash.hasItem(charCode) || 
                this.big5EncodingHash.hasItem(charCode)); 
          break; 
       }

       return true; 
    }          
 
}); 
