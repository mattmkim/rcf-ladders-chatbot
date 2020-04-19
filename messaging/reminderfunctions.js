var msg = require('./messagefunctions.js');

module.exports = function(User) {
    var module = {}

    module.sendInfo = function() {
        var message = "Sorry, we meant 10 am EDT!";
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