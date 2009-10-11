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

const SERVER_URL = "http://www.fireinput.com/"; 
var EmotionMgr = 
{
    imageFileValid: false, 

    userEmotionList:  [], 

    showMyEmotions: false,

    limitnum: 10,

    startindex: 0,

    selectedpage: 0, 

    initTab: function(tabid)
    {
       var handle = document.getElementById("addFileCommand"); 
       if(tabid == 1)
          handle.style.display = ""; 
       else    
          handle.style.display = "none"; 
       // command for browserFile panel 
       handle = document.getElementById("browseFileCommand");
       if(tabid == 2)
       {
          handle.style.display = ""; 
       }
       else    
          handle.style.display = "none"; 
    }, 

    notify: function()
    {
       var os = Components.classes["@mozilla.org/observer-service;1"]
                       .getService(Components.interfaces.nsIObserverService);
       os.notifyObservers(null, "fireinput-user-emotion-changed", null);
       return true;
    },
   
    clearAddFileMessage: function()
    {
       var handle = document.getElementById("addFileMessage");
       handle.innerHTML = "";

    },

    showAddFileMessage: function(flag, message)
    {
       var handle = document.getElementById("addFileMessage");
       handle.style.color = "green";
       if(!flag)
       {
          handle.style.color = "red";
       }

       handle.innerHTML = message; 
    }, 
          
    addFileOnFocus: function(event)
    {
       this.clearAddFileMessage(); 
    },

    addFileOnInput: function(event)
    {
       var handle = document.getElementById("uploadForm");
       var imageUrl = "";
       if(handle.style.display != "none")
       {
          var id = document.getElementById("uploadFileValue");
          imageUrl = "file://" + id.value;
       }
       else
       {
          var id = document.getElementById("addFileValue");
          imageUrl = id.value; 
       }

       this.clearAddFileMessage(); 

       var imgHandle = document.getElementById("addFileShowImage");
       imgHandle.style.display = "none";
       this.imageFileValid = false; 
       imgHandle.onload = bind(function(event) 
                               {
                                  this.imageFileValid = true; 
                                  imgHandle.style.display = "";
                               }, this); 

       imgHandle.src = imageUrl;
    },

    addFileIntoList: function()
    {
       if(!this.imageFileValid)
       {
          this.showAddFileMessage(false, "图案还没有成功显示或不合法的链接"); 
          return; 
       }

       var id = document.getElementById("addFileValue");
       var imageUrl = id.value;
       if(FireinputEmotionUpdater.save(imageUrl))
       {
          this.notify(); 
          this.showAddFileMessage(true, "图案成功加入网络图案菜单");
       }
       else
          this.showAddFileMessage(false, "图案加入失败－不应该发生，请到火输网站报告错误");
    },

    checkUserLogon: function()
    {
       var ajax = new Ajax();
       if(!ajax)
          return;
       var self = this;
         
       ajax.setOptions(
          {
             method: 'get',
             onSuccess: function(p) { self.checkUserLogonSuccess(p); },
             onFailure: function(p) { self.checkUserLogonFailure(p); }
          });
       ajax.request(SERVER_URL + "/account/logon_info.php"); 
    },
      
    checkUserLogonSuccess: function(p)
    {
       if(!p || p.responseText.length <= 0)
       {
          this.checkUserLogonFailure(p); 
          return;
       }

       var jsonResp;
       try {
          jsonResp = JSON.parse(p.responseText);
       }
       catch(e) 
       {
          this.checkUserLogonFailure(p); 
          return;
       };

       if(typeof(jsonResp) == 'undefined')
       {
          this.checkUserLogonFailure(p); 
          return;
       } 
       
       var handle = document.getElementById("logonUser");
       handle.innerHTML = "您好! " + jsonResp.name; 
       handle = document.getElementById("logonUserBox");
       handle.style.display = ""; 

       handle = document.getElementById("logonForm"); 
       handle.style.display = "none";

       handle = document.getElementById("logonButton");
       handle.setAttribute("image", "");

       handle = document.getElementById("logonLink");
       handle.style.display = "none";

       // my upload 
       handle = document.getElementById("showMyUpload");
       handle.style.display = ""; 
    },

    checkUserLogonFailure: function(p)
    {

       var handle = document.getElementById("logonUser");
       handle.innerHTML = "";

       handle = document.getElementById("logonUserBox");
       handle.style.display = "none";

       handle = document.getElementById("showMyUpload");
       handle.style.display = "none"; 
    }, 

    showAddFileForm: function(nothidden)
    {
       var handle = document.getElementById("addFileHelp"); 
       if(nothidden)
          handle.style.display = ""; 
       else 
          handle.style.display = "none"; 
       handle = document.getElementById("addForm");
       if(nothidden)
          handle.style.display = ""; 
       else 
          handle.style.display = "none"; 
    }, 

    cleanUploadForm: function()
    {
       this.imageFileValid = false; 
       var handle = document.getElementById("uploadFileValue"); 
       handle.value = "";

       this.clearAddFileMessage(); 

       var imgHandle = document.getElementById("addFileShowImage");
       imgHandle.style.display = "none";
       imgHandle.setAttribute("src", "");
    }, 

    toggleUploadForm: function()
    {
       this.cleanUploadForm(); 

       var handle = document.getElementById("uploadLinkBox");
       if(handle.style.display != "none")
       {
         handle.style.display = "none";
         handle = document.getElementById("uploadForm");
         handle.style.display = "none";
         handle = document.getElementById("uploadLink");
         handle.innerHTML = "上传"; 

         this.showAddFileForm(true);     
         return;
       }

       handle.style.display = "";
       handle = document.getElementById("uploadLink");
       handle.innerHTML = "取消上传"; 

       handle = document.getElementById("needLogonHelp");
       handle.style.display = document.getElementById("logonUserBox").style.display == "none" ? "":"none";

       handle = document.getElementById("uploadForm");
       handle.style.display = "";
       this.showAddFileForm(false);     
    },


    toggleLogonForm: function(event)
    {
       var handle = document.getElementById("logonForm"); 
       if(handle.style.display != "none")
       {
         handle.style.display = "none";
         return; 
       }
       var ajax = new Ajax();
       if(!ajax)
          return;

       var self = this;
       var px = event.pageX - 400; 
       var py = event.pageY+1; 
       ajax.setOptions(
          {
             method: 'get',
             onSuccess: function(p) { self.showLogonFormSuccess(p, px, py); },
             onFailure: function(p) { self.showLogonFormFailure(p, px, py); }
          });
       ajax.request(SERVER_URL + "/account/logon_form_simple.php");
    },
 
    showLogonFormSuccess: function(p, px, py)
    {
       var handle = document.getElementById("logonSeed");
       handle.value =  p.responseText; 
       $("#logonForm").css("left", px);
       $("#logonForm").css("top", py);
       $("#logonForm").css("height", 150);
       $("#logonForm").show(); 
    }, 

    showLogonFormFailure: function(p, px, py)
    {
       $("#logonForm").css("left", px);
       $("#logonForm").css("top", py);
       $("#logonForm").css("height", 50);
       $("#logonForm").html("<div style='margin: 10px; color:red'>无法显示登录网页，连接火输网站失败</div>"); 
       $("#logonForm").show(); 
    },

    logon: function(event)
    {
       // check enter key 
       if(event && event.keyCode!=13)
             return true; 
       var handle = document.getElementById("logonMessage"); 
       handle.value=""; 

       handle = document.getElementById("logonButton");
       handle.type = "image";
       handle.src = "chrome://fireinput/skin/loading.gif"; 
       var self = this; 
       setTimeout(function(){self.logonServer(); }, 1000); 
       return false; 
    },

    logonServer: function()
    {

       var email = document.getElementById("logonEmail").value; 
       var password = document.getElementById("logonPasswd").value; 
       var seed = document.getElementById("logonSeed").value; 
       var salt = password.substr(Math.floor(password.length/2),password.length);
       var md5hex1 = hex_hmac_md5(password, salt);
       var md5hex2 = hex_hmac_md5(md5hex1, seed);
       var url = "/account/logon_user.php";
       var params = "email="+email + "&password="+md5hex2;

       var ajax = new Ajax();
       var self = this; 
       ajax.setOptions(
        {
          method: 'post',
          postBody: params,
          contentType: 'application/x-www-form-urlencoded',
          onSuccess: function(p) { self.logonServerSuccess(p); },
          onFailure: function(p) { self.logonServerFailure(p); }
        });
       ajax.request(SERVER_URL + url);
    },

    logonServerSuccess: function(p)
    {
       var handle = document.getElementById("logonButton");
       handle.type = "button";
       handle.src = ""; 
       this.checkUserLogon(); 
    }, 

    logonServerFailure: function(p)
    {
       var handle = document.getElementById("logonMessage"); 
       handle.innerHTML="登录失败，您输入的邮箱或密码不正确"; 

       handle = document.getElementById("logonButton");
       handle.type = "button";
       handle.src = ""; 
    }, 

    goToPage: function(url)
    {
       var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow); 
       var gBrowser = mainWindow.top.document.getElementById("content");
       if(gBrowser)
           gBrowser.selectedTab = gBrowser.addTab(url); 
       else
           window.open(url); 
    }, 

   
    uploadFileCheckImage: function()
    {
       if(!this.imageFileValid)
       { 
          this.showAddFileMessage(false, "图案还没有成功显示或不合法的图像文件"); 
          return false; 
       }
       
       return true; 

    }, 

    uploadFileComplete: function(response)
    {
       /* the reponse should be valud URL */
       if(!response || response.length <= 0 || !/^http:\/\//.test(response))
       {
          this.showAddFileMessage(false, "图案没有成功上传，火输网站现在可能不能够处理您的上传，请稍后再试"); 
          return; 
       }    

       if(FireinputEmotionUpdater.save(response))
       {
          this.notify();
          this.showAddFileMessage(true, "图案成功上传并已加入到网络图案菜单");
       }
       else
          this.showAddFileMessage(false, "图案加入失败－不应该发生，请到火输网站报告错误");

    },

    uploadFrame: function(cb) 
    {
       var n = 'f' + Math.floor(Math.random() * 99999);
       var d = document.createElement('div');
       d.innerHTML = '<iframe style="display:none" src="about:blank" id="'+n+'" name="'+n+'" onload="EmotionMgr.uploadLoaded(\''+n+'\')"></iframe>';
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


    updateUserEmotionList: function(checkbox, emotionurl)
    {
       // clean up the save file message 
       this.showSaveFileMessage(true, "<font color='#E76539'>您所作的更改还未保存</font>");

       for (var i=this.userEmotionList.length-1; i>=0; i--)
       {
          if(this.userEmotionList[i].url == emotionurl)
          {
             if(checkbox.checked)
               this.userEmotionList[i].saved = true; 
             else 
               this.userEmotionList[i].saved = false; 

             return; 
          }
       }

       if(checkbox.checked)
          this.userEmotionList[this.userEmotionList.length] = {url: emotionurl, saved: true}; 
    }, 


    getUserEmotionURL: function(str)
    {
       this.userEmotionList[this.userEmotionList.length] = { url: str, saved: true};
    },

    loadCurrentEmotions: function()
    {
       // load local list 
       var ios = FireinputXPC.getIOService(); 
       var fileHandler = ios.getProtocolHandler("file")
                         .QueryInterface(Components.interfaces.nsIFileProtocolHandler);

       var path = FireinputUtils.getAppRootPath();
       var datafile = fileHandler.getFileFromURLSpec(path + "/useremotion.fireinput");
       this.userEmotionList.length = 0;
       if(!datafile.exists())
       {
          // initialize the pagination 
          this.showCurrentEmotions(); 
          return;
       }

       var options = {
          caller: this,
          oncomplete: this.showCurrentEmotions,
          onavailable: this.getUserEmotionURL
       };
       FireinputStream.loadDataAsync(datafile, options);
    },

    showCurrentEmotions: function()
    {
       var handle = document.getElementById("browseFileList"); 
       var pageinfo = {}; 
       pageinfo.page = this.userEmotionList; 
       pageinfo.electedpage=0; 

       if(this.userEmotionList.length <= 0)
       {
          this.showBrowseFileMessage(true, "您还没有加入图案");
          this.disableBrowseSaveButton(true);
       }
       else
       {
          this.showBrowseFileMessage(true, "");
          this.disableBrowseSaveButton(false);
       }

       this.showSaveFileMessage(true, "");
       Pagination.buildPages(pageinfo, 'pagecontent', 'paginatioplink', this.limitnum); 

    }, 
   
    getCheckedStatus: function(emotionurl)
    {
       for (var i=this.userEmotionList.length-1; i>=0; i--)
       {
          if(this.userEmotionList[i].url == emotionurl)
          {
             return this.userEmotionList[i].saved; 
          }
       }

       return false; 
    }, 

    showMimeOrAll: function(flag)
    {
       this.showMyEmotions = flag;
       // reload  
       this.loadServerEmotions(); 
    }, 

    loadServerNextPages: function(sindex,spage)
    {
       this.startindex = sindex; 
       this.selectedpage = spage; 
       // reload  
       this.loadServerEmotions(); 
    }, 

    loadServerEmotions: function()
    {
       var ajax = new Ajax();
       if(!ajax)
          return;

       var self = this;

       var url = SERVER_URL + "/emotions/viewlist.php?"; 
       url += "startindex=" + this.startindex + "&limitnum=" + this.limitnum; 
       if(this.showMyEmotions)
          url += "&showmine=true"; 
       ajax.setOptions(
          {
             method: 'get',
             onSuccess: function(p) { self.loadServerEmotionSuccess(p); },
             onFailure: function(p) { self.loadServerEmotionFailure(p); }
          });
       ajax.request(url);
    }, 

    loadServerEmotionSuccess: function(p)
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

       this.showBrowseFileMessage(true, "");
       this.showSaveFileMessage(true, "");
       this.disableBrowseSaveButton(false);
       Pagination.buildRemotePages(jsonArray.totalcount, jsonArray.urllist, this.selectedpage, 'pagecontent', 'paginatioplink', this.limitnum); 
    }, 

    loadServerEmotionFailure: function(p)
    {
       this.showBrowseFileMessage(false, "连接火输网站失败");
       this.showSaveFileMessage(true, "");
       this.disableBrowseSaveButton(true);
       Pagination.buildRemotePages(0, null, 0, 'pagecontent', 'paginatioplink', this.limitnum); 
       return; 
    },
 
    showBrowseFileMessage: function(flag, message)
    {
       var handle = document.getElementById("browseFileMessage");
       handle.style.color = "green";
       if(!flag)
       {
          handle.style.color = "red";
       }

       handle.innerHTML = message;
    },

    showSaveFileMessage: function(flag, message)
    {
       var handle = document.getElementById("saveFileMessage");
       handle.style.color = "green";
       if(!flag)
       {
          handle.style.color = "red";
       }

       handle.innerHTML = message;
    },

    saveFileToList: function()
    {
       if(FireinputEmotionUpdater.save(this.userEmotionList, 'overwrite'))
       {
          this.notify();
          this.showSaveFileMessage(true, "您所作的更改已成功保存");
          // refresh the page 
          this.loadCurrentEmotions();      
       }
       else
          this.showSaveFileMessage(false, "保存更改－不应该发生，请到火输网站报告错误");
    },

    disableBrowseSaveButton: function(flag)
    {
       var handle = document.getElementById("updateButton");
       handle.disabled = flag; 
    }


}; 

