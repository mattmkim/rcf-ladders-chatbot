var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

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
            fields: "first_name"
        },
        method: "GET"
        }, function(error, response, body) {
            var greeting = "";
            if (error) {
                console.log("Error getting user's name: " +  error);
            } else {
                var bodyObj = JSON.parse(body);
                name = bodyObj.first_name;
                greeting = "Hi " + name + "! ";
            }
            console.log("here");
            var message = greeting + "Thanks for joining RCF Meets! To begin, let's build your profile! What's something you like to do in your free time?" + 
            " No need to write an essay - a couple interests should do.";
            sendMessage(senderId, {text: message});
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
            User.find({user_id: senderId}, function(err, response) {
                if (err) {
                    console.log(err);
                } else {
                    if (response.length == 0) {
                        console.log(senderId + "does not exist. Adding " + senderId);
                        var newUser = new User({
                            user_id: senderId,
                            interests: message,
                            fun_fact: null
                        });
                        newUser.save(function (err, response) {
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
                        User.update({user_id: senderId}, {fun_fact: message}, function (err, response) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(response);
                            }
                        });
                        
                        var newMessage = "Great, you're all signed up!";
                        sendMessage(senderId, {text: newMessage});
                    }
                }
            });
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