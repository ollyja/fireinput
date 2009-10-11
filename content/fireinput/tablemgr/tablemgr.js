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
const PinyinTones = ["ā", "á", "ă", "à", "ō", "ó", "ǒ", "ò", "ū", "ú", "ǔ", "ù", 
                     "ī", "í", "ǐ", "ì", "ē", "é", "ě", "è", "ǖ", "ǘ", "ǚ", "ǜ"]; 

var KeyInput = function() { this.init(); };

KeyInput.prototype = 
{
    pinyinInitials: [],
    pinyinFinals: [],
    pinyinTones: [], 
    init: function()
    {
      for(var i=0; i<PinyinInitials.length; i++)
         this.pinyinInitials[PinyinInitials[i]] = PinyinInitials[i];

       for(var i=0; i<PinyinFinals.length; i++)
         this.pinyinFinals[PinyinFinals[i]] = PinyinFinals[i];

       for(var i=0; i<PinyinTones.length; i++)
         this.pinyinTones[PinyinTones[i]] = PinyinTones[i];
    }
}

var PinyinInput = function()  { };

PinyinInput.prototype = extend(new KeyInput(), 
{
    getAllowedInputKey: function()
    {
       return "abcdefghijklmnopqrstuvwxyzāáăàōóǒòūúǔùīíǐìēéěèǖǘǚǜü";
    },

    validateInputKey: function(inputkey)
    {
       for(var i = inputkey.length -1; i > 0; i--)
       {
          var s = inputkey.substr(i, 1); 
           
          if((typeof(this.pinyinFinals[s]) == 'undefined' && 
             typeof(this.pinyinInitials[s]) == 'undefined' && 
             typeof(this.pinyinTones[s]) == 'undefined') && 
             s != ' ' && s != "'")
          {
             return false; 
          }
       }

       return true; 
    }, 

    parseOneKey: function (keyInitial, keyFinal)
    {
       var keyInitialLen = keyInitial.length;

       if(typeof(this.pinyinFinals[keyFinal]) != 'undefined')
       {
         var pinyinKey = {};
         pinyinKey.key = keyInitial + keyFinal;
         pinyinKey.type = keyInitialLen>0 ? KEY_FULL : KEY_FINAL;
         pinyinKey.pos = keyInitialLen + keyFinal.length;
         return pinyinKey;
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

    parseKeys: function(inputchar)
    {
       var keys = new Array();
       // the space is from updateFrequency. Treat them as single quot
       var keyList = inputchar.replace(/\s+/g, "'");

       // if there are single quot delimiters, process them first
       if(keyList.search(/\'/) != null)
       {
           var keyListArray = keyList.split("'");
           var keyListArrayLength = keyListArray.length;
           for(var i=0; i<keyListArrayLength; i++)
           {
              var retArray = this.parseKeySteps(keyListArray[i]);

              if(retArray != null)
                 arrayInsert(keys, keys.length, retArray.slice(0, retArray.length));
           }

           return keys;
        }
        return this.parseKeySteps(keyList);
    },

    parseKeySteps: function(keyList)
    {
       var keys = new Array();

       var keyListLength = keyList.length;

       for(var i=0; i< keyListLength;)
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
              var pinyinKey = this.parseOneKey(key2, finals);
              if(pinyinKey.type == KEY_INITIAL)
              {
                 // No finals. Store them each one as Initial
                    keys.push({key: key2, type: KEY_INITIAL});
              }
              else
              {
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
              var pinyinKey = this.parseOneKey(key1, finals);

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
              var pinyinKey = this.parseOneKey("", finals);
              if(pinyinKey.pos <= 0)
              {
                 // some invalid chars, ignore it by increase position by 1
                 i++;
              }
              else
              {
                 keys.push({key: pinyinKey.key, type: KEY_FINAL});
                 i += pinyinKey.pos;
              }
          }
       }
       return keys;
    }
              
}); 

var WubiInput = function() { }; 

WubiInput.prototype = extend(new KeyInput(),
{
    validateInputKey: function(inputkey)
    {
       var allowedkeys = "abcdefghijklmnopqrstuvwxy"; 
       for(i = inputkey.length -1; i > 0; i--)
       {
          var s = inputkey.substr(i, 1);
          if(!allowedkeys.indexOf(s))
              return false; 
       }
       return true;
    },

    parseKeys: function(inputchar)
    {
       if(inputchar.length > 4 || inputchar.length <= 0)
          return null; 
       return inputchar; 
    }
});

var Cangjie5Input = function() { };

Cangjie5Input.prototype = extend(new KeyInput(),
{
    validateInputKey: function(inputkey)
    {
       var allowedkeys = "abcdefghijklmnopqrstuvwxyz"; 
       for(i = inputkey.length -1; i > 0; i--)
       {
          var s = inputkey.substr(i, 1);
          if(!allowedkeys.indexOf(s))
              return false; 
       }
       return true;
    },

    parseKeys: function(inputchar)
    {
       if(inputchar.length > 5 || inputchar.length <= 0)
          return null; 
       return inputchar;
    }
});


var FireinputTableMgr = 
{
    imageFileValid: false, 

    selectedpage: 0, 

    init: function()
    {
      var gs =  FireinputXPC.getService("@fireinput.com/fireinput;1", "nsIFireinput");
      var f =  gs.getChromeWindow().getFireinput();

       FireinputServerLogin.checkUserLogon(); 
       this.initAutomaticUpdateInteval();
       this.getLastUpdate();   
       this.initObserver(); 
       this.imeSelect(); 
    }, 

    initTab: function(tabid)
    {

    }, 

    initObserver: function()
    {
       FireinputPref.addObserver(this, false);
    }, 

    observe: function(subject, topic, data)
    {
       if(topic == "nsPref:changed" && typeof(prefDomain) != 'undefined')
       {
          var name = data.substr(prefDomain.length+1);
          if(name == 'lastTableUpdate')
          {
             $('#lastTableUpdate').html('自动更新完成...');
             $('#updateNowButton').show(); 
             $('#updateNowImg').hide(); 

             setTimeout(function() { FireinputTableMgr.getLastUpdate(); }, 2000);  
          }
   
          if(name == 'defaultInputMethod')
          {
             this.imeSelect(); 
          } 
       }

    }, 
   
    
    changeAutomaticUpdateInterval: function(interval)
    {
       fireinputPrefSave('tableUpdateInterval', interval); 
       FireinputUtils.notify(null, "fireinput-table-update-request", null);
    }, 
   
    initAutomaticUpdateInteval: function()
    {
       var intervalInHour = fireinputPrefGetDefault("tableUpdateInterval");
       options = document.getElementById('tableUpdateInterval'); 
       for (var i = 0; i < options.length; i++)
       {
         if(options[i].value == intervalInHour)
         {
            options[i].selected = true; 
            break; 
         }
       }
    }, 

    getLastUpdate: function()
    {
       var lastupdate = fireinputPrefGetDefault("lastTableUpdate");
       if(lastupdate.length <= 0)
       { 
          $('#lastTableUpdate').html('自动更新还没被执行过'); 
          return; 
       } 

       var current = new Date(lastupdate);
       var year  = current.getFullYear();
       var month = current.getMonth();
       var day =  current.getDate();
       var hour =  current.getHours();
       var minute =  current.getMinutes();

       var lastupdatestr = year + "年" + (month+1) + "月" + day + "日 " + hour + "点" + minute + "分";

       $('#lastTableUpdate').html(lastupdatestr);
    }, 

    updateTableNow: function(button)
    {
       // enable running icon 
       $('#lastTableUpdate').html('更新中...'); 
       
       button.style.display = "none";
       $('#updateNowImg').css("display", ""); 
       FireinputUtils.notify(null, "fireinput-table-update-request", '1');
    }, 

    uploadFrame: function(cb) 
    {
       var n = 'f' + Math.floor(Math.random() * 99999);
       var d = document.createElement('div');
       d.innerHTML = '<iframe style="display:none" src="about:blank" id="'+n+'" name="'+n+'" onload="TableMgr.uploadLoaded(\''+n+'\')"></iframe>';
       document.body.appendChild(d);
       var i = document.getElementById(n);
       if (cb && typeof(cb.onComplete) == 'function') {
           i.onComplete = cb.onComplete;
       }

       return n;
    },

    uploadForm: function(targetForm, name)
    {
       targetForm.setAttribute('target', name); 
    }, 

    uploadFile: function(targetForm)
    {
       if(!this.imageFileValid)
       { 
          this.showAddFileMessage(false, "图案还没有成功显示或不合法的图像文件"); 
          return false; 
       }

       var self = this; 

       var cb = { 
           onStart: function() { self.uploadFileCheckImage(); }, 
           onComplete: function(p) { self.uploadFileComplete(p); }
       }; 

       this.uploadForm(targetForm, this.uploadFrame(cb)); 
       if (cb && typeof(cb.onStart) == 'function') {
            return cb.onStart();
        } else {
            return true;
        } 
    }, 

    uploadLoaded : function(id) 
    {
        var i = document.getElementById(id);
        if (i.contentDocument) {
            var d = i.contentDocument;
        } else if (i.contentWindow) {
            var d = i.contentWindow.document;
        } else {
            var d = window.frames[id].document;
        }
        if (d.location.href == "about:blank") {
            return;
        }

        if (typeof(i.onComplete) == 'function') {
            i.onComplete(d.body.innerHTML);
        }
    },


    /********** all functions for adding add new word *********/

    imeSelect: function()
    {
        var schema = fireinputPrefGetDefault("defaultInputMethod");
        options = document.newWordForm.imetype; 
        switch(schema)
        { 
           case CANGJIE_5:
           case WUBI_98:
           case WUBI_86:
             $("#newWordForm").fadeOut("fast", function() { 
                        $("#newWordError").fadeIn("fast"); 
             }); 
           break; 
           case SMART_PINYIN: 
             $("#newWordError").hide();
             $("#newWordForm").show();
             for (var i = 0; i < options.length; i++)  
             {
               if(options[i].value == schema)
                  options[i].selected = true; 
             }
           break; 
        } 
    }, 

    imeChange: function(sel)
    {
        // clear error fist 
        this.showError("&nbsp");
        if(sel.value != SMART_PINYIN)
        {
           $("#keySuggestion").hide(); 
           $("#keyConfirm").hide(); 
        }

        $("#inputkey").show(); 
        $("#inputword").attr("defvalue", ""); 

        $("#freqData").hide(); 
        $("#addNew").removeAttr("disabled"); 
    }, 
 
    checkkey: function(inputkey, imetype)
    {
        var parser = null; 

        switch(imetype)
        {
           case SMART_PINYIN: 
              parser = new PinyinInput(); 
           break; 
           case WUBI_86: 
           case WUBI_98:
              parser = new WubiInput(); 
           break; 
           case CANGJIE_5:
              parser = new Canjie5Input(); 
           break; 
           default: 
              this.showError("对不起,不支持此输入法");
              return false; 
        }
   
       if(!parser.validateInputKey(inputkey))
       {
           this.showError("输入键含有不合法的字母");
           return false; 
       }
 
       var list = parser.parseKeys(inputkey); 
       if(!list)
       {
           errstr = "读入输入键失败"; 
           if(imetype == WUBI_86 || imetype == WUBI_98)
             errstr += ", 五笔输入键最多是四键";

           this.showError(errstr);
           return false; 
       }
 
       if(typeof(list) == 'string')
           return list; 
   
       var s = "";
       for(var i=0; i<list.length; i++)
       {
          s += list[i].key + " ";
       }
       return s; 
    }, 

    showError: function(error)
    {
       $("#formError").html(error);
    },

    checkWord: function()
    {
       var inputword = document.newWordForm.inputword.value; 
       var inputkey = document.newWordForm.inputkey.value; 

       // clear error fist 
       this.showError("&nbsp");
       if(!inputword)
       {
          this.showError("词组不能是空");
          return false; 
       }

       if(inputword.length < 2)
       {
          this.showError("词组必须至少两个字");
          return false; 
       }

       if(inputkey.length <= 0)
       {
          this.showError("输入键不能是空");
          return false; 
       }


       return true; 
    }, 

    addToLocal: function()
    {
        var imetype = document.newWordForm.imetype.value; 
        var inputword = document.newWordForm.inputword.value; 
        var inputkey = document.newWordForm.inputkey.value; 
        var hiddennumtoneinputkey = document.newWordForm.hiddennumtoneinputkey.value; 
        var hiddenchartoneinputkey = document.newWordForm.hiddenchartoneinputkey.value; 

        if(!this.checkWord())
           return false; 

        var schema = fireinputPrefGetDefault("defaultInputMethod");
        var notification = 0; 
        switch(imetype)
        {
           case CANGJIE_5:
             notification = (schema == imetype) ? 1 : 0; 
           case WUBI_98:
           case WUBI_86:
             notification = (schema == imetype) ? 1 : 0; 
           break;
           case SMART_PINYIN: 
             notification = (schema <= SMARTABC_SHUANGPIN) ? 1 : 0; 
           break; 
        }

        // we need to see whether user has modify the input keys 
        inputkey = FireinputUtils.trimString(inputkey); 
        if(inputkey.length <= 0)
        {
           this.showError("输入键不能是空");
           return false; 
        }

        // choose user input if there is a change 
        if(inputkey == hiddenchartoneinputkey)
           inputkey = hiddennumtoneinputkey; 

        // valid and send notification 
        if(notification)
        {
           try {
              var gs =  FireinputXPC.getService("@fireinput.com/fireinput;1", "nsIFireinput");
              var ime = gs.getChromeWindow().getFireinput().getCurrentIME();
              ime.storeOneUpdatePhrase(inputword + "0:" + inputkey);  
              this.showError("<div style='margin-left: 8px; color: green'>成功加入</div>");
           }
           catch(e)
           {
              this.showError("Fail to add: " + e);
           }   
        }
    }, 


    addToServer: function()
    {
        var imetype = document.newWordForm.imetype.value; 
        var inputword = document.newWordForm.inputword.value; 
        var keyconfirmvalue = document.newWordForm.keyconfirmvalue; 
        var hiddennumtoneinputkey = document.newWordForm.hiddennumtoneinputkey.value; 

        if(!this.checkWord()) 
           return false; 

        // take keyconfirmvalue #keyConfirm is displayed 
        // other use inputkey as real one 
        var result = ($("#keyConfirm").css("display") != "none" && keyconfirmvalue) ? keyconfirmvalue.value : hiddennumtoneinputkey; 
        if(!result || result.length <= 0)
        {
           this.showError("输入键不能是空"); 
           return false; 
        }

        // check whether username and email are given after keyconfirmvalue is provided 
        if($("#keyConfirm").css("display") != "none" && $("#userInfoData").css("display") != "none")
        {
           var guestname = document.newWordForm.realname.value; 
           var email = document.newWordForm.email.value; 
           if(guestname.length <= 0 || email.length <= 0)
           {
              this.showError("你还没有登录, 请提供笔名和邮箱"); 
              return; 
           }

           var guestdefname = document.newWordForm.realname.defvalue; 
           var defemail = document.newWordForm.email.defvalue; 

           // keep it in pref for later reuse. 
           if(guestdefname != guestname)
             fireinputPrefSave("serverGuestName", guestname); 
           if(email != defemail)
             fireinputPrefSave("serverGuestId", email); 

           this.addWordServer(inputword, imetype, result, guestname, email);
           return; 
       }

       // send to server 
       this.addWordServer(inputword, imetype, result);

       return true; 
    },


    addWordServer: function(inputword, imetype, inputkey, guestname, email)
    {
       var params = "inputword="+encodeURIComponent(inputword) + "&inputkey="+encodeURIComponent(inputkey) + "&imetype=" + imetype;
       if(guestname && email)
       {
          params += "&name=" + encodeURIComponent(guestname) + "&email=" + encodeURIComponent(email);
       }

       var url = "/table/addnew.php";
       var ajax = new Ajax();
       var self = this; 
       ajax.setOptions(
        {
          method: 'post',
          postBody: params,
          contentType: 'application/x-www-form-urlencoded',
          onSuccess: function(p) { self.addWordServerSuccess(p); self.disableButton("addNewServer", false);},
          onFailure: function(p) { self.addWordServerFailure(p); self.disableButton("addNewServer", false);}
        });

       this.disableButton("addNewServer", true);
       ajax.request(SERVER_URL + url);
   },

   addWordServerSuccess: function(p)
   {
       try 
       {
         var jsonMsg = JSON.parse(p.responseText);
         switch(jsonMsg.step)
         {
            case '1': 
              // success 
              this.showError("<div style='margin-left: 8px; color: green'>成功加入</div>");

              // just leave inputword in place 
              var inputword = $("#inputword").val(); 
              $("#inputword").val('');
              this.showKeySuggestion(); 
              $("#inputword").val(inputword);
            break; 
            case '2': 
            case '3': 
               this.showConfirmForm(jsonMsg); 
            break; 
         }
       }
       catch(e) { this.showError(e);}

   },

   addWordServerFailure: function(p)
   {
       try 
       {
         var jsonMsg = JSON.parse(p.responseText); 
         if(jsonMsg.errCode == 1)
         {
            this.showError(jsonMsg.errMsg); 
         }
         else if (jsonMsg.errCode == 2)
         {
            // the word exists
            this.showError("词组已存在"); 
         }
       }
       catch(e) { this.showError(e); }
   },

   showConfirmForm: function(data)
   {
       $("#keySuggestion").hide();
       $("#keyConfirmData").html("");
       $("#freqData").hide(); 
       $("#addNew").removeAttr("disabled"); 
       $("#toggleKeySuggestion").hide(); 

       if(typeof(data.mnumtone) != 'undefined' && typeof(data.nmnumtone) == 'undefined')
       {
         // only match 
         var html = "<table cellspacing=3 cellpadding=3>";
         html += "<tr><td valign='center'><span>" + data.mchartone +
                  "</span></td><td><input value='" + data.mnumtone + "' name='keyconfirmvalue' type='hidden'></td></tr>";
         $("#keyConfirmData").html(html); 
         $("#confirmChoose").html("选择的输入键:"); 
       }
       else if(typeof(data.mnumtone) != 'undefined' && typeof(data.nmnumtone) != 'undefined')
       {

          var charToneKeyList = data.nmchartone.split(",");
          var numToneKeyList =  data.nmnumtone.split(",");
          var html = "<table cellspacing=3 cellpadding=3>";

          html += "<tr><td colspan=2 valign='center'><span><select name='keyconfirmvalue'>";
          for(var i=0; i<charToneKeyList.length; i++)
          {
             if(data.mchartone == charToneKeyList[i])
             {
                html += "<option value='" + numToneKeyList[i] +
                  "' selected>" + charToneKeyList[i] + "</option>";
             }
             else 
                html += "<option value='" + numToneKeyList[i] +
                  "'>" + charToneKeyList[i] + "</option>";

          }
          data += "</select></td></tr>";

          html += "</table>";
          $("#keyConfirmData").html(html);
          $("#confirmChoose").html("请选择正确的键:"); 
        }

        // user information form is displayed 
        if(data.step == 2)
        {
           document.newWordForm.realname.value = fireinputPrefGetDefault("serverGuestName"); 
           document.newWordForm.realname.defvalue = document.newWordForm.realname.value; 
           document.newWordForm.email.value = fireinputPrefGetDefault("serverGuestId"); 
           document.newWordForm.email.defvalue = document.newWordForm.email.value; 
           $("#userInfoData").show(); 
        }
        else 
           $("#userInfoData").hide(); 

        $("#keyConfirm").show();   
        $("#inputkey").hide();   
   },

   showKeySuggestion: function()
   {
       var inputword = document.newWordForm.inputword.value; 
       var imetype = document.newWordForm.imetype.value; 

       // only do key suggestion for pinyin 
       if(imetype != SMART_PINYIN)
          return false; 
 
       if($("#inputword").attr("defvalue") == inputword)
          return; 
 
       if(this.ischecking == true)
          return;
   
       this.ischecking = true; 

       $("#freqData").hide();
       $("#addNew").removeAttr("disabled"); 
       $("#keyConfirm").hide(); 
       $("#keySuggestion").hide(); 
       $("#inputkey").show(); 

       // reset input key to prepare for suggestion keys 
       document.newWordForm.inputkey.value = ''; 

       // reset defvalue to to use new inputword 
       $("#inputword").attr("defvalue", ''); 

       //keep key suggestion silent 
       if(!inputword || inputword.length < 2)
       {
          this.ischecking = false; 
          return false; 
       }

       // query the key suggestion 
       var url = "/table/getpinyinkey.php";

       var params = "inputword="+encodeURIComponent(inputword);
       var ajax = new Ajax();
       var self = this; 
       ajax.setOptions(
        {
          method: 'post',
          postBody: params,
          contentType: 'application/x-www-form-urlencoded',
          onSuccess: function(p) { FireinputTableMgr.addKeySuggestion(p); self.ischecking = false;},
          onFailure: function(p) { alert(p.responseText);  $("#inputword").attr("defvalue", ""); self.ischecking = false;},
        });

       ajax.request(SERVER_URL + url);

   },


   addKeySuggestion: function(p)
   {
       if(p.responseText.length <= 0)
          return; 

       var inputword = document.newWordForm.inputword.value; 
       $("#inputword").attr("defvalue", inputword); 
       try {
          var jsonMsg = JSON.parse(p.responseText); 
          var charToneKeyList = jsonMsg.chartone.split(","); 
          var numToneKeyList = jsonMsg.numtone.split(","); 
          var fcharTone = jsonMsg.fchartone; 
          var fnumTone = jsonMsg.fnumtone; 
          if(!fcharTone || !fnumTone)
          {
             fnumTone = numToneKeyList[0]; 
             fcharTone = charToneKeyList[0]; 
          }

          var data = "<table cellspacing=3 cellpadding=3>"; 

          if(charToneKeyList.length > 1)
          {
            data += "<tr><td colspan=2 valign='center'><span><select id='myselect' onchange='FireinputTableMgr.keySuggestionChange(this)'>"; 
            for(var i=0; i<charToneKeyList.length; i++)
            {
               data += "<option value='" + numToneKeyList[i] + 
                  "'>" + charToneKeyList[i] + "</option>"; 
            }
            data += "</select></td></tr>";
          }

          data += "</table>"; 
          $("#keySuggestionData").html(data); 
     
          // add suggestion into inputkey textbox 
          document.newWordForm.inputkey.value = fcharTone; 
          document.newWordForm.hiddennumtoneinputkey.value = fnumTone;
          document.newWordForm.hiddenchartoneinputkey.value = fcharTone;
          if(charToneKeyList.length > 1)
          {
             $("#toggleKeySuggestion").show(); 
          }
          else 
          {
             $("#toggleKeySuggestion").hide(); 
          }

        }
        catch(e) {dump(e + "\n");}

   },

   keySuggestionChange: function(option)
   {
        document.newWordForm.inputkey.value = option.options[option.selectedIndex].text;
        document.newWordForm.hiddennumtoneinputkey.value = option.value; 
        document.newWordForm.hiddenchartoneinputkey.value = document.newWordForm.inputkey.value; 
   },

   disableButton: function(button, flag)
   {
       var id = document.getElementById(button); 
       if(flag)
       {
         id.setAttribute("oldtype", id.type); 
         id.type = "image"; 
         id.src="chrome://fireinput/skin/loading.gif"; 
         id.disabled = true; 
       }
       else
       {
         id.type = id.hasAttribute("oldtype") ? id.getAttribute("oldtype") : "button"; 
         id.disabled = false; 
       }
   },
 
   importToLocal: function()
   {
       var localfile = $("#importFile").val(); 
       var remotefile  = $("#webLink").val(); 
       if(localfile.length <= 0 && remotefile.length <= 0)
       {
          $("#formError").html("Nothing to be imported"); 
          $("#formError").show(); 
          return false; 
       }

       if(localfile.length> 0)
       {
          this.importLocalTableFile(localfile); 
       }

       if(remotefile.length > 0)
       {
          this.importRemoteTableFile(remotefile); 
       }

       return true; 
   }, 

   importLocalTableFile: function(localfile)
   {
       alert(Fireinput.getCurrentIME()); 
   },

   importRemoteTableFile: function(remotefile)
   {
       // getspt.php

   }

}; 

