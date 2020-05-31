var mongoose = require("mongoose");
var random = require('mongoose-simple-random');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  user_id: {type: String},
  interests: {type: String},
  fun_fact: {type: String},
  bible_verse: {type: String},
  firstName: {type: String},
  lastName: {type: String},
  year: {type: Number},
  profileUrl: {type: String},
  available: {type: Boolean},
  loggedIn: {type: Boolean},
  known: {type: [String]},
  prevMeetup: {type: [String]},
  sendingPhoto: {type: Boolean},
  photoUrl: {type: String}
  
});
UserSchema.plugin(random);

module.exports = mongoose.model("User", UserSchema);