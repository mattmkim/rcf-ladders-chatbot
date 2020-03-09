var msg = require('../messaging/messagefunctions.js');

var routes = function(User) {

    var openPreferenceWebview = function (req, res, next) {
        let referer = req.get('Referer');
    
        if (referer == undefined) {
            User.find({}).sort('year').exec(function(err, response) {
                if (err) {
                    console.log(err);
                } else {
                    // User.find({user_id: req.params.userId}, function(err, response2) {
                    //     res.render('webview', {data: response, access: process.env.PAGE_ACCESS_TOKEN, currUser: req.params.userId, known: response2[0].known});
                    // })

                    User.find({user_id: req.params.userId}, function(err, response2) {
                        res.render('webviewtest', {data: response, access: process.env.PAGE_ACCESS_TOKEN, currUser: req.params.userId, known: response2[0].known});
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
                    // User.find({user_id: req.params.userId}, function(err, response2) {
                    //     res.render('webview', {data: response, access: process.env.PAGE_ACCESS_TOKEN, currUser: req.params.userId, known: response2[0].known});
                    // })

                    // for new webview
                    User.find({user_id: req.params.userId}, function(err, response2) {
                        res.render('webviewtest', {data: response, access: process.env.PAGE_ACCESS_TOKEN, currUser: req.params.userId, known: response2[0].known});
                    })
                }
            })
            
        }
    }

    var submitPreferences = function (req, res) {
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
    
        msg.sendTwoMessages(req.params.userId, newMessage, viewMembersMessage);
    }

    return {
		open_preferences_webview: openPreferenceWebview,
		submit_preferences: submitPreferences
	}
}

module.exports = routes;