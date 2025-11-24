const utils = require('./utils.js');
const { documentSearch } = require('./documentSearch.js');


//   +---------------+
//   |   INCIDENTS   |
//   +---------------+
const incidents = {
  
  /**
   * Récupère tous les incidents de la base de données
   * @async
   * @param {Object} dbo - L'objet de la base de donnée MongoDB
   * @return {Array} Un tableau de tous les incidents. Valeurs par incidents ["description", "address", "owner", "date"]
   * @throws {Error} Si la requête à la base de données échoue
   * @exemple ```
   * const allIncidents = await incidents.getAll(dbo);
   * ```
   */
  getAll : async function(dbo) {
    return await dbo.collection('incidents')
      .find()
      .sort({date:-1})
      .toArray();
  },


  /**
   * Créer un nouvel incident
   * @async
   * @param {Object} dbo - L'objet de la base de donnée MongoDB
   * @param {string} description - La description de l'incident
   * @param {string} address - L'adresse de l'incident
   * @param {string} username - Le nom d'utilisateur du créateur de l'incident
   * @param {date} date - La date de l'évènement. Default value : `new Date()`
   * @throws {Error} Si la requête à la base de données échoue
   * @exemple ```
   * await incidents.create(dbo, "Chute d'arbre", "Rue du feuillage 7, 4280 Hannut", "JeanRenard", new Date());
   * ```
   */
  create : async function(dbo, description, address, username, date = new Date()) {
    await dbo.collection('incidents').insertOne({
      description: description,
      address: address,
      owner: username,
      date: date,
    })
  },


  search : async function(dbo, input) {

    // Convertis les incidents en String complet avec toutes les valeurs ("{description} {address} {owner} {date}")
    function incidentToFullString (incidents) {
      let incidentsString = []
      for (let incident of incidents) {
        incidentsString.push(
          incident.description + " " +
          incident.address     + " " +
          incident.owner       + " " +
          utils.renderDateToString(incident.date, format="short", clock=true)
        );
      }
      return incidentsString;
    };

    let output = []
    let incidents = await this.getAll(dbo)
    let incidentsString = incidentToFullString(incidents);


    let incidentSearched = documentSearch(input, incidentsString); // String des incidents avec toutes les valeurs ("{description} {address} {owner} {date}") trier selon le terme de recherche.

    for (let incidentString of incidentSearched) {
      for (let incident of incidents) {
        if (incidentString == incidentToFullString([incident])[0]) {
          output.push(incident);
        }
      }
    }
      
    return output;
  }
      
}

//   +----------+
//   |   USER   |
//   +----------+
const user = {

  /**
   * Crée un nouvel utilisateur dans la base de donnée
   * @async
   * @param {Object} dbo - L'objet de la base de donnée MongoDB
   * @param {string} username - Le nom d'utilisateur
   * @param {string} password - Le mot de passe en clair (sera haché)
   * @param {string} fullname - Le nom complet de l'utilisateur
   * @param {string} email - L'adresse email de l'utilisateur
   * @throws {Error} Si la requête à la base de données échoue
   * @exemple ```
   * await user.create(dbo, 'jdoe', 'motdepasse123', 'John Doe', 'john@example.com');
   * ```
   */
  create : async function(dbo, username, password, fullname, email) {
    await dbo.collection('users').insertOne({
      username: username,
      passwordHash: utils.hashString(password),
      fullname: fullname,
      email: email,
    })
  },

  /**
   * Vérifie si un mot de passe correspond bien a un username (Passe par le système de hash)
   * @async
   * @param {Object} dbo - L'objet de la base de donnée MongoDB
   * @param {string} username - Le nom d'utilisateur
   * @param {string} password - Le mot de passe en clair (sera haché pour être comparé)
   * @return {boolean} true ou false selon si le mot de passe est valide
   * @throws {Error} Si la requête à la base de données échoue
   * @exemple ```
   * const isValid = await user.checkLogin(dbo, 'jdoe', 'motdepasse123')
   * ```
   */
  checkLogin : async function(dbo, username, password) {
    let result = await dbo.collection('users').findOne({
      username: username,
      passwordHash: utils.hashString(password)
    })
    if (result) return true;
    else return false;
  },

  /**
   * Vérifie qu'un nom d'utilisateur est libre, ou s'il est déjà utilisé
   * @async
   * @param {Object} dbo - L'objet de la base de donnée MongoDB
   * @param {string} username - Le nom d'utilisateur a vérifier
   * @return {boolean} True si l'username est libre. False s'il est déjà utilisé.
   * @throws {Error} Si la requête à la base de données échoue
   * @exemple ```
   * const isFree = await user.isUsernameFree(dbo, "jdoe")
   * ```
   */
  isUsernameFree : async function(dbo, username) {
    let result = await dbo.collection('users').findOne({
      username: username
    })
    if (result) return false;
    else return true;
  },


  /**
   * Obtiens le nom complet d'un utilisateur en de du nom d'utilisateur.
   * @async
   * @param {Object} dbo - L'objet de la base de donnée MongoDB
   * @param {string} username - Le nom d'utilisateur
   * @return {string} Le nom complet de l'utilisateur
   * @throws {Error} Si la requête à la base de données échoue
   * @exemple ```
   * let fullName = await user.getNameFromUsername(dbo, "Mr_Yellow_")
   * > fullName = "Nathan Cobut"
   * ```
   */
  getNameFromUsername : async function(dbo, username) {
    let result = await dbo.collection('users').findOne({
      username: username
    })
    return result.fullname;
  }

}


module.exports = {
  incidents: incidents,
  user: user,
}