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
const { checkUserInput } = require('./backend/checkInput.js');
const db = require('./backend/db.js');
const utils = require('./backend/utils.js');

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




// Fonction MAIN asynchrone pour pouvoir charger la base de données
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

    // GET Page principale (+ barre de recherche)
    app.get('/', async function(req, res) {

      const currentDateString = utils.renderDateToString(new Date(), "long", clock=true); // Date actuelle affiché en bas de la page
      let searchInput = req.query.search; // Input de la barre de recherche
      let incidents;

      // Si une recherche a été effectué
      if (searchInput) { 
        incidents = await db.incidents.search(dbo, searchInput)
      }
      
      else { // Aucune recherche, affichage des incidents des plus récentes aux moins récentes
        incidents = await db.incidents.getAll(dbo)
      }
      
      // remplace l'objet Date en string lisible.
      for (incident of incidents) {
        incident.date = utils.renderDateToString(incident.date, "short", clock=true)
      }

      res.render("layout", {  // Rendu de la page
        title: "Acceuil",
        page: "pages/index",
        username: req.session.username,
        incidents: incidents,
        currentDate: currentDateString,
      })
    });

    // Get LOGIN 
    app.get('/login', async function(req, res) {
      if(req.session.username) {
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
    app.post('/login', async function(req, res) {
      let username = req.body.username;
      let password = req.body.password;

      if (await db.user.checkLogin(dbo, username, password)) {
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
    app.get('/signup', async function(req, res) {
      res.render("layout", {
        title: "Inscription",
        page: "pages/signup",
        usernameInput: null,
        emailInput: null,
        fullnameInput: null,
        username: req.session.username,
        error: undefined,
      })
    });

    // Post SIGNUP
    app.post('/signup', async function(req, res) {
      let username = req.body.username;
      let password = req.body.password;
      let passwordCopy = req.body.passwordCopy;
      let fullname = req.body.fullname;
      let email = req.body.email;

      delete req.session.signupErrorMessage;

      // Vérification des conditions de création d'un compte
      if (!checkUserInput.isValidUsername(username)) {
        req.session.signupErrorMessage = "Le nom d'utilisateur n'est pas valide."
      }
      else if (password != passwordCopy) {
        req.session.signupErrorMessage = "Les deux mots de passe ne correspondent pas."
      } 
      else if (!checkUserInput.isValidPassword(password)) {
        req.session.signupErrorMessage = "Le mot de passe n'est pas valide. Il doit :\n- faire plus de 8 caractères"
      }
      else if (!checkUserInput.isValidEmail(email)) {
        req.session.signupErrorMessage = "L'email n'est pas valide."
      }

      // Si les conditions sont OK, tentative de création de compte dans la database
      if (req.session.signupErrorMessage == undefined) {
        try {
          await db.user.create(dbo, username, password, username, email)
        } catch (err) {
          req.session.signupErrorMessage = "Une erreur est survenue avec la base de données."
        }
      }

      // Erreur > Rechargement de la page signup avec les inputs précomplété (pour
      // les données non sensibles) et affiche le message d'erreur.
      if (req.session.signupErrorMessage) {
        res.render("layout", {
          title: "Connection",
          page: "pages/signup",
          usernameInput: username,
          fullnameInput: fullname,
          emailInput: email,
          error: req.session.signupErrorMessage,
          username: req.session.username,
        });
      
      // Aucune erreur > Charge la page d'acceuil en étant connecté
      } else {
        req.session.username = username,
        res.redirect('/');
      }
    });


    // Get INCIDENT CREATION
    app.get('/incident-creation', function(req, res) {
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
          error: null,
        })
      }
    });


    // Post INCIDENT CREATION
    app.post('/incident-creation', async function(req, res) {
      let description = req.body.description;
      let address = req.body.address;

      let error = "";

      // Vérification des conditions
      if (!checkUserInput.isValidIncidentDescription(description)) {
        error = "La description doit faire plus de 5 caractères."
      } else if (!checkUserInput.isValidIncidentAddress(address)) {
        error = "L'addresse doit faire plus de 15 caractères."
      } else {
        try { // Vérification passée, tentative de création d'incident avec la DB
          await db.incidents.create(dbo, description, address, req.session.username, new Date())
        } catch {
          error = "Une erreur est survenue avec la base de donnée."
        }
      }

      if (error) {
        res.render("layout", {
          title: "Signalement d’incident",
          page: "pages/incident-creation",
          username: req.session.username,
          error: error,
        })
      } else {
        res.redirect("/");
      }
    })



    // Page inexistante, redirection vers la page principale
    app.use((req, res) => {
      res.redirect("/");
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