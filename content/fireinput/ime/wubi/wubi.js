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

var Wubi = function()  {}; 

Wubi.prototype =  extend(new FireinputIME(), 
{
    // 0 to disable debug or non zero to enable debug 
    debug: 0, 

    // the name of IME 
    name: IME_WUBI,

    // array to keep all matched words 
    charArray: null,

    // current position of charArray 
    charIndex: 0, 

    // invalid input key 
    validInputKey: null,

    // the hash table for wubi key=> word
    keyWubiHash: null, 

    // the hash table for wubi word=>key for learning 
    wordWubiHash: null, 

    // the hash table for user frequency 
    userCodeHash: null, 

    // the wubi key map in format of z 
    keyMapTable: null, 

    // use code hash table event 
    userTableChanged: false, 

    // full/half letter converter 
    letterConverter: null, 

    // pinyin Schema 
    wubiSchema: null, 

    // encoding mode. Either simplified or big5. Simplified default. 
    encodingMode: ENCODING_ZH, 

    // engine enabled 
    engineDisabled: false, 

    // can auto insertion 
    autoInsertion: false, 

    // number of selection word/phrase that will be sent back to IME panel for display
    numSelection: 9,

    // the entrance function to load all related tables 
    loadTable: function()
    {
       this.letterConverter = new FullLetterConverter(); 

       // setTimeout to not block firefox start
       var self = this; 
       setTimeout(function() { return self.loadWubiTable(); }, 500); 

       // init encoding table 
       FireinputEncoding.init(); 
    },

    insertKey: function(keyList, key)
    {
       if(typeof(keyList) == 'undefined')
       {
          keyList = new Array();
          keyList.push(key);
       }
       else
          keyList.push(key);
       return keyList;
    },

    getKeyMapList: function(length)
    {
       var str = ""; 
       for(var i=0; i<length; i++)
       {
          str += "z"; 
       }
       return str; 
    }, 

    insert: function(keyTable, key)
    {
       var itemStr = this.getKeyMapList(key.length); 
       var keyList = keyTable[itemStr]; 
       keyTable[itemStr] = this.insertKey(keyList, key); 
       return; 
    },

    getCodeLine: function(str)
    {
       var strArray = str.split(':');
       if(strArray.length < 2)
          return;

       // key=>word1, word2 
       this.keyWubiHash.setItem(strArray[0],strArray[1]);

       // build key map table in a format as: 
       // a => { "z" => array(), "zz" => array(), "zzz"=> array(), "zzzz"=> array()}
       
       var initialChar = strArray[0].substring(0,1);
       if(this.keyMapTable.hasItem(initialChar))
       {
          var keyTable = this.keyMapTable.getItem(initialChar); 
          this.insert(keyTable, strArray[0]); 
       }
       else
       {
          var keyTable = new Object(); 
          this.insert(keyTable, strArray[0]); 
          this.keyMapTable.setItem(initialChar, keyTable);
       }
       
    },

    sortKeyMapTable: function()
    {
       this.keyMapTable.foreach(function(k, v) { for(var s in v) { v[s] = v[s].sort(); } }); 
    }, 

    loadWubiTable: function()
    {
       var ios = FireinputXPC.getIOService(); 

       var path = this.getDataPath(); 
       var datafile = ""; 

       if(this.wubiSchema == WUBI_86) {
          datafile = ios.newURI(path + this.getWubi86File(), null, null);
       }
       else if(this.wubiSchema == WUBI_98) {
          datafile = ios.newURI(path + this.getWubi98File(), null, null);
       }

       this.keyWubiHash = new FireinputHash();
       this.keyMapTable = new FireinputHash(); 

       var checkExists = function() {
          if(this.keyWubiHash.length <= 0) {
            var datafile = this.wubiSchema == WUBI_98 ? this.getNetWubi98File() : this.getNetWubi86File(); 
            if(!datafile.exists()) {
              this.loadUserTable(); 
              return;
            }

            var options = {
               caller: this,
               oncomplete: bind(function() { this.sortKeyMapTable(); this.loadUserTable(); }, this),
               onavailable: this.getCodeLine
            };
            FireinputStream.loadDataAsync(ios.newFileURI(datafile), options);
          }
          else {
            this.sortKeyMapTable();
            this.loadUserTable();
          }
       };

       var options = {
          caller: this, 
          oncomplete: checkExists, 
          onavailable: this.getCodeLine
       }; 

       FireinputStream.loadDataAsync(datafile, options);
    },

    updateUserCodeValue: function(key, word, freq)
    {
       if(this.keyWubiHash.hasItem(key))
       {

          var phrase = this.keyWubiHash.getItem(key);
          var regex = new RegExp(word + "\\d+", "g");
          var oldWordFreq = phrase.match(regex);
          if(oldWordFreq)
          {
             phrase = phrase.replace(oldWordFreq, "");
          }

          phrase = word+freq + "," + phrase;
          this.keyWubiHash.setItem(key, phrase);

          return;
       }
       //the initKey is not in hash. Add it in  
       this.keyWubiHash.setItem(key, word+freq);
    },
     
    getUserCodeLine: function(str)
    {
       var strArray = str.split(':');
       if(strArray.length < 4)
          return;

       // user data format: schema: word: freq key initKey 
       if(isNaN(parseInt(strArray[0])))
       {
          return; 
       }
       else
       {
          this.userCodeHash.setItem(strArray[1]+":"+strArray[3], {freq: strArray[2], initKey: strArray[4], schema: strArray[0]});
          if(strArray[0] == this.wubiSchema)
             this.updateUserCodeValue(strArray[3], strArray[1], strArray[2]);
       }      

    },

    loadUserTable: function()
    {
       var ios = FireinputXPC.getIOService(); 
       var datafile = this.getUserDataFile();
       if(!datafile.exists())
       {
          this.loadExtPhraseTable();
          return;
       }
 
       this.userCodeHash = new FireinputHash();

       var options = {
          caller: this, 
          onavailable: this.getUserCodeLine, 
          oncomplete: this.loadExtPhraseTable
          
       }; 
       FireinputStream.loadDataAsync(ios.newFileURI(datafile), options); 
    },

    getExtPhraseCodeLine: function(str)
    {
       var strArray = str.split(':');
       if(strArray.length < 5)
          return;

       // for wubi, we only care about the first 3 values 
       var word = "";
       var freq = "";
       var key = "";

       if(strArray[0] != this.wubiSchema)
          return; 

       word = strArray[1];
       freq = strArray[2];
       key = strArray[3].replace(/^\s+|\s+$/g, '');
       this.updateUserCodeValue(key, word, freq);
    },

    loadExtPhraseTable: function()
    {
       var ios = FireinputXPC.getIOService(); 
       var datafile = this.getExtDataFile();
       if(!datafile.exists())
       {
          return;
       }
       var options = {
          caller: this,
          onavailable: this.getExtPhraseCodeLine
       };
       FireinputStream.loadDataAsync(ios.newFileURI(datafile), options);
    },

    hasTableFile: function()
    {
       var ios = FireinputXPC.getIOService();

       var path = this.getDataPath();
       if(this.wubiSchema == WUBI_86) {
          return FireinputStream.checkAccess(ios.newURI(path + this.getWubi86File(), null, null));
       }

       if(this.wubiSchema == WUBI_98) {
          return FireinputStream.checkAccess(ios.newURI(path + this.getWubi86File(), null, null));
       }

       return false; 
    },

    hasNetTableFile: function()
    {
       if(this.wubiSchema == WUBI_86) {
         var datafile = this.getNetWubi86File();
         return datafile.exists() ? true : false;
       }

       if(this.wubiSchema == WUBI_98) {
         var datafile = this.getNetWubi98File();
         return datafile.exists() ? true : false;
       }

       return false; 
    },

    isSchemaEnabled: function()
    {
       if(this.engineDisabled)
          return false;

       var ios = FireinputXPC.getIOService(); 
 
       var datafile = null; 
       var path = this.getDataPath();
       if(this.wubiSchema == WUBI_86) {
          if(!FireinputStream.checkAccess(ios.newURI(path + this.getWubi86File(), null, null)))
          {
            datafile = this.getNetWubi86File(); 
          }
       }
       else if(this.wubiSchema == WUBI_98) {
          if(!FireinputStream.checkAccess(ios.newURI(path + this.getWubi98File(), null, null)))
          {
            datafile = this.getNetWubi98File(); 
          }

       }  

       /* datafile is not set which means the internal data file is there */
       if(!datafile)
          return true; 

       /* finally check data file */
       if(!datafile.exists())
       {
          return false;
       }

       return true;
    },

    canComposeNew: function()
    {
       return false; 
    },
 
    getMaxAllowedKeys: function()
    {
       return 4; 
    }, 

    setNumWordSelection: function(num)
    {
       this.numSelection = num > 9 ? 9 : (num < 1 ? 1: num);
    },

    getIMEType: function()
    {
       return  this.wubiSchema;
    },

    setSchema: function(schema)
    {
       //FireinputLog.debug(this, "Set schema: " + schema);
       this.wubiSchema = schema; 
    }, 

    getSchema: function()
    {
       return this.wubiSchema; 
    }, 

    getAllowedInputKey: function()
    {
       return "abcdefghijklmnopqrstuvwxyz"; 
    },

    setEncoding: function(encoding)
    {
       this.encodingMode = encoding; 
    }, 

    convertLetter: function(code)
    {
       // Full: number + alpha character
       // Punct: any printable character which is not a space or an alphanumeric character
       if((!this.isHalfLetterMode() && 
          ((code > 47 && code < 58) || 
           (code > 64 && code < 91))) || 
          (!this.isHalfPunctMode() && 
           !((code > 47 && code < 58) ||
            (code > 64 && code < 91))))
          return this.letterConverter.toFullLetter(String.fromCharCode(code)); 

       return String.fromCharCode(code); 
    }, 

    find: function(inputChar)
    {
       var s = inputChar; 
       var retArray = null;

       this.autoInsertion = false; 
       // here we will do searching on inputChar by length -1 every time if retArray is null 
       while(s.length > 0 && (retArray=this.searchAll(s)) == null)
       {
          s = s.substr(0, s.length - 1); 
          // remove last single quot if it presents.  
          if(s.substr(s.length-1, 1) == "'")
          { 
            s = s.substr(0, s.length - 1); 
          }
       }

       this.validInputKey = s;
       return {charArray:retArray, validInputKey: this.validInputKey};
    },

    searchAll: function(inputChar)
    {
       this.charArray = null; 
       this.charIndex = 0; 

       this.charArray = this.codeLookup(inputChar); 
       if(this.charArray != null)
          return this.charArray.slice(0, this.numSelection);
       return null; 
    },

    codeLookup: function(keys)
    {
       var charArray = null; 
       if(keys == null || keys.length <= 0)
          return null; 

       // a valid charArray consist of {key:key, word: word}
       charArray = this.getValidWord(keys);
       if(!charArray)
          return null; 

       return charArray; 
    },

    next: function (endFlag)
    {
       if(!this.charArray)
          return null; 

       // FireinputLog.debug(this,"this.charIndex: " + this.charIndex);
       // if the next this.numSelection are already displayed, return null
       if((this.charIndex+this.numSelection) >= this.charArray.length)
          return null; 

       var i = this.charIndex; 
       if(!endFlag)
           this.charIndex += this.numSelection; 
       else 
       {
           i = this.charArray.length-this.numSelection; 
           i -= this.numSelection; 
           this.charIndex = i>0 ? i:0; 
       }
       // FireinputLog.debug(this,"this.charIndex: " + this.charIndex);
       return {charArray:this.charArray.slice(this.charIndex, this.charIndex+this.numSelection), validInputKey: this.validInputKey};
    }, 

    prev: function (homeFlag)
    {
       if(!this.charArray)
          return null; 
       // FireinputLog.debug(this,"this.charIndex: " + this.charIndex);
       // if the previous this.numSelection are already displayed, return null
       if((this.charIndex-this.numSelection) < 0)
          return null; 

       if(!homeFlag)
          this.charIndex -= this.numSelection; 
       else
          this.charIndex = 0; 
       
       // FireinputLog.debug(this,"this.charIndex: " + this.charIndex);
       return {charArray: this.charArray.slice(this.charIndex, this.charIndex+this.numSelection), validInputKey: this.validInputKey};
    }, 

    isBeginning: function()
    {
       return this.charIndex == 0; 
    },

    isEnd: function()
    {
       return (this.charIndex+this.numSelection) >= this.charArray.length; 
    }, 

    canAutoInsert: function()
    {
       return this.autoInsertion;       
    }, 


    getValidWord: function(key)
    {
       if(key.indexOf('z') < 0)
       {
          return this.getValidWordWithKey(key); 
       }

       var initialChar = key.substr(0, 1); 
       if(!this.keyMapTable.hasItem(initialChar))
       {
         // just return none if initial key is z or sth. else 
         return null; 
       }

       var keyTable = this.keyMapTable.getItem(initialChar); 
       var itemStr = this.getKeyMapList(key.length);  
       var keyList = keyTable[itemStr]; 

       var regexpStr = key.replace(/z/g, "\\S"); 
       var validWord = new Array(); 

       // let check whether there are "z"s
       for(var i=0; i<keyList.length; i++)
       {
          if(new RegExp(regexpStr).test(keyList[i]))
          {
              arrayInsert(validWord, validWord.length, this.getValidWordWithKey(keyList[i])); 
          }
       }
//       validWord.sort(this.sortCodeArray); 

       return validWord; 
    }, 

    getValidWordWithKey: function(key)
    {
       var wordArray = null; 
       var userArray = new Array(); 
       var wordList = new Array();
       if(!key)
          return null; 

       if(!this.keyWubiHash.hasItem(key))
          return null; 
 
       // only enable autoinsertion for 4 keys 
       if(key.length >= 4)
          this.autoInsertion = true; 

       var wubiWordList = this.keyWubiHash.getItem(key); 

       var wubiWordArray = wubiWordList.split(","); 

       wordArray = new Array(); 

       for(var i=0; i < wubiWordArray.length; i++)
       {
          var word = ""; 
          try 
          {
             word = wubiWordArray[i].match(/[\D\.]+/g)[0];
          }        
          catch(e) {}


          if(word.length <= 0) 
             continue; 

          var encodedWord = FireinputEncoding.getEncodedString(word, this.encodingMode);
          if(typeof(wordList[encodedWord]) != 'undefined')
             continue;

          wordList[encodedWord] = 1; 
 
          if(this.userCodeHash && this.userCodeHash.hasItem(word + ":" + key))
          {
             var ufreq = this.userCodeHash.getItem(word + ":" + key);
             /* use this way other than push to have better performance 
              * http://aymanh.com/9-javascript-tips-you-may-not-know
              */
             userArray[userArray.length] = {key: key, word:word+ufreq.freq, encodedWord:encodedWord+ufreq.freq}; 
          }
          else
          {
             var freq = wubiWordArray[i].match(/[\d\.]+/g)[0];
             wordArray[wordArray.length] = {key:key, word:wubiWordArray[i], encodedWord:encodedWord+freq};
          }
       }

       // free it 
       wordList = null;
       //FireinputLog.debug(this,"wordArray: " + this.getKeyWord(wordArray));
       if(userArray.length <= 0)         
          return wordArray; 

       // sort the first (this.numSelection+1) items 
       if(userArray.length < (this.numSelection+1))
       {
          arrayInsert(userArray, userArray.length, wordArray.slice(0, this.numSelection)); 
          userArray.sort(this.sortCodeArray); 
          arrayInsert(userArray, userArray.length, wordArray.slice((this.numSelection+1), wordArray.length)); 
       }
       else
       {
          userArray.sort(this.sortCodeArray); 
          arrayInsert(userArray, userArray.length, wordArray.slice(0, wordArray.length)); 
       }

       //FireinputLog.debug(this,"userArray: " + this.getKeyWord(userArray));
       return userArray; 
    },

    flushUserTable: function()
    {
       if(this.userCodeHash && this.userTableChanged)
       { 
          FireinputSaver.saveUserData(this.userCodeHash);
       }
    },

    updateFrequency: function(word, key, initKey)
    {
       var freq = word.match(/[\d\.]+/g)[0];
       var chars = word.match(/[\D\.]+/g)[0];
       if(!this.userCodeHash)
          this.userCodeHash = new FireinputHash();

       var newfreq = 0; 
       if(this.userCodeHash.hasItem(chars + ":" + key))
       {
          var charopt = this.userCodeHash.getItem(chars + ":" + key); 
          var freq1 = charopt.freq; 
          newfreq = parseInt("0xFFFFFFFF", 16) - freq1; 

          if(typeof(initKey) == "undefined")
              initKey = charopt.initKey; 
       }
       else
       {
          newfreq = parseInt("0xFFFFFFFF", 16) - freq; 

          if(typeof(initKey) == "undefined")
          {
              initKey = key.substring(0, 1);
              if(key.length >= 3)
                 initKey = key.substring(0, 3);
          }
       }

       if(newfreq)
       {
          newfreq /= Math.pow(2, 16); 
          if(newfreq < 1) newfreq = 1; 
       }
       freq = Math.round(newfreq) + parseInt(freq); 

       this.userCodeHash.setItem(chars+":"+key , {freq: freq, initKey: initKey, schema: this.wubiSchema});

       this.userTableChanged = true; 

       // FireinputLog.debug(this,"word: " + word);
       //FireinputLog.debug(this,"chars: " + chars + ", freq: " + freq);
       //FireinputLog.debug(this,"chars: " + chars + ", key: " + key + ", initKey: " + initKey);
       return freq; 
    },

    storeUserPhrases: function(userPhrases)
    {
       return; 
    },

    storeUserAddPhrase: function(phrase, keys, freq)
    {
      if(!this.userCodeHash)
          this.userCodeHash = new FireinputHash();

       if(this.userCodeHash.hasItem(phrase + ":" + keys))
          return;

       freq = this.updateFrequency(phrase+freq, keys);
       this.updateUserCodeValue(keys, phrase, freq); 
    }, 

    storeOneUpdatePhraseWithFreq: function(phrase, key, freq) 
    {
       this.updateUserCodeValue(key, phrase, freq); 
    }   
});


