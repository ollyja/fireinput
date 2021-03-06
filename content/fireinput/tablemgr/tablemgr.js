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

Fireinput.namespace("Fireinput.tableMgr"); 

Fireinput.tableMgr.keyInput = function() { this.init(); };

Fireinput.tableMgr.keyInput.prototype = 
{
    pinyinTones: ["ā", "á", "ă", "à", "ō", "ó", "ǒ", "ò", "ū", "ú", "ǔ", "ù", 
                  "ī", "í", "ǐ", "ì", "ē", "é", "ě", "è", "ǖ", "ǘ", "ǚ", "ǜ"],
    pinyinInitials: [],
    pinyinFinals: [],
    pinyinTones: [], 
    init: function()
    {
      for(var i=0; i<Fireinput.PinyinInitials.length; i++)
         this.pinyinInitials[Fireinput.PinyinInitials[i]] = Fireinput.PinyinInitials[i];

       for(var i=0; i<Fireinput.PinyinFinals.length; i++)
         this.pinyinFinals[Fireinput.PinyinFinals[i]] = Fireinput.PinyinFinals[i];

       for(var i=0; i<this.pinyinTones.length; i++)
         this.pinyinTones[this.pinyinTones[i]] = this.pinyinTones[i];
    }
}

Fireinput.tableMgr.pinyinInput = function() { }
Fireinput.tableMgr.pinyinInput.prototype = Fireinput.extend(new Fireinput.tableMgr.keyInput(), 
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
         pinyinKey.type = keyInitialLen>0 ? Fireinput.KEY_FULL : Fireinput.KEY_FINAL;
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
                pinyinKey.type = keyInitialLen>0 ? Fireinput.KEY_FULL : Fireinput.KEY_FINAL;
                pinyinKey.pos = keyInitialLen + i;
                return pinyinKey;
             }
          }
       }

       return ({key: keyInitial, type: Fireinput.KEY_INITIAL, pos: keyInitialLen});
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
                 Fireinput.arrayInsert(keys, keys.length, retArray.slice(0, retArray.length));
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
                    keys.push({key: key2, type: Fireinput.KEY_INITIAL});

                 break;
              }
              var pinyinKey = this.parseOneKey(key2, finals);
              if(pinyinKey.type == Fireinput.KEY_INITIAL)
              {
                 // No finals. Store them each one as Initial
                    keys.push({key: key2, type: Fireinput.KEY_INITIAL});
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
                 keys.push({key: key1, type: Fireinput.KEY_INITIAL});
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
                 keys.push({key: pinyinKey.key, type: Fireinput.KEY_FINAL});
                 i += pinyinKey.pos;
              }
          }
       }
       return keys;
    }
              
}); 

Fireinput.tableMgr.wubiInput = function() {}
Fireinput.tableMgr.wubiInput.prototype = Fireinput.extend(new Fireinput.tableMgr.keyInput(),
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

Fireinput.tableMgr.cangjie5Input = function() {}
Fireinput.tableMgr.cangjie5Input.prototype = Fireinput.extend(new Fireinput.tableMgr.keyInput(),
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

Fireinput.tableMgr.zhengmaInput = function() {}
Fireinput.tableMgr.zhengmaInput.prototype = Fireinput.extend(new Fireinput.tableMgr.keyInput(),
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


Fireinput.tableMgr = Fireinput.extend(Fireinput.tableMgr, {
    imageFileValid: false, 

    selectedpage: 0, 

    init: function()
    {
       Fireinput.serverLogin.checkUserLogon(); 
       this.initAutomaticUpdateInteval();
       this.getLastUpdate();   
       this.initObserver(); 
       this.imeSelect(); 
    }, 

    initTab: function(tabid)
    {
       // importWord 
       if(tabid == 3)
       {
          // load the available tables for download to install 
          this.loadDownloadTableList(); 
          this.loadImportedTableList(); 
       }

    }, 

    initObserver: function()
    {
       Fireinput.util.pref.addObserver(this, false);
    }, 

    observe: function(subject, topic, data)
    {
       if(topic == "nsPref:changed" && typeof(Fireinput.prefDomain) != 'undefined')
       {
          var name = data.substr(Fireinput.prefDomain.length+1);
          if(name == 'lastTableUpdate')
          {
             $('#lastTableUpdate').html('自动更新完成...');
             $('#updateNowButton').show(); 
             $('#updateNowImg').hide(); 

             setTimeout(function() { Fireinput.tableMgr.getLastUpdate(); }, 2000);  
          }
   
          if(name == 'defaultInputMethod')
          {
             this.toggleImportHelp(); 
             this.imeSelect(); 
             this.loadDownloadTableList(); 
             this.loadImportedTableList(); 
          } 

          if(name == 'hiddenInputMethod') 
          {
            this.initNetTableInstall();
          }
       }

    }, 
   
    
    changeAutomaticUpdateInterval: function(interval)
    {
       Fireinput.pref.save('tableUpdateInterval', interval); 
       Fireinput.util.notify(null, "fireinput-table-update-request", null);
    }, 
   
    initAutomaticUpdateInteval: function()
    {
       var intervalInHour = Fireinput.pref.getDefault("tableUpdateInterval");
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
       var lastupdate = Fireinput.pref.getDefault("lastTableUpdate");
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
       Fireinput.util.notify(null, "fireinput-table-update-request", '1');
    }, 

    uploadFrame: function(cb) 
    {
       var n = 'f' + Math.floor(Math.random() * 99999);
       var d = document.createElement('div');

       var f = document.createElement('iframe');
       f.setAttribute("type", "content");
       f.setAttribute("src", "about:blank");
       f.setAttribute("id", n);
       f.setAttribute("name", n);
       f.addEventListener("load", function() { Fireinput.tableMgr.uploadLoaded(n); }, false);
       f.style.display = "none";

       d.appendChild(f);
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
        var schema = Fireinput.pref.getDefault("defaultInputMethod");
        $("#newWordError").hide();
        $("#newWordForm").show();
        switch(schema)
        { 
           case Fireinput.ZHENGMA:
             $("#importZhengmaFormat").show();
             $("#addNewServer").attr("disabled", true);
           break; 
           case Fireinput.CANGJIE_5:
             $("#importCanjieFormat").show();
             $("#addNewServer").attr("disabled", true);
           break; 
           case Fireinput.SMART_PINYIN: 
             $("#importPinyinFormat").show();
             $("#addNewServer").attr("disabled", false);
           break; 
           case Fireinput.ZIGUANG_SHUANGPIN: 
           case Fireinput.MS_SHUANGPIN: 
           case Fireinput.CHINESESTAR_SHUANGPIN: 
           case Fireinput.SMARTABC_SHUANGPIN: 
             $("#importPinyinFormat").show();
           break; 
           case Fireinput.WUBI_98:
           case Fireinput.WUBI_86:
             $("#addNewServer").attr("disabled", true);
             $("#importWubiFormat").show();
           break; 
           default: 
             $("#newWordForm").fadeOut("fast", function() { 
                        $("#newWordError").fadeIn("fast"); 
             }); 
           break; 
        }
 
        options = document.newWordForm.imetype; 
        for (var i = 0; i < options.length; i++)  
        {
           if(options[i].value == schema)
           {
              options[i].selected = true; 
              options[i].disabled = false; 
           }
           else 
              options[i].disabled = true; 
        }
    }, 

    imeChange: function(sel)
    {
        // clear error fist 
        this.showError("&nbsp");
        if(sel.value != Fireinput.SMART_PINYIN)
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
           case Fireinput.SMART_PINYIN: 
              parser = new this.pinyinInput(); 
           break; 
           case Fireinput.WUBI_86: 
           case Fireinput.WUBI_98:
              parser = new this.wubiInput(); 
           break; 
           case Fireinput.CANGJIE_5:
              parser = new this.canjie5Input(); 
           break; 
           case Fireinput.ZHENGMA:
              parser = new this.zhengmaInput(); 
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
           if(imetype == Fireinput.WUBI_86 || imetype == Fireinput.WUBI_98)
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

        var schema = Fireinput.pref.getDefault("defaultInputMethod");
        var notification = 0; 
        switch(imetype)
        {
           case Fireinput.ZHENGMA:
           case Fireinput.CANGJIE_5:
           case Fireinput.WUBI_98:
           case Fireinput.WUBI_86:
             notification = (schema == imetype) ? 1 : 0; 
           break;
           case Fireinput.SMART_PINYIN: 
             notification = (schema <= Fireinput.SMARTABC_SHUANGPIN) ? 1 : 0; 
           break; 
        }

        // we need to see whether user has modify the input keys 
        inputkey = Fireinput.util.trimString(inputkey); 
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
              var ime = Fireinput.util.getCurrentIME(); 
              ime.storeUserAddPhrase(Fireinput.util.unicode.convertFromUnicode(inputword), inputkey, 0); 
              this.showError("<div style='margin-left: 8px; color: green'>成功加入</div>");
           }
           catch(e)
           {
              this.showError("Fail to add: " + e);
              return false;
           }   
        }
        return true; 
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
              return false; 
           }

           var guestdefname = document.newWordForm.realname.defvalue; 
           var defemail = document.newWordForm.email.defvalue; 

           // keep it in pref for later reuse. 
           if(guestdefname != guestname)
             Fireinput.pref.save("serverGuestName", guestname); 
           if(email != defemail)
             Fireinput.pref.save("serverGuestId", email); 

           this.addWordServer(inputword, imetype, result, guestname, email);
           return true; 
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
       var ajax = new Fireinput.util.ajax();
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
       ajax.request(Fireinput.SERVER_URL + url);
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
           document.newWordForm.realname.value = Fireinput.pref.getDefault("serverGuestName"); 
           document.newWordForm.realname.defvalue = document.newWordForm.realname.value; 
           document.newWordForm.email.value = Fireinput.pref.getDefault("serverGuestId"); 
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
       if(imetype != Fireinput.SMART_PINYIN)
          return; 
 
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
          return; 
       }

       // query the key suggestion 
       var url = "/table/getpinyinkey.php";

       var params = "inputword="+encodeURIComponent(inputword);
       var ajax = new Fireinput.util.ajax();
       var self = this; 
       ajax.setOptions(
        {
          method: 'post',
          postBody: params,
          contentType: 'application/x-www-form-urlencoded',
          onSuccess: function(p) { Fireinput.tableMgr.addKeySuggestion(p); self.ischecking = false;},
          onFailure: function(p) { $("#inputword").attr("defvalue", ""); self.ischecking = false;}
        });

       ajax.request(Fireinput.SERVER_URL + url);

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
            data += "<tr><td colspan=2 valign='center'><span><select id='myselect' onchange='Fireinput.tableMgr.keySuggestionChange(this)'>"; 
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

          document.newWordForm.realname.value = Fireinput.pref.getDefault("serverGuestName"); 
          document.newWordForm.realname.defvalue = document.newWordForm.realname.value; 
          document.newWordForm.email.value = Fireinput.pref.getDefault("serverGuestId"); 
          document.newWordForm.email.defvalue = document.newWordForm.email.value; 
          $("#userInfoData").show(); 
          $("#keyConfirm").show();   

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

   /* import functions */
   toggleImportHelp: function()
   {
      $("#importPinyinFormat").hide(); 
      $("#importWubiFormat").hide(); 
      $("#importCanjieFormat").hide(); 
      $("#importZhengmaFormat").hide(); 
   }, 

   loadImportedTableList: function()
   {
       $("#importedArea").hide();
       var html =  '<table cellspacing=0 cellpadding=5 border=0 width="70%" bgcolor="#eee">'; 
       html +=  '<tr style="font-weight: 700"><td width="50%">火输字库</td><td width="20%">最后更新</td><td></td></tr>'; 
       var len = html.length; 
       var getlist = function(tablelink, tablename, signature, last_updated)
       {
          if(tablename && signature && last_updated)
          {
             html += "<tr><td><a target='_blank' href='" + tablelink + "'>" + tablename + "</a></td>"; 
             html += "<td>" + last_updated + "</td>"; 
             html += "<td><input type='button' value='卸载' onclick='return Fireinput.tableMgr.uninstallTableFile(event,\"" + signature + "\")'>";
             html += "<span id='uninstallError' class='errorMsg' style='margin-left: 10px'></span></td>";
             html += "</tr>"; 
          }
          else if(html.length > len)
          {
             html +=  "</table>"; 
             $("#importedLinks").html(html);
             $("#importedArea").show();
          }
       }

       Fireinput.importer.getImportList(getlist);
   }, 
 
   loadDownloadTableList: function()
   {
      // only show pinyin phrase list 
      $("#downloadLinkArea").hide(); 

      var schema = Fireinput.pref.getDefault("defaultInputMethod");
  
      // only support pinyin now
      if(schema > Fireinput.SMARTABC_SHUANGPIN)
         return;

      var ajax = new Fireinput.util.ajax();
       if(!ajax)
         return;

       var self = this;

       var url = Fireinput.SERVER_URL + "/table/getspt.php?";
       ajax.setOptions(
          {
             method: 'get',
             onSuccess: function(p) { self.loadDownloadTableListSuccess(p); }
          });
       ajax.request(url);
   }, 

   loadDownloadTableListSuccess: function(p)
   {
       if(!p)
          return;
       if(p.responseText.length <= 0)
          return;

       var jsonArray;
       try {
          jsonArray = JSON.parse(p.responseText);
       }
       catch(e) { };

       if(typeof(jsonArray) == 'undefined')
          return;

       if(jsonArray.length <= 0)
          return; 

       var html =  '<table cellspacing=0 cellpadding=5 border=0 width="70%" bgcolor="#eee">'; 
       html +=  '<tr style="font-weight: 700"><td width="50%">火输字库</td><td width="20%">最后更新</td><td></td></tr>'; 

       for(var i=0; i<jsonArray.length; i++)
       {
          var link = Fireinput.SERVER_URL + jsonArray[i][1]; 
          html += "<tr><td><a target='_blank' href='" + link + "'>" + jsonArray[i][0] + "</a></td>"; 
          html += "<td>" + FireinputTime.prettyDate(jsonArray[i][2]) + "</td>"; 
          html += "<td><input type='button' value='安装' onclick='return Fireinput.tableMgr.importRemoteTableFile(event,\"" + link + "\"," + "\"" + jsonArray[i][0] + "\")'>";
          html += "<span id='installError' class='errorMsg' style='margin-left: 10px'></span></td>";
          html += "</tr>"; 
       }
       html +=  "</table>"; 
 
       $("#downloadLinks").html(html); 
       $("#downloadLinkArea").show(); 
   }, 

   importToLocal: function()
   {
       var localfile = $("#importFile").val(); 
       if(localfile.length <= 0)
       {
          $("#importFormError").html("Nothing to be imported").show(); 
          return false; 
       }

       this.importLocalTableFile(localfile); 

       return true; 
   }, 

   importLocalTableFile: function(localfile)
   {

       setTimeout(function() { Fireinput.importer.storePhraseFromLocal(localfile)}, 500);
       $("#importFile").hide(); 
       $("#importLoading").show(); 
       this.importTimer = setInterval(function() { 
                                var percent = Fireinput.importer.getStorePhrasePercent();  
                                if(percent >=0)
                                {  
                                   $("#importPercent").html("<span style='margin-right: 8px; color: green'>" + percent+"%</span>"); 
                                   $("#importPercent").show();
                                }
                                else {
                                   clearInterval(Fireinput.tableMgr.importTimer);
                                   $("#importFile").show(); 
                                   $("#importLoading").hide(); 
                                   $("#importFormError").html("<div style='margin-left: 8px;'>导入失败</div>"); 
                                }
                                if(percent >= 100) { 
                                   clearInterval(Fireinput.tableMgr.importTimer);
                                   // commit 
                                   Fireinput.importer.flushExtPhraseTable();
                                   // remember history 
                                   Fireinput.importer.updateHistory("file://" + localfile, localfile);

                                   $("#importFile").show(); 
                                   $("#importPercent").hide();
                                   $("#importLoading").hide(); 
                                   $("#importFormError").html("<div style='margin-left: 8px; color: green'>成功导入</div>");

                                   // reload imported list. need to settimeout because updateHistory is just done
                                   setTimeout(function() { Fireinput.tableMgr.loadImportedTableList()}, 1000); 
                                 }
                             }, 1000); 
   },

   importRemoteTableFile: function(e, remotefile, tablename)
   {
      var ajax = new Fireinput.util.ajax();
       if(!ajax)
          return;

       var self = this;
       ajax.setOptions(
          {
             method: 'get',
             onSuccess: function(p) { self.installRemoteTableFile(e, p, remotefile, tablename); },
             onFailure: function() { self.installRemoteTableFile(e); }
          });
       ajax.request(remotefile);
   },

   installRemoteTableFile: function(e, p, remotefile, tablename)
   {
       if(!p || p.responseText.length <= 0)
       {
          $("#installError", e.target.parentNode).html("<span>导入失败</span>");
          return;
       }

       var lines = p.responseText.split(/\r\n|\r|\n/);
       var signature = Fireinput.md5.hex_md5(tablename);
       Fireinput.importer.processPhraseFromRemote(lines, p.responseText.length, signature);
       var ptarget = e.target.parentNode; 
       var ohtml = ptarget.innerHTML; 
    
       Fireinput.util.emptyNode(ptarget);
       this.importTimer = setInterval(function() {
                                var percent = Fireinput.importer.getStorePhrasePercent();
                                if(percent >=0)
                                {
                                   ptarget.appendChild(Fireinput.util.parseHTML(document, "<span style='margin-right: 8px; color: green'>" + percent+"%</span><img  src='chrome://fireinput/skin/loading.gif'/>"));
                                }
                                else {
                                   clearInterval(Fireinput.tableMgr.importTimer);
                                   ptarget.appendChild(Fireinput.util.parseHTML(document, ohtml));
                                   $("#installError", ptarget).html("<span>导入失败</span>");
                                }
                                if(percent >= 100) {
                                   // commit 
                                   Fireinput.importer.flushExtPhraseTable();
                                   // remember history 
                                   Fireinput.importer.updateHistory(remotefile, tablename);
                                   clearInterval(Fireinput.tableMgr.importTimer);
                                   ptarget.appendChild(Fireinput.util.parseHTML(document, ohtml));
                                   $("#installError", ptarget).html("<span style='color:green'>成功导入</span>");

                                   // reload imported list 
                                   setTimeout(function() { Fireinput.tableMgr.loadImportedTableList()}, 1000); 
                                 }
                             }, 1000);

   }, 

   uninstallTableFile: function(event, signature)
   {
       var ptarget = event.target.parentNode; 
       var ohtml = ptarget.innerHTML; 

       var deleted = function()
       {
          Fireinput.util.emptyNode(ptarget); 
          ptarget.appendChild(Fireinput.util.parseHTML(document, ohtml));  
          Fireinput.tableMgr.loadImportedTableList();
       }; 
 
       setTimeout(function() { Fireinput.importer.deleteExtPhraseTable(signature, deleted)}, 1000);
       Fireinput.util.emptyNode(ptarget); 
       ptarget.appendChild(Fireinput.util.parseHTML(document, "<img src='chrome://fireinput/skin/loading.gif'/>"));
   }, 

   /* handles network table installation */
   showInputMethodSetting: function()
   {
       var gs =  Fireinput.util.xpc.getService("@fireinput.com/fireinput;1", "nsIFireinput");
       var fi = gs.getChromeWindow().getFireinput(); 
       fi.main.showInputMethodSetting();
   }, 

   initNetTableInstall: function()
   {
       var supportIMEList = Fireinput.pref.getDefault("inputMethodList");
       //For Dev Mode 
       if(supportIMEList == '%IME_LIST%') 
            supportIMEList = "1,2,3,4,5,6,7,8,9";

       supportIMEList = supportIMEList ? supportIMEList.split(",") : [];
       var hideIMEList = Fireinput.pref.getDefault("hiddenInputMethod") || ""; 
       hideIMEList = hideIMEList.split(",");

       for (var s in supportIMEList) {
         if(Fireinput.inArray(hideIMEList,supportIMEList[s])) {
            $("#ime" + supportIMEList[s]).hide();
            continue; 
         }

         var ime = null; 
         var id = supportIMEList[s];
         if(id == Fireinput.ZIGUANG_SHUANGPIN || id == Fireinput.MS_SHUANGPIN || id == Fireinput.CHINESESTAR_SHUANGPIN ||
            id == Fireinput.SMARTABC_SHUANGPIN)
            id = Fireinput.SMART_PINYIN; 

         switch (id) {
            case Fireinput.SMART_PINYIN:
               var ime = new Fireinput.smartPinyinEngine(); 
            break; 
            case Fireinput.WUBI_86: 
            case Fireinput.WUBI_98: 
               var ime = new Fireinput.wubiEngine();
            break; 
            case Fireinput.CANGJIE_5: 
               var ime = new Fireinput.cangjieEngine();
            break; 
            case Fireinput.ZHENGMA: 
               var ime = new Fireinput.zhengmaEngine();
            break; 
         }

         if(ime != null && $("#ime" + id).css("display") == "none") {
            ime.setSchema(id);
            if(ime.hasNetTableFile()) {
               $("#ime" + id + " input").attr("value", "已安装, 卸载?").css("color", "red").attr("schema", id).unbind("click").click(function(e) {
                  Fireinput.tableMgr.uninstallNetTable(e);
               }); 
            }
            else if(!ime.hasTableFile()){
               $("#ime" + id + " input").attr("value", "安装").attr("schema", id).unbind("click").click(function(e) {
                  Fireinput.tableMgr.installNetTable(e);
               });
            }
            else {
               $("#ime" + id + " input").attr("value", "系统字库").attr("disabled", "disabled");
            }

            $("#ime" + id).show(); 
         }
       }
   }, 

   installNetTable: function(event)
   {
     var target = $(event.target); 
     var schema = target.attr("schema");
     var ajax = new Fireinput.util.ajax();
       if(!ajax)
          return;

     var self = this;
     ajax.setOptions(
          {
             method: 'get',
             onSuccess: function(p) { self.saveNetTableFile(target, p); },
             onFailure: function() { self.saveNetTableFile(target); }
          });
     ajax.request(Fireinput.SERVER_URL + "table/getnetspt.php?s=" + encodeURIComponent(schema));
   },

   saveNetTableFile: function(target, p)
   {
     if(!p || p.responseText.length <= 0)
     {
        target.parent().append("<span class='errorMsg'>安装失败</span>");
        return;
     }

     var jsonArray;
     try {
         jsonArray = JSON.parse(p.responseText);
     }
     catch(e) { };

     if(typeof(jsonArray) == 'undefined')
         return;

     if(jsonArray.length <= 0)
         return;

     var ptarget = target.parent();
     var ohtml = ptarget.html();

     ptarget.html("<img  src='chrome://fireinput/skin/loading.gif'/>");

     var item = jsonArray.shift(); 
     this.saveNetTableFileStep(item, jsonArray, function(s) {
        if(s) {
          ptarget.html(ohtml);
          ptarget.append("<span style='margin-left: 5px; color:green'>成功安装</span>");
          target.unbind("click");
          // reload IME 
          var gs =  Fireinput.util.xpc.getService("@fireinput.com/fireinput;1", "nsIFireinput");
          var fi = gs.getChromeWindow().getFireinput(); 
          fi.main.reloadIME();

        } 
        else {
          ptarget.html(ohtml);
          ptarget.append("<span style='margin-left: 5px;' class='errorMsg'>安装失败</span>");
        }  
     }); 
   }, 

   saveNetTableFileStep: function(item, next, cb) {
     var ajax = new Fireinput.util.ajax();
       if(!ajax) {
          cb.call(this, false);
          return;
       }

     var self = this;
     ajax.setOptions(
          {
             method: 'get',
             onSuccess: function(p) {   
                  data = Fireinput.util.unicode.getUnicodeString(p.responseText);
                  if(item[2].indexOf(Fireinput.md5.hex_md5(data)) == -1) {
                     cb.call(this, false);
                  }

                  var file = Fireinput.util.getUserFile(item[0]); 
                  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                          .createInstance(Components.interfaces.nsIFileOutputStream);
                  fos.init(file, 0x02 | 0x08 | 0x20, 0664, 0);
                  var charset = "UTF-8";
                  var cos = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                         .createInstance(Components.interfaces.nsIConverterOutputStream);
                  cos.init(fos, charset, 0, 0x0000);
                  cos.writeString(data); 
                  cos.close();
                  if(next.length > 0) {
                     item = next.shift(); 
                     self.saveNetTableFileStep(item, next, cb); 
                  }
                  else {
                     cb.call(this, true); 
                  }          
                  
              },
             onFailure: function(p) {  cb.call(this, false); }
          });
     ajax.request(Fireinput.SERVER_URL + item[1] + "/" + item[0]); 
   }, 

   uninstallNetTable: function(event)
   {
     var target = $(event.target); 
     var schema = target.attr("schema");
     switch(schema) {
        case Fireinput.SMART_PINYIN:
            var ime = new Fireinput.smartPinyinEngine();
            ime.getNetPinyinDataFile().remove(false); 
            ime.getNetPinyinPhraseFile().remove(false);
        break;
        case Fireinput.WUBI_86:
            var ime = new Fireinput.wubiEngine();
            ime.getNetWubi86File().remove(false);
        break; 
        case Fireinput.WUBI_98:
            var ime = new Fireinput.wubiEngine();
            ime.getNetWubi98File().remove(false);
        break;
        case Fireinput.CANGJIE_5:
            var ime = new Fireinput.cangjieEngine();
            ime.getNetCangjie5File().remove(false);
        break;
        case Fireinput.ZHENGMA:
            var ime = new Fireinput.zhengmaEngine();
            ime.getNetZhengmaFile().remove(false);
        break;
     }

     var ptarget = target.parent();
     ptarget.append("<span style='margin-left: 5px; color:green'>成功卸载</span>"); 

     // update page 
     $("#ime" + schema + " input").attr("value", "安装").css("color", "#000").unbind('click').click(function(e) {
        Fireinput.tableMgr.installNetTable(e);
     });
   }

}); 


