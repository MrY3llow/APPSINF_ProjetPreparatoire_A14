const request = require("supertest");
const app = require("../server.js");



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
  it("Try to show creation incident page with CORECT login", async() => {
    const agent = request.agent(app); // Permet de créer une session qui garde les cookies
    await agent.get('/incident-creation');
    await agent
      .post('/login')
      .send({username: 'Johnny', password: '123pass'})
    const res = await agent.get('/incident-creation');
    expect(res.statusCode).toBe(200); // 200 > Affichage de page classique
    expect(res.text).toContain("Signaler un nouvel incident");
  });


})