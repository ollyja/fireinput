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

Fireinput.version =
{
    checkFirstRun: function()
    {
       var firstrun =  Fireinput.pref.getDefault("firstRun");
       if(firstrun != Fireinput.FIREINPUT_VERSION)
       {
          Fireinput.main.toggleFireinput(); 
          // enable it in first run 
          Fireinput.pref.save("firstRun", Fireinput.FIREINPUT_VERSION); 
          var versionArray = Fireinput.FIREINPUT_VERSION.split('.');
          if(versionArray.length < 2) return; 

          versionArray[versionArray.length-1] = versionArray[versionArray.length-1].match(/^[\d\.]+/g)[0];
          var url  = "http://www.fireinput.com/releases/?version=" + versionArray.join("."); 
          setTimeout(function() { window.openUILinkIn(url, "tab") }, 500);

          // if the version is net, enable table installation page 
          if(/net$/.test(Fireinput.FIREINPUT_VERSION)) {
             setTimeout(function() { window.openUILinkIn("chrome://fireinput/content/tablemgr/installtable.html", "tab") }, 500);
          }
       }
       else if(Fireinput.pref.getDefault("autoLoad"))
       {
          Fireinput.main.toggleFireinput(); 
          // keep in EN mode but leave it open 
          Fireinput.main.setIMEMode(Fireinput.IME_MODE_EN);
       }
    }
}; 

