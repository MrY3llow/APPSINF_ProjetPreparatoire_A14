const checkuserInput = {

    isValidUsername : function(input) {
        // BEGIN STRIP
        if(input.length < 6){
            return false;
        }
        return true;
        // END STRIP

    },

    isValidPassword : function(input) {
        if(input.length < 8){
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