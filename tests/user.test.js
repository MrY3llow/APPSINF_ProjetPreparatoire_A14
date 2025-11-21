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
    test("'        ' should not be valid", () => {
        let input = "        ";
        let result = checkUserInput.isValidUsername(input);
        expect(result).toBeFalsy();
    });
    test("'MacronExplosion123' should be valid", () => {
        let input = "MacronExplosion123";
        let result = checkUserInput.isValidUsername(input);
        expect(result).toBeTruthy();
    });
    test("'Macron Explosion' should not be valid", () => {
        let input = "Macron Explosion";
        let result = checkUserInput.isValidUsername(input);
        expect(result).toBeFalsy();
    });
    test("'MacronExplosion@gmail.com' should not be valid", () => {
        let input = "MacronExplosion@gmail.com";
        let result = checkUserInput.isValidUsername(input);
        expect(result).toBeFalsy();
    });
    test("'12345' should not be valid", () => {
        let input = "12345";
        let result = checkUserInput.isValidUsername(input);
        expect(result).toBeFalsy();
    });
    test("'123456' should be valid", () => {
        let input = "123456";
        let result = checkUserInput.isValidUsername(input);
        expect(result).toBeTruthy();
    });
    test("'@' should not be valid", () => {
        let input = "@";
        let result = checkUserInput.isValidUsername(input);
        expect(result).toBeFalsy();
    });
    test("'@@@@@@' should be valid", () => {
        let input = "@@@@@@";
        let result = checkUserInput.isValidUsername(input);
        expect(result).toBeTruthy();
    });
    test("'123456789123456789123' should not be valid", () => {
        let input = "123456789123456789123";
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
    test("Password is not valid", () => {
        let input = "";
        let result = checkUserInput.isValidPassword(input);
        expect(result).toBeFalsy();
    });
    test("Password is not valid", () => {
        let input = "        ";
        let result = checkUserInput.isValidPassword(input);
        expect(result).toBeFalsy();
    });
    test("Password is not valid", () => {
        let input = "1 2 3 4 ";
        let result = checkUserInput.isValidPassword(input);
        expect(result).toBeFalsy();
    });
    test("Password is not valid", () => {
        let input = " a b c d";
        let result = checkUserInput.isValidPassword(input);
        expect(result).toBeFalsy();
    });
    test("Password is not valid", () => {
        let input = "123456789123456789123";
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
    test("'@gmail.be' should not be valid", () => {
        let input = "@gmail.be";
        let result = checkUserInput.isValidEmail(input);
        expect(result).toBeFalsy();
    });
    test("'@gmail.com' should not be valid", () => {
        let input = "@gmail.com";
        let result = checkUserInput.isValidEmail(input);
        expect(result).toBeFalsy();
    });
    test("'@Gmail.com' should not be valid", () => {
        let input = "@Gmail.com";
        let result = checkUserInput.isValidEmail(input);
        expect(result).toBeFalsy();
    });
    test("'jean.charle@Gmail.com' should be valid", () => {
    let input = "jean.charle@Gmail.com";
    let result = checkUserInput.isValidEmail(input);
    expect(result).toBeTruthy();
    });
    test("'jean.charle@GMAIL.COM' should be valid", () => {
    let input = "jean.charle@GMAIL.COM";
    let result = checkUserInput.isValidEmail(input);
    expect(result).toBeTruthy();
});
    test("'@@gmail.be' should not be valid", () => {
        let input = "@@gmail.be";
        let result = checkUserInput.isValidEmail(input);
        expect(result).toBeFalsy();
    });
    test("'jean.charle@gmailcom' should not be valid", () => {
        let input = "jean.charle@gmailcom";
        let result = checkUserInput.isValidEmail(input);
        expect(result).toBeFalsy();
    });
    test(" '' should not be valid", () => {
        let input = "";
        let result = checkUserInput.isValidEmail(input);
        expect(result).toBeFalsy();
    });
});