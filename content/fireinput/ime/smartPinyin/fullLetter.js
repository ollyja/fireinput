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

const HALF_FULL_TABLE = [
       { half: '0020', full: '3000', next: 1 },
       { half: '0021', full: 'FF01', next: 94 },
       { half: '00A1', full: 'FFE0', next: 2 },
       { half: '00A5', full: 'FFE5', next: 1 },
       { half: '00A6', full: 'FFE4', next: 1 },
       { half: '00AC', full: 'FFE2', next: 1 },
       { half: '00AF', full: 'FFE3', next: 1 },
       { half: '20A9', full: 'FFE6', next: 1 },
       { half: 'FF61', full: '3002', next: 1 },
       { half: 'FF62', full: '300C', next: 2 },
       { half: 'FF64', full: '3001', next: 1 },
       { half: 'FF65', full: '30FB', next: 1 },
       { half: 'FF66', full: '30F2', next: 1 },
       { half: 'FF67', full: '30A1', next: 1 },
       { half: 'FF68', full: '30A3', next: 1 },
       { half: 'FF69', full: '30A5', next: 1 },
       { half: 'FF6A', full: '30A7', next: 1 },
       { half: 'FF6B', full: '30A9', next: 1 },
       { half: 'FF6C', full: '30E3', next: 1 },
       { half: 'FF6D', full: '30E5', next: 1 },
       { half: 'FF6E', full: '30E7', next: 1 },
       { half: 'FF6F', full: '30C3', next: 1 },
       { half: 'FF70', full: '30FC', next: 1 },
       { half: 'FF71', full: '30A2', next: 1 },
       { half: 'FF72', full: '30A4', next: 1 },
       { half: 'FF73', full: '30A6', next: 1 },
       { half: 'FF74', full: '30A8', next: 1 },
       { half: 'FF75', full: '30AA', next: 2 },
       { half: 'FF77', full: '30AD', next: 1 },
       { half: 'FF78', full: '30AF', next: 1 },
       { half: 'FF79', full: '30B1', next: 1 },
       { half: 'FF7A', full: '30B3', next: 1 },
       { half: 'FF7B', full: '30B5', next: 1 },
       { half: 'FF7C', full: '30B7', next: 1 },
       { half: 'FF7D', full: '30B9', next: 1 },
       { half: 'FF7E', full: '30BB', next: 1 },
       { half: 'FF7F', full: '30BD', next: 1 },
       { half: 'FF80', full: '30BF', next: 1 },
       { half: 'FF81', full: '30C1', next: 1 },
       { half: 'FF82', full: '30C4', next: 1 },
       { half: 'FF83', full: '30C6', next: 1 },
       { half: 'FF84', full: '30C8', next: 1 },
       { half: 'FF85', full: '30CA', next: 6 },
       { half: 'FF8B', full: '30D2', next: 1 },
       { half: 'FF8C', full: '30D5', next: 1 },
       { half: 'FF8D', full: '30D8', next: 1 },
       { half: 'FF8E', full: '30DB', next: 1 },
       { half: 'FF8F', full: '30DE', next: 5 },
       { half: 'FF94', full: '30E4', next: 1 },
       { half: 'FF95', full: '30E6', next: 1 },
       { half: 'FF96', full: '30E8', next: 6 },
       { half: 'FF9C', full: '30EF', next: 1 },
       { half: 'FF9D', full: '30F3', next: 1 },
       { half: 'FFA0', full: '3164', next: 1 },
       { half: 'FFA1', full: '3131', next: 30},
       { half: 'FFC2', full: '314F', next: 6 },
       { half: 'FFCA', full: '3155', next: 6 },
       { half: 'FFD2', full: '315B', next: 9 },
       { half: 'FFE9', full: '2190', next: 4 },
       { half: 'FFED', full: '25A0', next: 1 },
       { half: 'FFEE', full: '25CB', next: 1 }
]; 

var FullLetterConverter = function() {}; 

FullLetterConverter.prototype = 
{
    double_quot_stat: 0,
    single_quot_stat: 0,
    double_right_arrow: 0,
    double_left_arrow: 0,
    single_right_arrow: 0,
    single_left_arrow: 0,
    
   
    toFullLetter: function(key)
    {
       switch(key)
       {
          case ',':
             return "\uFF0C"; 
          case '.':
             return "\u3002"; 
          case '\\':
             return "\u3001"; 
          case ';':
             return "\uFF1B"; 
          case '[':
             return "\uFF3B"; 
          case ']':
             return "\uFF3D"; 
          case '^':
             return ["\u2026", "\u2026"]; 
          case '"':
             if(this.double_quot_state)
             {
                this.double_quot_state = 0; 
                return "\u201D"; 
             }
             else
             {
                this.double_quot_state = 1; 
                return "\u201C"; 
             }
          case '\'':  
             if(this.single_quot_state)
             {
                this.single_quot_state = 0; 
                return "\u2019"; 
             }
             else
             {
                this.single_quot_state = 1; 
                return "\u2018"; 
             }
          case '<': 
             if(!this.double_left_arrow)
             {
                this.double_left_arrow = 1; 
                this.double_right_arrow = 0; 
                this.single_left_arrow = 0; 
                return "\u300A"; 
             }
             else
             {
                this.single_left_arrow++; 
                return "\u3008"; 
             }

          case '>': 
             if(this.single_right_arrow < this.single_left_arrow)
             {
                this.single_right_arrow++; 
                return "\u3009";
             }
             else
             {
                this.double_right_arrow = 1; 
                this.double_left_arrow = 0; 
                this.single_right_arrow = 0; 
                this.single_left_arrow = 0; 
                return "\u300B";
             }
 
          case '$': 
             return "\uFFE5"; 

          case '_':
             return ["\u2014", "\u2014"]; 

          case '(': 
             return "\uFF08"; 
          case ')': 
             return "\uFF09"; 

          case '{': 
             return "\uFF5B"; 
          case '}': 
             return "\uFF5D"; 

          default: 
             return this.convertToFullLetter(key); 
       }
    },

    convertToFullLetter: function(key)
    {
       var charCode = key.charCodeAt(0); 
       for (var i=HALF_FULL_TABLE.length-1; i>=0; i--)
       {
          var halfCode = parseInt(HALF_FULL_TABLE[i].half, 16); 
          var fullCode = parseInt(HALF_FULL_TABLE[i].full, 16); 
          if(charCode >= halfCode && 
             charCode < (halfCode + HALF_FULL_TABLE[i].next))
             return String.fromCharCode(fullCode + charCode - halfCode); 
       }

       return key; 
    },

    convertToHalfLetter: function(key)
    {
       var charCode = key.charCodeAt(0);
       for (var i=HALF_FULL_TABLE.length-1; i>=0; i--)
       {
          var halfCode = parseInt(HALF_FULL_TABLE[i].half, 16);
          var fullCode = parseInt(HALF_FULL_TABLE[i].full, 16);
          if(charCode >= fullCode &&
             charCode < (fullCode + HALF_FULL_TABLE[i].next))
             return String.fromCharCode(halfCode + charCode - fullCode);
       }

       return key;
    }

}; 

