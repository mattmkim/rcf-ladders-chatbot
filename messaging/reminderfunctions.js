var msg = require('./messagefunctions.js');

module.exports = function(User) {
    var module = {}

    module.sendInfo = function() {
        var message = "Hello! As CGs and this semester comes to a close, RCF Meets will also no longer be running for at least a couple of weeks - " +
        "however, we’ll definitely bring this back online sometime over the summer! Be prepared to make a new account - we will most likely be deleting all users from the database." + 
        " Hope that this has helped us stay connected as a community and has been a good experience for you all! We will continue to work on additional features and prepare to welcome" + 
        " in freshman and newcomers for this upcoming year :) \n\n" +
        "Let’s continue to make the effort to stay connected and cover each other in prayer, and finish the semester strong! Almost there y’all! " + '"' +  "And let us consider how to stir up one another to love and good works, not neglecting to meet together, as is the habit of some, but encouraging one another, and all the more as you see the Day drawing near." + '"' +  " (Hebrews 10:24-25)";
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