var msg = require('./messagefunctions.js');

module.exports = function(User) {
    var module = {}

    module.sendInfo = function() {
        var message = "Hope your first week of school went well! From now on, we'll be providing some QuestionS of the Week that you and your partner(s) " +
        "can talk about, as well as a Challenge of the Week :O. The Challenge of the Week will involve sending a picture to me (the bot), which will be posted on the Penn RCF story later this week (completely optional, btw)! " +
        "It's a fun way to see what other meetups are happening during the week :)\n\n" +
        "Here are the QuestionS of the Week: \n1. What's your year, major, and favorite hobby/activity (and when did you start?)\n2. What's something you've been grateful for over quarantine/in general?\n3. What's your Meyers Briggs? What's your love language?\n\n" +
        "And this week's Challenge of the Week: \nTake a screenshot of you and your partner's meetup!\n\n" +
        "One last thing about sending pictures to the bot - after you send a picture, the bot will ask you to confirm that you want to send the picture. Then, it'll ask you to send a caption. For this week, send you and partner(s) names and years! Once you send the caption, you're all done!\n\n" +
        "Sorry for the veeeery long message. Hope y'all have a great week!";
        msg.sendMessage("2479283145514220", {text: message})
        // User.find({}, function(err, response) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         for (var i = 0; i < response.length; i++) {
        //             msg.sendMessage(response[i].user_id, {text: message});
        //             console.log(response[i].firstName);
        //             console.log(response[i].user_id);

        //         }
        //     }
        // })
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