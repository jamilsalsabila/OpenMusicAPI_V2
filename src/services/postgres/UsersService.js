const { Pool } = require("pg");
const bcrypt = require('bcrypt');
const { nanoid } = require("nanoid");
const AuthenticationError = require('../../exceptions/AuthenticationError');
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class UsersService {
    constructor() {
        this._pool = new Pool({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            port: process.env.PGPORT,
            password: process.env.PGPASSWORD,
        });
        this._saltRounds = 10;
    }

    async addUser(payload) {
        const {
            username,
            password,
            fullname
        } = payload;
        await this.verifyNewUsername(username);

        const id = `user-${nanoid(16)}`;
        const hashedPassword = await bcrypt.hash(password, this._saltRounds);
        const query = {
            text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
            values: [id, username, hashedPassword, fullname],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new Error('Gagal menambahkan user');
        }

        return result.rows[0].id;

    }

    async verifyNewUsername(username) {
        const query = {
            text: 'SELECT username FROM users WHERE username = $1',
            values: [username],
        };

        const result = await this._pool.query(query);

        if (result.rows.length > 0) {
            throw new InvariantError("Gagal menambahkan user. Username sudah terdaftar");
        }
    }

    async getUserById(id) {
        const query = {
            text: 'SELECT * FROM users WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Gagal mendapatkan user. Id tidak ditemukan", 404);
        }

        return result.rows[0];
    }

    async verifyUserCredential(payload) {
        const { username, password } = payload;
        const query = {
            text: 'SELECT id, username, password from users WHERE username = $1',
            values: [username],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new AuthenticationError('username atau password anda salah.', 401);
        }

        const { id, password: hashedPassword } = result.rows[0];

        const isSame = await bcrypt.compare(password, hashedPassword);

        if (!isSame) {
            throw new AuthenticationError('username atau password anda salah.', 401);
        }

        return id;
    }
}

module.exports = UsersService;