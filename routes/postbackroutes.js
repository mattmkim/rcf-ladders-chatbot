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
                tag: "NON_PROMOTIONAL_SUBSCRIPTION"
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
                tag: "NON_PROMOTIONAL_SUBSCRIPTION"
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
    }
}