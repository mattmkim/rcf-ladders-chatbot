var msg = require('./messagefunctions.js');

module.exports = function(User) {
    var module = {}

    module.sendInfo = function() {
        var message = "Hi! Some updates:\n\n1) The set preferences functionality on the mobile Facebook messenger app is now working! Sorry for the inconvenience.\n\n2) Since next week is spring break, no pairings are going to be made this weekend. Have a great spring break!\n\n3) We know there has been some confusion about this so just to make things clear, in order for two people not to be paired up with each other, they BOTH must select each other while setting their preferences - please make sure that you’re setting your preferences!\n\n4) If you would no longer like to receive messages, just send " + '"' + "Unsubscribe" + '"'+ ".";
        User.find({}, function(err, response) {
            if (err) {
                console.log(err);
            } else {
                for (var i = 0; i < response.length; i++) {
                    if (!(response[i].user_id.localeCompare("2740862885993089") == 0) && !(response[i].user_id.localeCompare("2713544202105549") == 0)) {
                        msg.sendMessage(response[i].user_id, {text: message});
                        console.log(response[i].firstName);
                        console.log(response[i].user_id);
                    }
                    
                }
            }
        })
    }

    return module;
}