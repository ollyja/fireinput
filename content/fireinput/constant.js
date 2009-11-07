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

// fireinput service url 
const SERVER_URL = "http://www.fireinput.com/";

// Perference domain 
const prefDomain = "extensions.fireinput";

// Language 
const LANGUAGE_EN   = ""; // don't have to specify; match properties file  
const LANGUAGE_ZH   = "zh"; 

// IME 
const IME_SMART_PINYIN = "Smart Pinyin"; 
const IME_WUBI         = "Wubi"; 
const IME_CANGJIE      = "Cangjie"

// Smart Pinyin Keyboard schema 
const SMART_PINYIN          = "1"; 
const ZIGUANG_SHUANGPIN     = "2"; 
const MS_SHUANGPIN          = "3"; 
const CHINESESTAR_SHUANGPIN = "4"; 
const SMARTABC_SHUANGPIN    = "5"; 
const WUBI_86               = "6"; 
const WUBI_98               = "7"; 
const CANGJIE_5             = "8";

// Pinyin key type 
const KEY_FINAL   = 1;
const KEY_INITIAL = 2;
const KEY_FULL    = 3;
const KEY_SWING   = 4;

// encoding 
const ENCODING_ZH   = "ZH";
const ENCODING_BIG5 = "BIG5";
const ENCODING_EN   = "EN";

// IME mode 
const IME_MODE_ZH   = "ZH";
const IME_MODE_EN   = "EN";

// insert source type 
const IMAGE_SOURCE_TYPE = 1;

// insert image mode 
const IMAGE_INSERT_BBCODE_URL = 1; 
const IMAGE_INSERT_URL        = 2; 

// Save data format 
const DATA_XML		= 1; 
const DATA_TEXT		= 2; 

// IME bar position 
const IME_BAR_BOTTOM   = "bottom";
const IME_BAR_TOP   = "top";

// pinyin input table type 
const PINYIN_WORD_LOOKUP = 1;
const PINYIN_PHRASE_LOOKUP = 2;

// fireinput event list 
const FIREINPUT_IME_CHANGED = 1; 
const FIREINPUT_TABLE_UPDATED = 2; 
