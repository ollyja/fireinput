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

// Fireinput Component constants 
const CLASS_ID = Components.ID('{b3d34bb1-405f-485d-a11b-39d90de735b4}');
const CLASS_NAME = 'Fireinput Service';
const CONTRACT_ID = '@fireinput.com/fireinput;1';


const SOURCE = 'chrome://fireinput/components/fireinputService.js';
const INTERFACE = Components.interfaces.nsIFireinput; 

const CC = Components.classes;
const CI = Components.interfaces;
const CR = Components.results;

const loader = CC['@mozilla.org/moz/jssubscript-loader;1'].getService(CI.mozIJSSubScriptLoader);

function FireinputService() 
{
    this.wrappedJSObject = this;
    this.objectList = new Array(); 
}

FireinputService.prototype = 
{
    reload: function() 
    {
       loader.loadSubScript(SOURCE, this.__proto__);
    },

    disableIME: function(handle, of)
    {
       if(typeof(this.objectList[handle]) != 'undefined')
       {
          var l = this.objectList[handle]; 
          if(typeof(l[of]) == 'undefined')
             l[of] = true; 
       }
       else 
       {
          this.objectList[handle] = new Array(); 
          this.objectList[handle][of]= true; 
       }
    }, 

    enableIME: function(handle, of)
    {
       if(typeof(this.objectList[handle]) != 'undefined')
       {
          var l = this.objectList[handle]; 
          if(typeof(l[of]) != 'undefined')
             delete l[of]; 
          if(l.length <= 0)
            this.objectList[handle] = null; 
       }
    }, 

    QueryInterface: function(aIID) 
    {
        if(!aIID.equals(INTERFACE) &&
           !aIID.equals(CI.nsISupports))
            throw CR.NS_ERROR_NO_INTERFACE;
        return this;
    }
};

// loader.loadSubScript(SOURCE, Component.prototype);

var FireinputFactory = 
{
    createInstance: function(aOuter, aIID) {

        if(aOuter != null)
            throw CR.NS_ERROR_NO_AGGREGATION;

        return (new FireinputService()).QueryInterface(aIID);
    }
};

var FireinputModule = {
    _firstTime: true,

    registerSelf: function(aCompMgr, aFileSpec, aLocation, aType) 
    {
        if (this._firstTime) 
        {
            this._firstTime = false;
            throw CR.NS_ERROR_FACTORY_REGISTER_AGAIN;
        };
        aCompMgr = aCompMgr.QueryInterface(CI.nsIComponentRegistrar);
        aCompMgr.registerFactoryLocation(
            CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
    },

    unregisterSelf: function(aCompMgr, aLocation, aType) 
    {
        aCompMgr = aCompMgr.QueryInterface(CI.nsIComponentRegistrar);
        aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);
    },

    getClassObject: function(aCompMgr, aCID, aIID) {
        if (!aIID.equals(CI.nsIFactory))
            throw CR.NS_ERROR_NOT_IMPLEMENTED;

        if (aCID.equals(CLASS_ID))
            return FireinputFactory;

        throw CR.NS_ERROR_NO_INTERFACE;        
    },

    canUnload: function(aCompMgr) 
    { 
        return true; 
    }
};

function NSGetModule(aCompMgr, aFileSpec) { return FireinputModule; }

