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

Fireinput.smartPinyinEngine = function()  {}; 

Fireinput.smartPinyinEngine.prototype =  Fireinput.extend(new Fireinput.imeEngine(), 
{
    // 0 to disable debug or non zero to enable debug 
    debug: 1, 

    // the name of IME 
    name: Fireinput.IME_SMART_PINYIN, 

    // pinyin Initial list 
    pinyinInitials: [],

    // pinyin Fials list 
    pinyinFinals: [], 

    // array to keep all matched words 
    charArray: null,

    // invalid input key 
    validInputKey: null, 

    // current position of charArray 
    charIndex: 0, 

    // the hash table for single word-pinyin 
    codePinyinHash: null, 

    // the hash table for phrase 
    phraseCodeHash: null, 

    // the hash table for on-demand phrase 
    onDemandPhraseCodeHash: null, 

    // the hash table for user frequency 
    userCodeHash: null, 

    // use code hash table event 
    userTableChanged: false,

    // full/half letter converter 
    letterConverter: null, 

    // pinyin Schema 
    pinyinSchema: null, 

    // encoding mode. Either simplified or big5. Simplified default. 
    encodingMode: Fireinput.ENCODING_ZH, 

    // engine enabled 
    engineDisabled: false, 

    // async timer 
    asyncFindTimer: null, 

    // current lookup env variables, used for asynchronous finding 
    currLookupEnv: null, 

    // number of selection word/phrase that will be sent back to IME panel for display 
    numSelection: 9, 

    // the entrance function to load all related tables 
    loadTable: function()
    {
       this.letterConverter = new Fireinput.fullLetterConverter(); 

       for(var i=0; i<Fireinput.PinyinInitials.length; i++)
         this.pinyinInitials[Fireinput.PinyinInitials[i]] = Fireinput.PinyinInitials[i]; 

       for(var i=0; i<Fireinput.PinyinFinals.length; i++)
         this.pinyinFinals[Fireinput.PinyinFinals[i]] = Fireinput.PinyinFinals[i]; 

       // setTimeout to not block firefox start
       var self = this; 
       setTimeout(function() { return self.loadPinyinTable(); }, 500); 

       // init encoding table 
       Fireinput.encoding.init(); 
    },

    getCodeLine: function(str)
    {
       var strArray = str.split(':');
       if(strArray.length < 2)
          return;

       // initKey:key=>word 
       
       if(/=>/.test(strArray[1]))
       {
          this.codePinyinHash.setItem(strArray[0],strArray[1]);
       }

       var codeList = strArray[1].split(",");

       for(var i=0; i<codeList.length; i++)
       {
          var codePinyin  = codeList[i].split("=>"); 
          var freq = codePinyin[1].match(/(\d+)/)[0]; 
          var word = codePinyin[1].match(/(\D+)/)[0]; 

          var item = this.codePinyinHash.getItem(word);
          if(!item)
          {
              this.codePinyinHash.setItem(word, codePinyin[0] + freq); 
          }
          else if(typeof(item) == 'object' && item instanceof Array)
          {
              item[item.length++] = codePinyin[0] + freq; 
              item.sort(this.sortKeyArray);
          }
          else
          {
              var itemArray = [];
              itemArray[itemArray.length++] = item;
              itemArray[itemArray.length++] = codePinyin[0] + freq; 
              itemArray.sort(this.sortKeyArray);
              this.codePinyinHash.setItem(word, itemArray);
          }
       }
    },

    loadPinyinTable: function()
    {
       var ios = Fireinput.util.xpc.getIOService(); 

       var path = this.getDataPath(); 
       var datafile = ios.newURI(path + this.getPinyinDataFile(),  null, null); 

       this.codePinyinHash = new Fireinput.util.hash();


       var checkExists = function() {
          if(this.codePinyinHash.length <= 0) {
            var datafile = this.getNetPinyinDataFile(); 
            if(!datafile.exists()) {
              this.engineDisabled = true; 
              return; 
            }

            var options = {
               caller: this, 
               oncomplete:this.loadPinyinPhrase,
               onavailable: this.getCodeLine
            }; 
            Fireinput.stream.loadDataAsync(ios.newFileURI(datafile), options);
          }
          else 
            this.loadPinyinPhrase(); 
       };
 
       var options = {
          caller: this, 
          oncomplete: checkExists,
          onavailable: this.getCodeLine
       }; 

       Fireinput.stream.loadDataAsync(datafile, options);
    },


    getPhraseLine: function(str)
    {
       var strArray = str.split(':');
       if(strArray.length < 1)
          return;

       // initKey:key=>phrase 
       this.phraseCodeHash.setItem(strArray[0], strArray[1]);
    }, 

    loadPinyinPhrase: function()
    {
       var ios = Fireinput.util.xpc.getIOService(); 

       var path = this.getDataPath();

       var datafile = ios.newURI(path + this.getPinyinPhraseFile(), null, null);

       this.phraseCodeHash = new Fireinput.util.hash(); 

       var checkExists = function() {
          if(this.phraseCodeHash.length <= 0) {
            var datafile = this.getNetPinyinPhraseFile();
            if(!datafile.exists()) {
              this.loadUserTable(); 
              return;
            }

            var options = {
               caller: this,
               oncomplete:this.loadUserTable,
               onavailable: this.getPhraseLine
            };
            Fireinput.stream.loadDataAsync(ios.newFileURI(datafile), options);
          }
          else
            this.loadUserTable(); 
       };

       var options = {
          caller: this, 
          onavailable: this.getPhraseLine,
          oncomplete: checkExists 
       }; 

       Fireinput.stream.loadDataAsync(datafile, options);
    },

    updateUserCodeValue: function(key, initKey, word, freq)
    {
       // check if it's single char 
       if (!/ /.test(key) && (this.codePinyinHash.hasItem(initKey) || this.codePinyinHash.hasItem(key)))
       {
          // check the list based on key first
          var hashKey = key; 
          var words = this.codePinyinHash.getItem(key);

          if(!words)
          { 
             words = this.codePinyinHash.getItem(initKey); 
             if(!words)
               return; 

             hashKey = initKey; 
          }

          var regex = new RegExp(word + "\\d+", "g"); 
          var oldWordFreq = words.match(regex);
          if(oldWordFreq)
          { 
             words = words.replace(key + "=>" + oldWordFreq, "");
          }

          // append to beginning 
          words = key + "=>" + word + freq + "," + words;
          this.codePinyinHash.setItem(hashKey,  words);

          return; 
       }

       // update phraseCodeHash 
 
       if(this.phraseCodeHash.hasItem(initKey))
       {
          
          var phrase = this.phraseCodeHash.getItem(initKey); 
          var regex = new RegExp("\\w" + word + "\\d+", "g"); 

          // replace the old word. We replace key and word just in case 
          // someone has manually edited the local userinput table 
          phrase = phrase.replace(regex, "");
          phrase = key+"=>"+word+freq + "," + phrase; 
          this.phraseCodeHash.setItem(initKey, phrase); 

          return; 
       }
      
       //the initKey is not in hash. Add it in  
       this.phraseCodeHash.setItem(initKey, key+"=>"+word+freq); 
    }, 

    getUserCodeLine: function(str)
    {
       var strArray = str.split(':');
       if(strArray.length < 4)
          return;

       // user data format: word: freq key initKey 
       // new user data format: schema: word: freq key initKey
       var word = ""; 
       var freq = ""; 
       var key = ""; 
       var initKey = ""; 
       var newPhrase = false; 
      
       var schema = parseInt(strArray[0]); 
       if(isNaN(schema))
       {
          word = strArray[0]; 
          freq = strArray[1]; 
          key = strArray[2].replace(/^\s+|\s+$/g, ''); 
          initKey = strArray[3].replace(/^\s+|\s+$/g, ''); 
          if(strArray.length > 4 && strArray[4] == "1")
             newPhrase = true; 
       }
       else if(schema <= 5) // everything for pinyin, no matter full or shuang 
       {
          word = strArray[1]; 
          freq = strArray[2]; 
          key = strArray[3].replace(/^\s+|\s+$/g, ''); 
          initKey = strArray[4].replace(/^\s+|\s+$/g, ''); 
          if(strArray.length > 5 && strArray[5] == "1")
             newPhrase = true; 
       }
       else
       {
          word = strArray[1]; 
          freq = strArray[2]; 
          key = strArray[3].replace(/^\s+|\s+$/g, ''); 
          initKey = strArray[4].replace(/^\s+|\s+$/g, ''); 
          // just leave it into userCodeHash for later save 
          this.userCodeHash.setItem(word + ":" + key, {freq: freq, initKey: initKey, schema: schema});
          return; 
       }

       //FIXME: We want to update the codeHash and phraseHash instead of keep it in user hash 
       if(newPhrase)
       {
          // to avoid incorrect hashing for words with different key, we hash work + " " + key which should be unique 
          this.userCodeHash.setItem(word + ":" + key, {freq: freq, initKey: initKey, schema: this.pinyinSchema.getSchema(), newPhrase: newPhrase});
       }
       else  
          this.userCodeHash.setItem(word + ":" + key, {freq: freq, initKey: initKey, schema: this.pinyinSchema.getSchema()});


       this.updateUserCodeValue(key, initKey, word, freq);
    },

    loadUserTable: function()
    {
       var ios = Fireinput.util.xpc.getIOService(); 
       var datafile = this.getUserDataFile();
       this.userCodeHash = new Fireinput.util.hash();

       if(!datafile.exists())
       {
          this.loadExtPhraseTable();
          return; 
       }

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

       // user data format: word: freq key initKey 
       // new user data format: schema: word: freq key initKey
       var word = ""; 
       var freq = ""; 
       var key = ""; 
       var initKey = ""; 
      
       var schema = parseInt(strArray[0]); 
       word = strArray[1]; 
       freq = strArray[2]; 
       key = strArray[3].replace(/^\s+|\s+$/g, ''); 
       initKey = strArray[4].replace(/^\s+|\s+$/g, ''); 
       this.updateUserCodeValue(key, initKey, word, freq);
    }, 

    loadExtPhraseTable: function()
    {
       var ios = Fireinput.util.xpc.getIOService(); 

       var datafile = this.getExtDataFile();

       var options = {
          caller: this, 
          onavailable: this.getExtPhraseCodeLine
       }; 
       Fireinput.stream.loadDataAsync(ios.newFileURI(datafile), options); 
    },

    hasTableFile: function()
    {
       if(this.engineDisabled)
         return false; 

       var ios = Fireinput.util.xpc.getIOService(); 

       var path = this.getDataPath(); 
       var datafile = ios.newURI(path + this.getPinyinDataFile(),  null, null); 

       return Fireinput.stream.checkAccess(datafile); 
         
    }, 

    hasNetTableFile: function()
    {
       var datafile = this.getNetPinyinDataFile();
       return datafile.exists() ? true : false; 
    }, 

    isSchemaEnabled: function()
    {
       if(this.engineDisabled)
          return false;

       return this.hasTableFile() || this.hasNetTableFile();
    },

    canComposeNew: function()
    {
       return true; 
    }, 

    setNumWordSelection: function(num)
    {
       this.numSelection = num > 9 ? 9 : (num < 1 ? 1: num); 
    }, 

    getIMEType: function()
    {
       return Fireinput.SMART_PINYIN; 
    }, 
  
    setSchema: function(schema)
    {
       if(!this.pinyinSchema)
          this.pinyinSchema = new Fireinput.pinyinSchema(); 

       if(!this.pinyinSchema)
          return; 

       //Fireinput.log.debug(this, "Set schema: " + schema);
       this.pinyinSchema.setSchema(schema); 
    }, 

    getSchema: function()
    {
       return this.pinyinSchema.getSchema(); 
    }, 

    getAllowedInputKey: function()
    {
       if(this.pinyinSchema)
          return this.pinyinSchema.getAllowedKeys(); 

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

    find: function(inputChar, singleWord, keyMatch)
    {
       var result = null;
       //Fireinput.log.debug(this, "find, inputChar: " + inputChar); 
       // use current schema 
       result = this.findBySchema(inputChar, false, singleWord, keyMatch);
       if(!result)
       {
          // use default schema: pinyin 
          result = this.findBySchema(inputChar, true, singleWord, keyMatch); 
       }

       return result; 
    }, 

    findBySchema: function(inputChar, useDefaultSchema, singleWord, keyMatch)
    {
       var s = inputChar; 
       var retArray = null;
       var _keymatch = keyMatch; 

       // here we will do searching on inputChar by length -1 every time if retArray is null 
       // Fireinput.log.debug(this, "Send original key=" + inputChar);
       while(s.length > 0)
       {
          // Fireinput.log.debug(this, "findBySchema: searchAll\n"); 
          var result=this.searchAll(s, useDefaultSchema, singleWord, keyMatch); 
          if(!result)
             break; 
          if(result.charArray)
          {
             retArray = result.charArray; 
             break; 
          }

          //Fireinput.log.debug(this, "findBySchema: _keymatch " + _keymatch + ", keyMatch " + keyMatch + ", s => " + s);
          /*  
           * If the keyMatch from upper level is true, it's not necessary for loop 
           */
          if(_keymatch)
             break; 
          /*
           * The loose match wasn't found, so the second loop needs to make the exact match 
           */
          keyMatch = true; 
          result.keySize = result.keySize >0 ? result.keySize : 1;  
          s = s.substr(0, s.length - result.keySize); 
          // Fireinput.log.debug(this, "Send key after reduced=" + s);

          // remove last single quot if it presents.  
          if(s.substr(s.length-1, 1) == "'")
          { 
            s = s.substr(0, s.length - 1); 
          }
       }
       this.validInputKey = s; 

       //FIXME: how to return the a valid English word 
       /*
       if(!retArray || retArray.length <= 0)
       {
          retArray = new Array({key: inputChar, word: inputChar, ufreq: 'false'}); 
       }
       */

       return {charArray:retArray, validInputKey: this.validInputKey}; 
    },

    searchAll: function(inputChar, useDefaultSchema, singleWord, keyMatch)
    {
       this.charArray = null; 
       this.currLookupEnv = null; 
       this.charIndex = 0; 

       var keySet = null; 
       var keyArray = this.pinyinSchema.getComposeKey(inputChar, useDefaultSchema); 

       //Fireinput.log.debug(this, "keyArray=" + keyArray);
       if(typeof(keyArray) == "string")
       {
          keySet = this.parseKeys(inputChar); 
          /* 
           * if singleWord is forced(e.g. the composer is enabled), only single word will be returned. 
           * So we only need to take first onefrom keySet to search the word. 
           * Please note: we only do this if the input key is multiple keys since a single key is going 
           * to be handled correctly
           */
          if(singleWord && keySet.length>1)
          {
             return {charArray: null, keySize: keySet[keySet.length-1].key.length};
          }
          else 
          {
             this.charArray = this.codeLookup(keySet, keyMatch); 
          }

          /* for single key, if no result was found, it should be a valid hash key for 
           * phrase table. We will just return key w/o further looping 
           */          
          if(!this.charArray && keySet.length <= 1)
          {
             keySet = this.parseKeys(inputChar, true);
             this.charArray = this.codeLookup(keySet, keyMatch); 
          } 
 
          /*
           * if the chararray is not found, we need to adjust the inputchar by removing last inputkey in keySet
           * array. Just make sure the FULL type will not be messed up 
           */ 
          if(this.charArray != null)
          {
             // the first set of word value is ready. We issue an asynchronous to get next list of values 
             this.currLookupEnv = {table: Fireinput.PINYIN_WORD_LOOKUP, keyArray: keySet, keyMatch: keyMatch}; 
             // Fireinput.log.debug(this, "findNext before Fireinput.PINYIN_WORD_LOOKUP\n"); 
             this.findNext(); 
             return {charArray: this.charArray.slice(0,this.numSelection), keySize: 0};

          }
          else if(keySet && keySet.length > 0)
          {
             /* If the last input is FINAL, there might be more input coming, return null to wait
              * if the keymatch is set, take the input as completed pinyin  
             if(keySet[keySet.length-1].type == Fireinput.KEY_FINAL && !keyMatch)
                return null; 
             else 
              */
                return {charArray: null, keySize: keySet[keySet.length-1].key.length};
          }
          else
             return {charArray: null, keySize: 1}; 
       }
       else if(keyArray != null)
       {
           // This is for Shuangping 
/*
           for(var i=0; i<keyArray.length; i++)
           {
               for (var j=0; j<keyArray[i].length; j++)
               {       
                   // Fireinput.log.debug(this, "keyArray[" + i + "][" + j + "].type=" + keyArray[i][j].type);
                   // Fireinput.log.debug(this, "keyArray[" + i + "][" + j + "].key=" + keyArray[i][j].key);
               }
           }
*/
           // loop through all possible combinations 
           for(var i=0; i<keyArray.length; i++)
           {
               var charArray = this.codeLookup(keyArray[i], keyMatch); 
               if(this.charArray == null)
               {
                   this.charArray = charArray; 
               }
               else if(this.charArray != null && charArray != null)
               {
                   Fireinput.arrayInsert(this.charArray, this.charArray.length, charArray); 
                   this.charArray.sort(this.sortCodeArray); 
               }

           }


           if(!this.charArray)
             return {charArray: null, keySize: 1};

           // the first set of word phrase is ready. We issue an asynchronous to get next list of values 
           // Fireinput.log.debug(this, "findNext before Fireinput.PINYIN_PHRASE_LOOKUP\n"); 
           this.currLookupEnv = {table: Fireinput.PINYIN_PHRASE_LOOKUP, keyArray: keyArray, keyMatch: keyMatch}; 
           this.findNext(); 

           return {charArray: this.charArray.slice(0,this.numSelection), keySize: 1}; 
       }

       return {charArray: null, keySize: 1};
    },

    codeLookup: function(keys, keyMatch, currIndex)
    {
       var charArray = null; 

       var originalKeys = keys;
       if(typeof(currIndex) == 'undefined')
          currIndex = this.charIndex; 

       if(keys == null || keys.length <= 0)
          return null; 

       //Fireinput.log.debug(this, "coodLookup keys.length=" + keys.length);
       // a valid charArray consist of {key:key, word: word}
       if(keys.length <= 1)
       { 
          charArray = this.getValidWord(keys, currIndex);
       }
       // check different mode 
       else if(keys[0].key == 'i')
       {
          // we are in special char imode 
          var ikey = this.getInitialKeys(keys); 
          if(ikey)
          {   
             ikey = ikey.ikey; 
             charArray = Fireinput.specialChar.getIMode(ikey); 
          }
       }
       else 
       {
          // look through all possible keyset 
          while(1)
          {
             var result = this.getKey(keys); 
             if(result == null)
                break; 

             keys = result.keys; 
             var keySet = result.keyset; 
             var phraseKey = keySet == null ? keys : keySet; 

             // add the charArray to global list 
             var tmpCharArray = this.getValidPhrase(phraseKey, keyMatch, currIndex);  
             if(!tmpCharArray || tmpCharArray.length <= 0)
             {
                if(!keySet)
                   break; 
                else 
                   continue; 
             }
             if(charArray == null)
                charArray = tmpCharArray; 
             else if(charArray != null && tmpCharArray != null)
             {
                Fireinput.arrayInsert(charArray, charArray.length, tmpCharArray); 
                charArray.sort(this.sortCodeArray); 
             }

             // there is no additional keyset, stop 
             if(keySet == null)
                 break; 
          }    
       }

       return charArray; 
    },

    next: function (endFlag)
    {
       if(!this.charArray)
          return null; 

       // Fireinput.log.debug(this,"this.charIndex: " + this.charIndex);
       // Fireinput.log.debug(this,"this.charArray: " + this.charArray.length);
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
       // preloading the next set of value, we only need one more (this.numSelection+1) items by default  
       // The first page this.charIndex is 0, second page: this.charIndex: 1
       // The reason we need to put the check between k & k+2 because we want to make sure the isEnd won't be hit 
       // when charArray.length is larger than k+1 but shorter than k+2. Please note the charArray.length may not be exactly 
       // number of times of (numSelection+1) as userArray is included  
       var k = this.charIndex / this.numSelection; 
       // Fireinput.log.debug(this,"next, this.charIndex: " + this.charIndex + ", this.charArray.length: "+ this.charArray.length);
       if(k*(this.numSelection+1) <= this.charArray.length && (k+2)*(this.numSelection+1) >= this.charArray.length)
       { 
           this.findNext(); 
       }
       else if(k*(this.numSelection+1) >= this.charArray.length)
       {
           // it might be too late to schedule a search in asynchronous way. Do it immediately 
           this.findNextAsync(this.charArray); 
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

    findNext: function()
    {
      // Fireinput.log.debug(this,"find next, this.charArray.length: "+ this.charArray.length);
       if(this.isEnd())
       {
          // there are not enough left to be searched 
          // Fireinput.log.debug(this,"find next, reach end");
          return; 
       }

       if(this.asyncFindTimer)
          clearTimeout(this.asyncFindTimer);

       var self = this;
       // use a reference to original charArray to make sure the original array is available 
       // for insertion. It's okay to discard it later. 
       this.asyncFindTimer = setTimeout(function(){ self.findNextAsync(self.charArray); }, 100);

    }, 
  
    findNextAsync: function(charArray)
    {
       // if a new finding is in the way, don't find next 
       if(!this.currLookupEnv)
          return; 

       var nextCharArray = null; 
       if(this.currLookupEnv.table == Fireinput.PINYIN_WORD_LOOKUP)
       {
          nextCharArray = this.codeLookup(this.currLookupEnv.keyArray, this.currLookupEnv.keyMatch, charArray.length); 
       }
       else
       {
          for(var i=0; i<this.currLookupEnv.keyArray.length; i++)
          {
               var tmpCharArray = this.codeLookup(this.currLookupEnv.keyArray[i], this.currLookupEnv.keyMatch, charArray.length);
               if(nextCharArray == null)
               {
                   nextCharArray = tmpCharArray;
               }
               else if(nextCharArray != null && tmpCharArray != null)
               {
                   Fireinput.arrayInsert(nextCharArray, nextCharArray.length, tmpCharArray);
                   nextCharArray.sort(this.sortCodeArray);
               }
          }
       }

       if(nextCharArray && charArray)
       {
           Fireinput.arrayInsert(charArray, charArray.length, nextCharArray);
       }
   
       // Fireinput.log.debug(this,"charArray: " + this.getKeyWord(charArray));

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
       return false; 
    },
 
    getKeyType: function(key)
    {
       if(typeof(this.pinyinFinals[key]) != 'undefined')
          return Fireinput.KEY_FINAL; 
       else if (typeof(this.pinyinInitials[key]) != 'undefined') 
          return Fireinput.KEY_INITIAL; 
       else
          return Fireinput.KEY_FULL; 
    }, 

    parseOneKey: function (keyInitial, keyFinal, sFlag)
    {
       var keyInitialLen = keyInitial.length; 

       if(typeof(this.pinyinFinals[keyFinal]) != 'undefined')
       {
         if(typeof(sFlag) != 'undefined' && sFlag)
         {
            // if sFlag is true, these two keys will be recognized as separated keys 
            if(keyInitialLen >0)
               return ({key: keyInitial, type: Fireinput.KEY_INITIAL, pos: keyInitialLen}); 
            else
               return ({key: keyFinal, type: Fireinput.KEY_FINAL, pos: keyFinal.length}); 
         }
         else 
         {
            var pinyinKey = {}; 
            pinyinKey.key = keyInitial + keyFinal; 
            pinyinKey.type = keyInitialLen>0 ? Fireinput.KEY_FULL : Fireinput.KEY_FINAL; 
            pinyinKey.pos = keyInitialLen + keyFinal.length; 
            return pinyinKey; 
         }
       }
       else 
       {
          for(var i=keyFinal.length-1; i>0; i--)
          {          
             var subFinal = keyFinal.substring(0, i); 
             if(typeof(this.pinyinFinals[subFinal]) != 'undefined')
             { 
                var pinyinKey = {}; 
                pinyinKey.key = keyInitial + subFinal; 
                pinyinKey.type = keyInitialLen>0 ? Fireinput.KEY_FULL : Fireinput.KEY_FINAL; 
                pinyinKey.pos = keyInitialLen + i; 
                return pinyinKey; 
             }
          }
       }

       // When we reach here, it means the engine might encounter the unsupported input chars. 
       // let move to next but ignore this keyFinal chars 
       keyInitialLen = keyInitialLen>0 ? keyInitialLen : keyFinal.length; 
       return ({key: keyInitial, type: Fireinput.KEY_INITIAL, pos: keyInitialLen}); 
    },


    parseKeys: function(keyList, sFlag)
    {
       var keys = new Array(); 
       // the space is from updateFrequency. Treat them as single quot
       keyList = keyList.replace(/\s+/g, "'"); 
       // if there are single quot delimiters, process them first 
       if(keyList.search(/\'/) != null)
       {
          var keyListArray = keyList.split("'"); 
          for(var i=0; i<keyListArray.length; i++)
          {
             var retArray = this.parseKeySteps(keyListArray[i], sFlag);
             if(retArray != null) 
                Fireinput.arrayInsert(keys, keys.length, retArray.slice(0, retArray.length)); 
          }

          return keys; 
       }

       return this.parseKeySteps(keyList, sFlag); 
    },

    parseKeySteps: function(keyList, sFlag)
    {
       var keys = new Array(); 
              
       for(var i=0; i< keyList.length;)
       {
          var key1 = keyList.substr(i, 1); 
          var key2 = keyList.substr(i, 2); 

          if(typeof(this.pinyinInitials[key2]) != 'undefined') 
          {
              var finals = keyList.substr(i+2, 4); 
              if(finals.length <= 0)
              {
                 keys.push({key: key2, type: Fireinput.KEY_INITIAL}); 
                 break; 
              }
              var pinyinKey = this.parseOneKey(key2, finals, sFlag); 
              if(pinyinKey.type == Fireinput.KEY_INITIAL)
              {
                 // No finals. Store them each one as Initial 
                 keys.push({key: key2, type: Fireinput.KEY_INITIAL}); 
              } 
              else 
              {
                 // for char as g, n and r, if the followings are finals, 
                 // then g/n should not be part of this key 
                 var lastChar = pinyinKey.key.substr(pinyinKey.key.length-1, 1); 
                 if(pinyinKey.type == Fireinput.KEY_FULL && (lastChar == "n" || lastChar == "g" || lastChar == "r"))
                 {
                    var followingKey = this.parseOneKey("", keyList.substr(i+pinyinKey.pos, 4), sFlag);
                    if(followingKey.type == Fireinput.KEY_FINAL)
                    { 
                       pinyinKey.type = Fireinput.KEY_SWING; 
                    }
                 }

                 keys.push({key: pinyinKey.key, type: pinyinKey.type}); 
              }

              i += pinyinKey.pos; 
          }
          else if(typeof(this.pinyinInitials[key1]) != 'undefined')
          {
              var finals = keyList.substr(i+1, 4);
              if(finals.length <= 0)
              {
                 keys.push({key: key1, type: Fireinput.KEY_INITIAL});
                 break; 
              }
              var pinyinKey = this.parseOneKey(key1, finals, sFlag);
              // for char as g/n/r, if the followings are finals, 
              // then g/n/r might not be part of this key 
              var lastChar = pinyinKey.key.substr(pinyinKey.key.length-1, 1); 
              if(pinyinKey.type == Fireinput.KEY_FULL && (lastChar == "n" || lastChar == "g" || lastChar == "r"))
              {
                 var followingKey = this.parseOneKey("", keyList.substr(i+pinyinKey.pos, 4), sFlag);
                 if(followingKey.type == Fireinput.KEY_FINAL)
                 { 
                    pinyinKey.type = Fireinput.KEY_SWING; 
                 }
              }

              keys.push({key: pinyinKey.key, type: pinyinKey.type});
              i += pinyinKey.pos;
          }
          else 
          {
              var finals = keyList.substr(i, 4);
              if(finals.length <= 0)
              {
                 // we don't know what kind of key it's
                 break;
              }
              var pinyinKey = this.parseOneKey("", finals, sFlag);
              keys.push({key: pinyinKey.key, type: Fireinput.KEY_FINAL});
              i += pinyinKey.pos;
          }
       }
       return keys; 
    },

    getKey: function(keys)
    {
       if(!keys)
          return null; 

       var keySet = new Array(); 
       
       var foundone = -1; 
       for (var i =0; i<keys.length; i++)
       {
          if(foundone !=-1 || keys[i].type != Fireinput.KEY_SWING)
            keySet.push({key: keys[i].key, type: keys[i].type}); 
          else 
          {
            foundone = i; 
            keySet.push({key: keys[i].key, type: Fireinput.KEY_FULL}); 
          }
       }
       
       if(foundone > -1)
       {
          // found one, move the swing key to next chars before return 
          keys[foundone+1].key = keys[foundone].key.substr(keys[foundone].key.length-1, 1) + 
                                 keys[foundone+1].key; 
          keys[foundone+1].type = Fireinput.KEY_FULL; 
          keys[foundone].type = Fireinput.KEY_FULL; 
          keys[foundone].key = keys[foundone].key.substr(0, keys[foundone].key.length-1); 

          return {keys: keys, keyset: keySet}; 
       }

       return {keys: keys, keyset: null}; 
    }, 

    getValidWord: function(keys, currentIndex)
    {
       var wordArray = null; 
       var userArray = new Array(); 
       var wordList = new Array(); 

       // this is phrase, not single char 
       if(!keys || keys.length > 1)
          return null; 

       var key = keys[0].key; 
       var keyType = keys[0].type; 

       // Fireinput.log.debug(this, "key: " + key + ", keyType: " + keyType);
       
       var keyInitial = key.substring(0, 1); 
       var keyInitial2 = key.substring(0, 2);
       if((keyInitial2 == "sh" || keyInitial2 == "zh" || keyInitial2 == "ch") &&
          (key.length <=3))
       {
          keyInitial = keyInitial2;
       }
       else if(key.length >=3)
          keyInitial = key.substring(0, 3);
 
       if(!this.codePinyinHash)
          return null; 

       if(!this.codePinyinHash.hasItem(keyInitial))
          return null; 
 
       var pinyinWordList = this.codePinyinHash.getItem(keyInitial); 
       // Fireinput.log.debug(this,"pinyinWordList: " + Fireinput.util.unicode.getUnicodeString(pinyinWordList));

       var pinyinWordArray = pinyinWordList.split(","); 

       wordArray = new Array(); 
       var oldIndex = 0; 
       for(var i=0; i < pinyinWordArray.length; i++)
       {
          var pinyinWord = null; 
          try {
             pinyinWord = pinyinWordArray[i].split("=>"); 
          } catch(e) { }

          if(!pinyinWord || pinyinWord.length < 2)
             continue; 

         // Fireinput.log.debug(this,"pinyinWord: " + Fireinput.util.unicode.getUnicodeString(pinyinWord)); 
          if(keyType != Fireinput.KEY_INITIAL)
          {
             if(!this.pinyinSchema.compareAMB(key, pinyinWord[0]) && pinyinWord[0] != key)
                continue; 
          }

          var word = ""; 
          try 
          {
             word = pinyinWord[1].match(/[\D\.]+/g)[0];
          }        
          catch(e) {}

         // Fireinput.log.debug(this,"word: " + Fireinput.util.unicode.getUnicodeString(word)); 

          if(word.length <= 0) 
             continue; 

          var encodedWord = Fireinput.encoding.getEncodedString(word, this.encodingMode);

          // make sure the same word won't show up twice 
          if(typeof(wordList[encodedWord]) != 'undefined')
             continue; 

          wordList[encodedWord] = 1; 

          // Fireinput.log.debug(this,"word: " + Fireinput.util.unicode.getUnicodeString(word));
          // Fireinput.log.debug(this,"oldIndex: " + oldIndex +", currentIndex: " + currentIndex);
          oldIndex++; 
          if(oldIndex <= currentIndex)
             continue; 

          if(this.userCodeHash && this.userCodeHash.hasItem(word + ":" + pinyinWord[0]))
          {
             // valid selection 
             var ufreq = this.userCodeHash.getItem(word + ":" + pinyinWord[0]);
             userArray[userArray.length] = {key: pinyinWord[0], word:word+ufreq.freq, encodedWord:encodedWord+ufreq.freq}; 
             continue; 
          }

          // add into wordArray for return 
          var freq = pinyinWord[1].match(/[\d\.]+/g)[0];   
          wordArray[wordArray.length] = {key:pinyinWord[0], word:pinyinWord[1], encodedWord:encodedWord+freq}; 

          // controls how many we will list the available words from big hash 
          if(wordArray.length>= (this.numSelection+1))
             break; 
       }

       // free it 
       wordList = null; 

       // Fireinput.log.debug(this,"wordArray: " + this.getKeyWord(wordArray));
       // Fireinput.log.debug(this,"userArray: " + this.getKeyWord(userArray));
       if(userArray.length <= 0)
       {
          wordArray.sort(this.sortCodeArray); 
          return wordArray; 
       }
       else
       {
          Fireinput.arrayInsert(userArray, userArray.length, wordArray.slice(0, wordArray.length)); 
          userArray.sort(this.sortCodeArray); 

          // Fireinput.log.debug(this,"userArray: " + this.getKeyWord(userArray));
          return userArray; 
       }
    },

    getInitialKeys: function(keys)
    {
       if(!keys) 
          return null;
 

       var initialKeys = ""; 
       var hasInitialKey = false; 

       for (var i =0; i<keys.length; i++)
       {
          Fireinput.log.debug(this,"keys[" + i + "]=" + keys[i].key); 
          if(keys[i].type == Fireinput.KEY_INITIAL)
          {
            hasInitialKey = true; 
            initialKeys += keys[i].key.substring(0,1); 
          }
          else if(keys[i].type == Fireinput.KEY_FINAL)
            initialKeys += keys[i].key;
          else
            initialKeys += keys[i].key.substring(0, 1);
       }

       Fireinput.log.debug(this,"initialKeys: " + initialKeys);

       return {ikey: initialKeys, hasInitial: hasInitialKey}; 
    },

    getValidPhrase: function(keys, keyMatch, currentIndex)
    {
       if(!keys)
          return null;

       var initialKeys = this.getInitialKeys(keys);
       // Fireinput.log.debug(this, "initialKeys=" + initialKeys);
       return this.getValidPhraseWithInitialKey(keys, initialKeys, keyMatch, currentIndex);
    },

    getValidPhraseWithInitialKey: function(keys, initialKeys, keyMatch, currentIndex)
    {
       var phraseList = [];

       // anything other than not exactly match input chars 
       var phraseArray = [];
       // match exactly input chars 
       var exactPhraseArray = []; 
       // user history 
       var userArray = new Array(); 

       // store the hasInitial flag 
       var hasInitialKey = initialKeys.hasInitial; 

       initialKeys = initialKeys.ikey; 

       // ondemand phrase will be preappended 
       var onDemandPhrase = this.searchOnDemandPhrase(initialKeys); 
       Fireinput.log.debug(this,"checking: " + initialKeys);

       // fast lookup for longer chars 
       if(initialKeys.length >=4)
       {
          initialKeys = initialKeys.substring(0, 4);
          // update onDemand if it's null after initialKeys is reduced 
          if(!onDemandPhrase)
               onDemandPhrase =  this.searchOnDemandPhrase(initialKeys); 

          // some user phrases have been re-hashed by 3 init key 
          if(!this.phraseCodeHash.hasItem(initialKeys))
          {

             initialKeys = initialKeys.substring(0,3); 
             /* if ondemand is false, retry with new initial keys */
             if(!onDemandPhrase)
                  onDemandPhrase = this.searchOnDemandPhrase(initialKeys);
          }
       }

       Fireinput.log.debug(this,"checking: " + initialKeys + ", keyMatch: " + keyMatch);

       var stringList = onDemandPhrase; 
       // merge strings from both phrase 
       if(this.phraseCodeHash || onDemandPhrase) {
         if(this.phraseCodeHash.hasItem(initialKeys)) {
            if(stringList)
               stringList += "," + this.phraseCodeHash.getItem(initialKeys);
            else 
               stringList = this.phraseCodeHash.getItem(initialKeys);
         }
       }
 
       // make final check before going forward 
       if(!stringList) 
           return null; 

       //Fireinput.log.debug(this, "currentInex: " + currentIndex);
       Fireinput.log.debug(this,"demandList: " + Fireinput.util.unicode.getUnicodeString(onDemandPhrase));
       // Fireinput.log.debug(this,"stringList: " + Fireinput.util.unicode.getUnicodeString(stringList));
 
       var stringArray = stringList.split(","); 
       //Fireinput.log.debug(this,"stringArray.length: " + stringArray.length);
 
       var oldIndex = 0; 
       for(var i=0; i<stringArray.length; i++)
       {
          var phraseKeyValue = null;
          try {
             phraseKeyValue = stringArray[i].split("=>"); 
          } catch(e) {}

          if(!phraseKeyValue)
             continue; 

          var keyList = phraseKeyValue[0].split(" "); 
          var phrase = ""; 
          try 
          {
             phrase = phraseKeyValue[1].match(/[\D\.]+/g)[0];
          }        
          catch(e) {}

          if(phrase.length <= 0) 
             continue; 


          // The key length should be checked to make sure small keys will be skipped 
          // if keyMatch is true, the key enforcement is installed at for loop 
          // In case of keyList has one entry only, we should skip the check as it might be 
          // from userword table 
          if(keyList.length != 1 && keyList.length < keys.length)
             continue; 

          //Fireinput.log.debug(this,"word: " + Fireinput.util.unicode.getUnicodeString(phrase) + ", keyList.length: " + keyList.length); 

          // assume it's a exact Match with input char. Don't be confused with keyMatch here. 
          // the keyMatch is to make sure a selection has to be matched for inputkey length and key string.
          // It's a enabler thing. The exact matched word will be on front 
          //
          var exactMatch = 1; 

          // assume it should not be selected by default. 
          var shouldAdd = 1; 

          // do strict filtering. If keyList has only one entry, skip it as it must be from userword table 
          for (var j =0; j<keys.length && keyList.length>1; j++)
          {
             if(keys[j].type == Fireinput.KEY_INITIAL)
             {
                if(keyList[j].indexOf(keys[j].key) !=0)
                {
                   shouldAdd = 0; 
                   break; 
                }
                else if(keyList[j] != keys[j].key)
                {
                   exactMatch = 0; 
                }
             } 
             /*
              * if keyMatch is false, the keyList value should be longer 
              * otherwise it should be exactly matched for both FULL and FINAL 
              * key types 
              */
             else if(!this.pinyinSchema.compareAMB(keys[j].key, keyList[j]) && 
                     ((keyMatch && keyList[j] != keys[j].key) || 
                       keyList[j].indexOf(keys[j].key) < 0))
             {
                shouldAdd = 0; 
                break; 
             }
             else if(keyList[j] != keys[j].key)
             {
                exactMatch = 0; 
             }      
          }


          
          if(shouldAdd == 1)
          { 
              // if the keyList has more entries than keys, the exactMatch should be false 
              if(exactMatch && keyList.length > keys.length)
                exactMatch = 0; 

             // exactMatch false position 
             var exactMatchPos = keys.length; 

             Fireinput.log.debug(this,"word: " + Fireinput.util.unicode.getUnicodeString(phrase) + ", exactMatch: " + exactMatch);
             Fireinput.log.debug(this,"exactMatchPos: " + exactMatchPos);
             var encodedWord = Fireinput.encoding.getEncodedString(phrase, this.encodingMode);

             // What we are trying to achieve here is that when exactMatch is false, we only copy the first few matched words 
             // into the list, and add the exact phrase after it
             // The rule should be subjected to be same as exact phrase  
             if(!exactMatch && exactMatchPos >= 2)
             {
                var matchedWord = encodedWord.substring(0, exactMatchPos); 
                Fireinput.log.debug(this,"word: " + matchedWord);
                if(typeof(phraseList[matchedWord]) == 'undefined')
                {
                   var matchedPhrase = Fireinput.util.unicode.convertFromUnicode(Fireinput.util.unicode.getUnicodeString(phrase).substring(0, exactMatchPos));
                   var matchedphraseKey = keyList.splice(0, exactMatchPos).join(" "); 
                   Fireinput.log.debug(this,"phraseKey: " + phraseKeyValue[0] + ", matched: " + matchedphraseKey);
                   phraseList[matchedWord] = ""; 

                   oldIndex++; 
                   if(oldIndex <= currentIndex)
                      continue; 

                   var freq = phraseKeyValue[1].match(/[\d\.]+/g)[0];   

                   var inUserHash = this.userCodeHash && this.userCodeHash.hasItem(matchedPhrase + ":" + matchedphraseKey); 
                   if(inUserHash)
                   {
                      var ufreq = this.userCodeHash.getItem(matchedPhrase + ":" + matchedphraseKey);
                      userArray[userArray.length] = {key: matchedphraseKey, word:matchedPhrase+ufreq.freq, encodedWord:matchedWord+ufreq.freq}; 
                   }
                   else 
                      phraseArray[phraseArray.length] = {key: matchedphraseKey, word:matchedPhrase+freq, encodedWord:matchedWord+freq};

                   // if hasInitialKey is true, mostly like there will no exactMatch at all, so we need to check non-exact phraseArray and userArray 
                   // whether there are enough items to return 
                   if(hasInitialKey && (phraseArray.length + userArray.length) >= (this.numSelection+1)) 
                      break; 
                }
             }

             if(typeof(phraseList[encodedWord]) == 'undefined')
             {

                phraseList[encodedWord] = ""; 

                oldIndex++; 
                if(oldIndex <= currentIndex)
                   continue; 

                var freq = phraseKeyValue[1].match(/[\d\.]+/g)[0];   

                var inUserHash = this.userCodeHash && this.userCodeHash.hasItem(phrase + ":" + phraseKeyValue[0]); 
                if(inUserHash)
                {
                   var ufreq = this.userCodeHash.getItem(phrase + ":" + phraseKeyValue[0]);
                   // for exact match words, we need to put in a separate array, so later we can add pre-append them 
                   if(exactMatch)
                      exactPhraseArray[exactPhraseArray.length] = {key: phraseKeyValue[0], word:phrase+ufreq.freq, encodedWord:encodedWord+ufreq.freq}; 
                   else 
                      userArray[userArray.length] = {key: phraseKeyValue[0], word:phrase+ufreq.freq, encodedWord:encodedWord+ufreq.freq}; 

                     
                }
                else 
                {
                   // for exact match words, we need to put in a separate array, so later we can add pre-append them 
                   if(exactMatch)
                      exactPhraseArray[exactPhraseArray.length] = {key: phraseKeyValue[0], word:phraseKeyValue[1], encodedWord:encodedWord+freq};
                   else 
                      phraseArray[phraseArray.length] = {key: phraseKeyValue[0], word:phraseKeyValue[1], encodedWord:encodedWord+freq};

                }

                // if hasInitialKey is true, mostly like there will no exactMatch at all, so we need to check non-exact phraseArray and userArray 
                // whether there are enough items to return 
                if(hasInitialKey && (phraseArray.length + userArray.length) >= (this.numSelection+1)) 
                   break; 
                else if(exactPhraseArray.length >= (this.numSelection+1))
                   break; 
             }
          }
       }                    

       //Fireinput.log.debug(this,"exactPhraseArray.length: " + exactPhraseArray.length);
       //Fireinput.log.debug(this,"phraseArray.length: " + phraseArray.length);
       //Fireinput.log.debug(this,"userArray.length: " + userArray.length);
       //Fireinput.log.debug(this,"userArray: " + this.getKeyWord(userArray));
       Fireinput.log.debug(this,"phraseArray: " + this.getKeyWord(phraseArray));
       //FIXME: how to sort it 
       //Fireinput.log.debug(this,"exactPhraseArray: " + this.getKeyWord(exactPhraseArray));
       if(userArray.length <= 0)
       {
          phraseArray.sort(this.sortCodeArray);
          if(exactPhraseArray.length > 0)
             Fireinput.arrayInsert(exactPhraseArray, exactPhraseArray.length, phraseArray.slice(0, phraseArray.length)); 
       }
       else 
       {
          Fireinput.arrayInsert(userArray, userArray.length, phraseArray.slice(0, phraseArray.length)); 
          userArray.sort(this.sortCodeArray); 
          if(exactPhraseArray.length > 0)
             Fireinput.arrayInsert(exactPhraseArray, exactPhraseArray.length, userArray.slice(0, userArray.length)); 
       }

       return exactPhraseArray.length >0 ? exactPhraseArray : 
              (userArray.length >0 ? userArray : phraseArray); 
    },
   
    flushUserTable: function()
    {
       if(this.userCodeHash && this.userTableChanged)
       {
          Fireinput.phraseSaver.saveUserData(this.userCodeHash);
       }
    },
 
    getPhraseInitKey: function(keys)
    {
       var validInitialKey = ""; 

       // remove any num tone from word adding 
       var keyArray = this.parseKeys(keys.replace(/\d+/g, ''));
       for(var i=0; i<keyArray.length; i++)
       {
          if(keyArray[i].type == Fireinput.KEY_FINAL)
             validInitialKey += keyArray[i].key;
          else
             validInitialKey += keyArray[i].key.substring(0,1);
       }

       // limit the short key less than 4 keys if it's not from user(user input key shouldn't have spaces 
       if(/ /.test(keys) && validInitialKey.length >= 4) 
       {
          // put user phrase into 4 keys if 3 keys is already defined 
          // force initialKey as 4 minimum if keys is too long 
          if(keyArray.length <= 8)
          {
             var subValidInitialKey = validInitialKey.substring(0, 3); 
             if(this.phraseCodeHash.hasItem(subValidInitialKey))
               validInitialKey = subValidInitialKey;
          }
          else 
             validInitialKey = validInitialKey.substring(0, 4);
       }

       return validInitialKey; 
    }, 

    updateFrequency: function(word, key, initKey, newPhrase, keepFreq)
    {
       var freq = word.match(/[\d\.]+/g); 
       if(freq)
          freq = freq[0];
       else 
          freq = 0; 

       Fireinput.log.debug(this,"word: " + word);
       var chars = word.match(/[\D\.]+/g)[0];
       Fireinput.log.debug(this,"chars: " + chars);
       if(!this.userCodeHash)
          this.userCodeHash = new Fireinput.util.hash();
 
       if(typeof(newPhrase) == "undefined")
          newPhrase = false; 

       var newfreq = 0; 
       if(this.userCodeHash.hasItem(chars + ":" + key))
       {
          var charopt = this.userCodeHash.getItem(chars + ":" + key); 
          var freq1 = charopt.freq; 
          newfreq = parseInt("0xFFFFFFFF", 16) - freq1; 

          if(typeof(charopt.newPhrase) != 'undefined')
             newPhrase = charopt.newPhrase; 

          if(typeof(initKey) == "undefined")
              initKey = charopt.initKey; 
       }
       else
       {
          newfreq = parseInt("0xFFFFFFFF", 16) - freq; 
          if(typeof(initKey) == "undefined")
          {
              initKey = "";
              var keys = this.parseKeys(key); 
              for(var i=0; i<keys.length; i++)
              {
                 if(keys[i].type == Fireinput.KEY_FINAL)
                    initKey += keys[i].key; 
                 else 
                    initKey += keys[i].key.substring(0,1); 
              }

              // a single char or phrase 
              if(/ /.test(key))
              {
                 if(initKey.length >= 4)   
                    initKey = initKey.substring(0, 4); 
              }
              else 
              {
                 // a single char
                 var keyInitial2 = key.substring(0, 2);
                 if((keyInitial2 == "sh" || keyInitial2 == "zh" || keyInitial2 == "ch") &&
                    (key.length <=3))
                 { 
                    initKey = keyInitial2; 
                 }
                 else if(initKey.length >= 3)   
                    initKey = initKey.substring(0, 3);
              } 
          }
       }

       // updateTable don't need to change freq 
       if(!keepFreq)
       {
          if(newfreq)
          newfreq /= Math.pow(2, 16); 
          if(newfreq < 1) newfreq = 1; 
       
          freq = Math.round(newfreq) + parseInt(freq); 
       } 

       if(newPhrase)
          this.userCodeHash.setItem(chars+":"+key, {freq: freq, initKey: initKey, schema: this.pinyinSchema.getSchema(), newPhrase: newPhrase});
       else 
          this.userCodeHash.setItem(chars+":"+key, {freq: freq, initKey: initKey, schema: this.pinyinSchema.getSchema()});

       // update phrase hash or code hash. Always to add it at the beginning 
       // ignore if it's new Phrase since it's always handled by storeUserPhrase 
       if(!newPhrase)
       {
          this.updateUserCodeValue(key, initKey, chars, freq);
       }

       //Fireinput.log.debug(this,"word: " + word);
       //Fireinput.log.debug(this,"chars: " + chars + ", freq: " + freq);
       Fireinput.log.debug(this,"chars: " + chars + ", key: " + key + ", initKey: " + initKey);
       this.userTableChanged = true; 
       return freq; 
    },

    updatePhraseTable: function(phrase, keys, freq, validInitialKey, updateKey)
    {
       Fireinput.log.debug(this, "updatePhraseTable: " + phrase + ", freq: " + freq); 
       if(!this.phraseCodeHash)
          return; 

       if(this.phraseCodeHash.hasItem(validInitialKey))
       {
          // the new phrase is already in phrase table, don't add it in
          var nowPhrase = this.phraseCodeHash.getItem(validInitialKey); 
          var regex = new RegExp(phrase + "\\d+", "g"); 
          var matched = nowPhrase.match(regex);
          if(matched)
          {
             // don't update the key. It's possible the key is generated from importing, thus it may not be accurate 
             if(updateKey)
             {
                nowPhrase = nowPhrase.replace(",\\D+" + "=>" + matched, "");  
                this.phraseCodeHash.setItem(validInitialKey, keys + "=>" + phrase+freq + "," + nowPhrase); 
             }
          }
          else 
             this.phraseCodeHash.setItem(validInitialKey, keys + "=>" + phrase+freq + "," + nowPhrase); 
       }
       else 
          this.phraseCodeHash.setItem(validInitialKey, keys + "=>" + phrase+freq); 
          
    },

    storeUserPhrase: function(userPhrase)
    {
       if(!userPhrase || userPhrase.length <= 0)
          return; 

       // Fireinput.log.debug(this,"userPhrase: " + this.getKeyWord(userPhrase));
       var validInitialKey = "";
       var phrase = ""; 
       var keys = ""; 
       for(var i=0; i<userPhrase.length; i++)
       {
          var word = userPhrase[i].word.match(/[\D\.]+/g)[0];
          phrase += word; 
          keys += userPhrase[i].key; 

          if(i < (userPhrase.length - 1))
             keys += " "; 
       }
      
       this.storeUserAddPhrase(phrase, keys);
    }, 

    storeUserAddPhrase: function(phrase, keys, freq, initialKey, newPhrase)
    { 
       if(!initialKey)
          initialKey = this.getPhraseInitKey(keys); 

       if(!freq)
          freq = 0; 

       // Fireinput.log.debug(this,"keys: " + keys + ", phrase: " + phrase);
       if(!this.userCodeHash)
          this.userCodeHash = new Fireinput.util.hash();

       if(this.userCodeHash.hasItem(phrase + ":" + keys))
          return; 

       freq = this.updateFrequency(phrase+freq, keys, initialKey, (typeof(newPhrase) != 'undefined' ? newPhrase : true)); 
       // Fireinput.log.debug(this,"freq: " + freq);
       Fireinput.log.debug(this, "phrase: " + phrase + ", freq: " + freq); 

       this.updatePhraseTable(phrase, keys, freq, initialKey, true); 
    }, 

    storeOneUpdatePhraseWithFreq: function(phrase, keys, freq, initialKey)
    {
       if(!initialKey)
          initialKey = this.getPhraseInitKey(keys);

       Fireinput.log.debug(this, "phrase: " + phrase + ", initialKey: " + initialKey);

       if(!this.userCodeHash)
          this.userCodeHash = new Fireinput.util.hash();

       // if the usercode hash has this item, just return. The freq update is from being used  
       if(this.userCodeHash.hasItem(phrase + ":" + keys))
          return;

       Fireinput.log.debug(this, "phrase: " + phrase + ", freq: " + freq);
       this.updatePhraseTable(phrase, keys, freq, initialKey, false);
    },

    searchOnDemandPhrase: function(initialKeys) 
    {
      if(this.onDemandPhraseCodeHash && this.onDemandPhraseCodeHash.hasItem(this.tabIndex)) {
          var phraseHash = this.onDemandPhraseCodeHash.getItem(this.tabIndex);
          var nowPhrase = phraseHash.getItem(initialKeys);
          return nowPhrase;
      }
      return null; 
    }, 

    storeOnDemandPhrase: function(phrase, keys, freq, initialKey, signature)
    {
       if(!initialKey)
          initialKey = this.getPhraseInitKey(keys);

       // Fireinput.log.debug(this, "signature: " + signature + ", phrase: " + Fireinput.util.unicode.getUnicodeString(phrase) + ", initialKey: " + initialKey);

       if(!this.userCodeHash)
          this.userCodeHash = new Fireinput.util.hash();


       if(this.userCodeHash.hasItem(phrase + ":" + keys))
          return;

       if(this.phraseCodeHash && this.phraseCodeHash.hasItem(initialKey))
       {
          // the new phrase is already in phrase table, don't add it in
          var nowPhrase = this.phraseCodeHash.getItem(initialKey);
          var regex = new RegExp(phrase + "\\d+", "g");
          var matched = nowPhrase.match(regex);
          if(matched)
             return; 
       }

       // move on to ondemand phrase hash 
       if(!this.onDemandPhraseCodeHash)
          this.onDemandPhraseCodeHash = new Fireinput.util.hash();

       // check the ondemand phrase hash to see if the phrase is already in 
       if(this.onDemandPhraseCodeHash.hasItem(signature)) {
          
          // the signature is also pointing to a hash 
          var phraseHash = this.onDemandPhraseCodeHash.getItem(signature); 
          var nowPhrase = phraseHash.getItem(initialKey);
          if(!nowPhrase) {
            phraseHash.setItem(initialKey, keys + "=>" + phrase+freq);
            return; 
          }

          // Fireinput.log.debug(this, "nowPhrase: " + Fireinput.util.unicode.getUnicodeString(nowPhrase) + ", initialKey: " + initialKey);
          var regex = new RegExp(phrase + "\\d+", "g");
          var matched = nowPhrase.match(regex);
          if(matched)
             return;
          else 
             phraseHash.setItem(initialKey, keys + "=>" + phrase+freq + "," + nowPhrase); 
       }
       else {
          var phraseHash = new Fireinput.util.hash(); 
          phraseHash.setItem(initialKey, keys + "=>" + phrase+freq);
          this.onDemandPhraseCodeHash.setItem(signature, phraseHash); 
       }

    },

    removeOnDemandPhrase: function(signature)
    {
       if(!this.onDemandPhraseCodeHash)
          return; 

       if(this.onDemandPhraseCodeHash.hasItem(signature))
          this.onDemandPhraseCodeHash.setItem(signature, null); 
    },

    getWordPinyin: function(word)
    {
       if(!this.codePinyinHash)
         return null; 

       return this.codePinyinHash.getItem(word);
    }

});


