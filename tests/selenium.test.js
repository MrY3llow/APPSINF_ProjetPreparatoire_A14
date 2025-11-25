const { Builder, By, until } = require('selenium-webdriver');
const { MongoClient } = require('mongodb');
const db = require('../backend/db.js');
const chrome = require('selenium-webdriver/chrome');

let connection;
let dbo;
let driver;

let BASE_URL;
process.env.MONGO_DB_NAME = "LouvainLaccident_TEST";
process.env.PORT = 8082; // Un port différent pour les tests
BASE_URL = `https://localhost:${process.env.PORT}`;

// Setup avant tous les tests
beforeAll(async () => {
  
  // Accepte les certifications non sécurisé
  let options = new chrome.Options();
  options.addArguments('--ignore-certificate-errors');
  options.addArguments('--allow-insecure-localhost');

  // Démarrer le serveur (qui va utiliser la DB de test)
  require("../server.js");
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Connexion à la base de test
  connection = await MongoClient.connect('mongodb://localhost:27017/');
  dbo = connection.db("LouvainLaccident_TEST");
  
  // Créer un utilisateur de test
  await db.user.create(dbo, 'Johnny', '123pass', 'John Doe', 'johnny@test.com');
  
  // Initialiser le driver Selenium
  driver = await new Builder()
  .forBrowser('chrome')
  .setChromeOptions(options)
  .build();
}, 30000);

// Nettoyage après tous les tests
afterAll(async () => {
  await driver.quit();
  await dbo.dropDatabase();
  await connection.close();
}, 10000);

// Réinitialisation avant chaque test
beforeEach(async () => {
  await dbo.collection('incidents').deleteMany({});
  await dbo.collection('users').deleteMany({ username: { $ne: 'Johnny' } });

    // Clear tous les cookies
  await driver.manage().deleteAllCookies();
});


describe("Page LOGIN - /login", () => {
  
  it("Should login successfully with correct credentials", async () => {
    await driver.get(`${BASE_URL}/login`);
    
    await driver.findElement(By.id('login-username')).sendKeys('Johnny');
    await driver.findElement(By.id('login-password')).sendKeys('123pass');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Attendre la redirection vers la page d'accueil
    await driver.wait(until.urlIs(`${BASE_URL}/`), 5000);
    
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toBe(`${BASE_URL}/`);
  }, 10000);
  
  it("Should show error message with wrong password", async () => {
    await driver.get(`${BASE_URL}/login`);
    
    await driver.findElement(By.id('login-username')).sendKeys('Johnny');
    await driver.findElement(By.id('login-password')).sendKeys('wrongpass');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Attendre que le message d'erreur apparaisse
    await driver.wait(until.elementLocated(By.css('.error-message')), 5000);
    
    
    const errorMessage = await driver.findElement(By.css('.error-message')).getText();
    expect(errorMessage).toContain("Identifiants incorrects");
  }, 10000);
  
  it("Should navigate to signup page when clicking link", async () => {
    await driver.get(`${BASE_URL}/login`);
    
    await driver.findElement(By.css('a[href="signup"]')).click();
    
    await driver.wait(until.urlIs(`${BASE_URL}/signup`), 5000);
    
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toBe(`${BASE_URL}/signup`);
  }, 10000);
});


describe("Page SIGNUP - /signup", () => {
  
  it("Should create new account with valid data", async () => {
    await driver.get(`${BASE_URL}/signup`);
    
    await driver.findElement(By.id('signup-username')).sendKeys('NewUser');
    await driver.findElement(By.css('input[name="password"]')).sendKeys('validpass123');
    await driver.findElement(By.css('input[name="passwordCopy"]')).sendKeys('validpass123');
    await driver.findElement(By.id('fullname')).sendKeys('New User Full Name');
    await driver.findElement(By.id('email')).sendKeys('newuser@test.com');
    
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Attendre la redirection vers la page d'accueil
    await driver.wait(until.urlIs(`${BASE_URL}/`), 5000);
    
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toBe(`${BASE_URL}/`);
    
    // Vérifier que l'utilisateur existe dans la DB
    const userExists = await db.user.isUsernameFree(dbo, 'NewUser');
    expect(userExists).toBe(false);
  }, 10000);
  
  it("Should show error when passwords don't match", async () => {
    await driver.get(`${BASE_URL}/signup`);
    
    await driver.findElement(By.id('signup-username')).sendKeys('TestUser');
    await driver.findElement(By.css('input[name="password"]')).sendKeys('password123');
    await driver.findElement(By.css('input[name="passwordCopy"]')).sendKeys('password456');
    await driver.findElement(By.id('fullname')).sendKeys('Test User');
    await driver.findElement(By.id('email')).sendKeys('test@test.com');
    
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.elementLocated(By.css('.error-message')), 5000);
    
    const errorMessage = await driver.findElement(By.css('.error-message')).getText();
    expect(errorMessage).toContain("Les deux mots de passe ne correspondent pas");
  }, 10000);
  
  it("Should show error when username already exists", async () => {
    await driver.get(`${BASE_URL}/signup`);
    
    await driver.findElement(By.id('signup-username')).sendKeys('Johnny');
    await driver.findElement(By.css('input[name="password"]')).sendKeys('validpass123');
    await driver.findElement(By.css('input[name="passwordCopy"]')).sendKeys('validpass123');
    await driver.findElement(By.id('fullname')).sendKeys('Another John');
    await driver.findElement(By.id('email')).sendKeys('another@test.com');
    
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.elementLocated(By.css('.error-message')), 5000);
    
    const errorMessage = await driver.findElement(By.css('.error-message')).getText();
    expect(errorMessage).toContain("Ce nom d'utilisateur est déjà utilisé");
  }, 10000);
});


describe("Page INDEX - /", () => {
  
  it("Should display incidents list", async () => {
    // Créer quelques incidents de test
    await db.incidents.create(dbo, 'Incident 1', 'Rue de Test 123, 1000 Bruxelles', 'Johnny', new Date());
    await db.incidents.create(dbo, 'Incident 2', 'Avenue de Test 456, 1000 Bruxelles', 'Johnny', new Date());
    
    await driver.get(`${BASE_URL}/`);
    
    // Attendre que le tableau soit chargé
    await driver.wait(until.elementLocated(By.css('.incidents-table')), 5000);
    
    const rows = await driver.findElements(By.css('.incidents-table tbody tr'));
    expect(rows.length).toBe(2);
  }, 10000);
  
  it("Should navigate to incident creation page when clicking button", async () => {
    await driver.get(`${BASE_URL}/`);
    
    await driver.findElement(By.css('a[href="incident-creation"]')).click();
    
    // Devrait rediriger vers login si pas connecté
    await driver.wait(until.urlContains('/login'), 5000);
    
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/login');
  }, 10000);
  
  it("Should search incidents using search bar", async () => {
    // Créer des incidents avec des descriptions différentes
    await db.incidents.create(dbo, 'Accident de voiture', 'Rue de Test 123, 1000 Bruxelles', 'Johnny', new Date());
    await db.incidents.create(dbo, 'Vol de vélo', 'Avenue de Test 456, 1000 Bruxelles', 'Johnny', new Date());
    
    await driver.get(`${BASE_URL}/`);
    
    await driver.findElement(By.css('input[name="search"]')).sendKeys('voiture');
    await driver.findElement(By.css('.search-form')).submit();
    
    await driver.wait(until.elementLocated(By.css('.incidents-table tbody tr')), 5000);
    
    const pageText = await driver.findElement(By.css('body')).getText();
    expect(pageText).toContain('Accident de voiture');
  }, 10000);
});


describe("Page INCIDENT CREATION - /incident-creation", () => {
  
  it("Should redirect to login if not authenticated", async () => {
    await driver.get(`${BASE_URL}/incident-creation`);
    
    await driver.wait(until.urlContains('/login'), 5000);
    
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/login');
  }, 10000);
  
  it("Should create incident when logged in with valid data", async () => {
    // Se connecter d'abord
    await driver.get(`${BASE_URL}/login`);
    await driver.findElement(By.id('login-username')).sendKeys('Johnny');
    await driver.findElement(By.id('login-password')).sendKeys('123pass');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlIs(`${BASE_URL}/`), 5000);
    
    // Aller sur la page de création
    await driver.get(`${BASE_URL}/incident-creation`);
    
    await driver.findElement(By.id('desc')).sendKeys('Description de test pour un incident');
    await driver.findElement(By.id('addr')).sendKeys('Rue de Test 123, 1000 Bruxelles Belgique');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.urlIs(`${BASE_URL}/`), 5000);
    
    // Vérifier que l'incident existe dans la DB
    const incidents = await dbo.collection('incidents').find().toArray();
    expect(incidents.length).toBe(1);
    expect(incidents[0].description).toBe('Description de test pour un incident');
  }, 15000);
  
  it("Should show error with invalid description", async () => {
    // Se connecter d'abord
    await driver.get(`${BASE_URL}/login`);
    await driver.findElement(By.id('login-username')).sendKeys('Johnny');
    await driver.findElement(By.id('login-password')).sendKeys('123pass');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlIs(`${BASE_URL}/`), 5000);
    
    await driver.get(`${BASE_URL}/incident-creation`);
    
    await driver.findElement(By.id('desc')).sendKeys('Test'); // Trop court
    await driver.findElement(By.id('addr')).sendKeys('Rue de Test 123, 1000 Bruxelles');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.elementLocated(By.css('.error-message')), 5000);
    
    const errorMessage = await driver.findElement(By.css('.error-message')).getText();
    expect(errorMessage).toContain("La description doit faire plus de 5 caractères");
  }, 15000);
});


describe("Header navigation", () => {
  
  it("Should navigate to home when clicking logo", async () => {
    await driver.get(`${BASE_URL}/login`);
    
    await driver.findElement(By.css('.brand')).click();
    
    await driver.wait(until.urlIs(`${BASE_URL}/`), 5000);
    
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toBe(`${BASE_URL}/`);
  }, 10000);
  
  it("Should show username in header when logged in", async () => {
    await driver.get(`${BASE_URL}/login`);
    await driver.findElement(By.id('login-username')).sendKeys('Johnny');
    await driver.findElement(By.id('login-password')).sendKeys('123pass');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlIs(`${BASE_URL}/`), 5000);
    
    await driver.wait(until.elementLocated(By.css('.btn-ghost')), 5000);
    
    const usernameElement = await driver.findElement(By.css('.btn-ghost')).getText();
    expect(usernameElement).toBe('Johnny');
  }, 10000);
  
  it("Should show login/signup buttons when not logged in", async () => {
    await driver.get(`${BASE_URL}/`);
    
    const loginLink = await driver.findElement(By.css('a[href="login"]'));
    const signupLink = await driver.findElement(By.css('a[href="signup"]'));
    
    expect(await loginLink.isDisplayed()).toBe(true);
    expect(await signupLink.isDisplayed()).toBe(true);
  }, 10000);
});