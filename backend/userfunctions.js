var request = require("request");
var msg = require('../messaging/messagefunctions.js');
var postback = require('../messaging/postbackfunctions');


module.exports = function(User) {
    var module = {}

    module.newUser = function(senderId) {
        // Get user's first name from the User Profile API
        // and include it in the greeting
        request({
            url: "https://graph.facebook.com/v5.0/" + senderId,
            qs: {
                access_token: process.env.PAGE_ACCESS_TOKEN,
                fields: "first_name,last_name,profile_pic"
            },
            method: "GET"
            }, function(error, response, body) {
                var greeting = "";
                var bodyObj = JSON.parse(body);
                if (error) {
                    console.log("Error getting user's name: " +  error);
                } else {
                    name = bodyObj.first_name;
                    greeting = "Hi " + name + "! ";
                }
                
                var firstMessage = greeting + "Thanks for joining RCF Meets!";
                //var url = "https://scontent-lga3-1.xx.fbcdn.net/v/t1.0-9/75127993_422291925366714_1670400768114425856_o.jpg?_nc_cat=109&_nc_ohc=qzo0m1xnBOYAQkEkl5MEkBwSkTC2eqPXz8nV6L-8FBb6t0A9AZVk38bLg&_nc_ht=scontent-lga3-1.xx&oh=7222ceccfb871c715cac3c32d7ebd30d&oe=5E6B246D"
                var secondMessage = "To begin, let's build your profile! What's something you like to do in your free time?" + 
                " No need to write an essay - a couple interests should do.";
                var passwordMessage = "Please enter the password to continue.";
                //sendAttachment(senderId, url);
                var newUser = new User({
                    user_id: senderId,
                    interests: null,
                    fun_fact: null,
                    firstName: bodyObj.first_name,
                    lastName: bodyObj.last_name,
                    year: null,
                    profileUrl: bodyObj.profile_pic,
                    available: false,
                    loggedIn: false,
                    known: [],
                    prevMeetup: []
                });
                User.find({user_id: senderId}, function(err, response) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(response);
                        if (response.length === 0) {
                            msg.sendTwoMessages(senderId, firstMessage, passwordMessage);
                            console.log(senderId + " does not exist.");
                            newUser.save(function (err, response) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(response);
                                }
                            });
                        } else if (response[0].loggedIn === false) {
                            msg.sendMessage(senderId, {text: passwordMessage});
                        } else if (response[0].interests == null) {
                            msg.sendTwoMessages(senderId, firstMessage, secondMessage);
                            console.log(senderId + " does not exist.");
                        } else if (response[0].fun_fact == null) {
                            firstMessage = firstMessage + " Looks like your profile is almost complete! What's a fun fact about yourself?";
                            msg.sendMessage(senderId, {text: firstMessage});
                        } else if (response[0].year == null) {
                            postback.sendYearPBs(senderId)
                        } else {
                            secondMessage = "Looks like you're already logged in! Keep on the lookout for weekly messages from us on Saturdays!"
                            var viewMembersMessage = "In the meantime, type " + '"' + "View Commands" + '"' + " to view all valid commands.";
                            msg.sendThreeMessages(senderId, firstMessage, secondMessage, viewMembersMessage);
                        }
                    }
                })
                
            }); 
    }

    module.getStarted = function(senderId) {
        User.find({user_id: senderId}, function(err, response) {
            if (err) {
                console.log(err);
            } else if (response.length === 0) {
                module.newUser(senderId);
            } else {
                User.deleteOne({user_id: senderId}, function(err, response) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(response);
                        console.log("Deleted user " + senderId);
                        module.newUser(senderId);
                    }
                })
            }
        })
    }

    module.deleteProfile = function(senderId) {
        var message = "You are now unsubscribed. If you want resubscribe, type Get Started!";
        User.deleteOne({user_id: senderId}, function(err, response) {
            if (err) {
                console.log(err);
            } else {
                console.log(response);
                console.log("Deleted user " + senderId);
            }
        })
        msg.sendMessage(senderId, {text: message});
    }


    return module;

}