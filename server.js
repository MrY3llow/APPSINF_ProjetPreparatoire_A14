var express = require('express');
var session = require('express-session');
var path = require('path');
var bodyParser = require("body-parser");
var app = express();
var https = require('https');
var fs = require('fs');
var sequelize = require('sequelize');
const { noDoubleNestedGroup } = require('sequelize/lib/utils/deprecations');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true })); 
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



app.get('/', function(req, res, next) {
  res.render("layout", {
    title: "Acceuil",
    page: "pages/index",
    username: req.session.username,
  })
});

app.get('/login', function(req, res, next) {
  if(req.session.username != undefined) {
    res.render("layout", {
      title: "Acceuil",
      page: "pages/index",
      username: req.session.username,
    })
  }

  else {
    res.render("layout", {
      title: "Connection",
      page: "pages/login",
  
      username: "",
      usernameInput: req.query.username,
    })
  }
  
});

app.post('/login', function(req, res) {
  const username = req.body.username;
  const password = req.body.password;


  if (password === "123pass") {
    req.session.username = username;
    res.redirect('/');
  } else {
    res.render("layout", {
      title: "Connection",
      page: "pages/login",
      username: "",
      usernameInput: username,
    });
  }
});

app.get('/signup', function(req, res, next) {
  res.render("layout", {
    title: "Inscription",
    page: "pages/signup",
    username: req.session.username,
  })
});

app.get('/incident-creation', function(req, res, next) {
  res.render("layout", {
    title: "Signalement d’incident",
    page: "pages/incident-creation",
    username: req.session.username,
  })
});


https.createServer({
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
  passphrase: 'ingi'
}, app).listen(8080, function() {
  console.log('Server is running...');
});