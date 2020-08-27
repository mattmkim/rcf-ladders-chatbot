var msg = require('../messaging/messagefunctions.js');

var routes = function(User) {

    var openPreferenceWebview = function (req, res) {
        let referer = req.get('Referer');
    
        if (referer == undefined) {
            User.find({}).sort('year').exec(function(err, response) {
                if (err) {
                    console.log(err);
                } else {
                    User.find({user_id: req.params.userId}, function(err, response2) {
                        res.render('webview', {data: response, access: process.env.PAGE_ACCESS_TOKEN, currUser: req.params.userId, known: response2[0].known});
                    })
                }
            })
        } else {
            if (referer.indexOf('www.messenger.com') >= 0) {
                res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.messenger.com/');
            } else if (referer.indexOf('www.facebook.com') >= 0) {
                res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.facebook.com/');
            }
            
            User.find({}).sort('year').exec(function(err, response) {
                if (err) {
                    console.log(err);
                } else {
                    User.find({user_id: req.params.userId}, function(err, response2) {
                        res.render('webview', {data: response, access: process.env.PAGE_ACCESS_TOKEN, currUser: req.params.userId, known: response2[0].known});
                    })
                }
            })
            
        }
    }

    var submitPreferences = function (req, res) {
        let body = req.body;
        var newMessage = "Great, thanks for submitting your preferences! Keep on the lookout for weekly messages from us on Saturdays!";
        var viewMembersMessage = "In the meantime, type " + '"' + "View Profile" + '"' + " if you want to see the information you've given, as well as if you want to make any updates! Type " + '"' + "View Commands" + '"' + " if you want to see a list of all valid commands.";
        
        //keys is array of all keys (psid, ....., submit)
        let keys = Object.keys(body);

        console.log(keys);
    
        if (keys.length != 0) {
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
    
        msg.sendTwoMessages(req.params.userId, newMessage, viewMembersMessage);
    }

    var openUserProfile = function (req, res) {
        let referer = req.get('Referer');
    
        if (referer == undefined) {
            User.find({user_id: req.params.userId}, function(err, response) {
                if (err) {
                    console.log(err);
                } else {
                    res.render('profileview', {data: response[0], access: process.env.PAGE_ACCESS_TOKEN});
                }
            })
        } else {
            if (referer.indexOf('www.messenger.com') >= 0) {
                res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.messenger.com/');
            } else if (referer.indexOf('www.facebook.com') >= 0) {
                res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.facebook.com/');
            }
            
            User.find({user_id: req.params.userId}, function(err, response) {
                if (err) {
                    console.log(err);
                } else {
                    res.render('profileview', {data: response[0], access: process.env.PAGE_ACCESS_TOKEN});
                }
            })
            
        }
    }

    var submitUpdate = function (req, res) {
        let body = req.body;
        let values = Object.values(body);
    
        console.log(values);
        console.log(req.params.userId);
        var verse = values[0];

        var school_year = 0;
        if (values[1].localeCompare("Freshman") == 0) {
            school_year = 1;
        } else if (values[1].localeCompare("Sophomore") == 0) {
            school_year = 2;
        } else if (values[1].localeCompare("Junior") == 0) {
            school_year = 3;
        } else if (values[1].localeCompare("Senior") == 0) {
            school_year = 4;
        }

        var availability = true;
        if (values[2].localeCompare("Available") == 0) {
            availability = true;
        } else {
            availability = false;
        }

        var interests = values[3];
        var fun_fact = values[4];
    
        User.update({user_id: req.params.userId}, {bible_verse: verse}, function(err, response) {
            if (err) {
                console.log(err);
            } else {
                console.log(response);
            }
        })

        User.update({user_id: req.params.userId}, {year: school_year}, function(err, response) {
            if (err) {
                console.log(err);
            } else {
                console.log(response);
            }
        })

        User.update({user_id: req.params.userId}, {available: availability}, function(err, response) {
            if (err) {
                console.log(err);
            } else {
                console.log(response);
            }
        })

        User.update({user_id: req.params.userId}, {interests: interests}, function(err, response) {
            if (err) {
                console.log(err);
            } else {
                console.log(response);
            }
        })

        User.update({user_id: req.params.userId}, {fun_fact: fun_fact}, function(err, response) {
            if (err) {
                console.log(err);
            } else {
                console.log(response);
            }
        })
    
        // code to update status of user (list of people to not pair up with)
        // need to somehow send back user id
        res.status(200).send('Please close this window to return to the conversation thread.');
    }

    var openLaddersProfile = function (req, res) {
        let referer = req.get('Referer');
    
        if (referer == undefined) {
            User.find({user_id: req.params.laddersId}, function(err, response) {
                if (err) {
                    console.log(err);
                } else {
                    res.render('laddersprofileview', {data: response[0], access: process.env.PAGE_ACCESS_TOKEN});
                }
            })
        } else {
            if (referer.indexOf('www.messenger.com') >= 0) {
                res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.messenger.com/');
            } else if (referer.indexOf('www.facebook.com') >= 0) {
                res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.facebook.com/');
            }
            
            User.find({user_id: req.params.laddersId}, function(err, response) {
                if (err) {
                    console.log(err);
                } else {
                    res.render('laddersprofileview', {data: response[0], access: process.env.PAGE_ACCESS_TOKEN});
                }
            })
            
        }
    }

    return {
		open_preferences_webview: openPreferenceWebview,
        submit_preferences: submitPreferences,
        open_user_profile: openUserProfile,
        submit_update: submitUpdate,
        open_ladders_profile: openLaddersProfile
	}
}

module.exports = routes;