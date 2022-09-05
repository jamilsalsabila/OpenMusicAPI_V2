const {
    playlistPayloadSchema,
    songIdPayloadSchema,
} = require("./schema");
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

const PlaylistsValidator = {
    validatePlaylistPayload: (payload) => {
        const validationResult = playlistPayloadSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
    validateSongIdPayload: (payload) => {
        const validationResult = songIdPayloadSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message, 404);
        }
    },
};

module.exports = PlaylistsValidator;