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

module.exports = {
    hashString: hashString,
}