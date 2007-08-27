const HALF_LETTER_MODE = 1;
const FULL_LETTER_MODE = 2;
const HALF_PUNCT_MODE = 3;
const FULL_PUNCT_MODE = 4;

var FireinputIME = function() {}; 

FireinputIME.prototype = 
{
    codeHash: null,
    phraseCodeHash: null, 
    name: null, 
    letterMode: HALF_LETTER_MODE, 
    punctMode: HALF_PUNCT_MODE, 

    getName: function ()
    {
       return this.name; 
    },

    loadTable: function()
    {
    
    },

    find: function(inputChar)
    {

    },

    next: function (index)
    {

    },

    prev: function (index)
    {

    }, 

    getDataPath: function()
    {
       var path = FireinputUtils.getExtensionPath();
       path = path.substring(0, path.length - 19);

       if(/chrome/.test(path))
       {
          return path.substring(0, path.lastIndexOf("/chrome"));
       }

       return path;
    },

    getPinyinDataFile: function()
    {

       return "/chrome/data/smart_pinyin_table"; 
    }, 

    getPinyinPhraseFile: function()
    {
       return "/chrome/data/smart_pinyin_phrase";
    }, 
 
    getUserDataFile: function()
    {
       return "/chrome/data/user_word_table"; 
    }, 
 
    getUserHistoryFile: function()
    {
       return "/chrome/data/user_history.rdf"; 
    }, 
  
    getPinyinTransformFile: function()
    {
       return "/chrome/data/pinyin_transform";
    }, 

    sortCodeArray: function (a, b)
    {
       if(!a || !b)
          return 0;

       //a = converter.convertStringToUTF8(a, "ASCII", false);
       //b = converter.convertStringToUTF8(b, "ASCII", false);
       var num1 = a.word.match(/[\d\.]+/g)[0];
       var num2 = b.word.match(/[\d\.]+/g)[0];
       var str1 = a.word.match(/[\D\.]+/g)[0];
       var str2 = b.word.match(/[\D\.]+/g)[0];

       if(str2.length != str1.length)
          return str2.length - str1.length;

       return num2 - num1;
    },

    getKeyWord: function(wordArray)
    {
       if(!wordArray) return null; 
       var str = "";
       for(var i=0; i<wordArray.length; i++)
       {
          str += wordArray[i].key + "=" + wordArray[i].word; 
          str += ",";
       }
       str = FireinputUnicode.getUnicodeString(str);
       var strArray = str.split(",");
       return (strArray.slice(0, strArray.length-1));
    },

    isHalfLetterMode: function()
    {
       return this.letterMode == HALF_LETTER_MODE; 
    }, 

    setHalfLetterMode: function()
    {
       this.letterMode = HALF_LETTER_MODE; 
    },

    setFullLetterMode: function()
    {
       this.letterMode = FULL_LETTER_MODE; 
    },

    isHalfPunctMode: function()
    {
       return this.punctMode == HALF_PUNCT_MODE;
    },
  
    setHalfPunctMode: function()
    {
       this.punctMode = HALF_PUNCT_MODE;
    },

    setFullPunctMode: function()
    {
       this.punctMode = FULL_PUNCT_MODE;    
    }
};

