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

var SmartPinyin = function()  {}; 

SmartPinyin.prototype =  extend(new FireinputIME(), 
{
    // 0 to disable debug or non zero to enable debug 
    debug: 0, 

    // the name of IME 
    name: IME_SMART_PINYIN, 

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

    // the hash table for user frequency 
    userCodeHash: null, 

    // use code hash table event 
    userTableChanged: false,

    // full/half letter converter 
    letterConverter: null, 

    // pinyin Schema 
    pinyinSchema: null, 

    // encoding mode. Either simplified or big5. Simplified default. 
    encodingMode: ENCODING_ZH, 

    // engine enabled 
    engineDisabled: false, 

    // async timer 
    asyncFindTimer: null, 

    // current lookup env variables, used for asynchronous finding 
    currLookupEnv: null, 

    // the entrance function to load all related tables 
    loadTable: function()
    {
       letterConverter = new FullLetterConverter(); 

       for(var i=0; i<PinyinInitials.length; i++)
         this.pinyinInitials[PinyinInitials[i]] = PinyinInitials[i]; 

       for(var i=0; i<PinyinFinals.length; i++)
         this.pinyinFinals[PinyinFinals[i]] = PinyinFinals[i]; 

       // setTimeout to not block firefox start
       var self = this; 
       setTimeout(function() { return self.loadPinyinTable(); }, 500); 

       // init encoding table 
       FireinputEncoding.init(); 
    },

    getCodeLine: function(str)
    {
       var strArray = str.split(':');
       if(strArray.length < 2)
          return;

       // initKey:key=>word 
       this.codePinyinHash.setItem(strArray[0],strArray[1]);
    },

    loadPinyinTable: function()
    {
       var ios = IOService.getService(Components.interfaces.nsIIOService);
       var fileHandler = ios.getProtocolHandler("file")
                         .QueryInterface(Components.interfaces.nsIFileProtocolHandler);

       var path = this.getDataPath(); 
       var datafile = fileHandler.getFileFromURLSpec(path + this.getPinyinDataFile()); 
       if(!datafile.exists())
       {
           this.engineDisabled = true; 
           return; 
       }

       this.codePinyinHash = new FireinputHash();

       var options = {
          caller: this, 
          oncomplete: this.loadPinyinPhrase, 
          onavailable: this.getCodeLine
       }; 

       FireinputStream.loadDataAsync(datafile, options);
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
       var ios = IOService.getService(Components.interfaces.nsIIOService);
       var fileHandler = ios.getProtocolHandler("file")
                         .QueryInterface(Components.interfaces.nsIFileProtocolHandler);

       var path = this.getDataPath();

       var datafile = fileHandler.getFileFromURLSpec(path + this.getPinyinPhraseFile());

       this.phraseCodeHash = new FireinputHash(); 

       if(!datafile.exists())
          return; 

       var options = {
          caller: this, 
          onavailable: this.getPhraseLine,
          oncomplete: this.loadUserTable 
       }; 

       FireinputStream.loadDataAsync(datafile, options);
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
          var regex = new RegExp(word + "\\d+", "g"); 
          var oldWordFreq = phrase.match(regex);
          if(oldWordFreq)
          { 
             phrase = phrase.replace(key + "=>" + oldWordFreq, "");
          }

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

       var word = strArray[0]; 
       var freq = strArray[1]; 
       var key = strArray[2].replace(/^\s+|\s+$/g, ''); 
       var initKey = strArray[3].replace(/^\s+|\s+$/g, ''); 
       var newPhrase = false; 
       if(strArray.length > 4 && strArray[4] == "1")
           newPhrase = true; 

       //FIXME: We want to update the codeHash and phraseHash instead of keep it in user hash 
       if(newPhrase)
       {
          this.userCodeHash.setItem(word, {freq: freq, key: key, initKey: initKey, newPhrase: newPhrase});
       }
       else  
          this.userCodeHash.setItem(word, {freq: freq, key: key, initKey: initKey});


       this.updateUserCodeValue(key, initKey, word, freq);
    },

    loadUserTable: function()
    {
       var ios = IOService.getService(Components.interfaces.nsIIOService);
       var fileHandler = ios.getProtocolHandler("file")
                         .QueryInterface(Components.interfaces.nsIFileProtocolHandler);

       var path = FireinputUtils.getAppRootPath();
       var datafile = fileHandler.getFileFromURLSpec(path + this.getUserDataFile());
       if(!datafile.exists())
          return; 
       this.userCodeHash = new FireinputHash();

       var options = {
          caller: this, 
          onavailable: this.getUserCodeLine
       }; 
       FireinputStream.loadDataAsync(datafile, options); 
    },

    isEnabled: function()
    {
       if(this.engineDisabled)
          return false; 
       var ios = IOService.getService(Components.interfaces.nsIIOService);
       var fileHandler = ios.getProtocolHandler("file")
                         .QueryInterface(Components.interfaces.nsIFileProtocolHandler);

       var path = this.getDataPath();
       var datafile = fileHandler.getFileFromURLSpec(path + this.getPinyinDataFile());
       if(!datafile.exists())
          return false; 

       return true; 
    }, 

    isSchemaEnabled: function()
    {
       if(this.engineDisabled)
          return false;

       return this.isEnabled(); 
    },

    canComposeNew: function()
    {
       return true; 
    }, 

    setSchema: function(schema)
    {
       if(!this.pinyinSchema)
          this.pinyinSchema = new PinyinSchema(); 

       if(!this.pinyinSchema)
          return; 

       //FireinputLog.debug(this, "Set schema: " + schema);
       this.pinyinSchema.setSchema(schema); 
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
          return letterConverter.toFullLetter(String.fromCharCode(code)); 

       return String.fromCharCode(code); 
    }, 

    find: function(inputChar)
    {
       var result = null;
       FireinputLog.debug(this, "inputChar: " + inputChar); 
       // use current schema 
       result = this.findBySchema(inputChar);
       if(!result)
       {
          // use default schema: pinyin 
          result = this.findBySchema(inputChar, true); 
       }

       return result; 
    }, 

    findBySchema: function(inputChar, useDefaultSchema)
    {
       var s = inputChar; 
       var retArray = null;

       var keyMatch = false; 
       // here we will do searching on inputChar by length -1 every time if retArray is null 
       // FireinputLog.debug(this, "Send original key=" + inputChar);
       while(s.length > 0)
       {
          var result=this.searchAll(s, useDefaultSchema, keyMatch); 
          if(!result)
             break; 
          if(result.charArray)
          {
             retArray = result.charArray; 
             break; 
          }

          /*
           * The exact match wasn't found, so the second loop needs to make the exact match 
           */
          keyMatch = true; 
          result.keySize = result.keySize >0 ? result.keySize : 1;  
          s = s.substr(0, s.length - result.keySize); 
          // FireinputLog.debug(this, "Send key after reduced=" + s);

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

    searchAll: function(inputChar, useDefaultSchema, keyMatch)
    {
       this.charArray = null; 
       this.currLookupEnv = null; 
       this.charIndex = 0; 

       var keySet = null; 
       var keyArray = this.pinyinSchema.getComposeKey(inputChar, useDefaultSchema); 

       FireinputLog.debug(this, "keyArray=" + keyArray);
       if(typeof(keyArray) == "string")
       {
          keySet = this.parseKeys(inputChar); 
          this.charArray = this.codeLookup(keySet, keyMatch); 
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
             this.currLookupEnv = {table: PINYIN_WORD_LOOKUP, keyArray: keySet, keyMatch: keyMatch}; 
             this.findNext(); 
             return {charArray: this.charArray.slice(0,9), keySize: 0};

          }
          else if(keySet && keySet.length > 0)
          {
             /* If the last input is FINAL, there might be more input coming, return null to wait
              * if the keymatch is set, take the input as completed pinyin  
              */
             if(keySet[keySet.length-1].type == KEY_FINAL && !keyMatch)
                return null; 
             else 
                return {charArray: null, keySize: keySet[keySet.length-1].key.length};
          }
          else
             return {charArray: null, keySize: 1}; 
       }
       else if(keyArray != null)
       {
/*
           for(var i=0; i<keyArray.length; i++)
           {
               for (var j=0; j<keyArray[i].length; j++)
               {       
                   FireinputLog.debug(this, "keyArray[i][j].type=" + keyArray[i][j].type);
                   FireinputLog.debug(this, "keyArray[i][j].key=" + keyArray[i][j].key);
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
                   arrayInsert(this.charArray, this.charArray.length, charArray); 
                   this.charArray.sort(this.sortCodeArray); 
               }

           }


           if(!this.charArray)
             return {charArray: null, keySize: 1};

           // the first set of word phrase is ready. We issue an asynchronous to get next list of values 
           this.currLookupEnv = {table: PINYIN_PHRASE_LOOKUP, keyArray: keyArray, keyMatch: keyMatch}; 
           this.findNext(); 

           return {charArray: this.charArray.slice(0,9), keySize: 1}; 
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

       // FireinputLog.debug(this, "keys.length=" + keys.length);
       // a valid charArray consist of {key:key, word: word}
       if(keys.length <= 1)
       { 
          charArray = this.getValidWord(keys, currIndex);
       }
       // check different mode 
       else if(keys[0].key == 'i')
       {
          // we are in special char imode 
          charArray = FireinputSpecialChar.getIMode(this.getInitialKeys(keys)); 
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
                arrayInsert(charArray, charArray.length, tmpCharArray); 
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

       FireinputLog.debug(this,"this.charIndex: " + this.charIndex);
       FireinputLog.debug(this,"this.charArray: " + this.charArray.length);
       // if the next 9 are already displayed, return null
       if((this.charIndex+9) >= this.charArray.length)
          return null; 

       var i = this.charIndex; 
       if(!endFlag)
           this.charIndex += 9; 
       else 
       {
           i = this.charArray.length-9; 
           i -= 9; 
           this.charIndex = i>0 ? i:0; 
       }
       // preloading the next set of value 
       if((this.charIndex+10) <= this.charArray.length)
       { 
           this.findNext(); 
       }
       else
       {
           // it might be too late to schedule a search in asynchronous way. Do it immediately 
           this.findNextAsync(this.charArray); 
       }

       // FireinputLog.debug(this,"this.charIndex: " + this.charIndex);
       return {charArray:this.charArray.slice(this.charIndex, this.charIndex+9), validInputKey: this.validInputKey}; 
    }, 

    prev: function (homeFlag)
    {
       if(!this.charArray)
          return null; 
       // FireinputLog.debug(this,"this.charIndex: " + this.charIndex);
       // if the previous 9 are already displayed, return null
       if((this.charIndex-9) < 0)
          return null; 

       if(!homeFlag)
          this.charIndex -= 9; 
       else
          this.charIndex = 0; 
       
       // FireinputLog.debug(this,"this.charIndex: " + this.charIndex);
       return {charArray: this.charArray.slice(this.charIndex, this.charIndex+9), validInputKey: this.validInputKey};
    }, 

    findNext: function()
    {
       FireinputLog.debug(this,"find next, this.charArray.length: "+ this.charArray.length);
       if(this.isEnd())
       {
          // there are not enough left to be searched 
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
       if(this.currLookupEnv.table == PINYIN_WORD_LOOKUP)
       {
          nextCharArray = this.codeLookup(this.currLookupEnv.keyArray, this.currLookupEnv.keyMatch, charArray.length); 
       }
       else
       {
          for(var i=0; i<this.currLookupEnv.keyArray.length; i++)
          {
               var tmpCharArray = this.codeLookup(keyArray[i], keyMatch, charArray.length);
               if(nextCharArray == null)
               {
                   nextCharArray = tmpCharArray;
               }
               else if(nextCharArray != null && tmpCharArray != null)
               {
                   arrayInsert(nextCharArray, nextCharArray.length, tmpCharArray);
                   nextCharArray.sort(this.sortCodeArray);
               }
          }
       }

       if(nextCharArray && charArray)
       {
           arrayInsert(charArray, charArray.length, nextCharArray);
       }
   
       FireinputLog.debug(this,"charArray: " + this.getKeyWord(charArray));

    }, 

    isBeginning: function()
    {
       return this.charIndex == 0; 
    },

    isEnd: function()
    {
       return (this.charIndex+9) >= this.charArray.length; 
    }, 

    canAutoInsert: function()
    {
       return false; 
    },
 
    getKeyType: function(key)
    {
       if(typeof(this.pinyinFinals[key]) != 'undefined')
          return KEY_FINAL; 
       else if (typeof(this.pinyinInitials[key]) != 'undefined') 
          return KEY_INITIAL; 
       else
          return KEY_FULL; 
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
               return ({key: keyInitial, type: KEY_INITIAL, pos: keyInitialLen}); 
            else
               return ({key: keyFinal, type: KEY_FINAL, pos: keyFinal.length}); 
         }
         else 
         {
            var pinyinKey = {}; 
            pinyinKey.key = keyInitial + keyFinal; 
            pinyinKey.type = keyInitialLen>0 ? KEY_FULL : KEY_FINAL; 
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
                pinyinKey.type = keyInitialLen>0 ? KEY_FULL : KEY_FINAL; 
                pinyinKey.pos = keyInitialLen + i; 
                return pinyinKey; 
             }
          }
       }

       return ({key: keyInitial, type: KEY_INITIAL, pos: keyInitialLen}); 
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
                arrayInsert(keys, keys.length, retArray.slice(0, retArray.length)); 
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
                    keys.push({key: key2, type: KEY_INITIAL}); 
                   
                 break; 
              }
              var pinyinKey = this.parseOneKey(key2, finals, sFlag); 
              if(pinyinKey.type == KEY_INITIAL)
              {
                 // No finals. Store them each one as Initial 
                    keys.push({key: key2, type: KEY_INITIAL}); 
              } 
              else 
              {
                 // for char as g and n, if the followings are finals, 
                 // then g/n should not be part of this key 
                 var lastChar = pinyinKey.key.substr(pinyinKey.key.length-1, 1); 
                 if(pinyinKey.type == KEY_FULL && (lastChar == "n" || lastChar == "g"))
                 {
                    var followingKey = this.parseOneKey("", keyList.substr(i+pinyinKey.pos, 4), sFlag);
                    if(followingKey.type == KEY_FINAL)
                    { 
                       pinyinKey.type = KEY_SWING; 
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
                 keys.push({key: key1, type: KEY_INITIAL});
                 break; 
              }
              var pinyinKey = this.parseOneKey(key1, finals, sFlag);
              // for char as g and n, if the followings are finals, 
              // then g/n should not be part of this key 
              var lastChar = pinyinKey.key.substr(pinyinKey.key.length-1, 1); 
              if(pinyinKey.type == KEY_FULL && (lastChar == "n" || lastChar == "g"))
              {
                    var followingKey = this.parseOneKey("", keyList.substr(i+pinyinKey.pos, 4), sFlag);
                    if(followingKey.type == KEY_FINAL)
                    { 
                       pinyinKey.type = KEY_SWING; 
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
              keys.push({key: pinyinKey.key, type: KEY_FINAL});
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
          if(foundone !=-1 || keys[i].type != KEY_SWING)
            keySet.push({key: keys[i].key, type: keys[i].type}); 
          else 
          {
            foundone = i; 
            keySet.push({key: keys[i].key, type: KEY_FULL}); 
          }
       }
       
       if(foundone > -1)
       {
          // found one, move the swing key to next chars before return 
          keys[foundone+1].key = keys[foundone].key.substr(keys[foundone].key.length-1, 1) + 
                                 keys[foundone+1].key; 
          keys[foundone+1].type = KEY_FULL; 
          keys[foundone].type = KEY_FULL; 
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

       // FireinputLog.debug(this, "key: " + key + ", keyType: " + keyType);
       
       var keyInitial = key.substring(0, 1); 
       var keyInitial2 = key.substring(0, 2);
       if((keyInitial2 == "sh" || keyInitial2 == "zh" || keyInitial2 == "ch") &&
          (key.length <=3))
       {
          keyInitial = keyInitial2;
       }
       else if(key.length >=3)
          keyInitial = key.substring(0, 3);
 
       if(!this.codePinyinHash.hasItem(keyInitial))
          return null; 
 
       var pinyinWordList = this.codePinyinHash.getItem(keyInitial); 
       //FireinputLog.debug(this,"pinyinWordList: " + FireinputUnicode.getUnicodeString(pinyinWordList));

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

          if(keyType != KEY_INITIAL)
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


          if(word.length <= 0) 
             continue; 

          // make sure the same word won't show up twice 
          if(typeof(wordList[word]) != 'undefined')
             continue; 

          wordList[word] = 1; 

         //FireinputLog.debug(this,"word: " + FireinputUnicode.getUnicodeString(word));
         // FireinputLog.debug(this,"oldIndex: " + oldIndex +", currentIndex: " + currentIndex);
          oldIndex++; 
          if(oldIndex <= currentIndex)
             continue; 

          var encodedWord = FireinputEncoding.getEncodedString(word, this.encodingMode);

          if(this.userCodeHash && this.userCodeHash.hasItem(word))
          {
             var ufreq = this.userCodeHash.getItem(word);
             /* use this way other than push to have better performance 
              * http://aymanh.com/9-javascript-tips-you-may-not-know
              */
             userArray[userArray.length] = {key: pinyinWord[0], word:word+ufreq.freq, encodedWord:encodedWord+ufreq.freq}; 
          }
          else 
          {
             // controls how many we will list the available words from big hash 
             // The reason the userArray is ignored is that the userCodeHash is very small 
             // comparing to system table. 
             var freq = pinyinWord[1].match(/[\d\.]+/g)[0];   
             wordArray[wordArray.length] = {key:pinyinWord[0], word:pinyinWord[1], encodedWord:encodedWord+freq}; 

             if(wordArray.length>= 10)
                break; 
          }
       }

       // free it 
       wordList = null; 

       //FireinputLog.debug(this,"wordArray: " + this.getKeyWord(wordArray));
       //FireinputLog.debug(this,"userArray: " + this.getKeyWord(userArray));
       if(userArray.length <= 0)
       {
          wordArray.sort(this.sortCodeArray); 
          return wordArray; 
       }
       else
       {
          arrayInsert(userArray, userArray.length, wordArray.slice(0, wordArray.length)); 
          userArray.sort(this.sortCodeArray); 

          //FireinputLog.debug(this,"userArray: " + this.getKeyWord(userArray));
          return userArray; 
       }
    },

    getInitialKeys: function(keys)
    {
       if(!keys) 
          return null;
 

       var initialKeys = ""; 
       
       for (var i =0; i<keys.length; i++)
       {
          if(keys[i].type == KEY_INITIAL)
            initialKeys += keys[i].key.substring(0,1); 
          else if(keys[i].type == KEY_FINAL)
            initialKeys += keys[i].key;
          else
            initialKeys += keys[i].key.substring(0, 1);
       }

       //FireinputLog.debug(this,"initialKeys: " + initialKeys);

       return initialKeys;
    },

    getValidPhrase: function(keys, keyMatch, currentIndex)
    {
       if(!keys)
          return null;

       var initialKeys = this.getInitialKeys(keys);
       // FireinputLog.debug(this, "initialKeys=" + initialKeys);
       return this.getValidPhraseWithInitialKey(keys, initialKeys, keyMatch, currentIndex);
    },

    getValidPhraseWithInitialKey: function(keys, initialKeys, keyMatch, currentIndex)
    {
       var phraseArray = [];
       var phraseList = [];
       var userArray = new Array(); 

       // fast lookup for longer chars 
       if(initialKeys.length >=4)
       {
          initialKeys = initialKeys.substring(0, 4);
          // some phrases have been re-hashed by 3 init key 
          if(!this.phraseCodeHash.hasItem(initialKeys))
          {
             initialKeys = initialKeys.substring(0,3); 
          }
       }

       // FireinputLog.debug(this,"checking: " + initialKeys + ", keyMatch: " + keyMatch);
       // make final check before going forward 
       if(!this.phraseCodeHash.hasItem(initialKeys))
           return null; 

       var stringList = this.phraseCodeHash.getItem(initialKeys); 
       //FireinputLog.debug(this, "currentInex: " + currentIndex);
       //FireinputLog.debug(this,"stringList: " + FireinputUnicode.getUnicodeString(stringList));
 
       var stringArray = stringList.split(","); 
       //FireinputLog.debug(this,"stringArray.length: " + stringArray.length);
 
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
          var shouldAdd = 1; 
          // only match first few chars, should ignore it 
          if(keyList.length < keys.length || (keyMatch && keyList.length != keys.length))
                continue; 

          var phrase = ""; 
          try 
          {
             phrase = phraseKeyValue[1].match(/[\D\.]+/g)[0];
          }        
          catch(e) {}

          if(phrase.length <= 0) 
             continue; 

          for (var j =0; j<keys.length; j++)
          {
             if(keys[j].type == KEY_INITIAL)
             {
                if(keyList[j].indexOf(keys[j].key) !=0)
                {
                   shouldAdd = 0; 
                   break; 
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
          }


          //FireinputLog.debug(this, "phraseKeyValue: " + FireinputUnicode.getUnicodeString(phraseKeyValue));
          if(shouldAdd == 1)
          { 

	     if(typeof(phraseList[phrase]) == 'undefined')
             {

                phraseList[phrase] = ""; 

                oldIndex++; 
                if(oldIndex <= currentIndex)
                   continue; 

                var freq = phraseKeyValue[1].match(/[\d\.]+/g)[0];   
                var encodedWord = FireinputEncoding.getEncodedString(phrase, this.encodingMode);

                if(this.userCodeHash && this.userCodeHash.hasItem(phrase))
                {
                   var ufreq = this.userCodeHash.getItem(phrase);
                   userArray[userArray.length] = {key: phraseKeyValue[0], word:phrase+ufreq.freq, encodedWord:encodedWord+ufreq.freq}; 
                }
                else 
                {
                   phraseArray[phraseArray.length] = {key: phraseKeyValue[0], word:phraseKeyValue[1], encodedWord:encodedWord+freq};
                   if(phraseArray.length>= 10)
                      break; 
                }
             }
          }
       }                    

       //FireinputLog.debug(this,"phraseArray: " + this.getKeyWord(phraseArray));
       //FireinputLog.debug(this,"userArray: " + this.getKeyWord(userArray));
       if(userArray.length <= 0)
       {
          phraseArray.sort(this.sortCodeArray); 
          return phraseArray;
       }
       else 
       {
          arrayInsert(userArray, userArray.length, phraseArray.slice(0, phraseArray.length)); 
          userArray.sort(this.sortCodeArray); 
          return userArray; 
       }
    },
   
    flushUserTable: function()
    {
       if(this.userCodeHash && this.userTableChanged)
       {
          FireinputSaver.save(this.userCodeHash);
       }
    },
 
    updateFrequency: function(word, key, initKey, newPhrase)
    {
       var freq = word.match(/[\d\.]+/g)[0];
       var chars = word.match(/[\D\.]+/g)[0];
       if(!this.userCodeHash)
          this.userCodeHash = new FireinputHash();
 
       if(typeof(newPhrase) == "undefined")
          newPhrase = false; 

       var newfreq = 0; 
       if(this.userCodeHash.hasItem(chars))
       {
          var charopt = this.userCodeHash.getItem(chars); 
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
                 if(keys[i].type == KEY_FINAL)
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

       if(newfreq)
       {
          newfreq /= Math.pow(2, 16); 
          if(newfreq < 1) newfreq = 1; 
       }
       freq = Math.round(newfreq) + parseInt(freq); 

       if(newPhrase)
          this.userCodeHash.setItem(chars, {freq: freq, key: key, initKey: initKey, newPhrase: newPhrase});
       else 
          this.userCodeHash.setItem(chars, {freq: freq, key: key, initKey: initKey});

       // update phrase hash or code hash. Always to add it at the beginning 
       // ignore if it's new Phrase since it's always handled by storeUserPhrase 
       if(!newPhrase)
       {
          this.updateUserCodeValue(key, initKey, chars, freq);
       }

       //FireinputLog.debug(this,"word: " + word);
       //FireinputLog.debug(this,"chars: " + chars + ", freq: " + freq);
       //FireinputLog.debug(this,"chars: " + chars + ", key: " + key + ", initKey: " + initKey);
       this.userTableChanged = true; 
       return freq; 
    },

    storeUserPhrase: function(userPhrase)
    {
       if(!userPhrase || userPhrase.length <= 0)
          return; 

       // FireinputLog.debug(this,"userPhrase: " + this.getKeyWord(userPhrase));
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

          var keyArray = userPhrase[i].key.split(" "); 
          for(j=0; j<keyArray.length; j++)
          {
             if(typeof(this.pinyinFinals[keyArray[j]]) != 'undefined')
             {
                validInitialKey += keyArray[j]; 
             }
             else
             {
                validInitialKey += keyArray[j].substring(0,1);
             }
          }

          if(validInitialKey.length >= 4) 
          {
             var subValidInitialKey = validInitialKey.substring(0, 3); 
             if(!this.phraseCodeHash.hasItem(subValidInitialKey))
                 validInitialKey = subValidInitialKey;
             else 
                 validInitialKey = validInitialKey.substring(0, 4);
          }
       }

       // FireinputLog.debug(this,"keys: " + keys + ", phrase: " + phrase);
       // FireinputLog.debug(this,"validInitialKey: " + validInitialKey);
       if(!this.userCodeHash)
          this.userCodeHash = new FireinputHash();

       if(this.userCodeHash.hasItem(phrase))
          return; 

       var freq = this.updateFrequency(phrase+0, keys, validInitialKey, true); 
       // FireinputLog.debug(this,"freq: " + freq);

       if(this.phraseCodeHash.hasItem(validInitialKey))
       {
          // the new phrase is already in phrase table, don't add it in
          var nowPhrase = this.phraseCodeHash.getItem(validInitialKey); 
          var regex = new RegExp(phrase + "\\d+", "g"); 
          var matched = nowPhrase.match(regex);
          if(matched)
          {
             nowPhrase = nowPhrase.replace(keys + "=>" + matched, "");  
          }
          this.phraseCodeHash.setItem(validInitialKey, keys + "=>" + phrase+freq + "," + nowPhrase); 
       }
       else 
          this.phraseCodeHash.setItem(validInitialKey, keys + "=>" + phrase+freq); 
          
    }
    
});


