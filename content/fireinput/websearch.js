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
Fireinput.namespace("Fireinput.webSearch");

Fireinput.webSearch = 
{
    debug: 1, 

    load: function()
    {
       var idf = document.getElementById("fireinputField");

       var composeWord = Fireinput.composer.getComposeWord(); 
       this.loadWebSearch(composeWord.word + " " + idf.value);
    }, 
 
    loadByMouse: function(searchstr)
    {
       // var composeWord = Fireinput.composer.getComposeWord(); 
       this.loadWebSearch(searchstr);
    },

    loadWebSearch: function(searchstr)
    {
       var params = "cx=015497061412694894056:riuiwerbis0&q="+encodeURIComponent(searchstr);
       params += "&sa=Search";
       url = "http://www.google.com/cse?" + params;
       Fireinput.log.debug(this, url);
       Fireinput.imePanel.hideAndCleanInput();
       Fireinput.util.loadURI(url); 
    },

    goSearchbox: function(event)
    {
       // check enter key 
       if(event.keyCode == KeyEvent.DOM_VK_RETURN) 
       {
          this.searchWeb(); 
          return; 
       }

       // check enter key 
       if(event.keyCode == KeyEvent.DOM_VK_ESCAPE) 
       {
          var handle = document.getElementById("fireinputSearchbox");
          handle.value = "";
          return; 
       }
    },

    searchWeb: function()
    {
      var handle = document.getElementById("fireinputSearchbox");
      this.loadWebSearch(handle.value);       
    },

    focusSearchbox: function()
    {
      var handle = document.getElementById("fireinputSearchbox");
      handle.focus(); 
    }, 

    searchboxOnFocus: function(event)
    {
      event.target.select(); 
    }
      
}; 
