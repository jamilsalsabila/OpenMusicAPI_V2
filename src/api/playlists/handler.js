const ClientError = require("../../exceptions/ClientError");

class PlaylistsHandler {
    constructor(validator, playlistsservice, songsservice) {
        this._validator = validator;
        this._playlistsservice = playlistsservice;
        this._songsservice = songsservice;

        this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
        this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
        this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
        this.postSongIntoPlaylistByPlaylistIdHandler = this.postSongIntoPlaylistByPlaylistIdHandler.bind(this);
        this.getSongsInsidePlaylistByPlaylistIdHandler = this.getSongsInsidePlaylistByPlaylistIdHandler.bind(this);
        this.deleteSongInsidePlaylistByPlaylistIdHandler = this.deleteSongInsidePlaylistByPlaylistIdHandler.bind(this);
        this.getPlaylistActivitiesByPlaylistIdHandler = this.getPlaylistActivitiesByPlaylistIdHandler.bind(this);
    }

    async postPlaylistHandler(request, h) {
        try {
            // cek format nama playlist
            this._validator.validatePlaylistPayload(request.payload);

            // mendapatkan nama playlist
            const { name } = request.payload;

            // mendapatkan id pengguna yang berada di dalam access token
            const { userId: owner } = request.auth.credentials;

            // menambah playlist
            const playlistId = await this._playlistsservice.addPlaylist(name, owner);

            const response = h.response({
                status: 'success',
                data: {
                    playlistId,
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
            response.code(500);
            return response;
        }

    }

    async getPlaylistsHandler(request, h) {
        // mendapatkan id pengguna yang berada di dalam access token
        const owner = request.auth.credentials.userId;

        // mengambil daftar playlist pengguna dari database
        const playlists = await this._playlistsservice.getPlaylists(owner);

        const response = h.response({
            status: 'success',
            data: {
                playlists,
            },
        });
        response.code(200);
        return response;
    }

    async deletePlaylistByIdHandler(request, h) {
        try {
            // mendapatkan id playlist dari url
            const { id } = request.params;

            // mendapatkan id user yang berada di dalam access token
            const owner = request.auth.credentials.userId;

            // cek kepemilikan playlist
            await this._playlistsservice.verifyPlaylistOwnership(id, owner);

            // menghapus playlist   
            await this._playlistsservice.deletePlaylistById(id);

            const response = h.response({
                status: 'success',
                message: 'playlist berhasil dihapus',
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
            response.code(500);
            return response;
        }
    }

    async postSongIntoPlaylistByPlaylistIdHandler(request, h) {
        try {
            // cek format id lagu
            this._validator.validateSongIdPayload(request.payload);

            // mengambil data id lagu 
            const { songId: songId } = request.payload;

            // mengambil id playlist dari url
            const { id: playlistId } = request.params;

            // mengambil id pengguna yang berada di dalam access token
            const owner = request.auth.credentials.userId;

            // cek kehadiran id lagu
            await this._songsservice.verifySongId(songId);

            // cek kepemilikan playlist
            await this._playlistsservice.verifyPlaylistAccess(playlistId, owner);

            // menambah lagu ke playlist berdasarkan playlist id valid
            await this._playlistsservice.addSongIntoPlaylist(playlistId, songId);

            // mencatat data penambahan lagu ke playlist ke dalam table 'playlist_song_activities'
            const data = { playlistId, owner, songId };
            await this._playlistsservice.addDataActivities(data, 'add');

            const response = h.response({
                status: 'success',
                message: 'lagu berhasil ditambahkan ke playlist',
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
            response.code(500);
            return response;
        }
    }

    async getSongsInsidePlaylistByPlaylistIdHandler(request, h) {
        try {
            // mengambil id playlist dari url
            const { id: playlistId } = request.params;

            // mengambil id pengguna yang berada di dalam access token
            const owner = request.auth.credentials.userId;

            // cek kepemilikan playlist
            await this._playlistsservice.verifyPlaylistAccess(playlistId, owner);

            // mengambil semua lagu yang berada di dalam playlist
            const playlist = await this._playlistsservice.getSongsInsidePlaylist(playlistId);

            const response = h.response({
                status: 'success',
                data: {
                    playlist,
                },
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
            response.code(500);
            return response;
        }
    }

    async deleteSongInsidePlaylistByPlaylistIdHandler(request, h) {
        try {
            // cek format id lagu
            this._validator.validateSongIdPayload(request.payload);

            // mengambil id playlist dari url
            const { id: playlistId } = request.params;

            // mengambil id lagu
            const { songId } = request.payload;

            // mengambil id pengguna yang berada di dalam access token
            const owner = request.auth.credentials.userId;

            // cek kehadiran id lagu
            await this._songsservice.verifySongId(songId);

            // cek kepemilikan playlist
            await this._playlistsservice.verifyPlaylistAccess(playlistId, owner);

            // menghapus lagu dari playlist
            await this._playlistsservice.deleteSongFromPlaylist(playlistId, songId);

            // mencatat data penghapusan lagu dari playlist ke dalam table 'playlist_song_activities'
            const data = { playlistId, owner, songId };
            await this._playlistsservice.addDataActivities(data, 'delete');

            const response = h.response({
                status: 'success',
                message: 'lagu berhasil di hapus dari playlist',

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
            response.code(500);
            return response;
        }
    }

    async getPlaylistActivitiesByPlaylistIdHandler(request, h) {
        try {
            // mengambil id pengguna yang berada di dalam access token
            const userId = request.auth.credentials.userId;

            // mengambil id playlist
            const { id: playlistId } = request.params;

            // cek kepemilikan playlist
            await this._playlistsservice.verifyPlaylistAccess(playlistId, userId);

            // mengambil daftar aktifitas playlist
            const data = await this._playlistsservice.getPlaylistActivities(playlistId);

            const response = h.response({
                status: 'success',
                data: data,
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
            response.code(500);
            return response;
        }


    }
}

module.exports = PlaylistsHandler;