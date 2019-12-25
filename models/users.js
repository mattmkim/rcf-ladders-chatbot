var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  user_id: {type: String},
  interests: {type: String},
  fun_fact: {type: String},
  firstName: {type: String},
  lastName: {type: String},
  profileUrl: {type: String}
});

module.exports = mongoose.model("User", UserSchema);