//   +-------------------------------+
//   |   LIBRAIRIES & IMPORTATIONS   |
//   +-------------------------------+

var express = require('express');
var session = require('express-session');
var path = require('path');
var bodyParser = require("body-parser");
var app = express();
var https = require('https');
var fs = require('fs');
const { checkUserInput } = require('./checkInput.js');
const db = require('./db.js');
MongoClient = require('mongodb').MongoClient;


//   +--------------------------------+
//   |   PARAMÈTRES & CONFIGURATION   |
//   +--------------------------------+

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




// Function MAIN asynchrone pour pouvoir charger la base de données
async function main() {
  //   +--------------+
  //   |   SETUP DB   |
  //   +--------------+
  const client = new MongoClient('mongodb://localhost:27017/');
  try { 
    await client.connect();
    console.log("Connected to MongoDB.");
    const dbo = client.db("LouvainLaVente");


    //   +------------+
    //   |   ROUTES   |
    //   +------------+

    // Page principale
    app.get('/', async function(req, res, next) {
      // Formatage de la date du bas de page
      let options = { year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit' };
      const dateString = new Date().toLocaleDateString('fr-FR', options);

      res.render("layout", {  // Rendu de la page
        title: "Acceuil",
        page: "pages/index",
        username: req.session.username,
        incidents: await db.incidents.getAll(dbo),
        date: dateString,
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



    // Erreur 404
    app.use((req, res) => {
      res.status(404).send("Page Not Found");
    });

    //   +------------------+
    //   |   End > ROUTES   |
    //   +------------------+


    // Création du serveur avec protocol HTTPS
    https.createServer({
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem'),
      passphrase: 'ingi'
    }, app).listen(8080, function () {
      console.log('Server is running...');
    });

  // Erreur lors de connection à la base de donnée
  } catch (err) {
      console.error("ERROR connecting to MongoDB:", err);
      process.exit(1); // Cut le serveur (il ne sert a rien sans db)
  }

}

main().catch(console.error);

module.exports = app;