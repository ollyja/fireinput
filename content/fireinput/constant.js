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

// this should be updated everytime a new release is ready 
Fireinput.FIREINPUT_VERSION = "%FIREINPUT_VERSION%";


// fireinput service url 
Fireinput.SERVER_URL = "http://www.fireinput.com/";

// Perference domain 
Fireinput.prefDomain = "extensions.fireinput";

// Language 
Fireinput.LANGUAGE_EN   = ""; // don't have to specify; match properties file  
Fireinput.LANGUAGE_ZH   = "zh"; 

// IME 
Fireinput.IME_SMART_PINYIN = "Smart Pinyin"; 
Fireinput.IME_WUBI         = "Wubi"; 
Fireinput.IME_CANGJIE      = "Cangjie"
Fireinput.IME_ZHENGMA      = "Zhengma"

// Smart Pinyin Keyboard schema 
Fireinput.SMART_PINYIN          = "1"; 
Fireinput.ZIGUANG_SHUANGPIN     = "2"; 
Fireinput.MS_SHUANGPIN          = "3"; 
Fireinput.CHINESESTAR_SHUANGPIN = "4"; 
Fireinput.SMARTABC_SHUANGPIN    = "5"; 
Fireinput.WUBI_86               = "6"; 
Fireinput.WUBI_98               = "7"; 
Fireinput.CANGJIE_5             = "8";
Fireinput.ZHENGMA               = "9";

// Pinyin key type 
Fireinput.KEY_FINAL   = 1;
Fireinput.KEY_INITIAL = 2;
Fireinput.KEY_FULL    = 3;
Fireinput.KEY_SWING   = 4;

// full/half mode 
Fireinput.HALF_LETTER_MODE = 1;
Fireinput.FULL_LETTER_MODE = 2;
Fireinput.HALF_PUNCT_MODE = 3;
Fireinput.FULL_PUNCT_MODE = 4;

// encoding 
Fireinput.ENCODING_ZH   = "ZH";
Fireinput.ENCODING_BIG5 = "BIG5";
Fireinput.ENCODING_EN   = "EN";

// IME mode 
Fireinput.IME_MODE_ZH   = "ZH";
Fireinput.IME_MODE_EN   = "EN";

// insert source type 
Fireinput.IMAGE_SOURCE_TYPE = 1;

// insert image mode 
Fireinput.IMAGE_INSERT_BBCODE_URL = 1; 
Fireinput.IMAGE_INSERT_URL        = 2; 

// Save data format 
Fireinput.DATA_XML		= 1; 
Fireinput.DATA_TEXT		= 2; 

// IME bar position 
Fireinput.IME_BAR_BOTTOM   = "bottom";
Fireinput.IME_BAR_TOP   = "top";

// pinyin input table type 
Fireinput.PINYIN_WORD_LOOKUP = 1;
Fireinput.PINYIN_PHRASE_LOOKUP = 2;

// fireinput event list 
Fireinput.FIREINPUT_IME_CHANGED = 1; 
Fireinput.FIREINPUT_TABLE_UPDATED = 2; 

Fireinput.PinyinInitials = [ "b", "c", "ch", "d", "f", "g", "h", "j", "k", "l", "m",
                          "n", "p","q", "r", "s", "sh", "t", "w", "x", "y", "z", "zh"];

Fireinput.PinyinFinals = ["a","ai", "an", "ang", "ao", "e", "ei", "en", "eng", "er",
                       "i", "ia", "ian", "iang", "iao", "ie", "in", "ing", "io", "ion", "iong",
                       "iou", "iu", "o", "on", "ong", "ou", "u", "ua", "uai", "uan",
                       "uang", "ue", "uei", "uen", "ueng", "ui", "un", "uo", "v", "van",
                       "ve", "vn"];

