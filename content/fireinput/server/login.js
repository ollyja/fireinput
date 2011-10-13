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

Fireinput.serverLogin = 
{
    checkUserLogon: function(loginCallback)
    {
       var ajax = new Fireinput.util.ajax();
       if(!ajax)
          return;
       var self = this;
         
       ajax.setOptions(
          {
             method: 'get',
             onSuccess: function(p) { self.checkUserLogonSuccess(p, loginCallback); },
             onFailure: function(p) { self.checkUserLogonFailure(p); }
          });
       ajax.request(Fireinput.SERVER_URL + "/account/logon_info.php"); 
    },
      
    checkUserLogonSuccess: function(p, loginCallback)
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
       handle.textContent = "您好! " + jsonResp.name; 
       handle = document.getElementById("logonUserBox");
       handle.style.display = ""; 

       handle = document.getElementById("logonForm"); 
       handle.style.display = "none";

       handle = document.getElementById("logonButton");
       handle.setAttribute("image", "");

       handle = document.getElementById("logonLink"); 
       handle.style.display = "none";

       // we are ready to issue loginCallback now 
       if(loginCallback)
         setTimeout(function() { loginCallback();}, 200);  
    },

    checkUserLogonFailure: function(p)
    {

       var handle = document.getElementById("logonUser");
       handle.textContent = "";

       handle = document.getElementById("logonUserBox");
       handle.style.display = "none";

    }, 

    toggleLogonForm: function(event)
    {
       var handle = document.getElementById("logonForm"); 
       if(handle.style.display != "none")
       {
         handle.style.display = "none";
         return; 
       }
       var ajax = new Fireinput.util.ajax();
       if(!ajax)
          return;

       var self = this;
       var px = event.pageX - 400; 
       var py = event.pageY+1; 
       var target = event.target; 
       target.oldInnerHTML = target.innerHTML; 
       Fireinput.util.emptyNode(target); 
       target.appendChild(Fireinput.util.parseHTML(document, '<img src="chrome://fireinput/skin/loading.gif"/>')); 
       ajax.setOptions(
          {
             method: 'get',
             onSuccess: function(p) { self.showLogonFormSuccess(p, px, py,target); },
             onFailure: function(p) { self.showLogonFormFailure(p, px, py,target); }
          });
       ajax.request(Fireinput.SERVER_URL + "/account/logon_form_simple.php");
    },
 
    showLogonFormSuccess: function(p, px, py,target)
    {
       Fireinput.util.emptyNode(target); 
       target.appendChild(Fireinput.util.parseHTML(document, target.oldInnerHTML)); 

       var handle = document.getElementById("logonSeed");
       handle.value =  p.responseText; 
       $("#logonForm").css("left", px);
       $("#logonForm").css("top", py);
       $("#logonForm").css("height", '8em');
       $("#logonForm").show(); 
    }, 

    showLogonFormFailure: function(p, px, py,target)
    {
       Fireinput.util.emptyNode(target); 
       target.appendChild(Fireinput.util.parseHTML(document, target.oldInnerHTML)); 
       $("#logonForm").css("left", px);
       $("#logonForm").css("top", py);
       $("#logonForm").css("height", 50);
       $("#logonForm").html("<div style='margin: 10px; color:red'>无法显示登录网页，连接火输网站失败</div>"); 
       $("#logonForm").show(); 
    },

    logon: function(event, loginCallback)
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
       setTimeout(function(){self.loginServer(loginCallback); }, 1000); 
       return false; 
    },

    loginServer: function(loginCallback)
    {

       var email = document.getElementById("logonEmail").value; 
       var password = document.getElementById("logonPasswd").value; 
       var seed = document.getElementById("logonSeed").value; 
       var salt = password.substr(Math.floor(password.length/2),password.length);
       var md5hex1 = Fireinput.md5.hex_hmac_md5(password, salt);
       var md5hex2 = Fireinput.md5.hex_hmac_md5(md5hex1, seed);
       var url = "/account/logon_user.php";
       var params = "email="+email + "&password="+md5hex2;

       var ajax = new Fireinput.util.ajax();
       var self = this; 
       ajax.setOptions(
        {
          method: 'post',
          postBody: params,
          contentType: 'application/x-www-form-urlencoded',
          onSuccess: function(p) { self.loginServerSuccess(p, loginCallback); },
          onFailure: function(p) { self.loginServerFailure(p); }
        });
       ajax.request(Fireinput.SERVER_URL + url);
    },

    loginServerSuccess: function(p, loginCallback)
    {
       var handle = document.getElementById("logonButton");
       handle.type = "button";
       handle.src = ""; 
       this.checkUserLogon(loginCallback); 
    }, 

    loginServerFailure: function(p)
    {
       var handle = document.getElementById("logonMessage"); 
       handle.textContent="登录失败，您输入的邮箱或密码不正确"; 

       handle = document.getElementById("logonButton");
       handle.type = "button";
       handle.src = ""; 
    }, 

}; 

