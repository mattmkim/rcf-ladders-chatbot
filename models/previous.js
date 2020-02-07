var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PreviousSchema = new Schema({
  user_id: {type: String},
  prevMeetup: {type: [String]},
  test: {type: String}
});

module.exports = mongoose.model("Previous", PreviousSchema);