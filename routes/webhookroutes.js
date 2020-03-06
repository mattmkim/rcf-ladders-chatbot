module.exports = {

    getWebhook: function (req, res) {
        if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
            console.log("Verified webhook");
            res.status(200).send(req.query["hub.challenge"]);
        } else {
            console.error("Verification failed. The tokens do not match.");
            res.sendStatus(403);
        }
    },

    postWebhook: function (req, res) {
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
    }

}