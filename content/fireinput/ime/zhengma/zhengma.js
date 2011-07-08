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

Fireinput.zhengmaEngine = function()  {}; 

Fireinput.zhengmaEngine.prototype =  Fireinput.extend(new Fireinput.imeEngine(), 
{
    // 0 to disable debug or non zero to enable debug 
    debug: 0, 

    // the name of IME 
    name: Fireinput.IME_ZHENGMA,

    // array to keep all matched words 
    charArray: null,

    // current position of charArray 
    charIndex: 0, 

    // invalid input key 
    validInputKey: null,

    // the hash table for zhengma key=> word
    keyZhengmaHash: null, 

    // the hash table for zhengma word=>key for learning 
    wordZhengmaHash: null, 

    // the hash table for user frequency 
    userCodeHash: null, 

    // the zhengma key map in format of z 
    keyMapTable: null, 

    // use code hash table event 
    userTableChanged: false, 

    // full/half letter converter 
    letterConverter: null, 

    // pinyin Schema 
    zhengmaSchema: null, 

    // encoding mode. Either simplified or big5. Simplified default. 
    encodingMode: Fireinput.ENCODING_ZH, 

    // engine enabled 
    engineDisabled: false, 

    // can auto insertion 
    autoInsertion: false, 

    // number of selection word/phrase that will be sent back to IME panel for display
    numSelection: 9,

    // the entrance function to load all related tables 
    loadTable: function()
    {
       this.letterConverter = new Fireinput.fullLetterConverter(); 

       // setTimeout to not block firefox start
       var self = this; 
       setTimeout(function() { return self.loadZhengmaTable(); }, 500); 

       // init encoding table 
       Fireinput.encoding.init(); 
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
          str += "/"; 
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
       var strArray = str.split(' ');
       if(strArray.length < 1)
          return;

       // key word1 word2 
       var key = strArray.shift();

       if(this.keyZhengmaHash.hasItem(key))
       {
          this.keyZhengmaHash.setItem(key, this.keyZhengmaHash.getItem(key) + "," + strArray.join(","));
       }
       else
          this.keyZhengmaHash.setItem(key,strArray.join(","));

       // build key map table in a format as: 
       // a => { "/" => array(), "//" => array(), "///"=> array(), "////"=> array()}
       
       var initialChar = key.substring(0,1);
       if(this.keyMapTable.hasItem(initialChar))
       {
          var keyTable = this.keyMapTable.getItem(initialChar); 
          this.insert(keyTable, key); 
       }
       else
       {
          var keyTable = new Object(); 
          this.insert(keyTable, key); 
          this.keyMapTable.setItem(initialChar, keyTable);
       }
       
    },

    sortKeyMapTable: function()
    {
       this.keyMapTable.foreach(function(k, v) { for(var s in v) { v[s] = v[s].sort(); } }); 
    }, 

    loadZhengmaTable: function()
    {
       var ios = Fireinput.util.xpc.getIOService(); 

       var path = this.getDataPath(); 
       var datafile = ios.newURI(path + this.getZhengmaFile(), null, null); 
       
       this.keyZhengmaHash = new Fireinput.util.hash();
       this.keyMapTable = new Fireinput.util.hash(); 

       var checkExists = function() {
          if(this.keyZhengmaHash.length <= 0) {
            var datafile = this.getNetZhengmaFile();
            if(!datafile.exists()) {
              this.loadUserTable();
              return;
            }

            var options = {
               caller: this,
               oncomplete: (function() { this.sortKeyMapTable(); this.loadUserTable(); }).bind(this),
               onavailable: this.getCodeLine
            };
            Fireinput.stream.loadDataAsync(ios.newFileURI(datafile), options);
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

       Fireinput.stream.loadDataAsync(datafile, options);
    },

    updateUserCodeValue: function(key, word, freq)
    {
       if(this.keyZhengmaHash.hasItem(key))
       {

          var phrase = this.keyZhengmaHash.getItem(key);
          var regex = new RegExp(word + "\\d+", "g");
          var oldWordFreq = phrase.match(regex);
          if(oldWordFreq)
          {
             phrase = phrase.replace(oldWordFreq, "");
          }

          phrase = word+freq + "," + phrase;
          this.keyZhengmaHash.setItem(key, phrase);

          return;
       }
       //the initKey is not in hash. Add it in  
       this.keyZhengmaHash.setItem(key, word+freq);
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
          if(strArray[0] == this.zhengmaSchema)
             this.updateUserCodeValue(strArray[3], strArray[1], strArray[2]);
       }      

    },

    loadUserTable: function()
    {
       var ios = Fireinput.util.xpc.getIOService(); 
       var datafile = this.getUserDataFile();
       if(!datafile.exists())
       {
          this.loadExtPhraseTable();
          return;
       }
 
       this.userCodeHash = new Fireinput.util.hash();

       var options = {
          caller: this, 
          onavailable: this.getUserCodeLine, 
          oncomplete: this.loadExtPhraseTable
          
       }; 
       Fireinput.stream.loadDataAsync(ios.newFileURI(datafile), options); 
    },

    getExtPhraseCodeLine: function(str)
    {
       var strArray = str.split(':');
       if(strArray.length < 5)
          return;

       // for zhengma, we only care about the first 3 values 
       var word = "";
       var freq = "";
       var key = "";

       if(strArray[0] != this.zhengmaSchema)
          return; 

       word = strArray[1];
       freq = strArray[2];
       key = strArray[3].replace(/^\s+|\s+$/g, '');
       this.updateUserCodeValue(key, word, freq);
    },

    loadExtPhraseTable: function()
    {
       var ios = Fireinput.util.xpc.getIOService();

       var datafile = this.getExtDataFile();
       if(!datafile.exists())
       {
          return;
       }
       var options = {
          caller: this,
          onavailable: this.getExtPhraseCodeLine
       };
       Fireinput.stream.loadDataAsync(ios.newFileURI(datafile), options);
    },

    hasTableFile: function()
    {
       var ios = Fireinput.util.xpc.getIOService();

       var path = this.getDataPath();
       return Fireinput.stream.checkAccess(ios.newURI(path + this.getZhengmaFile(), null, null));
    },

    hasNetTableFile: function()
    {
       var datafile = this.getNetZhengmaFile();
       return datafile.exists() ? true : false;
    },

    isSchemaEnabled: function()
    {
       return this.hasTableFile() || this.hasNetTableFile(); 
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
       return  this.zhengmaSchema;
    },

    setSchema: function(schema)
    {
       //Fireinput.log.debug(this, "Set schema: " + schema);
       this.zhengmaSchema = schema; 
    }, 

    getSchema: function()
    {
       return this.zhengmaSchema; 
    }, 

    getAllowedInputKey: function()
    {
       return "abcdefghijklmnopqrstuvwxyz/"; 
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
       Fireinput.log.debug(this,"inputChar: " + inputChar);
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

       // Fireinput.log.debug(this,"this.charIndex: " + this.charIndex);
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
       // Fireinput.log.debug(this,"this.charIndex: " + this.charIndex);
       return {charArray:this.charArray.slice(this.charIndex, this.charIndex+this.numSelection), validInputKey: this.validInputKey};
    }, 

    prev: function (homeFlag)
    {
       if(!this.charArray)
          return null; 
       // Fireinput.log.debug(this,"this.charIndex: " + this.charIndex);
       // if the previous this.numSelection are already displayed, return null
       if((this.charIndex-this.numSelection) < 0)
          return null; 

       if(!homeFlag)
          this.charIndex -= this.numSelection; 
       else
          this.charIndex = 0; 
       
       // Fireinput.log.debug(this,"this.charIndex: " + this.charIndex);
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
       Fireinput.log.debug(this,"key: " + key);
       if(key.indexOf('/') <= 0)
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

       // let check whether there are "/"s
       for(var i=0; i<keyList.length; i++)
       {
          if(new RegExp(regexpStr).test(keyList[i]))
          {
              Fireinput.arrayInsert(validWord, validWord.length, this.getValidWordWithKey(keyList[i])); 
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

       if(!this.keyZhengmaHash.hasItem(key))
       {
          // if first key is z, try zmode 
          if(key.substr(0, 1) == '/')
          {
             return Fireinput.specialChar.getZMode(key);
          }

          return null; 
       }
  
       // only enable autoinsertion for 4 keys 
       if(key.length >= 4)
          this.autoInsertion = true; 

       var zhengmaWordList = this.keyZhengmaHash.getItem(key); 

       Fireinput.log.debug(this,"zhengmaWordList: " + zhengmaWordList);
       var zhengmaWordArray = zhengmaWordList.split(","); 

       wordArray = new Array(); 

       for(var i=0; i < zhengmaWordArray.length; i++)
       {
          var word = ""; 
          try 
          {
             word = zhengmaWordArray[i].match(/[\D\.]+/g)[0];
          }        
          catch(e) {}


          if(word.length <= 0) 
             continue; 

          var encodedWord = Fireinput.encoding.getEncodedString(word, this.encodingMode);
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
             var freq = zhengmaWordArray[i].match(/[\d\.]+/g); 
             if(freq)
                freq = freq[0];
             else
                freq = 0;

             wordArray[wordArray.length] = {key:key, word:zhengmaWordArray[i], encodedWord:encodedWord+freq};
          }
       }

       // free it 
       wordList = null;

       // append zmode list 
       // if first key is z, try zmode 
       if(key.substr(0, 1) == '/')
       {
          var zArray =  Fireinput.specialChar.getZMode(key);
          if(zArray)
            Fireinput.arrayInsert(wordArray, wordArray.length, zArray.slice(0, zArray.length));
       }

       if(userArray.length <= 0)         
          return wordArray; 

       // sort the first (this.numSelection+1) items 
       if(userArray.length < (this.numSelection+1))
       {
          Fireinput.arrayInsert(userArray, userArray.length, wordArray.slice(0, this.numSelection)); 
          userArray.sort(this.sortCodeArray); 
          Fireinput.arrayInsert(userArray, userArray.length, wordArray.slice((this.numSelection+1), wordArray.length)); 
       }
       else
       {
          userArray.sort(this.sortCodeArray); 
          Fireinput.arrayInsert(userArray, userArray.length, wordArray.slice(0, wordArray.length)); 
       }

       // Fireinput.log.debug(this,"userArray: " + this.getKeyWord(userArray));
       return userArray; 
    },

    flushUserTable: function()
    {
       if(this.userCodeHash && this.userTableChanged)
       { 
          Fireinput.phraseSaver.saveUserData(this.userCodeHash);
       }
    },

    updateFrequency: function(word, key, initKey)
    {
       var freq = word.match(/[\d\.]+/g)[0];
       var chars = word.match(/[\D\.]+/g)[0];
       if(!this.userCodeHash)
          this.userCodeHash = new Fireinput.util.hash();

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

       this.userCodeHash.setItem(chars+":"+key , {freq: freq, initKey: initKey, schema: this.zhengmaSchema});

       this.userTableChanged = true; 

       // Fireinput.log.debug(this,"word: " + word);
       //Fireinput.log.debug(this,"chars: " + chars + ", freq: " + freq);
       //Fireinput.log.debug(this,"chars: " + chars + ", key: " + key + ", initKey: " + initKey);
       return freq; 
    },

    storeUserPhrases: function(userPhrases)
    {
       return; 
    },

    storeUserAddPhrase: function(phrase, keys, freq)
    {
      if(!this.userCodeHash)
          this.userCodeHash = new Fireinput.util.hash();

       if(this.userCodeHash.hasItem(phrase + ":" + keys))
          return;

       freq = this.updateFrequency(phrase+freq, keys);
       this.updateUserCodeValue(keys, phrase, freq); 
    }, 

    storeOneUpdatePhraseWithFreq: function(phrase, key, freq) 
    {
       this.updateUserCodeValue(key, phrase, freq); 
    },

    isNewPhrase: function(work, key)
    {
       return false;
    }


});


