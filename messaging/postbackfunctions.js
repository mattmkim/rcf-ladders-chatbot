var request = require("request");

module.exports = {
    
    sleep: function(ms){
        return new Promise(resolve=>{
            setTimeout(resolve, ms)
        })
    },
    
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
                messaging_type: "MESSAGE_TAG",
                tag: "CONFIRMED_EVENT_UPDATE"
            }
        }, function(error, response, body){
                if (error) {
                    console.log("Error sending message: " + response.error)
                }
        })
    },

    viewMembers: function(senderId, members) {
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
                messaging_type: "MESSAGE_TAG",
                tag: "CONFIRMED_EVENT_UPDATE"
            }
        }, function(error, response, body){
                if (error) {
                    console.log("Error sending message: " + response.error)
                }
        })
    },

    laddersPB: function(senderId, firstName, lastName, imageUrl, interests, funfact) {
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