const ClientError = require("./ClientError");

class NotFoundError extends ClientError {
    constructor(message, status) {
        super(message, status);
    }
}

module.exports = NotFoundError;