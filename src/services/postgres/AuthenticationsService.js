const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");

class AuthenticationsService {
    constructor() {
        this._pool = new Pool({
            user: process.env.PGUSER,
            password: process.env.PGPASSWORD,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            port: process.env.PGPORT,
        });
    }

    async addRefreshToken(token) {
        const query = {
            text: 'INSERT INTO tokens VALUES($1)',
            values: [token],
        };

        await this._pool.query(query);
    }

    async verifyRefreshToken(refreshToken) {
        const query = {
            text: 'SELECT * FROM tokens WHERE "refreshToken" = $1',
            values: [refreshToken],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError("Refresh Token tidak ditemukan");
        }
    }

    async deleteRefreshToken(refreshToken) {
        const query = {
            text: 'DELETE FROM tokens WHERE "refreshToken" = $1 RETURNING "refreshToken"',
            values: [refreshToken],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError("Gagal menghapus token. Refresh Token tidak ditemukan");
        }
    }
}

module.exports = AuthenticationsService;