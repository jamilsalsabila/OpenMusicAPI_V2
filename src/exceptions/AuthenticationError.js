const ClientError = require("./ClientError");

class AuthenticationError extends ClientError {
    constructor(message, status) {
        super(message, status);
    }
}

module.exports = AuthenticationError;