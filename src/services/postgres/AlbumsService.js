const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
    constructor() {
        this._pool = new Pool({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASEALBUMS,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT,
        });
    }

    async addAlbum(payload) {
        const { name, year } = payload;
        const id = `album-${nanoid(16)}`;
        const insertedAt = new Date().toISOString();
        const updatedAt = insertedAt;

        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
            values: [id, name, year, insertedAt, updatedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new Error("Gagal menambahkan album");
        }

        return result.rows[0].id;
    }

    async getAlbumById(id) {
        const query = {
            text: 'SELECT id, name, year FROM albums WHERE id = $1',
            values: [id],
        };

        const querySong = {
            text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
            values: [id],
        }

        const result = await this._pool.query(query);
        const resultSong = await this._pool.query(querySong);

        if (!result.rows.length) {
            throw new NotFoundError("Album tidak ditemukan", 404);
        }

        return { ...result.rows[0], songs: resultSong.rows };
    }

    async updateAlbumById(id, payload) {
        const { name, year } = payload;
        const updatedAt = new Date().toISOString();

        const query = {
            text: 'UPDATE albums SET name = $1, year = $2, "updatedAt" = $3 WHERE id = $4 RETURNING id',
            values: [name, year, updatedAt, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Gagal mengupdate album. Id tidak ditemukan", 404);
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Gagal menghapus album. Id tidak ditemukan", 404);
        }
    }
}

module.exports = AlbumsService;