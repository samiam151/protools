const crypto = require("crypto");

module.exports = {
    encrypt: function(str){
        var cipher = crypto.createCipher("aes-256-ctr", "test")
        var crypted = cipher.update(str,'utf8','hex')
        crypted += cipher.final('hex');
        return crypted;
    },

    decrypt: function(hash){
        var decipher = crypto.createDecipher("aes-256-ctr", "test")
        var dec = decipher.update(hash,'hex','utf8')
        dec += decipher.final('utf8');
        return dec;
    }
}
