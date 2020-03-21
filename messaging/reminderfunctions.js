var msg = require('./messagefunctions.js');

module.exports = function(User) {
    var module = {}

    module.sendInfo = function() {
        var message = "Hello! Sorry for the long message, but please read! Contrary to our previous message," + 
        " RCF Meets *WILL be running this semester*! Obviously, meetups will have to be held virtually (praise God for technology!), and here are some guidelines on what that could look like: \n" +
        "1. Before you and your ladders partner actually meet, be sure to agree on a time for how long the meetup will last! This can help reduce any potential awkwardness. We suggest around 20 minutes (but of course you can go longer!). \n" +
        "2. Be on the lookout for a Question of the Week, every week! Feel free to use this question to break the ice. \n" + 
        "3. Before you end, be sure to share any prayer requests, and have one person (or both!) pray to end the meetup. \n\n" + 
        "Through these ladders, we hope that we all can continue to point one another to Christ and live out Hebrews 10:24-25 - “And let us consider how to stir up one another to love and good works, not neglecting to meet together, as is the habit of some, but encouraging one another, and all the more as you see the Day drawing near.” Usually RCF Meets runs on Saturdays/Sundays, but for this upcoming week, RCF Meets will run on Sunday/Monday. *Keep on the lookout for a message to update your availabilty tomorrow!* \n\n" + 
        "Also, some *big updates*! \n" +
        "1. RCF Meets now has a new and improved logo thanks to our sister Angie! \n" +
        "2. Your own profile page! Type “View Profile” and click on the button that shows to open your profile page! You can view all the information you’ve given so far AND update your information too! No need to completely remake your whole profile if you want to update your information. \n" + 
        "3. The “View Members” and “Get Started” commands are no longer valid. \n\n" +
        "ALSO, if you haven’t heard, go and like the Penn RCF - Delighting in the Unexpected ’20 page! It’s an awesome resource for all of us to continue to share life virtually. Here’s the link! https://www.facebook.com/delightingintheunexpected/";
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
        var message = "Hi! Just a reminder to update your availability if you haven't already! Meetups are sent out at 4pm.";
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