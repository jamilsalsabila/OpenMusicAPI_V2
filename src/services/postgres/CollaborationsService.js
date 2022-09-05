const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class CollaborationsService {
    constructor() {
        this._pool = new Pool({
            host: process.env.PGHOST,
            port: process.env.PGPORT,
            user: process.env.PGUSER,
            password: process.env.PGPASSWORD,
            database: process.env.PGDATABASE,
        });
    }

    async addCollaboration(playlistId, userId) {
        const id = `collab-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO collaborations VALUES ($1, $2, $3) RETURNING id',
            values: [id, playlistId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new Error("kolaborasi gagal dimasukkan ke dalam database.");
        }

        return result.rows[0].id;
    }

    async deleteCollaborations(playlistId, userId) {
        const query = {
            text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
            values: [playlistId, userId],
        };

        const result = await this._pool.query(query);

        if (result.rows.length !== 1) {
            throw new InvariantError("gagal menghapus kolaborasi.");
        }
    }

    async verifyCollaboration(playlistId, userId) {
        const query = {
            text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
            values: [playlistId, userId],
        }

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new AuthorizationError("Anda tidak punya akses ke playlist ini.", 401);
        }
    }
}

module.exports = CollaborationsService;