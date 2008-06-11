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

    // the entrance function to load all related tables 
    loadTable: function()
    {
       letterConverter = new FullLetterConverter(); 

       // setTimeout to not block firefox start
       var self = this; 
       setTimeout(function() { return self.loadWubiTable(); }, 500); 

       // init encoding table 
       FireinputEncoding.init(); 
    },

    getCodeLine: function(str)
    {
       var strArray = str.split(':');
       if(strArray.length < 2)
          return;

       // initKey:key=>word 
       this.keyWubiHash.setItem(strArray[0],strArray[1]);
    },

    loadWubiTable: function()
    {
       var ios = FireinputXPC.getIOService(); 
       var fileHandler = ios.getProtocolHandler("file")
                         .QueryInterface(Components.interfaces.nsIFileProtocolHandler);

       var path = this.getDataPath(); 
       var datafile = ""; 
       if(this.wubiSchema == WUBI_86)
          datafile = fileHandler.getFileFromURLSpec(path + this.getWubi86File()); 
       if(this.wubiSchema == WUBI_98)
          datafile = fileHandler.getFileFromURLSpec(path + this.getWubi98File()); 
       
       if(!datafile.exists())
       {
           this.engineDisabled = true; 
           return; 
       }

       this.keyWubiHash = new FireinputHash();

       var options = {
          caller: this, 
          oncomplete: this.loadUserTable, 
          onavailable: this.getCodeLine
       }; 

       FireinputStream.loadDataAsync(datafile, options);
    },


    getUserCodeLine: function(str)
    {
       var strArray = str.split(':');
       if(strArray.length < 4)
          return;

       // old user data format: word: freq key initKey 
       // new user data format: schema: word: freq key initKey 
       if(isNaN(parseInt(strArray[0])))
       {
          this.userCodeHash.setItem(strArray[0], {freq: strArray[1], key: strArray[2], initKey: strArray[3], schema: this.wubiSchema});
       }
       else if(strArray[0] == this.wubiSchema)
       {
          this.userCodeHash.setItem(strArray[1], {freq: strArray[2], key: strArray[3], initKey: strArray[4], schema: this.wubiSchema});
       }      

    },

    loadUserTable: function()
    {
       var ios = FireinputXPC.getIOService(); 
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
       var ios = FireinputXPC.getIOService(); 
       var fileHandler = ios.getProtocolHandler("file")
                         .QueryInterface(Components.interfaces.nsIFileProtocolHandler);

       var path = this.getDataPath();
       var datafile = fileHandler.getFileFromURLSpec(path + this.getWubi86File());
       if(!datafile.exists())
       {
          datafile = fileHandler.getFileFromURLSpec(path + this.getWubi98File());
          if(datafile.exists())
             return true; 
          return false; 
       }

       return true; 
    }, 

    isSchemaEnabled: function()
    {
       if(this.engineDisabled)
          return false;
       var ios = FireinputXPC.getIOService(); 
       var fileHandler = ios.getProtocolHandler("file")
                         .QueryInterface(Components.interfaces.nsIFileProtocolHandler);

       var path = this.getDataPath();
       if(this.wubiSchema == WUBI_86)
          datafile = fileHandler.getFileFromURLSpec(path + this.getWubi86File()); 
       if(this.wubiSchema == WUBI_98)
          datafile = fileHandler.getFileFromURLSpec(path + this.getWubi98File()); 
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

    setSchema: function(schema)
    {
       //FireinputLog.debug(this, "Set schema: " + schema);
       this.wubiSchema = schema; 
    }, 

    getAllowedInputKey: function()
    {
       return "abcdefghijklmnopqrstuvwxy"; 
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
          return this.charArray.slice(0, 9);
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
       return this.autoInsertion;       
    }, 

    getValidWord: function(key)
    {
       var wordArray = null; 
       var userArray = new Array(); 
       var wordList = new Array(); 

       if(!key)
          return null; 

       var keyInitial = key.substring(0, 1); 
       if(key.length >= 3)
          keyInitial = key.substring(0, 3); 
       if(!this.keyWubiHash.hasItem(keyInitial))
             return null; 
 
       // only enable autoinsertion for 4 keys 
       if(key.length >= 4)
          this.autoInsertion = true; 

       var wubiWordList = this.keyWubiHash.getItem(keyInitial); 

       var wubiWordArray = wubiWordList.split(","); 

       wordArray = new Array(); 

       for(var i=0; i < wubiWordArray.length; i++)
       {
          var wubiWord = wubiWordArray[i].split("=>"); 
          
          if(wubiWord[0].search(new RegExp("^" + key)))
             continue; 

          // FireinputLog.debug(this,"wubiWordArray[i]: " + FireinputUnicode.getUnicodeString(wubiWordArray[i]));

          var word = ""; 
          try 
          {
             word = wubiWord[1].match(/[\D\.]+/g)[0];
          }        
          catch(e) {}


          if(word.length <= 0) 
             continue; 


          var encodedWord = FireinputEncoding.getEncodedString(word, this.encodingMode);
          if(typeof(wordList[encodedWord]) != 'undefined')
             continue; 

          wordList[encodedWord] = 1; 

          if(this.userCodeHash && this.userCodeHash.hasItem(word))
          {
             var ufreq = this.userCodeHash.getItem(word);
             /* use this way other than push to have better performance 
              * http://aymanh.com/9-javascript-tips-you-may-not-know
              */
             userArray[userArray.length] = {key: wubiWord[0], word:word+ufreq.freq, encodedWord:encodedWord+ufreq.freq}; 
          }
          else
          {
             var freq = wubiWord[1].match(/[\d\.]+/g)[0];
             wordArray[wordArray.length] = {key:wubiWord[0], word:wubiWord[1], encodedWord:encodedWord+freq};
          }
       }

       // free it 
       wordList = null; 

       //FireinputLog.debug(this,"wordArray: " + this.getKeyWord(wordArray));
       if(userArray.length <= 0)         
          return wordArray; 

       // sort the first 10 items 
       if(userArray.length < 10)
       {
          arrayInsert(userArray, userArray.length, wordArray.slice(0, 9)); 
          userArray.sort(this.sortCodeArray); 
          arrayInsert(userArray, userArray.length, wordArray.slice(10, wordArray.length)); 
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
          FireinputSaver.save(this.userCodeHash);
       }
    },

    updateFrequency: function(word, key, initKey)
    {
       var freq = word.match(/[\d\.]+/g)[0];
       var chars = word.match(/[\D\.]+/g)[0];
       if(!this.userCodeHash)
          this.userCodeHash = new FireinputHash();

       var newfreq = 0; 
       if(this.userCodeHash.hasItem(chars))
       {
          var charopt = this.userCodeHash.getItem(chars); 
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

       this.userCodeHash.setItem(chars, {freq: freq, key: key, initKey: initKey, schema: this.wubiSchema});

       this.userTableChanged = true; 

       // FireinputLog.debug(this,"word: " + word);
       //FireinputLog.debug(this,"chars: " + chars + ", freq: " + freq);
       //FireinputLog.debug(this,"chars: " + chars + ", key: " + key + ", initKey: " + initKey);
       return freq; 
    },

    storeUserPhrase: function(userPhrase)
    {
       return; 
    }
    
});


