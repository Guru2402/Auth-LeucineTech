var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  role: String
});

UserSchema.plugin(passportLocalMongoose);

UserSchema.methods.validatePassword = function(password, callback) {
  this.authenticate(password, callback);
};

module.exports = mongoose.model("User", UserSchema);
