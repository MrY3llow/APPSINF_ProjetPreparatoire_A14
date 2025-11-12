var express = require('express');
var path = require('path');
var app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'static')));


app.get('/', function(req, res, next) {
  res.render("layout", {
    title: "Acceuil",
    page: "pages/index",
    username: "Anonyme"
  })
});

app.get('/login', function(req, res, next) {
  password = req.query.password;

  if(password == "123pass") { // Si le met de passe est correcte
    res.render("layout", {
      title: "Acceuil",
      page: "pages/index",
      username: req.query.username
    })
  }

  else {
    res.render("layout", {
      title: "Connection",
      page: "pages/login",
  
      username: req.query.username,
      password: password
    })
  }
  
});

app.get('/signup', function(req, res, next) {
  res.render("layout", {
    title: "Inscription",
    page: "pages/signup",
    username: "Anonyme"
  })
});

app.get('/incident-creation', function(req, res, next) {
  res.render("layout", {
    title: "Signalement d’incident",
    page: "pages/incident-creation",
    username: "Anonyme"
  })
});

app.listen(8080, function() {
  console.log('Server is running...');
});