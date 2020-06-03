var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var session = require("express-session")
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;
const path = require('path');
var app = express();
var cron = require('node-cron');
const http = require("http");

setInterval(function() {
    http.get("http://rcf-meets.herokuapp.com");
}, 300000); // 5 Minutes

var db = mongoose.connect("mongodb://mattmkim:minwoo123@ds351455.mlab.com:51455/heroku_7866frlv");
var User = require("./models/users");
var Post = require("./models/posts");
var preferencesRoutes = require('./routes/preferencesroutes.js')(User);
var webhookRoutes = require('./routes/webhookroutes.js')(User);
var userFunctions = require('./backend/userfunctions')(User);
var reminderFunctions = require('./messaging/reminderfunctions')(User);

app.use("/public", express.static(path.join(__dirname, "public")))
app.use("/", express.static(path.join(__dirname, "client", "build")))
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({
    secret: 'Site visit',
     resave: true,
     saveUninitialized: true,
     cookie: { secure: false, maxAge : 6000000 }
 }));
app.listen((process.env.PORT || 5000));
app.set('views', './views');
app.set('view engine', 'ejs');

passport.use(new FacebookStrategy({
    clientID: "429499001267322",
    clientSecret: "bffab64e1317a9e89619a5532d78f9ab",
    callbackURL: "https://rcf-meets.herokuapp.com/auth/facebook/callback"
},
function(accessToken, refreshToken, profile, done) {
    User.find({user_id: profile.id}, function(err, response) {
        if (err) {
            return done(err)
        } else {
            return done(null, response)
        }
    })
}
));

passport.serializeUser(function(user, cb) {
    console.log("serializing " + user)
    cb(null, user);
});
  
passport.deserializeUser(function(id, cb) {
    console.log("deserializing " + id)
    User.findById(id, function(err, response) {
        cb(err, user);
    })
});

app.use(passport.initialize());
app.use(passport.session());

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
}

// Server index page


// send availability postback every Saturday night
// real time string: '0 6 * * Sunday'
// cron.schedule('0 9 * * Saturday', () => {
//     userFunctions.sendAvailabilityPB();
// }, {
//     scheduled: true,
//     timezone: "America/New_York"
// });

// // send ladders partners Sunday nights
// // real time string: '0 5 * * Monday'
// cron.schedule('0 9 * * Sunday', () => {
//     userFunctions.sendLadders();
// }, {
//     scheduled: true,
//     timezone: "America/New_York"
// })

// // send ladders partners Sunday nights
// // real time string: '0 5 * * Monday'
// cron.schedule('0 19 * * Saturday', () => {
//     reminderFunctions.sendAvailabilityReminder();
// }, {
//     scheduled: true,
//     timezone: "America/New_York"
// })

// Serve the options path and set required headers
app.get('/preferences/:userId', preferencesRoutes.open_preferences_webview);
app.post('/preferencespostback/:userId', preferencesRoutes.submit_preferences);

app.get('/profile/:userId', preferencesRoutes.open_user_profile);
app.post('/profileupdate/:userId', preferencesRoutes.submit_update);

app.get('/laddersprofile/:laddersId', preferencesRoutes.open_ladders_profile);

// Facebook Webhook
// Used for verification
app.get("/webhook", webhookRoutes.getWebhook);
app.post("/webhook", webhookRoutes.postWebhook);

// Passport paths
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/feed',
                                      failureRedirect: '/' }));

app.get("/feed", loggedIn, function(req, res) {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
})

app.get("*", function (req, res) {
    //res.sendFile(path.join(__dirname, "client", "build", "index.html"));
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});
