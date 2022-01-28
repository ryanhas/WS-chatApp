const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const express = require("express");
const passport = require('passport');
const exphbs  = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');

const connectDB = require("./config/db");
const { ensureAuthenticated } = require('./config/auth')

// Load config
dotenv.config({ path: "./config/config.env" });

connectDB();

app = express();

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Passport Config
require('./config/passport')(passport);

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Express session
app.use(
  session({
    secret: 'top secret this is',
    resave: true,
    saveUninitialized: true
  })
);

// Set handlebars as templating engine
app.engine('hbs', exphbs({
  defaultLayout: 'index',
  extname: '.hbs'}));
app.set('view engine', 'hbs');

// Disable client page caching
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  // res.set('Cache-control', 'public, max-age=0')
  next();
});

app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global var. Must come AFTER passport initialization
app.use(function (req, res, next) {
  // console.log(`req.user: ${req.user}`)
  // console.log(`req.session: ${req.session}`)
  // console.log(`req.headers: ${req.headers}`)
  // if(req.session.passport) { 
  //   console.log("passport session")
  //   console.log(req.session.passport.user)
  //  }
  res.locals.user = req.user || null;
  //res.locals.authenticated = !req.user.anonymous
  next();
});

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));

// Port where we'll run the websocket server
const webSocketsServerPort = process.env.PORT || 1337;

// Websocket server
require("./config/socket")(app)

app.listen(webSocketsServerPort, function () {
  console.log(
    new Date() + " Server is listening on port " + webSocketsServerPort
  );
});


