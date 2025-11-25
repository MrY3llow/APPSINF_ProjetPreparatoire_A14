const request = require("supertest");
const { MongoClient } = require('mongodb');
const db = require('../backend/db.js');

let connection;
let dbo;
let app;

// Setup avant tous les tests (connexion a la base de donnée de test)
beforeAll(async () => {
  process.env.MONGO_DB_NAME = "LouvainLaccident_TEST";
  process.env.PORT = 8081; // Port différent pour les tests
  
  // Charger l'app (qui va maintenant utiliser la DB de test) & connexion à la base de test pour manipuler les données
  app = require("../server.js");
  await new Promise(resolve => setTimeout(resolve, 1000));
  connection = await MongoClient.connect('mongodb://localhost:27017/');
  dbo = connection.db("LouvainLaccident_TEST");
  
  // Créer un utilisateur de test
  await db.user.create(dbo, 'Johnny', '123pass', 'John Doe', 'johnny@test.com');
});

// Nettoyage après tous les tests
afterAll(async () => {
  await dbo.dropDatabase();
  await connection.close();
});
// Réinitialisation avant chaque test
beforeEach(async () => {
  await dbo.collection('incidents').deleteMany({});
  // On garde juste l'utilisateur 'Johnny' pour les tests
});


describe("POST /login", () => {

  // CONNECTION RÉUSSIE
  it("Login with username and password (correct)", async() => {
    const res = await request(app)
      .post('/login')
      .send({username: 'Johnny', password: '123pass'})
    expect(res.statusCode).toBe(302); // 302 > Code de redirection
    expect(res.headers.location).toBe('/');
    expect(res.text).not.toContain("Identifiants incorrects");
  });

  // CONNECTION ÉCHOUÉE
  it("Login with WRONG username and good password", async() => {
    const res = await request(app)
      .post('/login')
      .send({username: 'John', password: '123pass'})
    expect(res.statusCode).toBe(200); // 200 > Affichage de page classique (On sait que c'est une erreur parce que des identifiants correctes auraient charger une autre page)
    expect(res.text).toContain("Identifiants incorrects");
  });
  
  it("Login with good username and WRONG password", async() => {
    const res = await request(app)
      .post('/login')
      .send({username: 'Johnny', password: '1234pass'})
    expect(res.statusCode).toBe(200); // 200 > Affichage de page classique (On sait que c'est une erreur parce que des identifiants correctes auraient charger une autre page)
    expect(res.text).toContain("Identifiants incorrects");
  });
});



describe("GET /incident-creation", () => {
  
  it("Try to show creation incident page WITHOUT login", async() => {
    const res = await request(app)
      .get('/incident-creation')
    expect(res.statusCode).toBe(302); // 302 > Code de redirection
    expect(res.headers.location).toBe('/login');
    expect(res.text).not.toContain("Une connexion est nécessaire pour soumettre des accidents.");
  });
  
  it("Try to show creation incident page with CORRECT login", async() => {
    const agent = request.agent(app); // Permet de créer une session qui garde les cookies
    
    // D'abord se connecter
    await agent
      .post('/login')
      .send({username: 'Johnny', password: '123pass'});
    
    // Ensuite accéder à la page de création
    const res = await agent.get('/incident-creation');
    expect(res.statusCode).toBe(200); // 200 > Affichage de page classique
    expect(res.text).toContain("Signaler un nouvel incident");
  });
});


describe("POST /signup", () => {
  
  beforeEach(async () => {
    // Nettoyer les utilisateurs sauf Johnny
    await dbo.collection('users').deleteMany({ username: { $ne: 'Johnny' } });
  });
  
  it("Should create new user with valid credentials", async() => {
    const res = await request(app)
      .post('/signup')
      .send({
        username: 'newuser',
        password: 'validpass123',
        passwordCopy: 'validpass123',
        fullname: 'New User',
        email: 'newuser@test.com'
      });
    
    expect(res.statusCode).toBe(302); // Redirection vers la page d'accueil
    expect(res.headers.location).toBe('/');
    
    // Vérifier que l'utilisateur existe dans la DB
    const userExists = await db.user.isUsernameFree(dbo, 'newuser');
    expect(userExists).toBe(false);
  });
  
  it("Should reject signup with existing username", async() => {
    const res = await request(app)
      .post('/signup')
      .send({
        username: 'Johnny', // Utilisateur déjà existant
        password: 'newpass123',
        passwordCopy: 'newpass123',
        fullname: 'Another John',
        email: 'another@test.com'
      });
    
    expect(res.statusCode).toBe(200); // Reste sur la page
    expect(res.text).toContain("Ce nom d'utilisateur est déjà utilisé");
  });
  
  it("Should reject signup when passwords don't match", async() => {
    const res = await request(app)
      .post('/signup')
      .send({
        username: 'testuser',
        password: 'password123',
        passwordCopy: 'password456', // Différent
        fullname: 'Test User',
        email: 'test@test.com'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Les deux mots de passe ne correspondent pas");
  });
  
  it("Should reject signup with invalid password", async() => {
    const res = await request(app)
      .post('/signup')
      .send({
        username: 'testuser',
        password: 'short', // Trop court
        passwordCopy: 'short',
        fullname: 'Test User',
        email: 'test@test.com'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Le mot de passe n'est pas valide");
  });
});


describe("POST /incident-creation", () => {
  
  it("Should create incident when logged in with valid data", async() => {
    const agent = request.agent(app);
    
    // Se connecter d'abord
    await agent
      .post('/login')
      .send({username: 'Johnny', password: '123pass'});
    
    // Créer un incident
    const res = await agent
      .post('/incident-creation')
      .send({
        description: 'Test incident description',
        address: 'Rue de Test 123, 1000 Bruxelles'
      });
    
    expect(res.statusCode).toBe(302); // Redirection vers l'accueil
    expect(res.headers.location).toBe('/');
    
    // Vérifier que l'incident existe dans la DB
    const incidents = await dbo.collection('incidents').find().toArray();
    expect(incidents).toHaveLength(1);
    expect(incidents[0].description).toBe('Test incident description');
    expect(incidents[0].owner).toBe('Johnny');
  });
  
  it("Should reject incident with too short description", async() => {
    const agent = request.agent(app);
    
    await agent
      .post('/login')
      .send({username: 'Johnny', password: '123pass'});
    
    const res = await agent
      .post('/incident-creation')
      .send({
        description: 'Test', // Trop court
        address: 'Rue de Test 123, 1000 Bruxelles'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("La description doit faire plus de 5 caractères");
  });
  
  it("Should reject incident with too short address", async() => {
    const agent = request.agent(app);
    
    await agent
      .post('/login')
      .send({username: 'Johnny', password: '123pass'});
    
    const res = await agent
      .post('/incident-creation')
      .send({
        description: 'Valid description here',
        address: 'Rue 1' // Trop court
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("L'addresse doit faire plus de 15 caractères");
  });
});