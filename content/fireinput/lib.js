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

function bind()
{
    var args = cloneArray(arguments), fn = args.shift(), object = args.shift();
    return function() { return fn.apply(object, arrayInsert(cloneArray(args), 0, arguments)); }
}

this.bindFixed = function()
{
    var args = cloneArray(arguments), fn = args.shift(), object = args.shift();
    return function() { return fn.apply(object, args); } 
};  

function extend(d, s)
{
   for (var property in s) {
     d[property] = s[property];
   }
   return d; 
}


function cloneArray(array, fn)
{
    var newArray = [];

    if (fn)
       for (var i = 0; i < array.length; ++i)
          newArray.push(fn(array[i]));
    else
       for (var i = 0; i < array.length; ++i)
          newArray.push(array[i]);

    return newArray;
}

function extendArray(array, array2)
{
    var newArray = [];
    newArray.push.apply(newArray, array);
    newArray.push.apply(newArray, array2);
    return newArray;
}

function arrayInsert(array, index, other)
{
    for (var i = 0; i < other.length; ++i)
       array.splice(i+index, 0, other[i]);

    return array;
}

function createCookie(name,value,days) 
{
    if (days) {
       var date = new Date();
       date.setTime(date.getTime()+(days*24*60*60*1000));
       var expires = "; expires="+date.toGMTString();
    }
    else 
       var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) 
{
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
       var c = ca[i];
       while (c.charAt(0)==' ') c = c.substring(1,c.length);
       if (c.indexOf(nameEQ) == 0) 
          return c.substring(nameEQ.length,c.length);
    }
    return null;
}

