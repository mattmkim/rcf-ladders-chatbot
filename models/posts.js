var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PostSchema = new Schema({
    user_id: {type: String},
    profileUrl: {type: String},
    firstName: {type: String},
    lastName: {type: String},
    imageUrl: {type: String},
    caption: {type: String}
});

module.exports = mongoose.model("Post", PostSchema);