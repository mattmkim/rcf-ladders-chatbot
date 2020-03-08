var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var app = express();
var cron = require('node-cron');
const http = require("http");

setInterval(function() {
    http.get("http://rcf-meets.herokuapp.com");
}, 300000); // 5 Minutes

var db = mongoose.connect("mongodb://mattmkim:minwoo123@ds351455.mlab.com:51455/heroku_7866frlv");
var User = require("./models/users");
var preferencesRoutes = require('./routes/preferencesroutes.js')(User);
var webhookRoutes = require('./routes/webhookroutes.js')(User);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));
app.set('views', './views');
app.set('view engine', 'ejs');

// Server index page
app.get("/", function (req, res) {
    res.send("Deployed!");
});

// send availability postback every Saturday night
// real time string: '0 6 * * Sunday'
// cron.schedule('0 17 * * Saturday', () => {
//     sendAvailabilityPB();
// }, {
//     scheduled: true,
//     timezone: "America/New_York"
// });

// send ladders partners Sunday nights
// real time string: '0 5 * * Monday'
// cron.schedule('0 16 * * Sunday', () => {
//     sendLadders();
// }, {
//     scheduled: true,
//     timezone: "America/New_York"
// })

// send ladders partners Sunday nights
// real time string: '0 5 * * Monday'
// cron.schedule('15 15 * * Sunday', () => {
//     sendAvailabilityReminder();
// }, {
//     scheduled: true,
//     timezone: "America/New_York"
// })


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
app.get('/preferences/:userId', preferencesRoutes.open_preferences_webview);

// app.get('/preferences/:userId', (req, res, next) => {
//     let referer = req.get('Referer');

//     if (referer == undefined) {
//         User.find({}).sort('year').exec(function(err, response) {
//             if (err) {
//                 console.log(err);
//             } else {
//                 User.find({user_id: req.params.userId}, function(err, response2) {
//                     res.render('webview', {data: response, access: process.env.PAGE_ACCESS_TOKEN, currUser: req.params.userId, known: response2[0].known});
//                 })
//             }
//         })
//     } else {
//         if (referer.indexOf('www.messenger.com') >= 0) {
//             res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.messenger.com/');
//         } else if (referer.indexOf('www.facebook.com') >= 0) {
//             res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.facebook.com/');
//         }
        
//         User.find({}).sort('year').exec(function(err, response) {
//             if (err) {
//                 console.log(err);
//             } else {
//                 User.find({user_id: req.params.userId}, function(err, response2) {
//                     res.render('webview', {data: response, access: process.env.PAGE_ACCESS_TOKEN, currUser: req.params.userId, known: response2[0].known});
//                 })
//             }
//         })
        
//     }
// });

app.post('/preferencespostback/:userId', preferencesRoutes.submit_preferences);

// app.post('/preferencespostback/:userId', (req, res) => {
//     let body = req.body;
//     var newMessage = "Great, thanks for submitting your preferences! Keep on the lookout for weekly messages from us on Saturdays!";
//     var viewMembersMessage = "In the meantime, type " + '"' + "View Commands" + '"' + " to view all valid commands.";
    
//     //keys is array of all keys (psid, ....., submit)
//     let keys = Object.keys(body);

//     if (keys.length != 0) {
//         keys.splice(keys.indexOf('psid'), 1);
//         keys.splice(keys.indexOf('submit'), 1);
//     }

//     console.log(keys);

//     User.update({user_id: req.params.userId}, {known: keys}, function(err, response) {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log(response);
//         }
//     })

//     // code to update status of user (list of people to not pair up with)
//     // need to somehow send back user id
//     res.status(200).send('Please close this window to return to the conversation thread.');

//     sendTwoMessages(req.params.userId, newMessage, viewMembersMessage);
// });


// Facebook Webhook
// Used for verification
app.get("/webhook", webhookRoutes.getWebhook);

// app.get("/webhook", function (req, res) {
//     if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
//         console.log("Verified webhook");
//         res.status(200).send(req.query["hub.challenge"]);
//     } else {
//         console.error("Verification failed. The tokens do not match.");
//         res.sendStatus(403);
//     }
// });

// All callbacks for Messenger will be POST-ed here
app.post("/webhook", webhookRoutes.postWebhook);

// app.post("/webhook", function (req, res) {
//     // Make sure this is a page subscription
//     if (req.body.object == "page") {
//         // Iterate over each entry
//         // There may be multiple entries if batched
//         req.body.entry.forEach(function(entry) {
//             // Iterate over each messaging event
//             entry.messaging.forEach(function(event) {
//                 if (event.postback) {
//                     processPostback(event);
//                 } else if (event.message) {
//                     processMessage(event);
//                 }
//             });
//         });

//         res.sendStatus(200);
//     }
// });
  
//async function processPostback(event) {

//function processMessage(event) {


// sends message to user
function sendMessage(recipientId, message) {
    request({
        url: "https://graph.facebook.com/v6.0/me/messages",
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: "POST",
        json: {
            recipient: {id: recipientId},
            message: message,
            messaging_type: "MESSAGE_TAG",
            tag: "CONFIRMED_EVENT_UPDATE"

        }
    }, function(error, response, body) {
        if (error) {
            console.log("Error sending message: " + response.error);
        } else {
            console.log(body);
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
                known: [],
                prevMeetup: []
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
                //console.log(response);
                while (response.length > 0) {
                    var f = response[Math.floor(Math.random() * response.length)];
                    //console.log(f);
                    var s = response[Math.floor(Math.random() * response.length)];
                    //console.log(s);

                    var setFPrevMeetup = new Set(f.prevMeetup);
                    while ((f.known.includes(s.user_id) && s.known.includes(f.user_id)) || f.user_id.localeCompare(s.user_id) == 0 || setFPrevMeetup.has(s.user_id)) {
                        s = response[Math.floor(Math.random() * response.length)];
                        if (setFPrevMeetup.has(s.user_id)) {
                            if (setFPrevMeetup.size == response.length - 1) {
                                break;
                            } else {
                                if (f.known.length == response.length - 1) {
                                    if (s.known.length == response.length - 1) {
                                        if (f.user_id.localeCompare(s.user_id) == 0) {
                                            continue;
                                        } else {
                                            break;
                                        }
                                    } else {
                                        continue;
                                    }
                                }
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
                            //console.log(response);
                        }
                    })
                    User.updateOne({user_id: s.user_id}, {available: false}, function(err, response) {
                        if (err) {
                            console.log(err);
                        } else {
                            //console.log(response);
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
                                //console.log(response);
                            }
                        })
                        console.log(f.firstName + f.lastName + " matched with " + s.firstName + s.lastName + " and " + t.firstName + t.lastName);
                        var messageToF = "Hi " + f.firstName + ", meet " + s.firstName + " and " + t.firstName + "! You all said you were able to meet this week. Message " + s.firstName + " and " + t.firstName + " to schedule a time to meet.";
                        var secondMessageToF = s.firstName + "'s interests: " + s.interests + "\n" + s.firstName + "'s fun fact: " + s.fun_fact + "\n\n"
                        t.firstName + "'s interests: " + t.interests + "\n" + t.firstName + "'s fun fact: " + t.fun_fact;
                        var messageToS = "Hi " + s.firstName + ", meet " + f.firstName + " and " + t.firstName + "! You all said you were able to meet this week. Message " + f.firstName + " and " + t.firstName + " to schedule a time to meet.";
                        var secondMessageToS = f.firstName + "'s interests: " + f.interests + "\n" + f.firstName + "'s fun fact: " + f.fun_fact + "\n\n"
                        t.firstName + "'s interests: " + t.interests + "\n" + t.firstName + "'s fun fact: " + t.fun_fact;
                        var messageToT = "Hi " + t.firstName + ", meet " + s.firstName + " and " + f.firstName + "! You all said you were able to meet this week. Message " + f.firstName + " and " + s.firstName + " to schedule a time to meet.";
                        var secondMessageToT = s.firstName + "'s interests: " + s.interests + "\n" + s.firstName + "'s fun fact: " + s.fun_fact + "\n\n"
                        f.firstName + "'s interests: " + f.interests + "\n" + f.firstName + "'s fun fact: " + f.fun_fact;
                        sendTwoMessages(f.user_id, messageToF, secondMessageToF);
                        sendTwoMessages(s.user_id, messageToS, secondMessageToS);
                        sendTwoMessages(t.user_id, messageToT, secondMessageToT);
                        laddersPB(f.user_id, s.firstName, s.lastName, s.profileUrl, s.interests, s.fun_fact);
                        laddersPB(f.user_id, t.firstName, t.lastName, t.profileUrl, t.interests, t.fun_fact);
                        laddersPB(s.user_id, f.firstName, f.lastName, f.profileUrl, f.interests, f.fun_fact);
                        laddersPB(s.user_id, t.firstName, t.lastName, t.profileUrl, t.interests, t.fun_fact);
                        laddersPB(t.user_id, s.firstName, s.lastName, s.profileUrl, s.interests, s.fun_fact);
                        laddersPB(t.user_id, f.firstName, f.lastName, f.profileUrl, f.interests, f.fun_fact);

                        User.update({user_id: f.user_id}, { $push: {prevMeetup: [s.user_id, t.user_id]} }, function(err, response) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("Updated previous for " + f.user_id);
                            }
                        })

                        User.update({user_id: s.user_id}, { $push: {prevMeetup: [f.user_id, t.user_id]} }, function(err, response) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("Updated previous for " + s.user_id);
                            }
                        })

                        User.update({user_id: t.user_id}, { $push: {prevMeetup: [s.user_id, f.user_id]} }, function(err, response) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("Updated previous for " + t.user_id);
                            }
                        })

                    } else {
                        console.log(f.firstName + f.lastName + " matched with " + s.firstName + s.lastName);
                        var messageToF = "Hi " + f.firstName + ", meet " + s.firstName + "! You both said you were able to meet this week. Message " + s.firstName + " to schedule a time to meet.";
                        var secondMessageToF = s.firstName + "'s interests: " + s.interests + "\n" + s.firstName + "'s fun fact: " + s.fun_fact;
                        var messageToS = "Hi " + s.firstName + ", meet " + f.firstName + "! You both said you were able to meet this week. Message " + f.firstName + " to schedule a time to meet.";
                        var secondMessageToS = f.firstName + "'s interests: " + f.interests + "\n" + f.firstName + "'s fun fact: " + f.fun_fact;
                        sendTwoMessages(f.user_id, messageToF, secondMessageToF);
                        sendTwoMessages(s.user_id, messageToS, secondMessageToS);
                        laddersPB(f.user_id, s.firstName, s.lastName, s.profileUrl, s.interests, s.fun_fact);
                        laddersPB(s.user_id, f.firstName, f.lastName, f.profileUrl, f.interests, f.fun_fact);
                        
                        //update previous

                        User.update({user_id: f.user_id}, { $push: {prevMeetup: s.user_id} }, function(err, response) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("Updated previous for " + f.user_id);
                            }
                        })

                        User.update({user_id: s.user_id}, { $push: {prevMeetup: f.user_id} }, function(err, response) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("Updated previous for " + s.user_id);
                            }
                        })
                        
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

function sendInfo() {
    var message = "Hi! Some updates:\n\n1) The set preferences functionality on the mobile Facebook messenger app is now working! Sorry for the inconvenience.\n\n2) Since next week is spring break, no pairings are going to be made this weekend. Have a great spring break!\n\n3) We know there has been some confusion about this so just to make things clear, in order for two people not to be paired up with each other, they BOTH must select each other while setting their preferences - please make sure that you’re setting your preferences!\n\n4) If you would no longer like to receive messages, just send " + '"' + "Unsubscribe" + '"'+ ".";
    User.find({}, function(err, response) {
        if (err) {
            console.log(err);
        } else {
            for (var i = 0; i < response.length; i++) {
                if (!(response[i].user_id.localeCompare("2740862885993089") == 0) && !(response[i].user_id.localeCompare("2713544202105549") == 0)) {
                    sendMessage(response[i].user_id, {text: message});
                    console.log(response[i].firstName);
                    console.log(response[i].user_id);
                }
                
            }
        }
    })
}

// function to remind people who have year == null to complete their profile
function sendProfileReminder() {
    var message = "Hi! Just a reminder to finish completing your profile when you get the chance! If you would like to start over, just send " + '"' + 
    "Get Started" + '"' + ".";
    User.find({}, function(err, response) {
        if (err) {
            console.log(err);
        } else {
            for (var i = 0; i < response.length; i++) {
                if (response[i].year == null) {
                    sendMessage(response[i].user_id, {text: message});
                    console.log(response[i].firstName);
                    console.log(response[i].user_id);
                }
            }
        }
    })
}

// function to remind people to update preferences
function sendPreferenceReminder() {
    var message = "Hi! Just a reminder to update your preferences if you haven't updated them recently! You can either scroll up and click the Set Preferences button, " +
    "or send " + '"' + "Set Preferences" + '",' + " and we will send you the button again.";
    User.find({}, function(err, response) {
        if (err) {
            console.log(err);
        } else {
            for (var i = 0; i < response.length; i++) {
                sendMessage(response[i].user_id, {text: message});
                console.log(response[i].firstName);
                console.log(response[i].user_id);
            }
        }
    })
}

// function to remind people to update preferences
function sendAvailabilityReminder() {
    var message = "Hi! Just a reminder to update your availability if you haven't already! Meetups are sent out at 4pm.";
    User.find({}, function(err, response) {
        if (err) {
            console.log(err);
        } else {
            for (var i = 0; i < response.length; i++) {
                sendMessage(response[i].user_id, {text: message});
                console.log(response[i].firstName);
                console.log(response[i].user_id);
            }
        }
    })
}

// function to test updating previous database
function testPreviousUpdate() {
    User.update({user_id: "2479283145514220"}, {$set : {prevMeetup: ["2479283145514220", "2479283145514220"]}}, function(err, response) {
        if (err) {
            console.log(err);
        } else {
            console.log("Updated previous for Matt Kim");
        }
    })
}

// function to make everyone available
function allAvailable() {
    User.find({}, function(err, response) {
        if (err) {
            console.log(err);
        } else {
            for (var i = 0; i < response.length; i++) {
                User.update({user_id: response[i].user_id}, {available: true}, function(err, response2) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(response2);
                    }
                })
            }
        }
    })
}