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

/* the mapping between DOM_VK_* and its value */
var keyCodeMapper=new Object();
keyCodeMapper['3']='CANCEL'
keyCodeMapper['6']='HELP'
keyCodeMapper['8']='BACK_SPACE'
keyCodeMapper['9']='TAB'
keyCodeMapper['12']='CLEAR'
keyCodeMapper['13']='RETURN'
keyCodeMapper['14']='ENTER'
keyCodeMapper['16']='SHIFT'
keyCodeMapper['17']='CONTROL'
keyCodeMapper['18']='ALT'
keyCodeMapper['19']='PAUSE'
keyCodeMapper['20']='CAPS_LOCK'
keyCodeMapper['27']='ESCAPE'
keyCodeMapper['32']='SPACE'
keyCodeMapper['33']='PAGE_UP'
keyCodeMapper['34']='PAGE_DOWN'
keyCodeMapper['35']='END'
keyCodeMapper['36']='HOME'
keyCodeMapper['37']='LEFT'
keyCodeMapper['38']='UP'
keyCodeMapper['39']='RIGHT'
keyCodeMapper['40']='DOWN'
keyCodeMapper['44']='PRINTSCREEN'
keyCodeMapper['45']='INSERT'
keyCodeMapper['46']='DELETE'
keyCodeMapper['48']='0'
keyCodeMapper['49']='1'
keyCodeMapper['50']='2'
keyCodeMapper['51']='3'
keyCodeMapper['52']='4'
keyCodeMapper['53']='5'
keyCodeMapper['54']='6'
keyCodeMapper['55']='7'
keyCodeMapper['56']='8'
keyCodeMapper['57']='9'
keyCodeMapper['59']=';'
keyCodeMapper['61']='='
keyCodeMapper['65']='A'
keyCodeMapper['66']='B'
keyCodeMapper['67']='C'
keyCodeMapper['68']='D'
keyCodeMapper['69']='E'
keyCodeMapper['70']='F'
keyCodeMapper['71']='G'
keyCodeMapper['72']='H'
keyCodeMapper['73']='I'
keyCodeMapper['74']='J'
keyCodeMapper['75']='K'
keyCodeMapper['76']='L'
keyCodeMapper['77']='M'
keyCodeMapper['78']='N'
keyCodeMapper['79']='O'
keyCodeMapper['80']='P'
keyCodeMapper['81']='Q'
keyCodeMapper['82']='R'
keyCodeMapper['83']='S'
keyCodeMapper['84']='T'
keyCodeMapper['85']='U'
keyCodeMapper['86']='V'
keyCodeMapper['87']='W'
keyCodeMapper['88']='X'
keyCodeMapper['89']='Y'
keyCodeMapper['90']='Z'
keyCodeMapper['93']='CONTEXT_MENU'
keyCodeMapper['96']='NUMPAD0'
keyCodeMapper['97']='NUMPAD1'
keyCodeMapper['98']='NUMPAD2'
keyCodeMapper['99']='NUMPAD3'
keyCodeMapper['100']='NUMPAD4'
keyCodeMapper['101']='NUMPAD5'
keyCodeMapper['102']='NUMPAD6'
keyCodeMapper['103']='NUMPAD7'
keyCodeMapper['104']='NUMPAD8'
keyCodeMapper['105']='NUMPAD9'
keyCodeMapper['106']='MULTIPLY'
keyCodeMapper['107']='ADD'
keyCodeMapper['108']='SEPARATOR'
keyCodeMapper['109']='SUBTRACT'
keyCodeMapper['110']='DECIMAL'
keyCodeMapper['111']='DIVIDE'
keyCodeMapper['112']='F1'
keyCodeMapper['113']='F2'
keyCodeMapper['114']='F3'
keyCodeMapper['115']='F4'
keyCodeMapper['116']='F5'
keyCodeMapper['117']='F6'
keyCodeMapper['118']='F7'
keyCodeMapper['119']='F8'
keyCodeMapper['120']='F9'
keyCodeMapper['121']='F10'
keyCodeMapper['122']='F11'
keyCodeMapper['123']='F12'
keyCodeMapper['124']='F13'
keyCodeMapper['125']='F14'
keyCodeMapper['126']='F15'
keyCodeMapper['127']='F16'
keyCodeMapper['128']='F17'
keyCodeMapper['129']='F18'
keyCodeMapper['130']='F19'
keyCodeMapper['131']='F20'
keyCodeMapper['132']='F21'
keyCodeMapper['133']='F22'
keyCodeMapper['134']='F23'
keyCodeMapper['135']='F24'
keyCodeMapper['144']='NUM_LOCK'
keyCodeMapper['145']='SCROLL_LOCK'
keyCodeMapper['188']=','
keyCodeMapper['190']='.'
keyCodeMapper['191']='/'
keyCodeMapper['192']='`'
keyCodeMapper['219']='{'
keyCodeMapper['220']='\\'
keyCodeMapper['221']='}'
keyCodeMapper['222']='\''
keyCodeMapper['224']='META'

/* a list of key and its command mapping */
var keyActions = [
    {name: "openKey", value: "",  command: "Fireinput.toggleFireinput"},
    {name: "openEditorKey", value: "", command: "FireinputHelp.openEditor"},
    {name: "toggleIMEKey", value: "", command: "Fireinput.toggleIMEMode"},
    {name: "quickToggleIMEKey", value: "", command: ""},
    {name: "switchInputMethodKey", value: "", command: "Fireinput.switchInputMethod"},
    {name: "toggleHalfKey", value: "", command: "Fireinput.toggleHalfMode"},
    {name: "togglePuncKey", value: "", command: "Fireinput.togglePunctMode"},
    {name: "toggleEncodingKey", value: "", command: "Fireinput.toggleEncodingMode"},
    {name: "pageUpKey", value: "", command: null},
    {name: "pageDownKey", value: "", command: null},
    {name: "selectFirstKey", value: "", command: null},
    {name: "selectSecondKey", value: "", command: null},
    {name: "selectThirdKey", value: "", command: null}
]; 

var FireinputKeyBinding = 
{
    keyValueHash: null, 
    keyCodeHash: null, 

    // initialize key value 
    init: function()
    {
       this.keyValueHash = new FireinputHash(); 
       this.keyCodeHash = new FireinputHash(); 
 
       for (var i=0; i<keyActions.length; i++)
       {
          keyActions[i].value = fireinputPrefGetDefault(keyActions[i].name); 
          this.keyValueHash.setItem(keyActions[i].value, keyActions[i]); 
          this.keyValueHash.setItem(keyActions[i].name, keyActions[i]); 
       }

       // create string to code value 
       for(var k in keyCodeMapper)
       {
          this.keyCodeHash.setItem(keyCodeMapper[k], k); 
       }

    }, 

    // re-read from pref 
    refreshKeySetting: function()
    {
       this.init(); 
    }, 
    
    getKeyCodeByString: function(keyString)
    {
       return this.keyCodeHash.getItem(keyString.toUpperCase());
    }, 

    disableConflictKey: function(allowInputKeys)
    {
       // reset first 
       for (var i=0; i<keyActions.length; i++)
       {
          keyActions[i].disabled = false; 
       }
       for(var i=0; i<allowInputKeys.length; i++)
       {
          var keyCode = this.getKeyCodeByString(allowInputKeys.charAt(i)); 

          // the stored value is at upper position 
          keyCode = keyCode << 4; 
          if(this.keyValueHash.hasItem(keyCode))
          {
             var keyAction = this.keyValueHash.getItem(keyCode); 
             keyAction.disabled = true; 
          }
       }

    },

    getKeyString: function(option)
    {
       var keyAction = this.keyValueHash.getItem(option); 
       if(keyAction)
       {
           var key = keyCodeMapper[this.getDecodedKey(keyAction.value)]; 
           var modifiers = this.getDecodedModifier(keyAction.value); 
           var str = ''; 
           str += (modifiers & Event.CONTROL_MASK)?'Ctrl+':'';
           str += (modifiers & Event.ALT_MASK)?'Alt+':'';
           str += (modifiers & Event.SHIFT_MASK)?'Shift+':'';
           str += (modifiers & Event.META_MASK)?'Meta+':''; 
             
           return key ? (str + key) : str; 
       }
    },

    getKeyActionCode: function(option)
    {
       var keyAction = this.keyValueHash.getItem(option); 
       return this.getDecodedKey(keyAction.value); 
    }, 
   
    getKeyActionModifiers: function(option)
    {
       var keyAction = this.keyValueHash.getItem(option);
       return this.getDecodedModifier(keyAction.value);
    },
 
    checkKeyEvent: function(event)
    {
       var keyvalue = this.getEncodedKeyEvent(event); 
       var keyAction = this.keyValueHash.getItem(keyvalue); 
       if(keyAction && keyAction.command)
       {
          event.preventDefault();
          event.stopPropagation();
          // http://adblockplus.org/blog/five-wrong-reasons-to-use-eval-in-an-extension
          var commands = keyAction.command.split(".");
          if(commands && commands.length >= 2)
          {
             var func = window[commands[0]][commands[1]]; 
             func.call(window[commands[0]]); 
          }
          else if(commands)
          {
             window[keyAction.command].call(window);
          }
       }
 
    }, 

    isTrue: function(option, event)
    {
       var keyAction = this.keyValueHash.getItem(option); 
       if(keyAction.disabled)
          return false; 

       var keyvalue = this.getEncodedKeyEvent(event); 
       return keyAction.value == keyvalue; 
    }, 

    getEncodedKeyEvent: function (event)
    {
       return (event.keyCode ? event.keyCode : event.charCode) << 4 | this.getEncodedModifierEvent(event); 
    }, 

    getEncodedModifierEvent: function(event) 
    {
       return event.altKey   * Event.ALT_MASK     |
              event.ctrlKey  * Event.CONTROL_MASK |
              event.shiftKey * Event.SHIFT_MASK   |
              event.metaKey  * Event.META_MASK;
    },
    
    getDecodedKey: function(value)
    {
       return value >> 4; 
    },

    getDecodedModifier: function(value)
    {

       return value & 0xF; 
    }
  
}; 

