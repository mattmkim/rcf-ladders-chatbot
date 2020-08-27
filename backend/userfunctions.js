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
                
                var firstMessage = greeting + "Thanks for joining RCF Meets! All you have to do is answer the prompts! Don't worry too much about your responses now - you can always update them later.";
                //var url = "https://scontent-lga3-1.xx.fbcdn.net/v/t1.0-9/75127993_422291925366714_1670400768114425856_o.jpg?_nc_cat=109&_nc_ohc=qzo0m1xnBOYAQkEkl5MEkBwSkTC2eqPXz8nV6L-8FBb6t0A9AZVk38bLg&_nc_ht=scontent-lga3-1.xx&oh=7222ceccfb871c715cac3c32d7ebd30d&oe=5E6B246D"
                var secondMessage = "To begin, let's build your profile! What's something you like to do in your free time?" + 
                " Feel free to write as much as you want!";
                var passwordMessage = "Please enter the password to continue.";
                //sendAttachment(senderId, url);
                // var newUser = new User({
                //     user_id: senderId,
                //     interests: null,
                //     fun_fact: null,
                //     bible_verse: null,
                //     firstName: bodyObj.first_name,
                //     lastName: bodyObj.last_name,
                //     year: null,
                //     profileUrl: bodyObj.profile_pic,
                //     available: false,
                //     loggedIn: false,
                //     known: [],
                //     prevMeetup: []
                // });
                User.find({user_id: senderId}, function(err, response) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(response);
                        if (response.length === 0) {
                            msg.sendTwoMessages(senderId, firstMessage, passwordMessage);
                            console.log(senderId + " does not exist.");
                            // newUser.save(function (err, response) {
                            //     if (err) {
                            //         console.log(err);
                            //     } else {
                            //         console.log(response);
                            //     }
                            // });
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

    module.makeAvail = function() {
        User.find({}, function(err, response) {
            if (err) {
                console.log(err);
            } else {
                for (var i = 0; i < 20; i++) {
                    User.updateOne({user_id: response[i].user_id}, {available: true}, function(err, response2) {
                        if (err) {
                            console.log(err);
                        } else {
                            //console.log(response);
                        }
                    })
                }
            }
        })
    }

    module.deleteProfile = function(senderId) {
        var message = "You are now unsubscribed. If you want resubscribe, type " + '"' + "New Profile" + '"' + "!";
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

    module.sendAvailabilityPB = function() {
        User.find({}, function(err, response) {
            if (err) {
                console.log(err);
            } else {
                for (var i = 0; i < response.length; i++) {
                    postback.availabilityPB(response[i].user_id, response[i].firstName);
                }
            }
        })
    }

    module.sendLadders = function() {
        var message = "";
        User.find({available: true}, function(err, response) {
            if (err) {
                console.log(err);
            } else {
                //console.log(response);
                if (response.length == 0) {
                    console.log("No one is free :(");
                } else if (response.length == 1) {
                    message = "Wow, did not expect this to happen. Looks like no one else is free this week :(";
                    sendMessage(response[0].user_id, {text: message});
                } else {
                    //console.log(response);
                    while (response.length > 0) {
                        var f = response[Math.floor(Math.random() * response.length)]
                        //console.log(f);
                        var s = response[Math.floor(Math.random() * response.length)]
                        //console.log(s);
    
                        var setFPrevMeetup = new Set(f.prevMeetup);
                        var count = 0;
                        while ((f.known.includes(s.user_id) && s.known.includes(f.user_id)) || f.user_id.localeCompare(s.user_id) == 0 || setFPrevMeetup.has(s.user_id)) {
                            if (!(f.user_id.localeCompare(s.user_id) == 0)) {
                                if (response.length <= 3 || count > 10) {
                                    break
                                }
                            } 

                            s = response[Math.floor(Math.random() * response.length)]
                            count++
                        }



                        // while ((f.known.includes(s.user_id) && s.known.includes(f.user_id)) || f.user_id.localeCompare(s.user_id) == 0 || setFPrevMeetup.has(s.user_id)) {
                        //     console.log("infinite?")
                        //     s = response[Math.floor(Math.random() * response.length)];


                        //     if (setFPrevMeetup.has(s.user_id)) {
                        //         if (setFPrevMeetup.size == response.length - 1) {
                        //             break;
                        //         } else {
                        //             if (f.known.length == response.length - 1) {
                        //                 if (s.known.length == response.length - 1) {
                        //                     if (f.user_id.localeCompare(s.user_id) == 0) {
                        //                         continue;
                        //                     } else {
                        //                         break;
                        //                     }
                        //                 } else {
                        //                     continue;
                        //                 }
                        //             }
                        //         }
                        //     }
                            
                        // }
    
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
                            var questionOfWeek = "This week’s Question of the Week: If you could eliminate one food so no one could eat it ever again, what would you destroy? \n";

                            // msg.sendMessage(f.user_id, {text: questionOfWeek});
                            // msg.sendMessage(s.user_id, {text: questionOfWeek});
                            // msg.sendMessage(t.user_id, {text: questionOfWeek});

                            // postback.laddersProfile(f.user_id, s.user_id, f.firstName, s.firstName);
                            // postback.laddersProfile(f.user_id, t.user_id, f.firstName, t.firstName);
                            // postback.laddersProfile(s.user_id, f.user_id, s.firstName, f.firstName);
                            // postback.laddersProfile(s.user_id, t.user_id, s.firstName, t.firstName);
                            // postback.laddersProfile(t.user_id, s.user_id, t.firstName, s.firstName);
                            // postback.laddersProfile(t.user_id, f.user_id, t.firstName, f.firstName);
    
                            // User.update({user_id: f.user_id}, { $push: {prevMeetup: [s.user_id, t.user_id]} }, function(err, response) {
                            //     if (err) {
                            //         console.log(err);
                            //     } else {
                            //         console.log("Updated previous for " + f.user_id);
                            //     }
                            // })
    
                            // User.update({user_id: s.user_id}, { $push: {prevMeetup: [f.user_id, t.user_id]} }, function(err, response) {
                            //     if (err) {
                            //         console.log(err);
                            //     } else {
                            //         console.log("Updated previous for " + s.user_id);
                            //     }
                            // })
    
                            // User.update({user_id: t.user_id}, { $push: {prevMeetup: [s.user_id, f.user_id]} }, function(err, response) {
                            //     if (err) {
                            //         console.log(err);
                            //     } else {
                            //         console.log("Updated previous for " + t.user_id);
                            //     }
                            // })
    
                        } else {
                            console.log(f.firstName + f.lastName + " matched with " + s.firstName + s.lastName);
                            var questionOfWeek = "This week’s Question of the Week: If you could eliminate one food so no one could eat it ever again, what would you destroy? \n";

                            // msg.sendMessage(f.user_id, {text: questionOfWeek});
                            // msg.sendMessage(s.user_id, {text: questionOfWeek});

                            // postback.laddersProfile(f.user_id, s.user_id, f.firstName, s.firstName);
                            // postback.laddersProfile(s.user_id, f.user_id, s.firstName, f.firstName);
                            
                            // //update previous
    
                            // User.update({user_id: f.user_id}, { $push: {prevMeetup: s.user_id} }, function(err, response) {
                            //     if (err) {
                            //         console.log(err);
                            //     } else {
                            //         console.log("Updated previous for " + f.user_id);
                            //     }
                            // })
    
                            // User.update({user_id: s.user_id}, { $push: {prevMeetup: f.user_id} }, function(err, response) {
                            //     if (err) {
                            //         console.log(err);
                            //     } else {
                            //         console.log("Updated previous for " + s.user_id);
                            //     }
                            // })
                            
                        }
                    }
                    
                    console.log('Done iterating through list.');
                }
            }
        })
    }

    return module;

}