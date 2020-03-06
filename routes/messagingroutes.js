module.exports = {

    sleep: function(ms){
        return new Promise(resolve=>{
            setTimeout(resolve, ms)
        })
    },
    
    sendMessage: function(recipientId, message) {
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
    },

    sendTwoMessages: async function(senderId, message1, message2) {
        module.exports.sendMessage(senderId, {text: message1});
        await module.exports.sleep(400);
        module.exports.sendMessage(senderId, {text: message2});
    }, 

    sendThreeMessages: async function(senderId, message1, message2, message3){
        module.exports.sendMessage(senderId, {text: message1});
        await module.exports.sleep(400);
        module.exports.sendMessage(senderId, {text: message2});
        await module.exports.sleep(400);
        module.exports.sendMessage(senderId, {text: message3});
    }

}