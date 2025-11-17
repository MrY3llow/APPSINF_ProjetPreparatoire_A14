var express = require('express');
var session = require('express-session');
var path = require('path');
var bodyParser = require("body-parser");
var app = express();
var https = require('https');
var fs = require('fs');
// var sequelize = require('sequelize');
const { checkUserInput } = require('./checkInput.js');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true,
  cookie: { 
    path: '/', 
    httpOnly: true, 
    maxAge: 3600000,
  }
}));
app.use(express.static(path.join(__dirname, 'static')));


// Page principale
app.get('/', function(req, res, next) {
  res.render("layout", {
    title: "Acceuil",
    page: "pages/index",
    username: req.session.username,
  })
});

// Get LOGIN 
app.get('/login', function(req, res, next) {
  if(req.session.username != undefined) {
    res.redirect('/');
  }

  else {
    res.render("layout", {
      title: "Connection",
      page: "pages/login",
      username: undefined,
      usernameInput: req.query.username,
      error: req.session.loginErrorMessage,
    })
  }
});

// Post LOGIN
app.post('/login', function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if (password === "123pass" && checkUserInput.isValidUsername(username)) {
    req.session.username = username;
    delete req.session.loginErrorMessage;
    if (req.session.previousPageBeforeLoginPage != undefined) {
      res.redirect(req.session.previousPageBeforeLoginPage);
      delete req.session.previousPageBeforeLoginPage
    } else {
      res.redirect('/');
    }
  } else {
    req.session.loginErrorMessage = "Identifiants incorrects";
    res.render("layout", {
      title: "Connection",
      page: "pages/login",
      username: "",
      usernameInput: username,
      error: req.session.loginErrorMessage,
    });
  }
});


// Get SIGNUP
app.get('/signup', function(req, res, next) {
  res.render("layout", {
    title: "Inscription",
    page: "pages/signup",
    username: req.session.username,
  })
});


// Get INCIDENT CREATION
app.get('/incident-creation', function(req, res, next) {
  if(req.session.username == undefined) {
    req.session.loginErrorMessage = "Une connexion est nécessaire pour soumettre des accidents.";
    req.session.previousPageBeforeLoginPage = '/incident-creation';
    res.redirect('/login');
  }
  else {
    res.render("layout", {
      title: "Signalement d’incident",
      page: "pages/incident-creation",
      username: req.session.username,
    })
  }
});



https.createServer({
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
  passphrase: 'ingi'
}, app).listen(8080, function () {
  console.log('Server is running...');
});

module.exports = app;



app.closeServer = () => {
  app.server.close();
};