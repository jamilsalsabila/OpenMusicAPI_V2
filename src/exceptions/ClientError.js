class ClientError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.name = 'ClientError';
        this.status = status;
    }
}

module.exports = ClientError;