const { MongoClient } = require('mongodb');
const db = require('../backend/db.js');
const utils = require('../backend/utils.js');

let connection;
let dbo;

// Setup avant tous les tests
beforeAll(async () => {
  connection = await MongoClient.connect('mongodb://localhost:27017/');
  dbo = connection.db("LouvainLaccident_TEST");
});

// Nettoyage après tous les tests
afterAll(async () => {
  await dbo.dropDatabase();
  await connection.close();
});

// Réinitialisation avant chaque test
beforeEach(async () => {
  await dbo.collection('users').deleteMany({});
  await dbo.collection('incidents').deleteMany({});
});


//   +---------------+
//   |   INCIDENTS   |
//   +---------------+

describe("incidents.getAll()", () => {
  
  it("Should return empty array when no incidents exist", async () => {
    const result = await db.incidents.getAll(dbo);
    expect(result).toEqual([]);
  });

  it("Should return all incidents sorted by date (most recent first)", async () => {
    // Créer 3 incidents avec des dates différentes
    await db.incidents.create(dbo, "Incident ancien", "Rue A 1", "user1", new Date('2024-01-01'));
    await db.incidents.create(dbo, "Incident récent", "Rue B 2", "user2", new Date('2024-12-01'));
    await db.incidents.create(dbo, "Incident moyen", "Rue C 3", "user3", new Date('2024-06-01'));

    const result = await db.incidents.getAll(dbo);
    
    expect(result).toHaveLength(3);
    expect(result[0].description).toBe("Incident récent"); // Le plus récent en premier
    expect(result[1].description).toBe("Incident moyen");
    expect(result[2].description).toBe("Incident ancien");
  });
});


describe("incidents.create()", () => {
  
  it("Should create a new incident with all fields", async () => {
    const testDate = new Date('2024-09-26T10:30:00');
    await db.incidents.create(dbo, "Arbre tombé", "Rue du Test 123", "testUser", testDate);

    const incidents = await dbo.collection('incidents').find().toArray();
    
    expect(incidents).toHaveLength(1);
    expect(incidents[0].description).toBe("Arbre tombé");
    expect(incidents[0].address).toBe("Rue du Test 123");
    expect(incidents[0].owner).toBe("testUser");
    expect(incidents[0].date).toEqual(testDate);
  });

  it("Should create incident with default date when date not provided", async () => {
    const beforeCreate = new Date();
    await db.incidents.create(dbo, "Test incident", "Test address", "testUser");
    const afterCreate = new Date();

    const incidents = await dbo.collection('incidents').find().toArray();
    
    expect(incidents).toHaveLength(1);
    expect(incidents[0].date.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(incidents[0].date.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
  });

  it("Should create multiple incidents independently", async () => {
    await db.incidents.create(dbo, "Incident 1", "Address 1", "user1", new Date());
    await db.incidents.create(dbo, "Incident 2", "Address 2", "user2", new Date());

    const incidents = await dbo.collection('incidents').find().toArray();
    expect(incidents).toHaveLength(2);
  });
});


describe("incidents.search()", () => {
  
  beforeEach(async () => {
    // Créer des incidents de test pour la recherche
    await db.incidents.create(dbo, "Arbre tombé sur la route", "Boulevard Anspach 100", "Sorcery Leroy", new Date('2025-09-26'));
    await db.incidents.create(dbo, "Nid de poule", "Rue de la Paix 5", "Jean Dupont", new Date('2025-08-15'));
    await db.incidents.create(dbo, "Feu de signalisation cassé", "Avenue Louise 200", "Marie Martin", new Date('2025-07-20'));
  });

  it("Should find incident by description keyword", async () => {
    const result = await db.incidents.search(dbo, "Arbre");
    
    expect(result).toHaveLength(3);
    expect(result[0].description).toBe("Arbre tombé sur la route");
  });

  it("Should find incident by address", async () => {
    const result = await db.incidents.search(dbo, "Anspach");
    
    expect(result).toHaveLength(3);
    expect(result[0].address).toBe("Boulevard Anspach 100");
  });

  it("Should find incident by owner username", async () => {
    const result = await db.incidents.search(dbo, "Leroy");
    
    expect(result).toHaveLength(3);
    expect(result[0].owner).toBe("Sorcery Leroy");
  });

  it("Should handle multi-word search", async () => {
    const result = await db.incidents.search(dbo, "Arbre route");
    
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].description).toContain("Arbre");
  });
});


//   +----------+
//   |   USER   |
//   +----------+

describe("user.create()", () => {
  
  it("Should create a new user with hashed password", async () => {
    await db.user.create(dbo, "john_doe", "password123", "John Doe", "john@example.com");

    const users = await dbo.collection('users').find().toArray();
    
    expect(users).toHaveLength(1);
    expect(users[0].username).toBe("john_doe");
    expect(users[0].fullname).toBe("John Doe");
    expect(users[0].email).toBe("john@example.com");
    expect(users[0].passwordHash).toBe(utils.hashString("password123"));
    expect(users[0].passwordHash).not.toBe("password123"); // Password should be hashed
  });

  it("Should hash different passwords differently", async () => {
    await db.user.create(dbo, "user1", "pass1", "User One", "user1@test.com");
    await db.user.create(dbo, "user2", "pass2", "User Two", "user2@test.com");

    const users = await dbo.collection('users').find().toArray();
    
    expect(users[0].passwordHash).not.toBe(users[1].passwordHash);
  });
});


describe("user.checkLogin()", () => {
  
  beforeEach(async () => {
    await db.user.create(dbo, "testuser", "correctpass", "Test User", "test@example.com");
  });

  it("Should return true with correct username and password", async () => {
    const result = await db.user.checkLogin(dbo, "testuser", "correctpass");
    expect(result).toBe(true);
  });

  it("Should return false with correct username but wrong password", async () => {
    const result = await db.user.checkLogin(dbo, "testuser", "wrongpass");
    expect(result).toBe(false);
  });

  it("Should return false with non-existent username", async () => {
    const result = await db.user.checkLogin(dbo, "nonexistent", "anypass");
    expect(result).toBe(false);
  });

  it("Should return false with wrong username but correct password", async () => {
    const result = await db.user.checkLogin(dbo, "wronguser", "correctpass");
    expect(result).toBe(false);
  });
});


describe("user.isUsernameFree()", () => {
  
  beforeEach(async () => {
    await db.user.create(dbo, "existinguser", "pass", "Existing User", "existing@test.com");
  });

  it("Should return false when username is already taken", async () => {
    const result = await db.user.isUsernameFree(dbo, "existinguser");
    expect(result).toBe(false);
  });

  it("Should return true when username is available", async () => {
    const result = await db.user.isUsernameFree(dbo, "newuser");
    expect(result).toBe(true);
  });

  it("Should be case-sensitive", async () => {
    const result = await db.user.isUsernameFree(dbo, "ExistingUser"); // Différente casse
    expect(result).toBe(true);
  });
});


describe("user.isEmailFree()", () => {
  
  beforeEach(async () => {
    await db.user.create(dbo, "user1", "pass", "User One", "taken@example.com");
  });

  it("Should return false when email is already taken", async () => {
    const result = await db.user.isEmailFree(dbo, "taken@example.com");
    expect(result).toBe(false);
  });

  it("Should return true when email is available", async () => {
    const result = await db.user.isEmailFree(dbo, "free@example.com");
    expect(result).toBe(true);
  });

  it("Should be case-sensitive", async () => {
    const result = await db.user.isEmailFree(dbo, "Taken@example.com"); // Différente casse
    expect(result).toBe(true);
  });
});


describe("user.getNameFromUsername()", () => {
  
  beforeEach(async () => {
    await db.user.create(dbo, "jdoe", "pass", "John Doe", "jdoe@test.com");
    await db.user.create(dbo, "asmith", "pass", "Alice Smith", "asmith@test.com");
  });

  it("Should return correct fullname for existing user", async () => {
    const result = await db.user.getNameFromUsername(dbo, "jdoe");
    expect(result).toBe("John Doe");
  });

  it("Should return correct fullname for another user", async () => {
    const result = await db.user.getNameFromUsername(dbo, "asmith");
    expect(result).toBe("Alice Smith");
  });

  it("Should handle user with special characters in name", async () => {
    await db.user.create(dbo, "special", "pass", "Jean-Pierre O'Connor", "jp@test.com");
    const result = await db.user.getNameFromUsername(dbo, "special");
    expect(result).toBe("Jean-Pierre O'Connor");
  });
});


//   +------------------------+
//   |   TESTS D'INTÉGRATION  |
//   +------------------------+

describe("Integration tests", () => {
  
  it("Should create user and verify login in workflow", async () => {
    // Créer un utilisateur
    await db.user.create(dbo, "workflow_user", "mypassword", "Workflow User", "workflow@test.com");
    
    // Vérifier que le username est pris
    expect(await db.user.isUsernameFree(dbo, "workflow_user")).toBe(false);
    
    // Vérifier que l'email est pris
    expect(await db.user.isEmailFree(dbo, "workflow@test.com")).toBe(false);
    
    // Vérifier le login
    expect(await db.user.checkLogin(dbo, "workflow_user", "mypassword")).toBe(true);
    
    // Récupérer le nom
    expect(await db.user.getNameFromUsername(dbo, "workflow_user")).toBe("Workflow User");
  });

  it("Should create incident and retrieve it via search", async () => {
    // Créer un utilisateur
    await db.user.create(dbo, "reporter", "pass", "Reporter User", "reporter@test.com");
    
    // Créer un incident
    await db.incidents.create(dbo, "Lampadaire cassé", "Rue des Lampes 42", "reporter", new Date('2025-09-26'));
    
    // Rechercher l'incident
    const searchResults = await db.incidents.search(dbo, "Lampadaire");
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].description).toBe("Lampadaire cassé");
    expect(searchResults[0].owner).toBe("reporter");
    
    // Vérifier que le propriétaire existe
    expect(await db.user.isUsernameFree(dbo, "reporter")).toBe(false);
  });
});