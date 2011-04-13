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
Fireinput.pagination = {

    buildPages: function(pageinfo, divId, paginateId, numPerPage)
    {
       this.pageinfo = pageinfo; 
       this.divId = divId; 
       this.numPerPage = numPerPage; 
       var  mod = (this.pageinfo.page.length % this.numPerPage !=0) ? 1 : 0; 
       this.totalPages = parseInt(this.pageinfo.page.length / this.numPerPage) + mod; 
       this.paginateId = paginateId; 
       var initialpage = (pageinfo.selectedpage<this.totalPages)? pageinfo.selectedpage : 0; 
       this.buildPagination(initialpage)
       this.selectPage(initialpage)
     
    }, 

    buildRemotePages: function(totalRemoteCount, remotePages, selectedPage, divId, paginateId, numPerPage)
    {
       this.divId = divId;
       this.numPerPage = numPerPage;
       this.remotePages = remotePages; 
       var mod = (totalRemoteCount % numPerPage != 0) ? 1 : 0;
       this.totalRemotePages = parseInt(totalRemoteCount / numPerPage) + mod; 
       this.paginateId = paginateId;

       this.startPage = 0; 
       if (!this.remotePages || this.remotePages.length <= 0)
          var paginateHTML="" 
       else
       { //construct pagination interface
          var paginateHTML='<div class="pagination"><ul>\n'
          paginateHTML+='<li><a href="#previous" rel="'+(selectedPage-1)+'">&lt</a></li>\n'
          var i = (selectedPage -5) > 0 ? selectedPage -5 : 0;
          var endi = selectedPage + 5; 
          this.startPage = i; 
          for(; i<this.totalRemotePages && i<endi; i++)
          {
               paginateHTML+='<li><a href="#page'+(i+1)+'" rel="'+i+'">'+(i+1)+'</a></li>\n'
          }
          paginateHTML+='<li><a href="#next" rel="'+(selectedPage+1)+'">&gt</a></li>\n'
          paginateHTML+='</ul></div>'
       }

       var paginatediv=document.getElementById(this.paginateId);
       paginatediv._currentpage=selectedPage - this.startPage; 
       paginatediv.innerHTML=paginateHTML;
       var pageinstance=this;
       paginatediv.onclick=function(e){
            var targetobj=e.target;
            if (targetobj.tagName=="A" && targetobj.getAttribute("rel")!=""){
               if (!/disabled/i.test(targetobj.className))
               {
                   var ipage = parseInt(targetobj.getAttribute("rel")); 
                   Fireinput.emotionMgr.loadServerNextPages(ipage * pageinstance.numPerPage, ipage); 
               }
	    }
            return false; 
       }; 
     
       this.selectRemotePage(selectedPage - this.startPage);
    }, 

    buildPagination: function(selectedpage)
    {
       if (!this.pageinfo || this.pageinfo.page.length <= 0)
          var paginateHTML="" 
       else
       { //construct pagination interface
          var paginateHTML='<div class="pagination"><ul>\n'
          paginateHTML+='<li><a href="#previous" rel="'+(selectedpage-1)+'">&lt</a></li>\n'
          for (var i=0; i<this.totalPages; i++)
          {
             paginateHTML+='<li><a href="#page'+(i+1)+'" rel="'+i+'">'+(i+1)+'</a></li>\n'
          }
          paginateHTML+='<li><a href="#next" rel="'+(selectedpage+1)+'">&gt</a></li>\n'
          paginateHTML+='</ul></div>'
       }

       var paginatediv=document.getElementById(this.paginateId);
       paginatediv._currentpage=selectedpage; 
       paginatediv.innerHTML=paginateHTML;
       var pageinstance=this;
       paginatediv.onclick=function(e){
            var targetobj=e.target;
            if (targetobj.tagName=="A" && targetobj.getAttribute("rel")!=""){
               if (!/disabled/i.test(targetobj.className))
               {
                   pageinstance.selectPage(parseInt(targetobj.getAttribute("rel"))); 
               }
	    }
            return false; 
       }; 
    },

    selectPage: function(selectedpage)
    {
       if(!this.pageinfo || this.pageinfo.page.length <= 0)
       { 
          var pagecontentdiv = document.getElementById(this.divId);
          pagecontentdiv.innerHTML = ""; 
          return; 
       }
 
       var sindex = selectedpage * this.numPerPage; 
     
       var paginateHTML='<div>\n'
       paginateHTML += "<div class='pagerowtitle'><span class='pageimgtitle'>网络图案(已加入)</span>";
       paginateHTML += "<span class='pagecheckboxtitle'>选择</span></div>"; 
       for(var i=sindex; i<sindex+this.numPerPage && i<this.pageinfo.page.length; i++)
       {
          paginateHTML += "<div class='pagerow'>";
          paginateHTML += "<span class='pageimg' title='" + this.pageinfo.page[i].url + "' onclick='Fireinput.emotionMgr.goToPage(\"" + this.pageinfo.page[i].url + "\")'>"; 
          paginateHTML += "<img width='32px' height='32px' src='" + this.pageinfo.page[i].url + "'/></span>";
          paginateHTML += "<span class='pagecheckbox'>";
          var shouldchecked = this.pageinfo.page[i].saved ? this.pageinfo.page[i].saved : Fireinput.emotionMgr.getCheckedStatus(this.pageinfo.page[i].url);
          var checked = shouldchecked ? "checked": ""; 
            paginateHTML += "<input type='checkbox' " + checked + "' onclick='Fireinput.emotionMgr.updateUserEmotionList(this, \"" + this.pageinfo.page[i].url + "\")'/></span></div>"; 
         
       }
       paginateHTML += "</div>";

       var prevlinkoffset=1; 
       var paginatediv=document.getElementById(this.paginateId); 
       var paginatelinks=paginatediv.getElementsByTagName("a"); 
       var pagecontentdiv = document.getElementById(this.divId);
       pagecontentdiv.innerHTML = paginateHTML; 
       if(paginatelinks.length <=0)
          return; 

       paginatelinks[0].className=(selectedpage==0)? "prevnext disabled" : "prevnext"; 
       paginatelinks[0].setAttribute("rel", selectedpage-1); 
       paginatelinks[paginatelinks.length-1].className=(selectedpage==this.totalPages-1)? "prevnext disabled" : "prevnext"; 
       paginatelinks[paginatelinks.length-1].setAttribute("rel", selectedpage+1); 
       paginatelinks[paginatediv._currentpage+prevlinkoffset].className=""; 
       paginatelinks[selectedpage+prevlinkoffset].className="currentpage"; 
       paginatediv._currentpage=selectedpage; 
    }, 

    selectRemotePage: function(selectedpage)
    {
       var sindex = 0; 
     
       if(!this.remotePages || this.remotePages.length <= 0)
       {
          var pagecontentdiv = document.getElementById(this.divId);
          pagecontentdiv.innerHTML = ""; 
          return; 
       } 

       var paginateHTML='<div>\n'
       paginateHTML += "<div class='pagerowtitle'><span class='pageimgtitle'>网络图案</span>";
       paginateHTML += "<span class='pagecheckboxtitle'>选择</span></div>"; 

       for(var i=sindex; i<sindex+this.numPerPage && i<this.remotePages.length; i++)
       {
          paginateHTML += "<div class='pagerow'>";
          paginateHTML += "<span class='pageimg'  title='" + this.remotePages[i] + "' onclick='Fireinput.emotionMgr.goToPage(\"" + this.remotePages[i] + "\")'>"; 
          paginateHTML += "<img width='32px' height='32px' src='" + this.remotePages[i] + "'/></span>";
          paginateHTML += "<span class='pagecheckbox'>";
          var shouldchecked = Fireinput.emotionMgr.getCheckedStatus(this.remotePages[i]);
          var checked = shouldchecked ? "checked": ""; 
            paginateHTML += "<input type='checkbox' " + checked + "' onclick='Fireinput.emotionMgr.updateUserEmotionList(this, \"" + this.remotePages[i] + "\")'/></span></div>"; 
         
       }
       paginateHTML += "</div>";

       var prevlinkoffset=1; 
       var paginatediv=document.getElementById(this.paginateId); 
       var paginatelinks=paginatediv.getElementsByTagName("a"); 
       var pagecontentdiv = document.getElementById(this.divId);
       pagecontentdiv.innerHTML = paginateHTML; 
       if(paginatelinks.length <=0)
          return; 

       paginatelinks[0].className=(selectedpage==0)? "prevnext disabled" : "prevnext"; 
       paginatelinks[0].setAttribute("rel", selectedpage + this.startPage - 1); 
       paginatelinks[paginatelinks.length-1].className=((selectedpage+this.startPage)==this.totalRemotePages-1)? "prevnext disabled" : "prevnext"; 
       paginatelinks[paginatelinks.length-1].setAttribute("rel", this.startPage+selectedpage+1); 
       paginatelinks[paginatediv._currentpage+prevlinkoffset].className=""; 
       paginatelinks[selectedpage+prevlinkoffset].className="currentpage"; 
       paginatediv._currentpage=selectedpage; 
    }
}; 
