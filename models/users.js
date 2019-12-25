var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  user_id: {type: String},
  interests: {type: String},
  fun_fact: {type: String}
});

module.exports = mongoose.model("User", UserSchema);