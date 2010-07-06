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

var FireinputEmotionUpdater = 
{

    init: function()
    {
       return FireinputUtils.getUserFile("useremotion.fireinput");
    },


    save: function(list, mode)
    {
       var args = list; 

       if(!args || args.length <= 0)
          return false; 
 
       // FIXME: the backfile is required for safe writing 

       var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                    .createInstance(Components.interfaces.nsIFileOutputStream);

       var file = this.init(); 
       // use 0x02 | 0x10 to open file for appending.
       // write, create, truncate
       if(mode && mode == 'overwrite')
          fos.init(file, 0x02 | 0x08 | 0x20, 0664, 0);
       else 
          fos.init(file, 0x02 | 0x08 | 0x10, 0664, 0);

       var charset = "UTF-8";
       var cos = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                   .createInstance(Components.interfaces.nsIConverterOutputStream);

       // This assumes that fos is the nsIOutputStream you want to write to
       cos.init(fos, charset, 0, 0x0000);
       if(typeof(args) == "string")
       { 
          cos.writeString(args);
          cos.writeString("\n");
       }
       else if(typeof(args) == "object") 
       { 
          for(var i=args.length-1; i>=0; i--)
          {
             if(args[i].saved)
             { 
                cos.writeString(args[i].url);
                cos.writeString("\n");
             }
          }
       }
       cos.close();

       return true; 
    }
   
}; 

