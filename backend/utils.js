const crypto = require('crypto');

/**
 * Convertis un string en hash (sha256)
 * @param {string} str - Le string a convertir
 * @param {string} [algorithm='sha256'] - L'algorithme de hachage à utiliser (sha256, md5, sha512, etc.)
 * @return {string} Le hash du str
 * @exemple
 * // Hash avec l'algorithme par défaut (sha256)
 * const hash = hashString('monMotDePasse');
 * // Retourne: '9c5c4c8f5c65c8f4d8a7b9c5d4e3f2a1...'
 */
function hashString(str, algorithm = 'sha256') {
  return crypto.createHash(algorithm).update(str).digest('hex');
}

/**
 * Convertis un objet de type Date en String.
 * Format : "YYYY"
 */
function renderDateToString(date, format="short", clock=true) {
  switch (format) {

    default: { // "long" aussi
      let options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      if (clock) {
        options.hour = '2-digit'
        options.minute = '2-digit'
      }
  
      return new Date().toLocaleString('fr-FR', options);
    }

    case "short": {
      let options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      };
      if (clock) {
        options.hour = '2-digit'
        options.minute = '2-digit'
      }

      return date.toLocaleString('fr-FR', options).replace(',', '');
    }
  }
}

module.exports = {
    hashString: hashString,
    renderDateToString: renderDateToString,
}