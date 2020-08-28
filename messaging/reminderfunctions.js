var msg = require('./messagefunctions.js');

module.exports = function(User) {
    var module = {}

    module.sendInfo = function() {
        var message = "The first RCF Meets of the year! Woohoo! If this is your first time, welcome! Reach out to the person(s) you were paired with, and set up a time to meet! This can " + 
        "be over phone call, video call, meeting outside in person, or whatever you feel comfortable with. Also, each week comes with a Question of the Week - feel free to end your meetup with this question " +
        "to avoid any awkward silences (haha). \n\n" + "This week's Question of the Week: What are you looking forward to this semester?";

        // msg.sendMessage("2479283145514220", {text: message})
        User.find({}, function(err, response) {
            if (err) {
                console.log(err);
            } else {
                for (var i = 0; i < response.length; i++) {
                    msg.sendMessage(response[i].user_id, {text: message});
                    console.log(response[i].firstName);
                    console.log(response[i].user_id);

                }
            }
        })
    }

    module.sendAvailabilityReminder = function() {
        var message = "Hi! Just a reminder to update your availability if you haven't already! Meetups will be sent out at 10 am EDT on Sunday.";
        User.find({}, function(err, response) {
            if (err) {
                console.log(err);
            } else {
                for (var i = 0; i < response.length; i++) {
                   msg.sendMessage(response[i].user_id, {text: message});
                    console.log(response[i].firstName);
                    console.log(response[i].user_id);
                }
            }
        })
    }

    return module;
}