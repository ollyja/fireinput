Fireinput.namespace("Fireinput.md5"); 

Fireinput.md5 = {
   core_md5: function(x) {
      var mhs = Fireinput.util.xpc.createInstance("@mozilla.org/security/hash;1", "nsICryptoHash"); 
      var dataarray = Fireinput.util.unicode.getByteArray(x); 
      if(dataarray.length <= 0)
         return ''; 
      mhs.init(mhs.MD5); 
      mhs.update(dataarray, dataarray.length); 
      return mhs.finish(false); 
   }, 

   core_hmac_md5: function(key, data) {
      var mhs = Fireinput.util.xpc.createInstance("@mozilla.org/security/hmac;1", "nsICryptoHMAC"); 
      var kos = Fireinput.util.xpc.getService("@mozilla.org/security/keyobjectfactory;1", "nsIKeyObjectFactory");
      var keyobject = kos.keyFromString(Components.interfaces.nsIKeyObject.HMAC, key);
  
      var dataarray = Fireinput.util.unicode.getByteArray(data); 
      if(dataarray.length <= 0)
         return ''; 
      mhs.init(mhs.MD5, keyobject);
      mhs.update(dataarray, dataarray.length);
      return mhs.finish(false);           
   }, 

   hex_md5: function(s) {
      var hash = this.core_md5(s); 
      return [this.toHexString(hash.charCodeAt(i)) for (i in hash)].join("");     
   },

   hex_hmac_md5: function(key, data) {
      var hash = this.core_hmac_md5(key, data); 
      return [this.toHexString(hash.charCodeAt(i)) for (i in hash)].join("");     
   },

   toHexString: function(charCode) {
      return ("0" + charCode.toString(16)).slice(-2);
   }
}
