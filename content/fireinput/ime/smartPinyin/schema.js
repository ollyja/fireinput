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

const PinyinInitials = [ "b", "c", "ch", "d", "f", "g", "h", "j", "k", "l", "m",
                          "n", "p","q", "r", "s", "sh", "t", "w", "x", "y", "z", "zh"];

const PinyinFinals = ["a","ai", "an", "ang", "ao", "e", "ei", "en", "eng", "er",
                       "i", "ia", "ian", "iang", "iao", "ie", "in", "ing", "io", "ion", "iong",
                       "iou", "iu", "o", "on", "ong", "ou", "u", "ua", "uai", "uan",
                       "uang", "ue", "uei", "uen", "ueng", "ui", "un", "uo", "v", "van",
                       "ve", "vn"];  

const PinyinAMBInitials  = ["zh z","ch c","sh s"];
const PinyinAMBFinals  = ["an ang", "en eng","in ing"];

const ZiGuangShuangPinInitials = [
       { key: "a", initials: "ch"      },
       { key: "b", initials: "b"       },
       { key: "c", initials: "c"       },
       { key: "d", initials: "d"       },
       { key: "f", initials: "f"       },
       { key: "g", initials: "g"       },
       { key: "h", initials: "h"       },
       { key: "i", initials: "sh"      },
       { key: "j", initials: "j"       },
       { key: "k", initials: "k"       },
       { key: "l", initials: "l"       },
       { key: "m", initials: "m"       },
       { key: "n", initials: "n"       },
       { key: "p", initials: "p"       },
       { key: "q", initials: "q"       },
       { key: "r", initials: "r"       },
       { key: "s", initials: "s"       },
       { key: "t", initials: "t"       },
       { key: "u", initials: "zh"      },
       { key: "w", initials: "w"       },
       { key: "x", initials: "x"       },
       { key: "y", initials: "y"       },
       { key: "z", initials: "z"       }
    ]; 

const ZiGuangShuangPinFinals = [
       { key: "a", finals: "a"         },
       { key: "b", finals: "iao"       },
       { key: "c", finals: "ing"       },
       { key: "d", finals: "ie"        },
       { key: "e", finals: "e"         },
       { key: "f", finals: "ian"       },
       { key: "g", finals: "uang,iang" },
       { key: "h", finals: "ong,iong"  },
       { key: "i", finals: "i"         },
       { key: "j", finals: "iu,er"     },
       { key: "k", finals: "ei"        },
       { key: "l", finals: "uan"       },
       { key: "m", finals: "un"        },
       { key: "n", finals: "ui,ue"     },
       { key: "o", finals: "uo,o"      },
       { key: "p", finals: "ai"        },
       { key: "q", finals: "ao"        },
       { key: "r", finals: "an"        },
       { key: "s", finals: "ang"       },
       { key: "t", finals: "ng,eng"    },
       { key: "u", finals: "u"         },
       { key: "v", finals: "v"         },
       { key: "w", finals: "en"        },
       { key: "x", finals: "ia,ua"     },
       { key: "y", finals: "in,uai"    },
       { key: "z", finals: "ou"        }
    ]; 
   
const MSShuangPinInitials = [
       { key: "b", initials: "b"       },
       { key: "c", initials: "c"       },
       { key: "d", initials: "d"       },
       { key: "f", initials: "f"       },
       { key: "g", initials: "g"       },
       { key: "h", initials: "h"       },
       { key: "i", initials: "ch"      },
       { key: "j", initials: "j"       },
       { key: "k", initials: "k"       },
       { key: "l", initials: "l"       },
       { key: "m", initials: "m"       },
       { key: "n", initials: "n"       },
       { key: "p", initials: "p"       },
       { key: "q", initials: "q"       },
       { key: "r", initials: "r"       },
       { key: "s", initials: "s"       },
       { key: "t", initials: "t"       },
       { key: "u", initials: "sh"      },
       { key: "v", initials: "zh"      },
       { key: "w", initials: "w"       },
       { key: "x", initials: "x"       },
       { key: "y", initials: "y"       },
       { key: "z", initials: "z"       }
    ];
 
const MSShuangPinFinals = [
       { key: "a", finals: "a"         },
       { key: "b", finals: "ou"        },
       { key: "c", finals: "iao"       },
       { key: "d", finals: "uang,iang" },  
       { key: "e", finals: "e"         },
       { key: "f", finals: "en"        },
       { key: "g", finals: "ng,eng"    },
       { key: "h", finals: "ang"       },
       { key: "i", finals: "i"         },
       { key: "j", finals: "an"        },
       { key: "k", finals: "ao"        },
       { key: "l", finals: "ai"        },
       { key: "m", finals: "ian"       },
       { key: "n", finals: "in"        },
       { key: "o", finals: "o,uo"      },
       { key: "p", finals: "un"        },
       { key: "q", finals: "iu"        },
       { key: "r", finals: "uan,er"    },
       { key: "s", finals: "ong,iong"  },
       { key: "t", finals: "ue"        },
       { key: "u", finals: "u"         },
       { key: "v", finals: "v,ui"      },
       { key: "w", finals: "ia,ua"     },
       { key: "x", finals: "ie"        },
       { key: "y", finals: "uai"       },
       { key: "z", finals: "ei"        },
       { key: ";", finals: "ing"       }
    ]; 

const ChineseStarShuangPinInitials = [
       { key: "b", initials: "b"       },
       { key: "c", initials: "c"       },
       { key: "d", initials: "d"       },
       { key: "f", initials: "f"       },
       { key: "g", initials: "g"       },
       { key: "h", initials: "h"       },
       { key: "i", initials: "sh"      },
       { key: "j", initials: "j"       },
       { key: "k", initials: "k"       },
       { key: "l", initials: "l"       },
       { key: "m", initials: "m"       },
       { key: "n", initials: "n"       },
       { key: "p", initials: "p"       },
       { key: "q", initials: "q"       },
       { key: "r", initials: "r"       },
       { key: "s", initials: "s"       },
       { key: "t", initials: "t"       },
       { key: "u", initials: "ch"      },
       { key: "v", initials: "zh"      },
       { key: "w", initials: "w"       },
       { key: "x", initials: "x"       },
       { key: "y", initials: "y"       },
       { key: "z", initials: "z"       }
    ];
  
const ChineseStarShuangPinFinals = [
       { key: "a", finals: "a"         },
       { key: "b", finals: "ia,ua"     },
       { key: "c", finals: "uan"       },
       { key: "d", finals: "ao"        },
       { key: "e", finals: "e"         },
       { key: "f", finals: "an"        },
       { key: "g", finals: "ang"       },
       { key: "h", finals: "uang,iang" },
       { key: "i", finals: "i"         },
       { key: "j", finals: "ian"       },
       { key: "k", finals: "iao"       },
       { key: "l", finals: "in"        },
       { key: "m", finals: "ie"        },
       { key: "n", finals: "iu"        },
       { key: "o", finals: "uo,o"      },
       { key: "p", finals: "ou"        },
       { key: "q", finals: "ing,er"    },
       { key: "r", finals: "en"        },
       { key: "s", finals: "ai"        },
       { key: "t", finals: "ng,eng"    },
       { key: "u", finals: "u"         },
       { key: "v", finals: "v,ui"      },
       { key: "w", finals: "ei"        },
       { key: "x", finals: "uai,ue"    },
       { key: "y", finals: "ong,iong"  },
       { key: "z", finals: "un"        }
    ];

const SmartABCShuangPinInitials = [
       { key: "a", initials: "zh"      },
       { key: "b", initials: "b"       },
       { key: "c", initials: "c"       },
       { key: "d", initials: "d"       },
       { key: "e", initials: "ch"      },
       { key: "f", initials: "f"       },
       { key: "g", initials: "g"       },
       { key: "h", initials: "h"       },
       { key: "j", initials: "j"       },
       { key: "k", initials: "k"       },
       { key: "l", initials: "l"       },
       { key: "m", initials: "m"       },
       { key: "n", initials: "n"       },
       { key: "p", initials: "p"       },
       { key: "q", initials: "q"       },
       { key: "r", initials: "r"       },
       { key: "s", initials: "s"       },
       { key: "t", initials: "t"       },
       { key: "v", initials: "sh"      },
       { key: "w", initials: "w"       },
       { key: "x", initials: "x"       },
       { key: "y", initials: "y"       },
       { key: "z", initials: "z"       }
    ];

const SmartABCShuangPinFinals = [
       { key: "a", finals: "a"         },
       { key: "b", finals: "ou"        },
       { key: "c", finals: "in,uai"    },
       { key: "d", finals: "ia,ua"     },
       { key: "e", finals: "e"         },
       { key: "f", finals: "en"        },
       { key: "g", finals: "ng,eng"    },
       { key: "h", finals: "ang"       },
       { key: "i", finals: "i"         },
       { key: "j", finals: "an"        },
       { key: "k", finals: "ao"        },
       { key: "l", finals: "ai"        },
       { key: "m", finals: "ui,ue"     },
       { key: "n", finals: "un"        },
       { key: "o", finals: "uo,o"      },
       { key: "p", finals: "uan"       },
       { key: "q", finals: "ei"        },
       { key: "r", finals: "iu,er"     },
       { key: "s", finals: "ong,iong"  },
       { key: "t", finals: "uang,iang" },
       { key: "u", finals: "u"         },
       { key: "v", finals: "v"         },
       { key: "w", finals: "ian"       },
       { key: "x", finals: "ie"        },
       { key: "y", finals: "ing"       },
       { key: "z", finals: "iao"       }
    ];

 
var PinyinSchema = function() {}; 

PinyinSchema.prototype = 
{
    debug: 0, 
    pinyinInitials: null,
    pinyinFinals: null,
    pinyinAMBInitialHash: null, 
    pinyinAMBFinalHash: null, 
    pinyinSchema: SMART_PINYIN, 
    enableAMBZh: false, 
    enableAMBSh: false, 
    enableAMBCh: false, 
    enableAMBAng: false, 
    enableAMBEng: false, 
    enableAMBIng: false, 

    getSchema: function()
    {
       return this.pinyinSchema;
    }, 

    setSchema: function(schema)
    {
       this.pinyinInitials = new FireinputHash(); 
       this.pinyinFinals = new FireinputHash(); 
       this.pinyinSchema = schema; 

       switch(schema)
       {
          case ZIGUANG_SHUANGPIN: 
             for(var i=ZiGuangShuangPinInitials.length-1; i>=0; i--)
             {
                this.pinyinInitials.setItem(ZiGuangShuangPinInitials[i].key, 
                                       ZiGuangShuangPinInitials[i].initials); 
             }
             for(var i=ZiGuangShuangPinFinals.length-1; i>=0; i--)
             {
                this.pinyinFinals.setItem(ZiGuangShuangPinFinals[i].key, 
                                       ZiGuangShuangPinFinals[i].finals); 
             }
          break; 

          case MS_SHUANGPIN: 
             for(var i=MSShuangPinInitials.length-1; i>=0; i--)
             {
                this.pinyinInitials.setItem(MSShuangPinInitials[i].key, 
                                       MSShuangPinInitials[i].initials);
             }
             for(var i=MSShuangPinFinals.length-1; i>=0; i--)
             {
                this.pinyinFinals.setItem(MSShuangPinFinals[i].key, 
                                       MSShuangPinFinals[i].finals);
             }
          break;

          case CHINESESTAR_SHUANGPIN: 
             for(var i=ChineseStarShuangPinInitials.length-1; i>=0; i--)
             {
                this.pinyinInitials.setItem(ChineseStarShuangPinInitials[i].key, 
                                       ChineseStarShuangPinInitials[i].initials);
             }
             for(var i=ChineseStarShuangPinFinals.length-1; i>=0; i--)
             {
                this.pinyinFinals.setItem(ChineseStarShuangPinFinals[i].key, 
                                       ChineseStarShuangPinFinals[i].finals);
             }
          break;

          case SMARTABC_SHUANGPIN: 
             for(var i=SmartABCShuangPinInitials.length-1; i>=0; i--)
             {
                this.pinyinInitials.setItem(SmartABCShuangPinInitials[i].key, 
                                       SmartABCShuangPinInitials[i].initials);
             }
             for(var i=SmartABCShuangPinFinals.length-1; i>=0; i--)
             {
                this.pinyinFinals.setItem(SmartABCShuangPinFinals[i].key, 
                                       SmartABCShuangPinFinals[i].finals);
             }
          break;

          default: 
             this.pinyinSchema = SMART_PINYIN; 
          break;
       }

       this.initAMB(); 
    },

    initAMB: function()
    {
       if(this.pinyinAMBInitialHash != null)
          return; 

       this.setAMBOption();
       FireinputPref.addObserver(this, false);	
       this.pinyinAMBInitialHash = new FireinputHash(); 
       this.pinyinAMBFinalHash = new FireinputHash(); 

       //FIXME: should be based on configuration 
       for(var i=0; i<PinyinAMBInitials.length; i++)
       {
          var strArray = PinyinAMBInitials[i].split(' ');
          if(strArray.length < 2) 
             continue; 
          for(var j=0; j<PinyinFinals.length; j++)
          {
               this.pinyinAMBInitialHash.setItem(strArray[0]+PinyinFinals[j], strArray[1]+PinyinFinals[j]); 
          }
       }

       for(var i=0; i<PinyinAMBFinals.length; i++)
       {
          var strArray = PinyinAMBFinals[i].split(' ');
          if(strArray.length < 2) 
             continue; 
          for(var j=0; j<PinyinInitials.length; j++)
          {
               this.pinyinAMBFinalHash.setItem(PinyinInitials[j]+strArray[0], PinyinInitials[j]+strArray[1]); 
          }
          // put final in as well 
          this.pinyinAMBFinalHash.setItem(strArray[0], strArray[1]); 
       }
    }, 

    getAllowedKeys: function()
    {
       var allowedKeys = ""; 
       var self  =  this; 
       this.pinyinInitials.foreach ( function(k, v) { allowedKeys += k; }); 
       this.pinyinFinals.foreach ( function(k, v) { if(!self.pinyinInitials.hasItem(k)) {allowedKeys += k; }}); 

       // smart pinyin by default 
       if(allowedKeys.length <= 0)
          allowedKeys = "abcdefghijklmnopqrstuvwxyz"; 

       return allowedKeys; 

    }, 

    observe: function(subject, topic, data)
    {
        var name = data.substr(prefDomain.length+1);
        this.setAMBOption(name);
    },
     
    setAMBOption: function(option)
    {

       if(!option || option == "fireinputAMBZh")
         this.enableAMBZh = FireinputPrefDefault.getAMBOption("fireinputAMBZh");

       if(!option || option == "fireinputAMBSh")
         this.enableAMBSh = FireinputPrefDefault.getAMBOption("fireinputAMBSh");

       if(!option || option == "fireinputAMBCh")
         this.enableAMBCh = FireinputPrefDefault.getAMBOption("fireinputAMBCh");

       if(!option || option == "fireinputAMBAng")
         this.enableAMBAng = FireinputPrefDefault.getAMBOption("fireinputAMBAng");

       if(!option || option == "fireinputAMBEng")
         this.enableAMBEng = FireinputPrefDefault.getAMBOption("fireinputAMBEng");

       if(!option || option == "fireinputAMBIng")
         this.enableAMBIng = FireinputPrefDefault.getAMBOption("fireinputAMBIng");
    },

    getAMBKeys: function (ikey)
    {
       if(this.getSchema() != SMART_PINYIN)
          return null; 

       var ambKeys = [];

       if((this.enableAMBZh && /^z/.test(ikey)) || 
          (this.enableAMBSh && /^s/.test(ikey)) ||
          (this.enableAMBCh && /^c/.test(ikey)))
       {
          if(this.pinyinAMBInitialHash.hasItem(ikey))
          {
             ambKeys[ambKeys.length] = this.pinyinAMBInitialHash.getItem(ikey); 

             if((this.enableAMBAng && (/an$/.test(ikey) || /ang$/.test(ikey))) || 
                (this.enableAMBEng && (/en$/.test(ikey) || /eng$/.test(ikey))) || 
                (this.enableAMBIng && (/in$/.test(ikey) || /ing$/.test(ikey))))
             {
                if(this.pinyinAMBFinalHash.hasItem(ikey))
                   ambKeys[ambKeys.length] = this.pinyinAMBFinalHash.getItem(ikey); 
             }
          }
        }
 
        return ambKeys; 
    }, 

    // ikey/mkey should be: 
    //    zan => zhang: final hash
    //    zan =>zhan: initial hash 
    //
    compareAMB: function(ikey, mkey)
    {
       if(this.getSchema() != SMART_PINYIN)
          return false; 

       return this.compareAMBInitial(ikey, mkey) || this.compareAMBFinal(ikey, mkey);  
    },
 
    compareAMBInitial: function(ikey, mkey)
    {
       if(ikey == mkey)
          return true; 

       if((this.enableAMBZh && /^z/.test(ikey)) || 
          (this.enableAMBSh && /^s/.test(ikey)) ||
          (this.enableAMBCh && /^c/.test(ikey)))
       {
          if(this.pinyinAMBInitialHash.hasItem(ikey))
          {
             if (this.pinyinAMBInitialHash.getItem(ikey) == mkey) 
                return true; 
             // mapping such as zen -> zheng 
             if(this.compareAMBFinal(this.pinyinAMBInitialHash.getItem(ikey), mkey))
                return true; 

             return false; 
          }
          else if(this.pinyinAMBInitialHash.hasItem(mkey))
          {
             if (this.pinyinAMBInitialHash.getItem(mkey) == ikey)
                return true; 

             // mapping such as zen -> zheng 
             if(this.compareAMBFinal(this.pinyinAMBInitialHash.getItem(mkey), ikey))
                return true; 

             return false; 
          }
       }

       return false; 
    }, 

    compareAMBFinal: function(ikey, mkey)
    {
       if((this.enableAMBAng && (/an$/.test(ikey) || /ang$/.test(ikey))) || 
          (this.enableAMBEng && (/en$/.test(ikey) || /eng$/.test(ikey))) || 
          (this.enableAMBIng && (/in$/.test(ikey) || /ing$/.test(ikey))))
       {
          if(this.pinyinAMBFinalHash.hasItem(ikey))
          {
             return (this.pinyinAMBFinalHash.getItem(ikey) == mkey); 
          }
          else if(this.pinyinAMBFinalHash.hasItem(mkey))
          {
             return (this.pinyinAMBFinalHash.getItem(mkey) == ikey); 
          }
       }

       return false; 
    }, 

    getKeyByFormat: function(keys, format)
    {
       var keyArray = new Array(); 
       var keySet = new Array();
       var k;
       var useFormat = ""; 

       for(var i=0; i<format.length;)
       {
          var fkey = format.substr(i, 1); 
          var ykey = format.substr(i+1, 1); 
          if(fkey == "s")
          {
             // it's initial 
             var c1 = keys.substr(i,1);
             if(this.pinyinInitials.hasItem(c1) || c1 == "o")
             {
                var firstKey = ""; 
                if(c1 != "o")
                {
                   firstKey = this.pinyinInitials.getItem(c1);
                }
                else 
                {
                   if(ykey == 's') 
                      ykey = "y"; 
                   firstKey = "o"; 
                }
 
                // if keyArray has saved a list of keys, append the new key to each of them
                // otherwise just add to keySet only 
                if(ykey != "y")
                {
                   if(keyArray.length > 0)
                   {
                      for (var ii=0; ii<keyArray.length; ii++)
                      {
                         keyArray[ii].push({key: firstKey, type: KEY_INITIAL}); 
                      }
                   }
                   else
                      keySet.push({key: firstKey, type: KEY_INITIAL}); 
                }
                else if(ykey == "y")
                {
                  
                   // it's final 
                   var c2 = keys.substr(i+1,1);
                   if(firstKey == "o")
                      firstKey = ""; 

                   var keyType = firstKey.length>0 ? KEY_FULL : KEY_FINAL; 
                   if(this.pinyinFinals.hasItem(c2))
                   {
                      var finalArray = this.pinyinFinals.getItem(c2).split(",");
                      if(keyArray.length > 0)
                      {
                          for(var ii=0; ii<keyArray.length; ii++)  
                          {
                           keyArray[ii].push({key: firstKey+finalArray[0], type: keyType}); 
                          }
                      }
                      else 
                          keySet.push({key: firstKey+finalArray[0], type: keyType}); 

                      // multiple finals. We have save the previous keyset and create a matrix table here 
                      // to list all possibilities 
                      if(finalArray.length > 1)
                      {
                         if(keyArray.length > 0)
                         {
                            var keyArrayCloned = cloneArray(keyArray); 
                            for(var jj=0; jj<keyArrayCloned.length; jj++)
                            {
                               keyArrayCloned[jj].pop(); 
                               keyArrayCloned[jj].push({key: firstKey+finalArray[1], type: keyType}); 
                               keyArray.push(keyArrayCloned[jj]); 
                            }
                         }   
                         else
                         {
                            keyArray.push(keySet); 
                            var keySetCloned = cloneArray(keySet); 
                            keySetCloned.pop(); 
                            keySetCloned.push({key: firstKey+finalArray[1], type: keyType}); 
                            keyArray.push(keySetCloned); 
                         }
                      }
                   } /* if in finals */   
                } /* else */
             } 
          } /* first has to be s */

          // save format 
          useFormat += fkey; 

          if(ykey == "y")
          {
             useFormat += ykey; 
             i += 2; 
          }
          else
             i++; 

            
       }

       // FireinputLog.debug(this, "format: " + format + ", Return format: " + useFormat); 
       return {format: useFormat, keyset: keyArray.length > 0 ? keyArray: keySet, mkey: keyArray.length > 0 ? 1:0}; 
    }, 


    getComposeKey: function(keys, useDefaultSchema)
    {
       var keyArray = new Array(); 
       // 两字词：输入两字的双拼码 (SY)；
       // 三字词：输入前两个字的声码和第三个字的双拼码，共4码 (SSSY)；
       // 四字词：输入每个字的声码，共4码 (SSSS)；
       // 五字词：输入前三个字和第五个字的声码，共4码 (SSSSS)。 FIXME: how ? 
       
       // upper level asks to use default schema: pingyin 
       if(useDefaultSchema)
          return keys; 

       switch(this.pinyinSchema)
       {
          case ZIGUANG_SHUANGPIN: 
          case MS_SHUANGPIN: 
          case CHINESESTAR_SHUANGPIN: 
          case SMARTABC_SHUANGPIN: 
             if(keys.length == 1)
             {
                var keySet = new Array(); 
                if(this.pinyinInitials.hasItem(keys))
                   keySet.push({key: this.pinyinInitials.getItem(keys), type: KEY_INITIAL}); 
                else
                   keySet.push({key: keys, type: KEY_INITIAL}); 
                keyArray.push(keySet); 
                return keyArray; 
             }
             else if (keys.length == 2)
             {
                var keySet = this.getKeyByFormat(keys, "sy"); 
                if(keySet.mkey)
                   keyArray = keySet.keyset; 
                else
                   keyArray.push(keySet.keyset); 

                return keyArray; 
             }
             else if(keys.length == 3)
             {
                // s -sy
                var keySet = this.getKeyByFormat(keys, "sss"); 
                if(keySet.mkey)
                   keyArray = keySet.keyset; 
                else
                   keyArray.push(keySet.keyset); 

                var useFormat = keySet.format; 
                if(useFormat != "ssy")
                {
                   keySet = this.getKeyByFormat(keys, "ssy"); 
                   if(keySet.mkey)
                      arrayInsert(keyArray, keyArray.length, keySet.keyset); 
                   else
                      keyArray.push(keySet.keyset); 
                }

                if(useFormat != "sys")
                {
                   keySet = this.getKeyByFormat(keys, "sys"); 
                   if(keySet.mkey)
                      arrayInsert(keyArray, keyArray.length, keySet.keyset); 
                   else
                      keyArray.push(keySet.keyset); 
                }

                return keyArray; 
             } 
             else if(keys.length == 4)
             {
                // s s s s 
                var keySet = this.getKeyByFormat(keys, "ssss"); 
                if(keySet.mkey)
                   keyArray = keySet.keyset; 
                else
                   keyArray.push(keySet.keyset); 

                var useFormat = keySet.format; 
		// if ssss -> sysy, the keys will be in format as sysy, and cannot be in other formats 
		// if ssss -> sssy, then syss will be same as sysy
		// if ssss -> syss, then sssy will be same as sysy
                if(useFormat == "sysy")
                   return keyArray; 

                // if format changed, in any case only sysy will be valid format 
                if(useFormat != "ssss")
                {
                   keySet = this.getKeyByFormat(keys, "sysy"); 
                   if(keySet.mkey)
                      arrayInsert(keyArray, keyArray.length, keySet.keyset); 
                   else
                      keyArray.push(keySet.keyset); 
                   return keyArray; 
                   
                }
                else 
                {
                   keySet = this.getKeyByFormat(keys, "sssy"); 
                   if(keySet.mkey)
                      arrayInsert(keyArray, keyArray.length, keySet.keyset); 
                   else
                      keyArray.push(keySet.keyset); 

                   keySet = this.getKeyByFormat(keys, "sysy"); 
                   if(keySet.mkey)
                      arrayInsert(keyArray, keyArray.length, keySet.keyset); 
                   else
                      keyArray.push(keySet.keyset); 

                   keySet = this.getKeyByFormat(keys, "syss"); 
                   if(keySet.mkey)
                      arrayInsert(keyArray, keyArray.length, keySet.keyset); 
                   else
                      keyArray.push(keySet.keyset); 

                   return keyArray; 
                }
             }
             else
             {
                // s s s s s
                var fs = ""; 
                for(var i=0; i<keys.length; i++)
                   fs = fs + "s"; 

                var keySet = this.getKeyByFormat(keys, fs); 
                if(keySet.mkey)
                   keyArray = keySet.keyset; 
                else
                   keyArray.push(keySet.keyset); 

                return keyArray; 
             }
          break; 

          case SMART_PINYIN: 
          default: 
             return keys; 
          break; 
       }

       return keyArray; 
    } 

    
}; 

