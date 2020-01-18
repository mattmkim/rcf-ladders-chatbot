var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  user_id: {type: String},
  interests: {type: String},
  fun_fact: {type: String},
  firstName: {type: String},
  lastName: {type: String},
  year: {type: Number},
  profileUrl: {type: String},
  available: {type: Boolean},
  loggedIn: {type: Boolean}
});

module.exports = mongoose.model("User", UserSchema);