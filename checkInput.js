const checkuserInput = {

    isValidUsername : function(input) {
        // BEGIN STRIP
        if(input.length < 6 || input.length > 20){
            return false;
        }
        if(input.includes(' ')){
            return false;
        }
        // Block email-like patterns (contains both @ and .)
        if(input.includes('@') && input.includes('.')){
            return false;
        }
        return true;
        // END STRIP

    },

    isValidPassword : function(input) {
        if(input.length < 8 || input.length > 20){
            return false;
        }
        if(input.includes(' ')){
            return false;
        }
        return true;

    },

    isValidEmail : function(input) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(input);
    }

}

module.exports = {
    checkUserInput: checkuserInput
}