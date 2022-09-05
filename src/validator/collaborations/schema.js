const Joi = require('joi');

const postCollabPayloadSchema = Joi.object({
    playlistId: Joi.string().pattern(/^playlist-/).required(),
    userId: Joi.string().pattern(/^user-/).required(),
});

const deleteCollabPayloadSchema = Joi.object({
    playlistId: Joi.string().pattern(/^playlist-/).required(),
    userId: Joi.string().pattern(/^user-/).required(),
})

module.exports = {
    postCollabPayloadSchema,
    deleteCollabPayloadSchema,
};