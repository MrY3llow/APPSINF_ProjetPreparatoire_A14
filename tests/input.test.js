const { checkUserInput } = require('../backend/check-input.js');

describe("Username validation", () => {
    // Un username doit faire au moins 5 caractères
    // Ne vérifie pas qu'un username existe déjà dans le DB. (pour ça voir `tests/db.test.js`)

    let validInput = [ // Tests attendu COORECTES
        "MacronExplosion"]
    let invalidInputs = [ // Tests attendu INCORRECTES
        "Hey",
        ""]

    for(let input of validInput) {
        test("Password '" + input + "' should be valid (>= 5)", () => {
            let result = checkUserInput.isValidUsername(input);
            expect(result).toBeTruthy();
        });
    }
    for(let input of invalidInputs) {
        test("Password '" + input + "' should not be valid (< 5)", () => {
            let result = checkUserInput.isValidUsername(input);
            expect(result).toBeFalsy();
        });
    }
});


describe("Password validation", () => {
    // Un password doit faire au moins 8 caractères

    let validInput = [ // Tests attendu COORECTES
        "12345678"]
    let invalidInputs = [ // Tests attendu INCORRECTES
        "1234567",
        ""]

    for(let input of validInput) {
        test("Password '" + input + "' should be valid (>= 8)", () => {
            let result = checkUserInput.isValidPassword(input);
            expect(result).toBeTruthy();
        });
    }
    for(let input of invalidInputs) {
        test("Password '" + input + "' should not be valid (< 8)", () => {
            let result = checkUserInput.isValidPassword(input);
            expect(result).toBeFalsy();
        });
    }
});


describe("Incident description validation", () => {
    // Une description d'accident doit faire au moins 20 caractères

    let validInput = [ // Tests attendu COORECTES
        "Explosion dans la rue",
        "Une très longue description qui correspond à quelque qui s'est motivé à contribuer de manière intensive au site web"]
    let invalidInputs = [ // Tests attendu INCORRECTES
        "Explosion",
        "",
        "Courte description"]

    for(let input of validInput) {
        test("Description '" + input + "' should be valid (>= 20)", () => {
            let result = checkUserInput.isValidIncidentDescription(input);
            expect(result).toBeTruthy();
        });
    }
    for(let input of invalidInputs) {
        test("Description '" + input + "' should not be valid (< 20)", () => {
            let result = checkUserInput.isValidIncidentDescription(input);
            expect(result).toBeFalsy();
        });
    }
});


describe("Address validation", () => {
    // Une adresse doit faire au moins 15 caractères

    let validInput = [ // Tests attendu COORECTES
        "Boulevard Anspach, 1000 Bruxelles"]
    let invalidInputs = [ // Tests attendu INCORRECTES
        "Rue",
        "",
        "Rue courte"]
    
    for(let input of validInput) {
        test("Description '" + input + "' should be valid (>= 15)", () => {
            let result = checkUserInput.isValidIncidentAddress(input);
            expect(result).toBeTruthy();
        });
    }
    for(let input of invalidInputs) {
        test("Description '" + input + "' should not be valid (< 15)", () => {
            let result = checkUserInput.isValidIncidentAddress(input);
            expect(result).toBeFalsy();
        });
    }
});