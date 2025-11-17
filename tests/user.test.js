const { checkUserInput } = require('../checkInput.js');


describe("Username validation", () => {
    test("'MacronExplosion' should be valid", () => {
        let input = "MacronExplosion";
        let result = checkUserInput.isValidUsername(input);
        expect(result).toBeTruthy();
    });
    test("'Hey' should not be valid", () => {
        let input = "Hey";
        let result = checkUserInput.isValidUsername(input);
        expect(result).toBeFalsy();
    });
    test("'' should not be valid", () => {
        let input = "";
        let result = checkUserInput.isValidUsername(input);
        expect(result).toBeFalsy();
    });
});


describe("Password validation", () => {
    test("Password is valid", () => {
        let input = "12345678";
        let result = checkUserInput.isValidPassword(input);
        expect(result).toBeTruthy();
    });
    test("Password is not valid", () => {
        let input = "1234567";
        let result = checkUserInput.isValidPassword(input);
        expect(result).toBeFalsy();
    });
});


describe("Email validation", () => {
    test("'jean.charle@argent.com' should be valid", () => {
        let input = "jean.charle@argent.com";
        let result = checkUserInput.isValidEmail(input);
        expect(result).toBeTruthy();
    });
    test("'abc@gmail.be' should be valid", () => {
        let input = "abc@gmail.be";
        let result = checkUserInput.isValidEmail(input);
        expect(result).toBeTruthy();
    });
    test("'jean.charle' should not be valid", () => {
        let input = "jean.charle";
        let result = checkUserInput.isValidEmail(input);
        expect(result).toBeFalsy();
    });
    test("'jean.charle@gmail should not be valid", () => {
        let input = "jean.charle@gmail";
        let result = checkUserInput.isValidEmail(input);
        expect(result).toBeFalsy();
    });
    test("'a' should not be valid", () => {
        let input = "a";
        let result = checkUserInput.isValidEmail(input);
        expect(result).toBeFalsy();
    });
});