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

var FireinputConfig = 
{
    loadWindow: function()
    {
       if(window.arguments.length < 2)
          return; 

       var module = window.arguments[0];
       var param = window.arguments[1];
       this.displayInputMethodlist(param);
       this.displayShortKeys();
       this.displayInputInterfaceSetting(); 

       // display tab as requested 
       var tabbox = document.getElementById("fireinputConfigTabbox"); 
       var tab = document.getElementById(module); 
       tabbox.selectedTab = tab; 
    },

    displayInputMethodlist: function(param)
    {
       var list = param.split(",").sort(); 
       var hideIMEList = fireinputPrefGetDefault("hiddenInputMethod") || "";
       var lb = document.getElementById("inputMethodList"); 

       for(var i=0; i<list.length; i++)
       {
          this.createListItem(lb, list[i], false); 
       }

       hideIMEList = hideIMEList.split(",");  
       for(var i=0; i<hideIMEList.length; i++)
       {
          if(hideIMEList[i].length <= 0)
             continue; 
          this.createListItem(lb, hideIMEList[i], true); 
       }
          
    },
    
    createListItem: function(parentEl, imeindex, hidden)
    {
       var item = document.getElementById("listitem_" + imeindex); 
       if(!item)
       {
          item = document.createElement("listitem");
          item.setAttribute("imeindex", imeindex);
          item.setAttribute("id", "listitem_" + imeindex); 
          item.setAttribute("imehidden", hidden);
          item.onclick = bind(function(event) {
                 this.toggleShow(event);
                 }, this);

          var cell = document.createElement("listcell");
          cell.setAttribute("label", FireinputUtils.getIMENameString(imeindex));
          item.appendChild(cell);
          cell = document.createElement("listcell");
          cell.setAttribute("type", "checkbox");
          cell.setAttribute("id", "listcell_" + imeindex);
          cell.setAttribute("imeindex", imeindex);
          item.appendChild(cell);
          if(hidden)
            cell.setAttribute("checked", "false");
          else
            cell.setAttribute("checked", "true");

          parentEl.appendChild(item);
       }
       else
       {
          item.setAttribute("imehidden", hidden);
          var cell = document.getElementById("listcell_" + imeindex);
          if(hidden)
            cell.setAttribute("checked", "false");
          else
            cell.setAttribute("checked", "true");
       }
          
    }, 

    toggleShow: function(e)
    {
        var target = e.target; 
        var imeindex = target.getAttribute("imeindex"); 
        var imehidden = target.getAttribute("imehidden") == "true"; 
        target.setAttribute("imehidden", !imehidden); 
        var cell = document.getElementById("listcell_" + imeindex); 
        cell.setAttribute("checked", imehidden); 

    },

    displayShortKeys: function()
    {
       // display key configuration. If not set, take default value 
       var keyinputboxes = document.getElementsByTagName("keyinputbox");
       for (var i = 0; i < keyinputboxes.length; i++)
       {
          var keyinputbox = keyinputboxes[i];
          keyinputbox.combinedValue = fireinputPrefGetDefault(keyinputbox.getAttribute("option")); 
       }

    },

    displayInputInterfaceSetting: function()
    {
       var ids = ["fireinput.inputbox.fontsize", "fireinput.wordselection.fontsize", "fireinput.wordselection.num"]; 
       for(var i=0; i<ids.length; i++)
       {
          var el = document.getElementById(ids[i]); 
          var elvalue = fireinputPrefGetDefault(el.getAttribute("option"));
          var element = el.getElementsByAttribute("value", elvalue)[0];
          if (element)
             el.selectedItem  = element; 
       }

       ids = ["fireinput.inputbox.fontcolor", "fireinput.wordselection.fontcolor"]; 
       for(var i=0; i<ids.length; i++)
       {
          var el = document.getElementById(ids[i]); 
          var elvalue = fireinputPrefGetDefault(el.getAttribute("option"));
          el.color = elvalue; 
       }
    },

    saveInputInterfaceSetting: function()
    {
       var ids = ["fireinput.inputbox.fontsize", "fireinput.wordselection.fontsize", "fireinput.wordselection.num"];
       for(var i=0; i<ids.length; i++)
       {
          var el = document.getElementById(ids[i]); 
          fireinputPrefSave(el.getAttribute("option"), el.value); 
       }

       ids = ["fireinput.inputbox.fontcolor", "fireinput.wordselection.fontcolor"];
       for(var i=0; i<ids.length; i++)
       {
          var el = document.getElementById(ids[i]);
          fireinputPrefSave(el.getAttribute("option"), el.color);
       }
    }, 

    save: function()
    {
       // get a list of hidden IME list 
       var listcells = document.getElementsByTagName("listcell"); 
       var imeHiddens = []; 
       for (var i = 0; i < listcells.length; i++)
       {
          if(listcells[i].hasAttribute("imeindex") && listcells[i].getAttribute("checked") == "false")
          {
             imeHiddens.push(listcells[i].getAttribute("imeindex")); 
          }
       }
       fireinputPrefSave("hiddenInputMethod", imeHiddens.join(",")); 

       // save key configuration.

       //FIXME: shouldn't have two same keys 
       var keyinputboxes = document.getElementsByTagName("keyinputbox");
       for (i = 0; i < keyinputboxes.length; i++)
       {
           var keyinputbox = keyinputboxes[i];
           fireinputPrefSave(keyinputbox.getAttribute("option"), keyinputbox.combinedValue); 
       }

       // save interface settings 
       this.saveInputInterfaceSetting(); 

       // close the window 
       window.close();
    }
    
}


