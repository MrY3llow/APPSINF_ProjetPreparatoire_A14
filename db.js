const utils = require('./utils.js');


//   +---------------+
//   |   INCIDENTS   |
//   +---------------+
const incidents = {
  
  /**
   * Récupère tous les incidents de la base de données
   * @async
   * @param {Object} dbo - L'objet de la base de donnée MongoDB
   * @return {Array} Un tableau de tous les incidents. Valeurs par incidents ["description", "address", "owner", "date"]
   * @exemple ```
   * const allIncidents = await incidents.getAll(dbo);
   * ```
   */
  getAll : async function(dbo) {
    return await dbo.collection('incidents').find().toArray();
  },


  /**
   * Créer un nouvel incident
   * @async
   * @param {Object} dbo - L'objet de la base de donnée MongoDB
   * @param {string} description - La description de l'incident
   * @param {string} address - L'adresse de l'incident
   * @param {string} username - Le nom d'utilisateur du créateur de l'incident
   * @param {date} date - La date de l'évènement
   * @exemple ```
   * await incidents.create(dbo, "Chute d'arbre", "Rue du feuillage 7, 4280 Hannut", "JeanRenard", new Date());
   * ```
   */
  create : async function(dbo, description, address, username, date) {
    await dbo.collection('incidents').insertOne({
      description: description,
      address: address,
      owner: username,
      date: date,
    })
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
   * @exemple ```
   * let fullName = await user.getNameFromUsername(dbo, "Mr_Yellow_")
   * console.log(fullName) // "Nathan Cobut"
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