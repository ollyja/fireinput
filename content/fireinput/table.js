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

const tableManagmentUI = [
    {id: "fireinputTableManagement", strKey: "fireinput.table.management.label", attribute: "label"}
]; 

var FireinputTable = 
{
    debug: 0, 

    updateTimer: null, 
    isUpdating: false, 
    initialized: false,

    load: function(forceLoad)
    {
       if(this.initialized && !forceLoad)
          return;

       this.refreshMenu(); 

       // register an observer 
       var os = FireinputXPC.getService("@mozilla.org/observer-service;1", "nsIObserverService");
       os.addObserver(this, "fireinput-table-update-request", false);
       
       // check new table words 
       this.checkTableUpdate(); 
    },

    observe: function(subject, topic, data)
    {

       if(topic != 'fireinput-table-update-request')
          return;

       if(data)
          this.checkTableUpdate(true); 
       else 
          this.checkTableUpdate(); 
    }, 


    refreshMenu: function()
    {
       // get default language first 
       var defaultLanguage = fireinputPrefGetDefault("interfaceLanguage");
       // update UI 
       for(var i =0; i<tableManagmentUI.length; i++)
       {
          var id = tableManagmentUI[i].id;
          var handle = document.getElementById(id);
          if(!handle)
             continue;

          var strKey = tableManagmentUI[i].strKey;
          var attr = tableManagmentUI[i].attribute;

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

    showDialog: function()
    {
       FireinputUtils.loadURI("chrome://fireinput/content/tablemgr/tablemgr.html");
    },

    openUpdateLink: function()
    {
      FireinputUtils.loadURI(SERVER_URL + "table/index.php");
    }, 

    isBeingUpdated: function()
    {
       return this.isUpdating; 
    },
 
    showUpdatingProgress: function(showflag)
    {
       var handle = document.getElementById('fireinputTableUpdatePanel'); 
       if(showflag)
       {
          this.isUpdating = true; 
          if(handle) 
            handle.style.display = ""; // don't put block here as it will not align with other menu well 

          var defaultLanguage = fireinputPrefGetDefault("interfaceLanguage");
          var value = FireinputUtils.getLocaleString('fireinput.table.updating.label' + defaultLanguage);
          var h = document.getElementById('fireinputTableUpdate'); 
          if(h)
              h.setAttribute('label', value); 
       }
       else 
       {
          this.isUpdating = false; 
          if(handle) 
            handle.style.display = "none"; 
          var h = document.getElementById('fireinputTableUpdate'); 
          if(h)
              h.setAttribute('label', '');
       }
          
    }, 

    checkTableUpdate: function(force)
    {
       if(this.isBeingUpdated())
          return; 

       var lastupdate = fireinputPrefGetDefault("lastTableUpdate"); 
       var intervalInHour = fireinputPrefGetDefault("tableUpdateInterval");
       if(lastupdate.length <= 0)
       {

          // find out the fireinput installation time 
          var installpath = FireinputUtils.getAppRootPath() + "/extensions/fireinput@software.fireinput.com";
          var pathUrl = FireinputXPC.getIOService().newURI(installpath, null, null).QueryInterface(Components.interfaces.nsIFileURL);
          var path = pathUrl.file;
          lastupdate = path.lastModifiedTime / 1000;
       }

       if(this.updateTimer)
          clearTimeout(this.updateTimer); 

       if(!force && intervalInHour <= 0)
       {
          // perodically loop to see if the interval has been changed. 
          var timeout = 30 * 60 * 1000; 
          this.updateTimer = setTimeout(function() { FireinputTable.checkTableUpdate(); }, timeout);
       }
       else 
       {
          var last = new Date(lastupdate).getTime() - 10000000;
          var now =  new Date().getTime();
          var timeout = intervalInHour * 3600 * 1000 - (now - last);
          timeout = (!force && timeout > 0) ? timeout: 1000; // give 1 seconds window 
          lastupdatetime = last / 1000;

          FireinputLog.debug(this, "lastupdatetime: " + lastupdatetime + ", timeout: " + timeout);
          this.updateTimer = setTimeout(function() { FireinputTable.startTableUpdate(lastupdatetime); }, timeout);
       }
    },

    startTableUpdate: function(lastupdatetime)
    {
       var ime = FireinputUtils.getCurrentIME();
       // FIXME: only support pinyin now 
       if(ime.getIMEType() > SMARTABC_SHUANGPIN)
       {
          fireinputPrefSave('lastTableUpdate', (new Date()).toString());
          this.checkTableUpdate(); 
          return; 
       }

       var ajax = new Ajax();
       if(!ajax) 
          return;

       var self = this;

       ajax.setOptions(
          {
             method: 'get',
             onSuccess: function(p) { self.processLatestTableUpdate(p); self.checkTableUpdate(); },
             onFailure: function(p) { self.processLatestTableUpdate(p, true); self.checkTableUpdate();}
          });

       this.showUpdatingProgress(true); 

       var ime = FireinputUtils.getCurrentIME(); 
       var params = "imetype=" + encodeURIComponent(ime.getIMEType()) + 
                    "&lastupdate=" + encodeURIComponent(lastupdatetime); 

       setTimeout(function() { ajax.request(SERVER_URL + "/table/getlatest.php?" + params); }, 5000);
    },

    processLatestTableUpdate: function(p, error)
    {
       if(!p || p.responseText.length <= 0)
       {
          this.showUpdatingProgress(false); 
          // if not error, set lastUpdateTime 
          if(!error)
            fireinputPrefSave('lastTableUpdate', (new Date()).toString());

          // re-schedule it 
          this.checkTableUpdate(); 
          return;
       }

       // the input is UTF-8, we need to convert as we save raw bytes in memory 
       var words = FireinputUnicode.convertFromUnicode(p.responseText);
       var jsonArray;
       try {
          jsonArray = JSON.parse(words); 
       }
       catch(e) { };

       if(typeof(jsonArray) == 'undefined')
       { 
          fireinputPrefSave('lastTableUpdate', (new Date()).toString());
          this.showUpdatingProgress(false); 
          this.checkTableUpdate(); 
          return;
       }

       FireinputLog.debug(this, FireinputUnicode.getUnicodeString(jsonArray.toString()));
       this.processLatestTable(jsonArray); 
       this.showUpdatingProgress(false); 
    },

    processLatestTable: function(tableArray)
    {
       var current = new Date(); 
       try {
         FireinputImporter.storePhraseFromAutoupdate(tableArray); 
         
       } catch(e) {}; 

       // update lastTableUpdate time and re-schedule checking 
       fireinputPrefSave('lastTableUpdate', current.toString());
       this.checkTableUpdate(); 
    }
   
}; 

var FireinputImporter = {

   debug: 0, 
   extPhraseCodeHash: null, 
   mDBConn: null, 
   extPhraseTableChanged: 0, 

   openImportHistoryDB: function()
   {
      if(this.mDBConn)
         return; 

      var file = FireinputXPC.getService("@mozilla.org/file/directory_service;1", "nsIProperties").
                              get("ProfD", Components.interfaces.nsIFile);
  
      file.append("fireinput.sqlite");  
      
      var storageService = Components.classes["@mozilla.org/storage/service;1"]  
                            .getService(Components.interfaces.mozIStorageService);  
      this.mDBConn = storageService.openDatabase(file); 
      this.mDBConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS import_history (table_link TEXT NOT NULL, table_name TEXT NOT NULL, signature TEXT unique NOT NULL, last_updated TEXT)");  
   }, 

   getImportList: function(callback)
   {
      this.openImportHistoryDB(); 
      if(!this.mDBConn)
        return; 

      var statement = this.mDBConn.createStatement("SELECT * FROM import_history ORDER BY last_updated ASC");
      statement.executeAsync({
        empty: true,
        handleResult: function(aResultSet) {
           for(var row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
              this.empty = false; 
              if(callback)
                 callback(row.getResultByName("table_link"), row.getResultByName("table_name"), 
                          row.getResultByName("signature"), row.getResultByName("last_updated"));
           }
        },
        handleCompletion: function(aReason) {
           if(aReason == Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED && 
              !this.empty) {
              if(callback)
                 callback();
           }
        }
      });
   },

   updateHistory: function(filelink, tablename)
   {
      this.openImportHistoryDB(); 
      if(!this.mDBConn)
        return; 
      var statement = this.mDBConn.createStatement("SELECT * FROM import_history WHERE signature=:signature");
      statement.params.signature = hex_md5(tablename);
      statement.executeAsync({
        empty: true,
        handleResult: function(aResultSet) {  
           this.empty = false; 
           FireinputImporter.updateImportHistory(tablename);
        }, 
        handleError: function(aError) {
        }, 
 
        handleCompletion: function(aReason) {
           if(aReason == Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED && 
              this.empty) {
              FireinputImporter.insertImportHistory(filelink, tablename);
           }
        }
      });
   },


   updateImportHistory: function(tablename)
   {
      this.openImportHistoryDB(); 
      if(!this.mDBConn)
        return; 

      var statement = this.mDBConn.createStatement("UPDATE import_history SET last_updated=:last_updated WHERE signature=:signature");
      var d = new Date(); 
      statement.params.last_updated = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate(); 
      statement.params.signature = hex_md5(tablename);

      statement.executeAsync({
        handleCompletion: function(aReason) {
          // if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED)
          //   print("Query canceled or aborted!");
        } 
      });  
   },   

   insertImportHistory: function(filelink, tablename)
   {
      this.openImportHistoryDB(); 
      if(!this.mDBConn)
        return; 

      var statement = this.mDBConn.createStatement("INSERT INTO import_history (table_link, table_name, signature, last_updated) VALUES(:table_link, :table_name, :signature, :last_updated)");  
      var d = new Date(); 
      statement.params.last_updated = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate(); 
      statement.params.signature = hex_md5(tablename);
      statement.params.table_link = filelink; 
      statement.params.table_name = tablename;

      statement.executeAsync({
        handleCompletion: function(aReason) {  
          // if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED)  
          //   print("Query canceled or aborted!");  
        }  
      });  
   }, 

   deleteImportHistory: function(signature, callback)
   {
      this.openImportHistoryDB(); 
      if(!this.mDBConn)
      {
        callback(); 
        return; 
      } 

      var statement = this.mDBConn.createStatement("DELETE FROM import_history WHERE signature=:signature");
      statement.params.signature = signature;
      
      statement.executeAsync({
        handleCompletion: function(aReason) {
           // we dont' care about errors 
           callback(); 
        } 
      });  
   }, 
  
   loadExtPhraseTable: function(callback)
   {
       var ios = FireinputXPC.getIOService();
       var fileHandler = ios.getProtocolHandler("file")
                         .QueryInterface(Components.interfaces.nsIFileProtocolHandler);

       var path = FireinputUtils.getAppRootPath();
       var IME = new FireinputIME();
       var datafile = fileHandler.getFileFromURLSpec(path + IME.getExtDataFile());
       if(!datafile.exists())
       {
          callback();
          return;
       }

       this.extPhraseCodeHash = new FireinputHash();

       var options = {
          caller: this,
          onavailable: this.getExtPhraseCodeLine,
          oncomplete: function() { callback(); }
       };
       FireinputStream.loadDataAsync(datafile, options);
    },

    getExtPhraseCodeLine: function(str)
    {
       var strArray = str.split(':');
       if(strArray.length < 5)
          return;

       // imported format: schema: word: freq key initKey

       var schema = parseInt(strArray[0]);
       var word = strArray[1];
       var freq = strArray[2];
       var key = strArray[3].replace(/^\s+|\s+$/g, '');
       var initKey = strArray[4].replace(/^\s+|\s+$/g, '');
       var signature = strArray[5]; 

       // only care about pinyin 
       if(schema != SMART_PINYIN)
          return; 

       this.extPhraseCodeHash.setItem(word + ":" + key, {freq: freq, initKey: initKey, schema: schema, signature: signature});
    },

    addOneExtPhrase: function(phrase, key, freq, initKey, schema, signature)
    {
       if(!this.extPhraseCodeHash)
          this.extPhraseCodeHash = new FireinputHash();

       if(this.extPhraseCodeHash.hasItem(phrase + ":" + key))
          return; 

       this.extPhraseCodeHash.setItem(phrase + ":" + key, {freq: freq, initKey: initKey, schema: schema, signature: signature});
       this.extPhraseTableChanged = 1;  
    }, 
 
    flushExtPhraseTable: function()
    {
       if(this.extPhraseCodeHash && this.extPhraseTableChanged)
       {
          FireinputSaver.saveExtData(this.extPhraseCodeHash);
          this.extPhraseTableChanged = 0; 
          this.extPhraseCodeHash = null; 
       }
    }, 

    deleteExtPhraseTable: function(signature, callback)
    {
       var self = this;    
       var loaddone = function()
       {
          if(!self.extPhraseCodeHash || !signature)
            return; 

          self.extPhraseCodeHash.foreach(function(k, v) {
             if(v.signature == signature)
             {
                self.extPhraseCodeHash.removeItem(k); 
             }
          }); 
          FireinputSaver.saveExtData(self.extPhraseCodeHash);
          self.deleteImportHistory(signature, callback);
       }; 
   
       // one delete entries after loading existing is completed 
       this.loadExtPhraseTable(loaddone);
    }, 

    buildPhraseKeyMap: function(word, keyArray)
    {
       var ime = FireinputUtils.getCurrentIME();

       var pinyin = ime.getWordPinyin(word);
       //FireinputLog.debug(this, "pinyin: " + pinyin);
       if(!pinyin)
          return keyArray; 

       //FIXME: we need to control how many different items in keyArray. As we need to maintain 
       // a new entry for every word which might more than pinyin key. If there are too many 
       // items, it's unlikely people will make a hit 
       if(typeof(pinyin) == "string")
       {
          // there no key yet, just put it in as a single item 
          if(keyArray.length <= 0)
              keyArray[keyArray.length++] = pinyin; 
          else
          { 
             // there are multiple entires in the list, append it to each of them 
             for(var i=0; i<keyArray.length; i++)
             {
               keyArray[i] = keyArray[i] + ' ' + pinyin; 
             }
          }
       }
       else if(typeof(pinyin) == "object")
       {
          // since the pinyin is multiple set, we need to create an exact multiple entries too 
          if(keyArray.length <= 0)
          { 
              for(var i=0; i<pinyin.length; i++)
              {
                 keyArray[keyArray.length++] = pinyin[i]; 
              }
          }
          else 
          {
             // okay. Here is the complicated thing: the keyArray might be multiple entries, so as same as pinyin list
             // as such we need to extend keyArray by M (number of pinyin list) times of entries. We need to put limit here 
             var result = cloneArray(keyArray);
             for(var i=0; i<pinyin.length; i++)
             {
                // attach pinyin to first N entries 
                for(var j=i*result.length; j<keyArray.length; j++)
                {
                   keyArray[j] = keyArray[j] + ' ' + pinyin[i]; 
                }
                // we need to put a break to protect a too long list 
                if(keyArray.length >= 8) 
                {
                   // ignore the reset pingyin keys 
                   break; 
                }
                // extend with original N entries as long as the pinyin list has more than 1 entry left  
                for(var j=0; j<result.length && i<(pinyin.length-1); j++)
                {
                   keyArray[keyArray.length++] = result[j]; 
                }
             }
          }

       }
       //FireinputLog.debug(this, "build keyArray: " + keyArray.join(",")); 

    }, 

    getPhrasePinyinKey: function(phrase, keyArray)
    {
       if(!keyArray)
           keyArray=[]; 

       var uword = phrase.substr(0, 1); 
       var word = FireinputUnicode.convertFromUnicode(uword);
 
       var ime = FireinputUtils.getCurrentIME(); 

       if(!ime.getWordPinyin(word) || uword == word)
       {
          // if first one is not valid word, ignore it 
          return null; 
       }

       //FireinputLog.debug(this, "word: " + FireinputUnicode.getUnicodeString(word));
       if(word)
       {
          phrase = phrase.substr(1, phrase.length);
          this.buildPhraseKeyMap(word, keyArray);
          this.getPhrasePinyinKey(phrase, keyArray);
       }

      // FireinputLog.debug(this, "return keyArray: " + keyArray.join(",")); 
      // FireinputLog.debug(this, "return keyArray.length: " + keyArray.length); 
       return keyArray; 
    }, 

   
    getPhraseWordLine: function(line, signature)
    {
       if(!line || line.length <= 1)
          return; 

       FireinputLog.debug(this, "line: " + line); 
       var pinyinkey = null; 
       var phraseFreq = null; 

       var ime = FireinputUtils.getCurrentIME(); 

       // supported format: 
       // phrase
       // phrase=input key 
       // freq phrase=input key 
       // freq phrase

       // first chech whether the key is given 
       var phraseKeyList = line.match(/=/); 
       if(phraseKeyList && phraseKeyList.length >= 2)
       { 
          // we have key given 
          pinyinkey = phraseKeyList[1]; 
          phraseFreq = phraseKeyList[0]; 
       }
       else 
       {
          // must be freq phrase or phrase only 
          phraseFreq = line; 
          if(ime.getIMEType() != SMART_PINYIN)
          {
             // for any non-pinyin importing, we need the key; ignore if the line doesn't have it 
             return; 
          }
       }

       if(phraseFreq)
       {
          var freq = 0; 
          var phrase = null; 

          // check whether the freq is given 
          var phraseFreqItems = phraseFreq.match(/\s+/); 
          if(!phraseFreqItems || phraseFreqItems.length < 2)
          {
             // just phrase only 
             phrase = phraseFreq; 
          }
          else
          {
             // ignore if it's single word 
             if(phraseFreqItems[1].length <= 1)
                  return; 

             phrase = phraseFreqItems[1]; 
             freq = parseInt(phraseFreqItems[0]); 
          }

          if(!pinyinkey)
          {
              var keys = this.getPhrasePinyinKey(phrase);
              if(!keys || keys.length <= 0)
                 return; 
              FireinputLog.debug(this, "Phrase: " + phrase + ", Got keys: " + keys.join(",")); 

              phrase = FireinputUnicode.convertFromUnicode(phrase); 
              for(var i=0; i<keys.length; i++)
              {
                 var initialKey = ime.getPhraseInitKey(keys[i]);
                 ime.storeOneUpdatePhraseWithFreq(phrase, keys[i], freq, initialKey); 
                 // add it to ext phrase list
                 // only update ext hash when signature is set. This is not true for on-demand processing 
                 if(signature)
                    this.addOneExtPhrase(phrase, keys[i], freq, initialKey, ime.getIMEType(), signature);
              }

           }
           else
           {
              var initialKey = ime.getPhraseInitKey(pinyinkey);
              ime.storeOneUpdatePhraseWithFreq(FireinputUnicode.convertFromUnicode(phrase), pinyinkey, freq, initialKey);         
              // only update ext hash when signature is set. This is not true for on-demand processing 
              if(signature)
                 this.addOneExtPhrase(FireinputUnicode.convertFromUnicode(phrase), keys[i], freq, initialKey, ime.getIMEType(), signature);
           }
       }
    }, 

    storePhraseFromLocal: function(localfile)
    {
       var ios = FireinputXPC.getIOService();
       var fileHandler = ios.getProtocolHandler("file")
                         .QueryInterface(Components.interfaces.nsIFileProtocolHandler);

       var datafile = fileHandler.getFileFromURLSpec("file://" + localfile);
       if(!datafile.exists())
       {
           this.storePhrasePercent = -1; 
           return;
       }

       var istream = FireinputXPC.createInstance("@mozilla.org/network/file-input-stream;1", "nsIFileInputStream");
       istream.init(datafile,  0x01, 0444, 0);
       istream.QueryInterface(Components.interfaces.nsILineInputStream);

       FireinputLog.debug(this, "datafile.fileSize: " + datafile.fileSize);
       var line = {}, lines = [], hasmore;
       do {
           hasmore = istream.readLine(line);
           line.value = FireinputUnicode.getUnicodeString(line.value); 
           lines.push(line.value);
       } while(hasmore);

       istream.close();

       this.storePhrasePercent = 0; 
       // process any insertion after loading is completed 
       this.loadExtPhraseTable(function() {
          FireinputImporter.processPhraseFromLocal(lines, 0, datafile.fileSize, hex_md5(localfile));
       }); 
    }, 
 
    /* It's on demand processing which requires in-memory process only */
    processPhraseFromRemoteOnDemand: function(lines, totalsize)
    {
       this.storePhrasePercent = 0; 
       // process any insertion after loading is completed 
       this.processPhraseFromLocal(lines, 0, totalsize);
    }, 

    /* The phrases will be saved into ext phrase table. */
    processPhraseFromRemote: function(lines, totalsize, signature)
    {
       this.storePhrasePercent = 0; 
       // process any insertion after loading is completed 
       this.loadExtPhraseTable(function() {
          FireinputImporter.processPhraseFromLocal(lines, 0, totalsize, signature);
       }); 
    }, 

    processPhraseFromLocal: function(lines, totalread, totalsize, signature)
    {
       var linenum =0;
       if(totalread <= 0)
          this.storePhrasePercent = 0; 

       while(lines.length > 0)
       {
           var l = lines.shift();
           this.getPhraseWordLine(l, signature);
           linenum++;
           totalread += l.length;
           this.storePhrasePercent = parseInt((totalread * 100)/totalsize);
           if(linenum >= 500)
           {
              // give it a short break;
              var self = this; 
              setTimeout(function() { self.processPhraseFromLocal(lines, totalread, totalsize, signature); }, 500);
              break;
           }

       }

       if(lines.length <= 0)
          this.storePhrasePercent = 100; 
    },
  
    getStorePhrasePercent: function()
    {
       return this.storePhrasePercent; 
    }, 

    storePhraseFromAutoupdate: function(updatePhrases)
    {
       if(!updatePhrases || updatePhrases.length <= 0)
          return;

       FireinputLog.debug(this, "updatePhrase.length: " + updatePhrases.length);
       // load existing tables 
       this.loadExtPhraseTable(function() {
          var signature = hex_md5("火输词库更新");
          for(var i=0; i<updatePhrases.length; i++)
          {
             FireinputImporter.storeOneUpdatePhrase(updatePhrases[i], signature);
          }
          FireinputImporter.flushExtPhraseTable();
          FireinputImporter.updateHistory(SERVER_URL + "table/index.php", "火输词库更新");
       }); 
    },

    storeOneUpdatePhrase: function(updatePhrase, signature)
    {
       FireinputLog.debug(this, "phrase: " + updatePhrase);
       if(!updatePhrase || updatePhrase.length <= 0)
          return;

       if(/:/.test(updatePhrase))
       {
          var phraseKey = updatePhrase.split(':');
          var phrase = phraseKey[0].match(/[\D\.]+/g)[0];

          // There are tones from auto update, but we don't support it yet. skip it  
          var keys = phraseKey[1]; //.replace(/\d+/g, ''); 
          var freq = phraseKey[0].match(/[\d\.]+/g)[0];

          var ime = FireinputUtils.getCurrentIME(); 
          var initialKey = ime.getPhraseInitKey(keys);
          ime.storeOneUpdatePhraseWithFreq(phrase, keys, freq, initialKey);
          // add it to ext phrase list
          this.addOneExtPhrase(phrase, keys, freq, initialKey, ime.getIMEType(), signature);
       }
    }
 
     
}; 

