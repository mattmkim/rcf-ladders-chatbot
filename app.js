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
var db = mongoose.connect("mongodb://mattmkim:minwoo123@ds351455.mlab.com:51455/heroku_7866frlv");
var User = require("./models/users");

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.listen((process.env.PORT || 5000));
app.set('views', './views');
app.set('view engine', 'ejs');

// Server index page
app.get("/", function (req, res) {
    res.send("Deployed!");
});

// send availability postback every Saturday night
// real time string: '0 6 * * Sunday'
cron.schedule('0 18 * * Saturday', () => {
    sendAvailabilityPB();
}, {
    scheduled: true,
    timezone: "America/New_York"
});

// send ladders partners Sunday nights
// real time string: '0 5 * * Monday'
cron.schedule('0 18 * * Sunday', () => {
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
    await sleep(400);
    sendMessage(senderId, {text: message2});
}

// for sending three consecutive messages
async function sendThreeMessages(senderId, message1, message2, message3){
    sendMessage(senderId, {text: message1});
    await sleep(400);
    sendMessage(senderId, {text: message2});
    await sleep(400);
    sendMessage(senderId, {text: message3});

}

// for sending the year postbacks
async function sendYearPBs(senderId){
    underYearPB(senderId);
    await sleep(200);
    upperYearPB(senderId)
}

// Serve the options path and set required headers
app.get('/preferences/:userId', (req, res, next) => {
    let referer = req.get('Referer');
    if (referer) {
        if (referer.indexOf('www.messenger.com') >= 0) {
            res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.messenger.com/');
        } else if (referer.indexOf('www.facebook.com') >= 0) {
            res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.facebook.com/');
        }
        //res.sendFile('webview.html', {root: __dirname});
        User.find({}).sort('year').exec(function(err, response) {
            if (err) {
                console.log(err);
            } else {
                console.log(response);
                res.render('webview', {data: response, access: process.env.PAGE_ACCESS_TOKEN, currUser: req.params.userId});
            }
        })
        
    }
});

app.post('/preferencespostback/:userId', (req, res) => {
    let body = req.body;
    var newMessage = "Great, thanks for submitting your preferences! Keep on the lookout for weekly messages from us on Saturdays!";
    var viewMembersMessage = "In the meantime, type " + '"' + "View Commands" + '"' + " to view all valid commands.";
    
    //keys is array of all keys (psid, ....., submit)
    let keys = Object.keys(body);

    if (keys.length != 0) {
        keys.splice(keys.indexOf('psid'), 1);
        keys.splice(keys.indexOf('submit'), 1);
    }

    console.log(keys);

    User.update({user_id: req.params.userId}, {known: keys}, function(err, response) {
        if (err) {
            console.log(err);
        } else {
            console.log(response);
        }
    })

    // code to update status of user (list of people to not pair up with)
    // need to somehow send back user id
    res.status(200).send('Please close this window to return to the conversation thread.');

    sendTwoMessages(req.params.userId, newMessage, viewMembersMessage);
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
  
async function processPostback(event) {
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
        var message = "Got it. I'll get back to you Sunday night!"
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
    } else if (payload == "SENIOR") {
        User.update({user_id: senderId}, {year: 4}, function(err, response) {
            if (err) {
                console.log(err);
            } else {
                console.log(response);
            }
        })
        var newMessage = "Great, thanks for submitting your preferences! Keep on the lookout for weekly messages from us on Saturdays!";
        var viewMembersMessage = "In the meantime, type " + '"' + "View Commands" + '"' + " to view all valid commands.";
        setPreferences(senderId);
    } else if (payload == "JUNIOR") {
        User.update({user_id: senderId}, {year: 3}, function(err, response) {
            if (err) {
                console.log(err);
            } else {
                console.log(response);
            }
        })
        var newMessage = "Great, thanks for submitting your preferences! Keep on the lookout for weekly messages from us on Saturdays!";
        var viewMembersMessage = "In the meantime, type " + '"' + "View Commands" + '"' + " to view all valid commands.";
        setPreferences(senderId);
    } else if (payload == "SOPHOMORE") {
        User.update({user_id: senderId}, {year: 2}, function(err, response) {
            if (err) {
                console.log(err);
            } else {
                console.log(response);
            }
        })
        var newMessage = "Great, thanks for submitting your preferences! Keep on the lookout for weekly messages from us on Saturdays!";
        var viewMembersMessage = "In the meantime, type " + '"' + "View Commands" + '"' + " to view all valid commands.";
        setPreferences(senderId);
        
    } else if (payload == "FRESHMAN") {
        User.update({user_id: senderId}, {year: 1}, function(err, response) {
            if (err) {
                console.log(err);
            } else {
                console.log(response);
            }
        })
        var newMessage = "Great, thanks for submitting your preferences! Keep on the lookout for weekly messages from us on Saturdays!";
        var viewMembersMessage = "In the meantime, type " + '"' + "View Commands" + '"' + " to view all valid commands.";
        setPreferences(senderId);
        
    }
}

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
            if (text.localeCompare("View Members") == 0 || text.localeCompare("view members") == 0 || text.localeCompare("View members") == 0) {
                var notLoggedInMessage = "Please enter the password before sending commands.";
                User.find({user_id: senderId}, function(err, response) {
                    if (err) {
                        console.log(err);
                    } else if (response.length == 0 || response[0].loggedIn === false) {
                        sendMessage(senderId, {text: notLoggedInMessage});
                    } else {

                        User.findRandom({}, {}, {limit: 10}, function(err, response) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(response);
                                viewMembers(senderId, response);
                            }
                        })

                        // User.find({}).limit(10).exec(function(err, response) {
                        //     if (err) {
                        //         console.log(err);
                        //     } else {
                        //         console.log(response);
                        //         viewMembers(senderId, response);
                        //     }
                        // })
                    }
                })
            } else if (text.localeCompare("View Commands") == 0 || text.localeCompare("View commands") == 0 || text.localeCompare("view commands") == 0) {
                var notLoggedInMessage = "Please enter the password before sending commands.";
                User.find({user_id: senderId}, function(err, response) {
                    if (err) {
                        console.log(err);
                    } else if (response.length == 0 || response[0].loggedIn === false) {
                        sendMessage(senderId, {text: notLoggedInMessage});
                    } else {
                        var message = "All valid commands: \n\nView Members: Send " + '"' + "View Members" + '"' + " to get a preview of members who are also in RCF Meets! \n\n" 
                        + "Unsubscribe: Send " + '"' + "Unsubscribe" + '"' + " if you want to unsubscribe and no longer want to receive messages. \n\n" + 
                        "Update Availability: Send " + '"' + "Update Availability" + '"' + " if you want to update your availabilility. Note that while you can update your availability during the middle of the week, you won't get paired till Sunday. \n\n" +
                        "Get Started: Send " + '"' + "Get Started" + '"' + " if you want to remake your profile, or if you have recently unsubscribed and would like to subscribe again. \n\n" +
                        "Set Preferences: Send " + '"' + "Set Preferences" + '"' + " if you want to update your preferences."; 
                        sendMessage(senderId, {text: message});
                    }
                })
            } else if (text.localeCompare("Unsubscribe") == 0 || text.localeCompare("unsubscribe") == 0) {
                User.find({user_id: senderId}, function(err, response) {
                    if (err) {
                        console.log(err);
                    } else {
                        deleteProfile(senderId);
                    }
                })
            } else if (text.localeCompare("Update Availability") == 0 || text.localeCompare("update availability") == 0 || text.localeCompare("Update availability") == 0) {
                var notLoggedInMessage = "Please enter the password before sending commands.";
                User.find({user_id: senderId}, function(err, response) {
                    if (err) {
                        console.log(err);
                    } else if (response.length == 0 || response[0].loggedIn === false) {
                        sendMessage(senderId, {text: notLoggedInMessage});
                    } else if (response[0].fun_fact == null) {
                        var notFullySignedIn = "Your profile is not complete yet.";
                        sendMessage(senderId, {text: notFullySignedIn});
                    } else {
                        availabilityPB(senderId, response[0].firstName);
                    }
                })
            } else if (text.localeCompare("Get Started") == 0 || text.localeCompare("Get started") == 0 || text.localeCompare("get started") == 0) {
                getStarted(senderId);
            } else if (text.localeCompare("Set Preferences") == 0 || text.localeCompare("Set preferences") == 0 || text.localeCompare("set preferences") == 0) {
                setPreferences(senderId);
            // for APP APPROVAL ONLY    
            // } else if (text.localeCompare("Ask Availability") == 0 || text.localeCompare("Ask availability") == 0 || text.localeCompare("ask availability") == 0) {
            //     sendAvailabilityPB();
            // } else if (text.localeCompare("Show Meetup") == 0 || text.localeCompare("Show meetup") == 0 || text.localeCompare("show meetup") == 0) {
            //     sendLadders();
            // for APP APPROVAL ONLY
            } else if (text.localCompare("send reminder profile") == 0) {
                sendProfileReminder();
            } else {
                User.find({user_id: senderId}, function(err, response) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (response[0].loggedIn === false) {
                            if (text.localeCompare("rcfmeets2020") == 0) {
                                var correctPasswordMessage = "To begin, let's build your profile! What's something you like to do in your free time?" + 
                                " No need to write an essay - a couple interests should do.";
                                sendMessage(senderId, {text: correctPasswordMessage});
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
                                sendMessage(senderId, {text: wrongPasswordMessage});
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
                            sendMessage(senderId, {text: newMessage});
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
                            sendYearPBs(senderId);
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
        } else {
            console.log(body);
        }
    });
}

// sends message to user
function sendSubscriptionMessage(recipientId, message) {
    request({
        url: "https://graph.facebook.com/v5.0/me/messages",
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
                known: []
            });
            User.find({user_id: senderId}, function(err, response) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(response);
                    if (response.length === 0) {
                        sendTwoMessages(senderId, firstMessage, passwordMessage);
                        console.log(senderId + " does not exist.");
                        newUser.save(function (err, response) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(response);
                            }
                        });
                    } else if (response[0].loggedIn === false) {
                        sendMessage(senderId, {text: passwordMessage});
                    } else if (response[0].interests == null) {
                        sendTwoMessages(senderId, firstMessage, secondMessage);
                        console.log(senderId + " does not exist.");
                    } else if (response[0].fun_fact == null) {
                        firstMessage = firstMessage + " Looks like your profile is almost complete! What's a fun fact about yourself?";
                        sendMessage(senderId, {text: firstMessage});
                    } else if (response[0].year == null) {
                        sendYearPBs(senderId)
                    } else {
                        secondMessage = "Looks like you're already logged in! Keep on the lookout for weekly messages from us on Saturdays!"
                        var viewMembersMessage = "In the meantime, type " + '"' + "View Commands" + '"' + " to view all valid commands.";
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

// function to ask what year a user is
function underYearPB(senderId) {
    let messageData = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"button",
                "text": "What year are you?",
                "buttons":[
                    {
                        "type":"postback",
                        "title":"Freshman",
                        "payload":"FRESHMAN"
                    },
                    {
                        "type":"postback",
                        "title":"Sophomore",
                        "payload":"SOPHOMORE"
                    }
                ]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v5.0/me/messages',
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
            } else {
                console.log(response);
            }
    })
}

// function to ask what year a user is
function upperYearPB(senderId) {
    let messageData = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"button",
                "text": "Or...",
                "buttons":[
                    {
                        "type":"postback",
                        "title":"Junior",
                        "payload":"JUNIOR"
                    },
                    {
                        "type":"postback",
                        "title":"Senior",
                        "payload":"SENIOR"
                    }
                ]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v5.0/me/messages',
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
            } else {
                console.log(response);
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
        url: 'https://graph.facebook.com/v5.0/me/messages',
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
                message = "Looks like no one else is free this week :(";
                //sendMessage(response[0].user_id, {text: message});
            } else {
                console.log(response);
                while (response.length > 0) {
                    var f = response[Math.floor(Math.random() * response.length)];
                    //console.log(f);
                    var s = response[Math.floor(Math.random() * response.length)];
                    //console.log(s);

                    while ((f.known.includes(s.user_id) && s.known.includes(f.user_id)) || f.user_id.localeCompare(s.user_id) == 0) {
                        s = response[Math.floor(Math.random() * response.length)];
                        if (f.known.length == response.length - 1) {
                            if (s.known.length == response.length - 1) {
                                // both f and s know everyone else - but still check if f.user_id == s.user_id
                                if (f.user_id.localeCompare(s.user_id) == 0) {
                                    continue;
                                } else {
                                    break;
                                }
                            } else {
                                // f knows everyone else, find someone who doesn't know f
                                continue;
                            }
                        } 
                    }

                    var indF = response.indexOf(f);
                    response.splice(indF, 1);
                    var indS = response.indexOf(s);
                    response.splice(indS, 1);

                    //for testing comment out below

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


                    //if odd number of people, need to make a group of three?
                    if (response.length == 1) {
                        var t = response[0];
                        //console.log(t);
                        var indT = response.indexOf(t);
                        response.splice(indT, 1);
                        User.updateOne({user_id: t.user_id}, {available: false}, function(err, response) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(response);
                            }
                        })
                        console.log(f.firstName + " matched with " + s.firstName + " and " + t.firstName);
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
                        console.log(f.firstName + " matched with " + s.firstName);
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
        url: 'https://graph.facebook.com/v5.0/me/messages',
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
        if (members[i].user_id != senderId) {
            let obj = {
                "title": members[i].firstName + ' ' + members[i].lastName,
                "image_url": members[i].profileUrl,
                "subtitle": 'Interests: ' + members[i].interests + "\n" + 'Fun Fact: ' + members[i].fun_fact,
            }
            memberObjs.push(obj);
        }
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
        url: 'https://graph.facebook.com/v5.0/me/messages',
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
    var message = "You are now unsubscribed. If you want resubscribe, type Get Started!";
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

// function to send template to set preferences
function setPreferences(senderId) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Please select people you already know!",
                "buttons": [{
                    "type": "web_url",
                    "url":  "https://rcf-meets.herokuapp.com/preferences/" + senderId,
                    "title": "Set Preferences",
                    "webview_height_ratio": "full",
                    "messenger_extensions": true
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v5.0/me/messages',
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
            } else {
                console.log(response);
            }
    })
}

// function to remind people who have year == null to complete their profile
function sendProfileReminder() {
    var message = "Hi! Just a reminder to finish completing your profile!";
    User.find({}, function(err, response) {
        if (err) {
            console.log(err);
        } else {
            for (var i = 0; i < response.length; i++) {
                if (response[i].year == null) {
                    console.log(response[i].firstName);
                }
            }
        }
    })
}