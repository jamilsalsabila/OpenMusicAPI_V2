const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
    constructor(collaborationsService) {
        this._pool = new Pool({
            user: process.env.PGUSER,
            password: process.env.PGPASSWORD,
            host: process.env.PGHOST,
            port: process.env.PGPORT,
            database: process.env.PGDATABASE,
        });

        this._collaborationsService = collaborationsService;
    }

    async addPlaylist(name, owner) {
        const id = `playlist-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Gagal menambahkan playlist');
        }

        return result.rows[0].id;

    }

    async getPlaylistById(id) {
        const query = {
            text: 'SELECT id FROM playlists WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal mendapatkan playlist. Id tidak ditemukan');
        }

        return result.rows[0];
    }

    async getPlaylists(owner) {
        const query = {
            text: `SELECT 
                    playlists.id id, 
                    playlists.name name, 
                    users.username username 
                   FROM playlists
                   LEFT JOIN users ON playlists.owner = users.id
                   LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
                   WHERE playlists.owner = $1 OR collaborations.user_id = $1
                   GROUP BY playlists.id, users.username
                  `,
            values: [owner],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async deletePlaylistById(id) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new Error('DB gagal menghapus playlist');
        }

    }

    async addSongIntoPlaylist(playlistId, songId) {
        const query = {
            text: 'INSERT INTO playlists_songs VALUES($1, $2) RETURNING "playlistId"',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new Error("DB Gagal memasukkan lagu ke playlist");
        }
    }

    async getSongsInsidePlaylist(playlistId) {
        let query = {
            text: ` SELECT 
                        playlists.*, 
                        songs.id as "songs id", 
                        songs.title as "songs title",
                        songs.performer as "songs performer",
                        users.username as "username"
                    FROM playlists_songs
                    INNER JOIN playlists ON playlists_songs."playlistId" = playlists.id AND playlists_songs."playlistId" = $1
                    INNER JOIN songs ON playlists_songs."songId" = songs.id
                    INNER JOIN users ON users.id = owner
                    `,
            values: [playlistId],
        };

        let result = await this._pool.query(query);

        // jika tidak terdapat lagu di dalam playlist...
        if (!result.rows[0]['songs id']) {
            return {
                id: result.rows[0].id,
                name: result.rows[0].name,
                username: result.rows[0].username,
                songs: [],
            };
        }

        // jika terdapat lagu di dalam playlist...
        return {
            id: result.rows[0].id,
            name: result.rows[0].name,
            username: result.rows[0].username,
            songs: result.rows.map((song) => ({ id: song['songs id'], title: song['songs title'], performer: song['songs performer'] })),
        };

    }

    async deleteSongFromPlaylist(playlistId, songId) {
        // cari keberadaan id lagu dan id playlist di dalam tabel 'playlists_songs'
        const query = {
            text: 'DELETE FROM playlists_songs WHERE "playlistId" = $1 AND "songId" = $2 RETURNING "songId"',
            values: [playlistId, songId],
        }

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new Error('DB gagal menghapus lagu di dalam playlist');
        }
    }

    async verifyPlaylistOwnership(playlistId, userId) {
        const query = {
            text: 'SELECT owner FROM playlists WHERE id = $1',
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal mendapatkan playlist. Id tidak ditemukan', 404);
        }

        const { owner: ownerDB } = result.rows[0];

        if (userId !== ownerDB) {
            throw new AuthorizationError('Anda tidak punya akses ke playlist ini', 403);
        }

    }

    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwnership(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            try {
                await this._collaborationsService.verifyCollaboration(playlistId, userId);
            } catch {
                throw error;
            }
        }
    }

    async getPlaylistActivities(playlistId) {
        const query = {
            text: `
                SELECT 
                    users.username username,
                    songs.title title,
                    playlist_song_activities.action action,
                    playlist_song_activities.time time
                FROM 
                    playlist_song_activities
                LEFT JOIN playlists ON playlist_song_activities.playlist_id = playlists.id
                LEFT JOIN users ON playlist_song_activities.user_id = users.id
                LEFT JOIN songs ON playlist_song_activities.song_id = songs.id
                WHERE
                    playlists.id = $1
                GROUP BY
                    playlists.id, users.id, songs.id, playlist_song_activities.action, playlist_song_activities.time   
            `,
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        return { playlistId, activities: result.rows };
    }

    async addDataActivities(data, action) {
        const id = `activity-${nanoid(16)}`;
        const {
            playlistId,
            owner: userId,
            songId,
        } = data;
        const query = {
            text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5) RETURNING id',
            values: [id, playlistId, songId, userId, action],
        }

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new Error('Gagal menyimpan aktifitas playlist.');
        }

    }

}

module.exports = PlaylistsService;