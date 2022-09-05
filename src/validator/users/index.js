const userPayloadSchema = require("./schema");
const InvariantError = require('../../exceptions/InvariantError');

const UsersValidator = {
    validateUserPayload: (payload) => {
        const validationResult = userPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    }
};

module.exports = UsersValidator;