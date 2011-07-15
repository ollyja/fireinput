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

Fireinput.namespace("Fireinput.keyBinding"); 

/* the mapping between DOM_VK_* and its value */
Fireinput.keyBinding.keyCodeMapper=new Object();
Fireinput.keyBinding.keyCodeMapper['3']='CANCEL'
Fireinput.keyBinding.keyCodeMapper['6']='HELP'
Fireinput.keyBinding.keyCodeMapper['8']='BACK_SPACE'
Fireinput.keyBinding.keyCodeMapper['9']='TAB'
Fireinput.keyBinding.keyCodeMapper['12']='CLEAR'
Fireinput.keyBinding.keyCodeMapper['13']='RETURN'
Fireinput.keyBinding.keyCodeMapper['14']='ENTER'
Fireinput.keyBinding.keyCodeMapper['16']='SHIFT'
Fireinput.keyBinding.keyCodeMapper['17']='CONTROL'
Fireinput.keyBinding.keyCodeMapper['18']='ALT'
Fireinput.keyBinding.keyCodeMapper['19']='PAUSE'
Fireinput.keyBinding.keyCodeMapper['20']='CAPS_LOCK'
Fireinput.keyBinding.keyCodeMapper['27']='ESCAPE'
Fireinput.keyBinding.keyCodeMapper['32']='SPACE'
Fireinput.keyBinding.keyCodeMapper['33']='PAGE_UP'
Fireinput.keyBinding.keyCodeMapper['34']='PAGE_DOWN'
Fireinput.keyBinding.keyCodeMapper['35']='END'
Fireinput.keyBinding.keyCodeMapper['36']='HOME'
Fireinput.keyBinding.keyCodeMapper['37']='LEFT'
Fireinput.keyBinding.keyCodeMapper['38']='UP'
Fireinput.keyBinding.keyCodeMapper['39']='RIGHT'
Fireinput.keyBinding.keyCodeMapper['40']='DOWN'
Fireinput.keyBinding.keyCodeMapper['44']='PRINTSCREEN'
Fireinput.keyBinding.keyCodeMapper['45']='INSERT'
Fireinput.keyBinding.keyCodeMapper['46']='DELETE'
Fireinput.keyBinding.keyCodeMapper['48']='0'
Fireinput.keyBinding.keyCodeMapper['49']='1'
Fireinput.keyBinding.keyCodeMapper['50']='2'
Fireinput.keyBinding.keyCodeMapper['51']='3'
Fireinput.keyBinding.keyCodeMapper['52']='4'
Fireinput.keyBinding.keyCodeMapper['53']='5'
Fireinput.keyBinding.keyCodeMapper['54']='6'
Fireinput.keyBinding.keyCodeMapper['55']='7'
Fireinput.keyBinding.keyCodeMapper['56']='8'
Fireinput.keyBinding.keyCodeMapper['57']='9'
Fireinput.keyBinding.keyCodeMapper['59']=';'
Fireinput.keyBinding.keyCodeMapper['61']='='
Fireinput.keyBinding.keyCodeMapper['65']='A'
Fireinput.keyBinding.keyCodeMapper['66']='B'
Fireinput.keyBinding.keyCodeMapper['67']='C'
Fireinput.keyBinding.keyCodeMapper['68']='D'
Fireinput.keyBinding.keyCodeMapper['69']='E'
Fireinput.keyBinding.keyCodeMapper['70']='F'
Fireinput.keyBinding.keyCodeMapper['71']='G'
Fireinput.keyBinding.keyCodeMapper['72']='H'
Fireinput.keyBinding.keyCodeMapper['73']='I'
Fireinput.keyBinding.keyCodeMapper['74']='J'
Fireinput.keyBinding.keyCodeMapper['75']='K'
Fireinput.keyBinding.keyCodeMapper['76']='L'
Fireinput.keyBinding.keyCodeMapper['77']='M'
Fireinput.keyBinding.keyCodeMapper['78']='N'
Fireinput.keyBinding.keyCodeMapper['79']='O'
Fireinput.keyBinding.keyCodeMapper['80']='P'
Fireinput.keyBinding.keyCodeMapper['81']='Q'
Fireinput.keyBinding.keyCodeMapper['82']='R'
Fireinput.keyBinding.keyCodeMapper['83']='S'
Fireinput.keyBinding.keyCodeMapper['84']='T'
Fireinput.keyBinding.keyCodeMapper['85']='U'
Fireinput.keyBinding.keyCodeMapper['86']='V'
Fireinput.keyBinding.keyCodeMapper['87']='W'
Fireinput.keyBinding.keyCodeMapper['88']='X'
Fireinput.keyBinding.keyCodeMapper['89']='Y'
Fireinput.keyBinding.keyCodeMapper['90']='Z'
Fireinput.keyBinding.keyCodeMapper['93']='CONTEXT_MENU'
Fireinput.keyBinding.keyCodeMapper['96']='NUMPAD0'
Fireinput.keyBinding.keyCodeMapper['97']='NUMPAD1'
Fireinput.keyBinding.keyCodeMapper['98']='NUMPAD2'
Fireinput.keyBinding.keyCodeMapper['99']='NUMPAD3'
Fireinput.keyBinding.keyCodeMapper['100']='NUMPAD4'
Fireinput.keyBinding.keyCodeMapper['101']='NUMPAD5'
Fireinput.keyBinding.keyCodeMapper['102']='NUMPAD6'
Fireinput.keyBinding.keyCodeMapper['103']='NUMPAD7'
Fireinput.keyBinding.keyCodeMapper['104']='NUMPAD8'
Fireinput.keyBinding.keyCodeMapper['105']='NUMPAD9'
Fireinput.keyBinding.keyCodeMapper['106']='MULTIPLY'
Fireinput.keyBinding.keyCodeMapper['107']='ADD'
Fireinput.keyBinding.keyCodeMapper['108']='SEPARATOR'
Fireinput.keyBinding.keyCodeMapper['109']='SUBTRACT'
Fireinput.keyBinding.keyCodeMapper['110']='DECIMAL'
Fireinput.keyBinding.keyCodeMapper['111']='DIVIDE'
Fireinput.keyBinding.keyCodeMapper['112']='F1'
Fireinput.keyBinding.keyCodeMapper['113']='F2'
Fireinput.keyBinding.keyCodeMapper['114']='F3'
Fireinput.keyBinding.keyCodeMapper['115']='F4'
Fireinput.keyBinding.keyCodeMapper['116']='F5'
Fireinput.keyBinding.keyCodeMapper['117']='F6'
Fireinput.keyBinding.keyCodeMapper['118']='F7'
Fireinput.keyBinding.keyCodeMapper['119']='F8'
Fireinput.keyBinding.keyCodeMapper['120']='F9'
Fireinput.keyBinding.keyCodeMapper['121']='F10'
Fireinput.keyBinding.keyCodeMapper['122']='F11'
Fireinput.keyBinding.keyCodeMapper['123']='F12'
Fireinput.keyBinding.keyCodeMapper['124']='F13'
Fireinput.keyBinding.keyCodeMapper['125']='F14'
Fireinput.keyBinding.keyCodeMapper['126']='F15'
Fireinput.keyBinding.keyCodeMapper['127']='F16'
Fireinput.keyBinding.keyCodeMapper['128']='F17'
Fireinput.keyBinding.keyCodeMapper['129']='F18'
Fireinput.keyBinding.keyCodeMapper['130']='F19'
Fireinput.keyBinding.keyCodeMapper['131']='F20'
Fireinput.keyBinding.keyCodeMapper['132']='F21'
Fireinput.keyBinding.keyCodeMapper['133']='F22'
Fireinput.keyBinding.keyCodeMapper['134']='F23'
Fireinput.keyBinding.keyCodeMapper['135']='F24'
Fireinput.keyBinding.keyCodeMapper['144']='NUM_LOCK'
Fireinput.keyBinding.keyCodeMapper['145']='SCROLL_LOCK'
Fireinput.keyBinding.keyCodeMapper['188']=','
Fireinput.keyBinding.keyCodeMapper['190']='.'
Fireinput.keyBinding.keyCodeMapper['191']='/'
Fireinput.keyBinding.keyCodeMapper['192']='`'
Fireinput.keyBinding.keyCodeMapper['219']='{'
Fireinput.keyBinding.keyCodeMapper['220']='\\'
Fireinput.keyBinding.keyCodeMapper['221']='}'
Fireinput.keyBinding.keyCodeMapper['222']='\''
Fireinput.keyBinding.keyCodeMapper['224']='META'

/* a list of key and its command mapping */

Fireinput.keyBinding.keyActions = [
    {name: "openKey", value: "",  command: "Fireinput.main.toggleFireinput"},
    {name: "openEditorKey", value: "", command: "Fireinput.main.help.openEditor"},
    {name: "toggleIMEKey", value: "", command: "Fireinput.main.toggleIMEMode"},
    {name: "quickToggleIMEKey", value: "", command: ""},
    {name: "switchInputMethodKey", value: "", command: "Fireinput.main.switchInputMethod"},
    {name: "toggleLetterKey", value: "", command: "Fireinput.main.toggleLetterMode"},
    {name: "togglePuncKey", value: "", command: "Fireinput.main.togglePunctMode"},
    {name: "toggleEncodingKey", value: "", command: "Fireinput.main.toggleEncodingMode"},
    {name: "pageUpKey", value: "", command: null},
    {name: "pageDownKey", value: "", command: null},
    {name: "selectFirstKey", value: "", command: null},
    {name: "selectSecondKey", value: "", command: null},
    {name: "selectThirdKey", value: "", command: null}
]; 

Fireinput.keyBinding = Fireinput.extend(Fireinput.keyBinding,  
{
    keyValueHash: null, 
    keyCodeHash: null, 

    // initialize key value 
    init: function()
    {
       this.keyValueHash = new Fireinput.util.hash(); 
       this.keyCodeHash = new Fireinput.util.hash(); 
 
       for (var i=0; i<this.keyActions.length; i++)
       {
          this.keyActions[i].value = Fireinput.pref.getDefault(this.keyActions[i].name); 
          if(this.keyValueHash.hasItem(this.keyActions[i].value)) {
            var pAction = this.keyValueHash.getItem(this.keyActions[i].value);
            if(Array.isArray(pAction))
               pAction[pAction.length] = this.keyActions[i]; 
            else {
               pArray = [];
               pArray[pArray.length] = pAction; 
               pArray[pArray.length] = this.keyActions[i];
               this.keyValueHash.setItem(this.keyActions[i].value, pArray);
            }
            
          }
          else 
            this.keyValueHash.setItem(this.keyActions[i].value, this.keyActions[i]); 

          this.keyValueHash.setItem(this.keyActions[i].name, this.keyActions[i]); 
       }

       // create string to code value 
       for(var k in this.keyCodeMapper)
       {
          this.keyCodeHash.setItem(this.keyCodeMapper[k], k); 
       }

    }, 

    // re-read from pref 
    refreshKeySetting: function()
    {
       this.init(); 
    }, 

    modifyToggleIMEKeyCommand: function(reset) {
       /* update toggleIMEKey action to be close/open ime bar when pos is at floating */
       for (var i=0; i<this.keyActions.length; i++)
       {
          if(this.keyActions[i].name == "toggleIMEKey") {
            if(!this.keyActions[i]._command) {
               if(reset)
                  return; 
               else {
                  this.keyActions[i]._command = this.keyActions[i].command
                  this.keyActions[i].command = "Fireinput.main.toggleFireinput"; 
               }
            }
            else if(reset) {
               this.keyActions[i].command = this.keyActions[i]._command; 
            }
   
            break; 
          }
       }
       
    }, 

    getKeyCodeByString: function(keyString)
    {
       return this.keyCodeHash.getItem(keyString.toUpperCase());
    }, 

    disableConflictKey: function(allowInputKeys)
    {
       // reset first 
       for (var i=0; i<this.keyActions.length; i++)
       {
          this.keyActions[i].disabled = false; 
       }
       for(var i=0; i<allowInputKeys.length; i++)
       {
          var keyCode = this.getKeyCodeByString(allowInputKeys.charAt(i)); 

          // the stored value is at upper position 
          keyCode = keyCode << 4; 
          if(this.keyValueHash.hasItem(keyCode))
          {
             var keyAction = this.keyValueHash.getItem(keyCode); 
             if(Array.isArray(keyAction)) {
               for(var s in keyAction)
                  keyAction[s].disabled = true; 
             }
             else 
               keyAction.disabled = true; 
          }
       }

    },

    getKeyString: function(option)
    {
       var keyAction = this.keyValueHash.getItem(option); 
       if(keyAction)
       {
           var key = this.keyCodeMapper[this.getDecodedKey(keyAction.value)]; 
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
       if(Array.isArray(keyAction)) {
          for(var s in keyAction)
               this.invokeKeyEvent(event, keyAction[s]); 
       }
       else
          this.invokeKeyEvent(event, keyAction); 
    },

    invokeKeyEvent: function(event, keyAction)
    {
       if(keyAction && keyAction.command)
       {
          event.preventDefault();
          event.stopPropagation();
          // http://adblockplus.org/blog/five-wrong-reasons-to-use-eval-in-an-extension
          var commands = keyAction.command.split(".");
          if(commands && commands.length >= 2)
          {
             var myfunc = window; 
             for(var i =0; i<commands.length; i++) {
               var o  = myfunc[commands[i]] || {}; 
               if(typeof(o) == 'function') {
                  myfunc = o.bind(myfunc); 
               }
               else {
                  myfunc = o; 
               }

             }
             myfunc.call(window, event); 
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
       if (event.keyCode == KeyEvent.DOM_VK_META ||
           event.keyCode == KeyEvent.DOM_VK_SHIFT ||
           event.keyCode == KeyEvent.DOM_VK_CONTROL ||
           event.keyCode == KeyEvent.DOM_VK_ALT) 
            return 0; 

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
  
}); 

