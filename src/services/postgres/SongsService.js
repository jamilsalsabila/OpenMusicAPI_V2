const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
    constructor() {
        this._pool = new Pool({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT,
        });
    }

    async addSong(payload) {
        const {
            title,
            year,
            genre,
            performer,
            duration,
            albumId,
        } = payload;
        const id = `song-${nanoid(16)}`;
        const insertedAt = new Date().toISOString();
        const updatedAt = insertedAt;

        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            values: [id, title, year, genre, performer, insertedAt, updatedAt, duration, albumId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new Error("Gagal menambahkan lagu");
        }

        return result.rows[0].id;
    }

    async getSongs({ title, performer }) {
        let query;

        if (title && performer) {
            query = {
                text: "SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE $1 AND LOWER(performer) LIKE $2",
                values: [`%${title}%`, `%${performer}%`],
            };

        } else if (title) {
            query = {
                text: "SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE $1",
                values: [`%${title}%`],
            };

        } else if (performer) {
            query = {
                text: "SELECT id, title, performer FROM songs WHERE LOWER(performer) LIKE $1",
                values: [`%${performer}%`],
            };

        } else {
            query = {
                text: 'SELECT id, title, performer FROM songs',
                values: [],
            };
        }

        const result = await this._pool.query(query);
        return result.rows;
    }

    async getSongById(id) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Gagal mendapatkan lagu. Id tidak ditemukan", 404);
        }

        return result.rows[0];
    }

    async putSongById(id, payload) {
        const {
            title,
            year,
            genre,
            performer,
            duration,
            albumId,
        } = payload;
        const updatedAt = new Date().toISOString();

        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "albumId" = $6, "updatedAt" = $7 WHERE id = $8 RETURNING id',
            values: [title, year, genre, performer, duration, albumId, updatedAt, id],
        }

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Gagal mengubah lagu. Id tidak ditemukan", 404);
        }
    }

    async deleteSongById(id) {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Lagu gagal dihapus. Id tidak ditemukan", 404);
        }
    }

    async verifySongId(songId) {
        const query = {
            text: 'SELECT id FROM songs WHERE id = $1',
            values: [songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal mendapatkan id lagu. Id tidak ditemukan', 404);
        }
    }
}

module.exports = SongsService;