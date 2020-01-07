var express = require("express");
var request = require("request");
var cron = require('node-cron');
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
const http = require("http");

setInterval(function() {
    http.get("http://rcf-meets.herokuapp.com");
}, 300000); // 5 Minutes

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

// send availability postback every Sunday morning
// real time string: '0 6 * * Sunday'
cron.schedule('10 0 * * Saturday', () => {
    sendAvailabilityPB();
}, {
    scheduled: true,
    timezone: "America/New_York"
});

// send ladders partners Monday mornings
// real time string: '0 5 * * Monday'
cron.schedule('0 5 * * Monday', () => {
    sendLadders();
}, {
    scheduled: true,
    timezone: "America/New_York"
})


function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve, ms)
    })
}
// for sending two consecutive messages
async function sendTwoMessages(senderId, message1, message2){
    sendMessage(senderId, {text: message1});
    await sleep(200);
    sendMessage(senderId, {text: message2});
}

// for sending three consecutive messages
async function sendThreeMessages(senderId, message1, message2, message3){
    sendMessage(senderId, {text: message1});
    await sleep(200);
    sendMessage(senderId, {text: message2});
    await sleep(200);
    sendMessage(senderId, {text: message3});

}


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
        newUser(senderId);
    } else if (payload == "YES") {
        User.update({user_id: senderId}, {available: true}, function(err, response) {
            if (err) {
                console.log(err);
            } else {
                console.log(response);
                console.log("Updated " + senderId + " to true.");
            }
        })
        var message = "Got it. I'll get back to you by Monday morning!"
        sendMessage(senderId, {text: message});
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
        sendMessage(senderId, {text: message});
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
            var text = message.text;
            if (text.localeCompare("View Members") == 0 || text.localeCompare("view members") == 0 || text.localeCompare("View members") == 0) {
                // view 10 members who have signed up
                // potentially add functionality so users can specify which users they want to see??
                User.find({}).limit(10).exec(function(err, response) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(response);
                        viewMembers(senderId, response);
                    }
                })
            } else if (text.localeCompare("View Commands") == 0 || text.localeCompare("View commands") == 0 || text.localeCompare("view commands") == 0) {
                var message = "All valid commands: \n\nView Members: Send " + '"' + "View Members" + '"' + " to get a preview of members who are also in RCF Meets! \n\n" 
                + "Unsubscribe: Send " + '"' + "Unsubscribe" + '"' + "if you want to unsubscribe and no longer want to receive messages. \n\n" + 
                "Update Availability: Send " + '"' + "Update Availability" + '"' + " if you want to update your availabilility. \n\n" +
                "Get Started: Send " + '"' + "Get Started" + '"' + " if you want to remake your profile, or if you have recently unsubscribed and would like to subscribe again."; 
                sendMessage(senderId, {text: message});
            } else if (text.localeCompare("Unsubscribe") == 0 || text.localeCompare("unsubscribe") == 0) {
                deleteProfile(senderId);
            } else if (text.localeCompare("Update Availability") == 0 || text.localeCompare("update availability") == 0 || text.localeCompare("Update availability") == 0) {
                User.find({user_id: senderId}, function(err, response) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(response);
                        availabilityPB(senderId, response[0].firstName);
                    }
                })
            } else if (text.localeCompare("Get Started") == 0 || text.localeCompare("Get started") == 0 || text.localeCompare("get started") == 0) {
                getStarted(senderId);
            // for APP APPROVAL ONLY    
            } else if (text.localeCompare("Ask Availability") == 0 || text.localeCompare("Ask availability") == 0 || text.localeCompare("ask availability") == 0) {
                sendAvailabilityPB();
            } else if (text.localeCompare("Show Meetup") == 0 || text.localeCompare("Show meetup") == 0 || text.localeCompare("show meetup") == 0) {
                sendLadders();
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
                        } else if (response[0].fun_fact == null) {
                            // user already exists in the database, message received is for fun fact
                            console.log(senderId + "exits. Adding fun fact");
                            User.update({user_id: senderId}, {fun_fact: message.text}, function (err, response) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(response);
                                }
                            });  
                            var newMessage = "Great, you're all signed up! Keep on the lookout for weekly messages from us on Sundays!";
                            var viewMembersMessage = "In the meantime, type " + '"' + "View Members" + '"' + " if you would like to get a preview of who else is in RCF Meets!";
                            sendTwoMessages(senderId, newMessage, viewMembersMessage);
                        } else {
                            // user filled out interests and fun fact - send message stating unknown request
                            var newMessage = "Sorry, we did not understand your request. Type " + '"' + "View Commands" + '"' + " to see all possible commands.";
                            sendMessage(senderId, {text: newMessage});
                        }
                    }
                });
            }
        } else if (message.attachments) {
            sendMessage(senderId, {text: "Sorry, we don't understand your request."});
        }
    }
}


// sends message to user
function sendMessage(recipientId, message) {
    request({
        url: "https://graph.facebook.com/v5.0/me/messages",
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

// sends message to user
function sendSubscriptionMessage(recipientId, message) {
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: "POST",
        json: {
            recipient: {id: recipientId},
            message: message,
            tag: "NON_PROMOTIONAL_SUBSCRIPTION"
        }
    }, function(error, response, body) {
        if (error) {
            console.log("Error sending message: " + response.error);
        }
    });
}

// function for new user
function newUser(senderId) {
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
            " No need to write an essay - a couple interests should do.";
            //sendAttachment(senderId, url);
            var newUser = new User({
                user_id: senderId,
                interests: null,
                fun_fact: null,
                firstName: bodyObj.first_name,
                lastName: bodyObj.last_name,
                profileUrl: bodyObj.profile_pic,
                //userLink: bodyObj.user_link,
                available: false
            });
            
            User.find({user_id: senderId}, function(err, response) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(response);
                    if (response.length === 0) {
                        sendTwoMessages(senderId, firstMessage, secondMessage);
                        console.log(senderId + " does not exist.");
                        newUser.save(function (err, response) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(response);
                            }
                        });
                    } else if (response[0].interests == null) {
                        sendTwoMessages(senderId, firstMessage, secondMessage);
                        console.log(senderId + " does not exist.");
                    } else if (response[0].fun_fact == null) {
                        firstMessage = firstMessage + " Looks like your profile is almost complete! What's a fun fact about yourself?";
                        sendMessage(senderId, {text: firstMessage});
                    } else {
                        secondMessage = "Looks like you're already logged in! Keep on the lookout for weekly messages from us on Sundays!"
                        var viewMembersMessage = "In the meantime, type " + '"' + "View Members" + '"' + " if you would like to get a preview of who else is in RCF Meets!";
                        sendThreeMessages(senderId, firstMessage, secondMessage, viewMembersMessage);
                    }
                }
            })
            
        });
    
}

// function to handle Get Started command
function getStarted(senderId) {
    User.find({user_id: senderId}, function(err, response) {
        if (err) {
            console.log(err);
        } else if (response.length === 0) {
            newUser(senderId);
        } else {
            User.deleteOne({user_id: senderId}, function(err, response) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(response);
                    console.log("Deleted user " + senderId);
                    newUser(senderId);
                }
            })
        }
    })
}

// function to iterate through all users and send availability postback
function sendAvailabilityPB() {
    User.find({}, function(err, response) {
        if (err) {
            console.log(err);
        } else {
            for (var i = 0; i < response.length; i++) {
                availabilityPB(response[i].user_id, response[i].firstName);
            }
        }
    })
}

// function to send postback asking if users are free for the week
function availabilityPB(senderId, name) {
    let messageData = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"button",
                "text": "Hi " + name + ", are you free to meet with someone this week?",
                "buttons":[
                    {
                        "type":"postback",
                        "title":"Yes",
                        "payload":"YES"
                    },
                    {
                        "type":"postback",
                        "title":"No",
                        "payload":"NO"
                    }
                ]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: {id: senderId},
            message: messageData,
            tag: "NON_PROMOTIONAL_SUBSCRIPTION"
        }
    }, function(error, response, body){
            if (error) {
                console.log("Error sending message: " + response.error)
            }
    })
}

// function to generate ladders pairs
function sendLadders() {
    var message = "";
    User.find({available: true}, function(err, response) {
        if (err) {
            console.log(err);
        } else {
            //console.log(response);
            if (response.length == 0) {
                console.log("No one is free :(");
            } else if (response.length == 1) {
                message = "Looks like no one else is free this week :(. We'll get back to you if someone changes their mind!";
                sendMessage(response[0].user_id, {text: message});
            } else {
                while (response.length > 0) {
                    var f = response[Math.floor(Math.random() * response.length)];
                    console.log(f);
                    var indF = response.indexOf(f);
                    response.splice(indF, 1);
                    var s = response[Math.floor(Math.random() * response.length)];
                    console.log(s);
                    var indS = response.indexOf(s);
                    response.splice(indS, 1);
                    User.updateOne({user_id: f.user_id}, {available: false}, function(err, response) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(response);
                        }
                    })
                    User.updateOne({user_id: s.user_id}, {available: false}, function(err, response) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(response);
                        }
                    })
                    // if odd number of people, need to make a group of three?
                    if (response.length == 1) {
                        var t = response[0];
                        console.log(t);
                        var indT = response.indexOf(t);
                        response.splice(indT, 1);
                        User.updateOne({user_id: t.user_id}, {available: false}, function(err, response) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(response);
                            }
                        })
                        var messageToF = "Hi " + f.firstName + ", meet " + s.firstName + " and " + t.firstName + "! You all said you were able to meet this week. Message " + s.firstName + " and " + t.firstName + " to schedule a time to meet.";
                        var messageToS = "Hi " + s.firstName + ", meet " + f.firstName + " and " + t.firstName + "! You all said you were able to meet this week. Message " + f.firstName + " and " + t.firstName + " to schedule a time to meet.";
                        var messageToT = "Hi " + t.firstName + ", meet " + s.firstName + " and " + f.firstName + "! You all said you were able to meet this week. Message " + f.firstName + " and " + s.firstName + " to schedule a time to meet.";
                        sendSubscriptionMessage(f.user_id, {text: messageToF});
                        sendSubscriptionMessage(s.user_id, {text: messageToS});
                        sendSubscriptionMessage(t.user_id, {text: messageToT});
                        laddersPB(f.user_id, s.firstName, s.lastName, s.profileUrl, s.interests, s.fun_fact);
                        laddersPB(f.user_id, t.firstName, t.lastName, t.profileUrl, t.interests, t.fun_fact);
                        laddersPB(s.user_id, f.firstName, f.lastName, f.profileUrl, f.interests, f.fun_fact);
                        laddersPB(s.user_id, t.firstName, t.lastName, t.profileUrl, t.interests, t.fun_fact);
                        laddersPB(t.user_id, s.firstName, s.lastName, s.profileUrl, s.interests, s.fun_fact);
                        laddersPB(t.user_id, f.firstName, f.lastName, f.profileUrl, f.interests, f.fun_fact);
                    } else {
                        var messageToF = "Hi " + f.firstName + ", meet " + s.firstName + "! You both said you were able to meet this week. Message " + s.firstName + " to schedule a time to meet.";
                        var messageToS = "Hi " + s.firstName + ", meet " + f.firstName + "! You both said you were able to meet this week. Message " + f.firstName + " to schedule a time to meet.";
                        sendSubscriptionMessage(f.user_id, {text: messageToF});
                        sendSubscriptionMessage(s.user_id, {text: messageToS});
                        laddersPB(f.user_id, s.firstName, s.lastName, s.profileUrl, s.interests, s.fun_fact);
                        laddersPB(s.user_id, f.firstName, f.lastName, f.profileUrl, f.interests, f.fun_fact);
                    }
                }
                console.log('Done iterating through list.');
            }
        }
    })
}

// function to send postback allowing user to message ladders partner
function laddersPB(senderId, firstName, lastName, imageUrl, interests, funfact) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": firstName + " " + lastName,
                    "image_url": imageUrl,
                    "subtitle": 'Interests: ' + interests + "\n" + 'Fun Fact: ' + funfact,
                    // "buttons": [{
                    //     "type":"postback",
                    //     "title":"Yes",
                    //     "payload":"YES"
                    // }]
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: {id: senderId},
            message: messageData,
            tag: "NON_PROMOTIONAL_SUBSCRIPTION"
        }
    }, function(error, response, body){
            if (error) {
                console.log("Error sending message: " + response.error)
            }
    })
}

// function to view members
function viewMembers(senderId, members) {
    console.log(members);
    const memberObjs = [];
    for (let i = 0; i < members.length; i++) { 
       let obj = {
            "title": members[i].firstName + ' ' + members[i].lastName,
            "image_url": members[i].profileUrl,
            "subtitle": 'Interests: ' + members[i].interests + "\n" + 'Fun Fact: ' + members[i].fun_fact,
        }
        memberObjs.push(obj);
    }
    let messageData = {
    "attachment": {
        "type": "template",
        "payload": {
            "template_type": "generic",
            "elements": memberObjs
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: {id: senderId},
            message: messageData,
        }
    }, function(error, response, body){
            if (error) {
                console.log("Error sending message: " + response.error)
            }
    })
}

// function to delete profile, and unsubscribe
function deleteProfile(senderId) {
    var message = "You are now unsubscribed. If you want resubscribe, delete this chat and create a new profile!";
    User.deleteOne({user_id: senderId}, function(err, response) {
        if (err) {
            console.log(err);
        } else {
            console.log(response);
            console.log("Deleted user " + senderId);
        }
    })
    sendMessage(senderId, {text: message});
}