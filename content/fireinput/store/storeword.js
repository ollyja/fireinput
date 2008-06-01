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

var FireinputSaver = 
{

    init: function()
    {
       var ios = IOService.getService(Components.interfaces.nsIIOService);
       var fileHandler = ios.getProtocolHandler("file")
                         .QueryInterface(Components.interfaces.nsIFileProtocolHandler);

       var IME = new FireinputIME(); 
       var path = FireinputUtils.getAppRootPath() + IME.getUserDataFile();
       var datafile = fileHandler.getFileFromURLSpec(path); 
       return datafile; 
    },


    save: function()
    {
       var args = arguments; 

       if(!args || args.length <= 0)
          return; 
 
       // FIXME: the backfile is required for safe writing 

       var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                    .createInstance(Components.interfaces.nsIFileOutputStream);

       var file = this.init(); 
       // use 0x02 | 0x10 to open file for appending.
       // write, create, truncate
       fos.init(file, 0x02 | 0x08 | 0x20, 0664, 0);

       var charset = "UTF-8";
       var cos = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                   .createInstance(Components.interfaces.nsIConverterOutputStream);

       // This assumes that fos is the nsIOutputStream you want to write to
       cos.init(fos, charset, 0, 0x0000);
 
       var self = this; 
  
       // if the user saved list is growing up quickly, the filter needs to be enable to remove 
       // the less frequent words 
       for(var i=args.length-1; i>=0; i--)
       {
          if(!args[i])
             continue; 
          // the mininum list we keep is to have 5000 entries 
          var filter = parseInt(args[i].length/5000) -1; 
          filter = filter > 0 ? filter : 0; 

          var wStr = []; 
          args[i].foreach(function(key, value) {
                          var compactStr = self.getString(key, value, filter);
                          if(compactStr)
                             wStr[wStr.length] = compactStr; 

                          if(wStr.length >= 20)
                          {
                              cos.writeString(wStr.join("")); 
                              wStr.length = 0; 
                          }
          }); 
          // write all that are left
          if(wStr.length >0)
          {
              cos.writeString(wStr.join("")); 
              wStr.length = 0; 
          }
       }

       cos.close();
    },
   
    getString: function(key, value, filter)
    {
       var used = parseInt(value.freq / Math.pow(2, 16)); 

       // if it's not new phrase, and the used times is smaller than filter 
       // it will be skipped to save some memory 
       if((typeof(value.newPhrase) == 'undefined') && used < filter)
       {
           return null; 
       }

       var str = value.schema; 
       str += ":" + key; 
       str += ":" + value.freq; 
       str += ":" + value.key; 
       str += ":" + value.initKey; 
       if(typeof(value.newPhrase) != 'undefined')
         str += ":1"

       str += "\n";

       return FireinputUnicode.getUnicodeString(str); 
    }  

}; 

