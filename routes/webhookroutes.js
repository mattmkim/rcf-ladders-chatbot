var User = require("../models/users");
var msg = require('../messaging/messagefunctions.js');
var postback = require('../messaging/postbackfunctions');
var reminder = require('../messaging/reminderfunctions')(User);
var userfunction = require('../backend/userfunctions')(User);

module.exports = function(User) {
    var module = {}

    async function processPostback(event) {
        var senderId = event.sender.id;
        var payload = event.postback.payload;
        
        if (payload === "Greeting") {
            userfunction.newUser(senderId);
        } else if (payload == "YES") {
            User.update({user_id: senderId}, {available: true}, function(err, response) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(response);
                    console.log("Updated " + senderId + " to true.");
                }
            })
            var message = "Got it. I'll get back to you Sunday night!"
            msg.sendMessage(senderId, {text: message});
        } else if (payload == "NO") {
            User.update({user_id: senderId}, {available: false}, function(err, response) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(response);
                    console.log("Updated " + senderId + " to false.");
                }
            })
            var message = "Got it. Have a good day!";
            msg.sendMessage(senderId, {text: message});
        } else if (payload == "SENIOR") {
            User.update({user_id: senderId}, {year: 4}, function(err, response) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(response);
                }
            })
            postback.setPreferences(senderId);
        } else if (payload == "JUNIOR") {
            User.update({user_id: senderId}, {year: 3}, function(err, response) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(response);
                }
            })
            postback.setPreferences(senderId);
        } else if (payload == "SOPHOMORE") {
            User.update({user_id: senderId}, {year: 2}, function(err, response) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(response);
                }
            })
            postback.setPreferences(senderId);
            
        } else if (payload == "FRESHMAN") {
            User.update({user_id: senderId}, {year: 1}, function(err, response) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(response);
                }
            })
            postback.setPreferences(senderId);     
        }
    };

    function processMessage(event) {
        if (!event.message.is_echo) {
            var message = event.message;
            var senderId = event.sender.id
            console.log("Received message from senderId: " + senderId);
            console.log("Message is: " + JSON.stringify(message));
            // You may get a text or attachment but not both
            if (message.text) {
                // preemptively check if message is looking to see all members in the group
                var text = message.text;
                if (text.localeCompare("View Commands") == 0 || text.localeCompare("View commands") == 0 || text.localeCompare("view commands") == 0) {
                    var notLoggedInMessage = "Please enter the password before sending commands.";
                    User.find({user_id: senderId}, function(err, response) {
                        if (err) {
                            console.log(err);
                        } else if (response.length == 0 || response[0].loggedIn === false) {
                            msg.sendMessage(senderId, {text: notLoggedInMessage});
                        } else {
                            var message = "All valid commands: \n\nView Profile: Send " + '"' + "View Profile" + '"' + " to see your profile! You can view and update all your information in your profile page. \n\n" 
                            + "Unsubscribe: Send " + '"' + "Unsubscribe" + '"' + " if you want to unsubscribe and no longer want to receive messages. \n\n" + 
                            "Update Availability: Send " + '"' + "Update Availability" + '"' + " if you want to update your availability. Note that while you can update your availability during the middle of the week, you won't get paired till Sunday. \n\n" +
                            "Set Preferences: Send " + '"' + "Set Preferences" + '"' + " if you want to update your preferences."; 
                            msg.sendMessage(senderId, {text: message});
                        }
                    })
                } else if (text.localeCompare("Unsubscribe") == 0 || text.localeCompare("unsubscribe") == 0) {
                    User.find({user_id: senderId}, function(err, response) {
                        if (err) {
                            console.log(err);
                        } else {
                            userfunction.deleteProfile(senderId);
                        }
                    })
                } else if (text.localeCompare("Update Availability") == 0 || text.localeCompare("update availability") == 0 || text.localeCompare("Update availability") == 0) {
                    var notLoggedInMessage = "Please enter the password before sending commands.";
                    User.find({user_id: senderId}, function(err, response) {
                        if (err) {
                            console.log(err);
                        } else if (response.length == 0 || response[0].loggedIn === false) {
                            msg.sendMessage(senderId, {text: notLoggedInMessage});
                        } else if (response[0].fun_fact == null) {
                            var notFullySignedIn = "Your profile is not complete yet.";
                            msg.sendMessage(senderId, {text: notFullySignedIn});
                        } else {
                            postback.availabilityPB(senderId, response[0].firstName);
                        }
                    })
                } else if (text.localeCompare("Get Started") == 0 || text.localeCompare("Get started") == 0 || text.localeCompare("get started") == 0) {
                    userfunction.getStarted(senderId);
                } else if (text.localeCompare("Set Preferences") == 0 || text.localeCompare("Set preferences") == 0 || text.localeCompare("set preferences") == 0) {
                    postback.setPreferences(senderId);
                } else if (text.localeCompare("View Profile") == 0 || text.localeCompare("View profile") == 0 || text.localeCompare("view profile") == 0) {
                    postback.viewProfile(senderId);
                // admin commands
                // } else if (text.localeCompare("Ask Availability") == 0 || text.localeCompare("Ask availability") == 0 || text.localeCompare("ask availability") == 0) {
                //     sendAvailabilityPB();
                // } else if (text.localeCompare("Show Meetup") == 0 || text.localeCompare("Show meetup") == 0 || text.localeCompare("show meetup") == 0) {
                //     userfunction.sendLadders();    
                // } else if (text.localeCompare("send reminder profile") == 0) {
                //     sendProfileReminder();
                // } else if (text.localeCompare("send preference reminder") == 0) {
                //     sendPreferenceReminder();
                // } else if (text.localeCompare("send available reminder") == 0) {
                //     sendAvailabilityReminder();
                // } else if (text.localeCompare("send info") == 0) {
                //     reminder.sendInfo();
                // } else if (text.localeCompare("make avail") == 0) {
                //    userfunction.makeAvail();
                // }
                // admin commands
                } else {
                    User.find({user_id: senderId}, function(err, response) {
                        if (err) {
                            console.log(err);
                        } else {
                            if (response[0].loggedIn === false) {
                                if (text.localeCompare("rcfmeets2020") == 0) {
                                    var correctPasswordMessage = "To begin, let's build your profile! What's something you like to do in your free time?" + 
                                    " No need to write an essay - a couple interests should do.";
                                    msg.sendMessage(senderId, {text: correctPasswordMessage});
                                    // update profile
                                    User.update({user_id: senderId}, {loggedIn: true}, function (err, response) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log(response);
                                        }
                                    })
                                } else {
                                    var wrongPasswordMessage = "Sorry, that is the incorrect password. Please try again.";
                                    msg.sendMessage(senderId, {text: wrongPasswordMessage});
                                }
                            } else if (response[0].interests == null) {
                                console.log(senderId + " has no interests yet");
                                User.update({user_id: senderId}, {interests: message.text}, function (err, response) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(response);
                                    }
                                });
                                // need to send message prompting a users fun fact
                                var newMessage = "What is a fun fact about you?";
                                msg.sendMessage(senderId, {text: newMessage});
                            } else if (response[0].fun_fact == null) {
                                // user already exists in the database, message received is for fun fact
                                console.log(senderId + " exits. Adding fun fact");
                                User.update({user_id: senderId}, {fun_fact: message.text}, function (err, response) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(response);
                                    }
                                });  
                                postback.sendYearPBs(senderId);
                            } else {
                                // user filled out interests and fun fact - send message stating unknown request
                                var newMessage = "Sorry, we did not understand your request. Type " + '"' + "View Commands" + '"' + " to see all possible commands.";
                                msg.sendMessage(senderId, {text: newMessage});
                            }
                        }
                    });
                }
            } else if (message.attachments) {
                msg.sendMessage(senderId, {text: "Sorry, we don't understand your request."});
            }
        }
    }

    module.getWebhook = function (req, res) {
        if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
            console.log("Verified webhook");
            res.status(200).send(req.query["hub.challenge"]);
        } else {
            console.error("Verification failed. The tokens do not match.");
            res.sendStatus(403);
        }
    };

    module.postWebhook = function (req, res) {
        // Make sure this is a page subscription
        if (req.body.object == "page") {
            // Iterate over each entry
            // There may be multiple entries if batched
            req.body.entry.forEach(function(entry) {
                // Iterate over each messaging event
                entry.messaging.forEach(function(event) {
                    if (event.postback) {
                        processPostback(event);
                    } else if (event.message) {
                        processMessage(event);
                    }
                });
            });
    
            res.sendStatus(200);
        }
    };

    return module;
}