const {Builder,By,Key,Util} = require('selenium-webdriver');
const script = require('jest');
const { beforeAll } = require('@jest/globals');

// const app = require("../server.js");
 
const url = 'http://www.bing.com';
  
// declaring one test group, with common initialisation.
describe('Random test', () => {

  let driver;

  beforeAll(async () => {    
    driver = new Builder().forBrowser("chrome").build();
  }, 10000);
 
  afterAll(async () => {
    await driver.quit();
  }, 15000);
  
  test('Check whether the homepage have correct title', async () => {
    await driver.get  ( "https://127.0.0.1:8080/" );
    await driver.findElement (By.id ("details-button")).click();
    await driver.findElement (By.id ("proceed-link")).click(); // On accepte la page non sécurée (parce que certificat https non officiel)
    let title = await driver.getTitle ();
    expect(title).toContain('Mon Site d’Événements')
  });
});
