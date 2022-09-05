const ClientError = require('../../exceptions/ClientError');

class CollaborationsHandler {
    constructor(validator, collabsservice, playlistsservice) {
        this._validator = validator;
        this._collabsservice = collabsservice;
        this._playlistsservice = playlistsservice;

        this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
        this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
    }

    async postCollaborationHandler(request, h) {
        try {
            // cek format payload
            this._validator.validatePostCollabPayload(request.payload);

            // mengambil id pengguna yang berada di dalam access token
            const { userId: owner } = request.auth.credentials;

            // mengambil id playlist dan id pengguna dari dalam payload
            const { playlistId, userId } = request.payload;

            // cek apakah pengguna punya hak menambah kolaborasi?
            await this._playlistsservice.verifyPlaylistOwnership(playlistId, owner);

            // menyimpan id playlist dan id pengguna ke dalam table 'collaborations'
            const collab_id = await this._collabsservice.addCollaboration(playlistId, userId);

            const response = h.response({
                status: 'success',
                data: {
                    collaborationId: collab_id,
                },
            });
            response.code(201);
            return response;

        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.status);
                return response;
            }

            const response = h.response({
                status: 'error',
                message: error.message,
            });
            response.code(500)
            return response;
        }
    }

    async deleteCollaborationHandler(request, h) {
        try {
            // cek format payload
            this._validator.validateDeleteCollabPayload(request.payload);

            // mengambil id pengguna yang berada di dalam access token
            const { userId: owner } = request.auth.credentials;

            // mengambil id playlist dan id pengguna dari dalam payload
            const { playlistId, userId } = request.payload;

            // cek apakah pengguna punya hak menghapus kolaborasi?
            await this._playlistsservice.verifyPlaylistOwnership(playlistId, owner);

            // menghapus id playlist dan id pengguna dari dalam table 'collaborations'
            await this._collabsservice.deleteCollaborations(playlistId, userId);

            const response = h.response({
                status: 'success',
                message: 'kolaborasi berhasil dihapus',
            });
            response.code(200);
            return response;

        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.status);
                return response;
            }

            const response = h.response({
                status: 'error',
                message: error.message,
            });
            response.code(500)
            return response;
        }
    }
}

module.exports = CollaborationsHandler;