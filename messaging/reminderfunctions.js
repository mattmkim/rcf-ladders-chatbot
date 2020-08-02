var msg = require('./messagefunctions.js');

module.exports = function(User) {
    var module = {}

    module.sendInfo = function() {
        var message = "Hello! Hope you've been having a good summer so far! Wanted to let you know that this week will be the last week of RCF Meets until further notice. Unfortunately, the service that RCF Meets uses to store data is being discontinued soon, so we want to migrate to a different service and have everything ready before the school year starts, which may take some time.";
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