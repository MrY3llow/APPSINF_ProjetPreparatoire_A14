const checkuserInput = {

    /**
     * Vérifie qu'un String respecte bien les conditions d'un NOM D'UTILISATEUR.
     *
     * Conditions :
     * - faire plus de 6 caractères
     * @param {string} input - Le nom d'utilisateur à vérifier
     * @return {boolean} True s'il est valide. False s'il n'est pas valide
     */
    isValidUsername : function(input) {
        // BEGIN STRIP
        if(input.length < 6){
            return false;
        }
        return true;
        // END STRIP

    },

    /**
     * Vérifie qu'un String respecte bien les conditions d'un MOTS DE PASSE.
     * 
     * Conditions :
     * - faire plus de 8 caractères
     * @param {string} input - Le mot de passe à vérifier
     * @return {boolean} True s'il est valide. False s'il n'est pas valide
     */
    isValidPassword : function(input) {
        if(input.length < 8){
            return false;
        }
        return true;

    },

    /**
     * Vérifie qu'un String respecte bien les conditions d'un EMAIL.
     * 
     * Conditions :
     * 
     * - avant le `@` :
     *   - lettres miniscules & majuscules
     *   - chiffres
     *   - un ou plusieurs caractères
     * 
     * - `@` obligatoire
     * 
     * - le nom de domaine (après le `@`, ex: `gmail`) :
     *   - au moins un caractère
     *   - un point `.`
     * 
     * - l'extension de domaine (ex: `.com`) :
     *   - uniquement des lettres
     *   - min. 2 caractères
     * @param {string} input - Le email à vérifier
     * @return {boolean} True s'il est valide. False s'il n'est pas valide
     */
    isValidEmail : function(input) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(input);
    },

    /**
     * Vérifie qu'un String respecte bien les conditions d'une DESCRIPTION D'ACCIDENT.
     * 
     * Conditions :
     * - faire plus de 5 caractères
     * @param {string} input - La description à vérifier
     * @return {boolean} True s'il est valide. False s'il n'est pas valide
     */
    isValidIncidentDescription : function(input) {
        return (input.length > 5);
    },

    /**
     * Vérifie qu'un String respecte bien les conditions d'une ADDRESSE.
     * 
     * Conditions :
     * - faire plus de 15 caractères
     * @param {string} input - L'ADDRESSE à vérifier
     * @return {boolean} True s'il est valide. False s'il n'est pas valide
     */
    isValidIncidentAddress : function(input) {
        return (input.length > 15);
    }

}

module.exports = {
    checkUserInput: checkuserInput
}