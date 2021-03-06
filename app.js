var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var session = require("cookie-session")
const path = require('path');
var app = express();
var cron = require('node-cron');
const http = require("http");

setInterval(function() {
    http.get("http://rcf-meets.herokuapp.com");
}, 300000); // 5 Minutes

var db = mongoose.connect(process.env.DB_URI);
var User = require("./models/users");
var Post = require("./models/posts");
var preferencesRoutes = require('./routes/preferencesroutes.js')(User);
var webhookRoutes = require('./routes/webhookroutes.js')(User);
var postRoutes = require('./client/src/routes/postroutes.js')(Post);
var userFunctions = require('./backend/userfunctions')(User);
var reminderFunctions = require('./messaging/reminderfunctions')(User);

app.use("/public", express.static(path.join(__dirname, "public")))
app.use("/", express.static(path.join(__dirname, "client", "build")))
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));
app.set('views', './views');
app.set('view engine', 'ejs');

// Server index page


// send availability postback every Saturday night
// real time string: '0 6 * * Sunday'
cron.schedule('0 10 * * Saturday', () => {
    userFunctions.sendAvailabilityPB();
}, {
    scheduled: true,
    timezone: "America/New_York"
});

// send ladders partners Sunday nights
cron.schedule('0 10 * * Sunday', () => {
    userFunctions.sendLadders();
}, {
    scheduled: true,
    timezone: "America/New_York"
})

// send ladders reminder Saturday night
cron.schedule('0 20 * * Saturday', () => {
    reminderFunctions.sendAvailabilityReminder();
}, {
    scheduled: true,
    timezone: "America/New_York"
})

// Serve the options path and set required headers
app.get('/preferences/:userId', preferencesRoutes.open_preferences_webview);
app.post('/preferencespostback/:userId', preferencesRoutes.submit_preferences);

app.get('/profile/:userId', preferencesRoutes.open_user_profile);
app.post('/profileupdate/:userId', preferencesRoutes.submit_update);

app.get('/laddersprofile/:laddersId', preferencesRoutes.open_ladders_profile);

// Facebook Webhook
app.get("/webhook", webhookRoutes.getWebhook);
app.post("/webhook", webhookRoutes.postWebhook);

// api
app.post("/api/fetchposts", postRoutes.fetch_all_posts);

app.get("*", function (req, res) {
    //res.sendFile(path.join(__dirname, "client", "build", "index.html"));
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});
