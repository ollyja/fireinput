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

var FireinputDocSaver = 
{
    docData: '', 

    getFile: function(path)
    {
       var ios = IOService.getService(Components.interfaces.nsIIOService);
       var fileHandler = ios.getProtocolHandler("file")
                         .QueryInterface(Components.interfaces.nsIFileProtocolHandler);
       return fileHandler.getFileFromURLSpec(path); 
    }, 

    initAutoSave: function()
    {
       var path = FireinputUtils.getAppRootPath() + "/userdocument.fireinput"; 
       return this.getFile(path); 
    },

    loadFileDone: function(cb)
    {
       this.loadFileDoneCallback(this.docData); 
    }, 

    loadFileLine: function(l)
    {
       this.docData += l; 
    },

    read: function(file, cb)
    {
       this.docData = ''; 
       var options = {
             caller: this,
             oncomplete: this.loadFileDone,
             onavailable: this.loadFileLine
       }; 
       this.loadFileDoneCallback = cb; 

       var datafile = this.getFile('file://' + file); 
       FireinputStream.loadXHTMLDataAsync(datafile, options);
    }, 

    open: function(title)
    {
       var nsIFilePicker = Components.interfaces.nsIFilePicker;
       var fileChooser = Components.classes["@mozilla.org/filepicker;1"].
                           createInstance(nsIFilePicker);
        fileChooser.init(window, title, nsIFilePicker.modeOpen);
        fileChooser.appendFilters(nsIFilePicker.filterHTML | nsIFilePicker.filterText);
        fileChooser.appendFilter('XHTML files', "*.xhtml");
        fileChooser.appendFilters(nsIFilePicker.filterAll); 
        fileChooser.defaultExtension = 'html';
	var ret = fileChooser.show();
        if(ret == fileChooser.returnOK)
        {
            return fileChooser.file.path; 
        }

        return null; 

    }, 

    write  : function(file, data, mode) 
    {
       try 
       {
          var writefile = this.getFile('file://' + file); 

          var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                    .createInstance(Components.interfaces.nsIFileOutputStream);
          if(mode && mode == 'overwrite')
             fos.init(writefile, 0x02 | 0x08 | 0x20, 0664, 0);
          else
             fos.init(writefile, 0x02 | 0x08 | 0x10, 0664, 0);

          //FIXME: here we always save as UTF-8. Are there any other charsets that should be used ? 
          var charset = "UTF-8";
          data = FireinputUnicode.convertFromUnicode(data);
          fos.write(data, data.length);
          fos.close();
       }
       catch(e)
       {
          alert(e.message);
          return false; 
       }

       return true; 
    }, 
 
    save: function(doc, title, skipPrompt, path)
    {
       if (!doc)
          throw "Must have a document when calling save";

       if(!skipPrompt || !path)
       {
          var nsIFilePicker = Components.interfaces.nsIFilePicker;
          var fileChooser = Components.classes["@mozilla.org/filepicker;1"].
                            createInstance(nsIFilePicker);
          fileChooser.init(window, title, nsIFilePicker.modeSave);
          fileChooser.appendFilters(nsIFilePicker.filterHTML | nsIFilePicker.filterText);
          fileChooser.appendFilter('XHTML files', "*.xhtml");
          fileChooser.defaultExtension = 'html'; 
          fileChooser.defaultString = path ? path : 'untitled.html' ;

          var ret = fileChooser.show();
          if (ret != nsIFilePicker.returnCancel) 
          {
             ret = this.write(fileChooser.file.path, doc,  (ret == nsIFilePicker.returnReplace) ? 'overwrite': ''); 
             return ret ? fileChooser.file.path : null; 
          }
       }
       else
       { 
          var ret = this.write(path, doc, 'overwrite'); 
          return path; 
       }

       return null; 
    }, 

    savetoserver: function() 
    {


    }, 

    autosave: function(doc, path)
    {
       var file = path; 
       if(!file)
       {
         file = this.initAutoSave(); 

         var savetime = new Date(); 
         var xmlDoc = new XML(); 
         xmlDoc = <autosave><lastsave>{savetime}</lastsave><doc>{doc}</doc></autosave>; 
         this.write(file.path, xmlDoc.toString(), 'overwrite'); 
       }
       else
         this.write(file.path, doc, 'overwrite'); 
         
       return true; 
    },

    autoload: function(cb)
    {
       var file = this.initAutoSave();

       if(!file.exists())  
          return;

       var loadDone = function(lines)
       {
          var xmlDoc = new XML(lines); 
          return cb(xmlDoc.doc); 
       }; 

       this.read(file.path, loadDone); 
    }             
   
}; 

