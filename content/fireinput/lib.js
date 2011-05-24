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

Fireinput.extend = function(d, s)
{
   for (var property in s) {
     d[property] = s[property];
   }
   return d; 
};


Fireinput.cloneArray = function(array, fn)
{
    var newArray = [];

    var len = array.length; 
    if (fn)
       for (var i = 0; i < len; ++i)
          newArray[newArray.length] = fn(array[i]);
    else
       for (var i = 0; i < len; ++i)
          newArray[newArray.length] = array[i];

    return newArray;
};

Fireinput.extendArray = function(array, array2)
{
    var newArray = [];
    newArray.push.apply(newArray, array);
    newArray.push.apply(newArray, array2);
    return newArray;
};

Fireinput.arrayInsert = function(array, index, other)
{
    var len = other.length; 
    for (var i = 0; i < len; ++i)
       array.splice(i+index, 0, other[i]);

    return array;
};

Fireinput.inArray = function(array, value) {
   for (var i = 0; i < array.length; i++) {
      if (array[i] == value) return true;
   }
   return false;
};


