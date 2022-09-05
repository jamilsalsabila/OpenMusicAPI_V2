const NotFoundError = require('../../exceptions/NotFoundError');
const {
    postCollabPayloadSchema,
    deleteCollabPayloadSchema
} = require('./schema');

const CollabValidator = {
    validatePostCollabPayload: (payload) => {
        const validationResult = postCollabPayloadSchema.validate(payload);

        if (validationResult.error) {
            throw new NotFoundError(validationResult.error.message, 404);
        }
    },
    validateDeleteCollabPayload: (payload) => {
        const validationResult = deleteCollabPayloadSchema.validate(payload);

        if (validationResult.error) {
            throw new NotFoundError(validationResult.error.message);
        }
    }
}

module.exports = CollabValidator;