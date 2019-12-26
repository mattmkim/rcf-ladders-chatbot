var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

console.log(process.env.MONGODB_URI);
var db = mongoose.connect(process.env.MONGODB_URI);
var User = require("./models/users");

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

// Server index page
app.get("/", function (req, res) {
    res.send("Deployed!");
});

// Facebook Webhook
// Used for verification
app.get("/webhook", function (req, res) {
    if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
        console.log("Verified webhook");
        res.status(200).send(req.query["hub.challenge"]);
    } else {
        console.error("Verification failed. The tokens do not match.");
        res.sendStatus(403);
    }
});

// All callbacks for Messenger will be POST-ed here
app.post("/webhook", function (req, res) {
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
});
  
function processPostback(event) {
    var senderId = event.sender.id;
    var payload = event.postback.payload;

    console.log(senderId);

    if (payload === "Greeting") {
        // Get user's first name from the User Profile API
        // and include it in the greeting
        request({
        url: "https://graph.facebook.com/v2.6/" + senderId,
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
            " No need to write an essay - a couple interests should do."
            //sendAttachment(senderId, url);
            var newUser = new User({
                user_id: senderId,
                interests: null,
                fun_fact: null,
                firstName: bodyObj.first_name,
                lastName: bodyObj.last_name,
                profileUrl: bodyObj.profile_pic
            });

            User.find({user_id: senderId}, function(err, response) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(response);
                    if (response.length === 0) {
                        sendMessage(senderId, {text: firstMessage});
                        sendMessage(senderId, {text: secondMessage});
                        console.log(senderId + " does not exist.");
                    } else {
                        secondMessage = "Looks like you're already logged in! Keep on the lookout for weekly messages from us on Mondays!"
                        var viewMembersMessage = "In the meantime, type " + '"' + "View Members" + '"' + "if you would like to get a preview of who else is in RCF Meets!";
                        sendMessage(senderId, {text: firstMessage});
                        sendMessage(senderId, {text: secondMessage});
                        sendMessage(senderId, {text: viewMembersMessage});
                    }
                }
            })
            
            newUser.save(function (err, response) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(response);
                }
            });
        });
    }
}

function processMessage(event) {
    if (!event.message.is_echo) {
        var message = event.message;
        var senderId = event.sender.id;

        console.log("Received message from senderId: " + senderId);
        console.log("Message is: " + JSON.stringify(message));

        // You may get a text or attachment but not both
        if (message.text) {
            // preemptively check if message is looking to see all members in the group
            if (message.text.localeCompare("View Members") == 0 || message.text.localeCompare("view members") == 0 || message.text.localeCompare("View members") == 0) {
                // code to allow users to see all members
                ;

            } else {
                User.find({user_id: senderId}, function(err, response) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (response[0].interests == null) {
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
                            sendMessage(senderId, {text: newMessage});
                        } else {
                            // user already exists in the database, message received is for fun fact
                            console.log(senderId + "exits. Adding fun fact");
                            User.update({user_id: senderId}, {fun_fact: message.text}, function (err, response) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(response);
                                }
                            });

                            
                            var newMessage = "Great, you're all signed up! Keep on the lookout for weekly messages from us on Mondays!";
                            var viewMembersMessage = "In the meantime, type " + '"' + "View Members" + '"' + " if you would like to get a preview of who else is in RCF Meets!";
                            sendMessage(senderId, {text: newMessage});
                            sendMessage(senderId, {text: viewMembersMessage});
    
                        }
                    }
                });
            }
            
        } else if (message.attachments) {
            sendMessage(senderId, {text: "Sorry, I don't understand your request."});
        }
    }
}
  
// sends message to user
function sendMessage(recipientId, message) {
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: "POST",
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log("Error sending message: " + response.error);
        }
    });
}

//sends message with attachement
function sendAttachment(recipientId, url) {
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: "POST",
        json: {
            recipient: {id: recipientId},
            message: {
                attachment: {
                    type: "image", 
                    payload: {
                        url: url, 
                        is_reusable: true
                    }
                }
            }
        }
    }, function(error, response, body) {
        if (error) {
            console.log("Error sending message: " + response.error);
        } else {
            console.log(response);
        }
    });
}
