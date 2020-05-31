var request = require("request");

module.exports = {
    
    sleep: function(ms){
        return new Promise(resolve=>{
            setTimeout(resolve, ms)
        })
    },

    // postPB: function(senderId, )
    
    underYearPB: function(senderId) {
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
                messaging_type: "MESSAGE_TAG",
                tag: "CONFIRMED_EVENT_UPDATE"
            }
        }, function(error, response, body){
                if (error) {
                    console.log("Error sending message: " + response.error)
                } else {
                    console.log(response);
                }
        })
    }, 

    upperYearPB: function(senderId) {
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
                messaging_type: "MESSAGE_TAG",
                tag: "CONFIRMED_EVENT_UPDATE"
            }
        }, function(error, response, body){
                if (error) {
                    console.log("Error sending message: " + response.error)
                } else {
                    console.log(response);
                }
        })
    },

    sendYearPBs: async function(senderId) {
        module.exports.underYearPB(senderId);
        await module.exports.sleep(200);
        module.exports.upperYearPB(senderId)
    },

    setPreferences: function(senderId) {
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
                messaging_type: "MESSAGE_TAG",
                tag: "CONFIRMED_EVENT_UPDATE"
            }
        }, function(error, response, body){
                if (error) {
                    console.log("Error sending message: " + response.error)
                } else {
                    console.log(response);
                }
        })
    },

    laddersProfile: function(userId, laddersId, userFirstName, laddersFirstName) {
        let messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [
                        {
                        "title": "Meet " + laddersFirstName + "!",
                        "image_url": "https://graph.facebook.com/" + laddersId + "/picture?width=800&access_token=EAAGGoIdm5HoBABBvCjuZADP90chUfr7L41uoaRQSk0P3N7JDXYLW6mHRGMefZBvDBZC4r9kOndzBWMbUcSFcaS8g3ZBKOqDBTlXNKs1AK1LbzbaDhUBNsdeeLEYSZCfG8voktlPyZA3zXZCxq0q9k6DdoKROPbFtLo6YDEo88xjM0GAQKXkXAVF",
                        "subtitle": "Hi " + userFirstName + ", meet " + laddersFirstName + "! Click the button below to learn more about " + laddersFirstName + "!",
                        "buttons": [
                            {
                                "type": "web_url",
                                "url":  "https://rcf-meets.herokuapp.com/laddersprofile/" + laddersId,
                                "title": laddersFirstName + "'" + "s Profile",
                                "webview_height_ratio": "full",
                                "messenger_extensions": true
                            }
                        ]
                        }]
                    // "template_type": "button",
                    // "text": "Hi " + userFirstName + ", meet " + laddersFirstName + "! Click the button below to learn more about " + laddersFirstName + "!",
                    // "buttons": [{
                    //     "type": "web_url",
                    //     "url":  "https://rcf-meets.herokuapp.com/laddersprofile/" + laddersId,
                    //     "title": laddersFirstName + "'" + "s Profile",
                    //     "webview_height_ratio": "full",
                    //     "messenger_extensions": true
                    // }]
                }
            }
        }
        request({
            url: 'https://graph.facebook.com/v5.0/me/messages',
            qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
            method: 'POST',
            json: {
                recipient: {id: userId},
                message: messageData,
                messaging_type: "MESSAGE_TAG",
                tag: "CONFIRMED_EVENT_UPDATE"
            }
        }, function(error, response, body){
                if (error) {
                    console.log("Error sending message: " + response.error)
                } else {
                    //console.log(response);
                }
        })
    },

    viewProfile: function(senderId) {
        let messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": "Click below to view your profile!",
                    "buttons": [{
                        "type": "web_url",
                        "url":  "https://rcf-meets.herokuapp.com/profile/" + senderId,
                        "title": "View Profile",
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
                messaging_type: "MESSAGE_TAG",
                tag: "CONFIRMED_EVENT_UPDATE"
            }
        }, function(error, response, body){
                if (error) {
                    console.log("Error sending message: " + response.error)
                } else {
                    console.log(response);
                }
        })
    }, 

    availabilityPB: function(senderId, name) {
        let messageData = {
            "attachment":{
                "type":"template",
                "payload":{
                    "template_type":"button",
                    "text": "Hi " + name + ", are you free to meet with someone (virtually) this week?",
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
                messaging_type: "MESSAGE_TAG",
                tag: "CONFIRMED_EVENT_UPDATE"
            }
        }, function(error, response, body){
                if (error) {
                    console.log("Error sending message: " + response.error)
                }
        })
    }, 

    availabilityPBSingle: function(senderId, name) {
        let messageData = {
            "attachment":{
                "type":"template",
                "payload":{
                    "template_type":"button",
                    "text": "Hi " + name + ", thanks for joining RCF Meets! Just to give a brief overview of what's happening - if you would like meet with someone this week, please select Yes! Tomorrow at 10 am EST you will receive a message about who your meetup partner is going to be. If you would not like to meetup with someone this week, please select No.",
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
                messaging_type: "MESSAGE_TAG",
                tag: "CONFIRMED_EVENT_UPDATE"
            }
        }, function(error, response, body){
                if (error) {
                    console.log("Error sending message: " + response.error)
                }
        })
    }
}