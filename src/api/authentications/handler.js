const ClientError = require('../../exceptions/ClientError');

class AuthenticationsHandler {
    constructor(authservice, validator, tokenmanager, usersservice) {
        this._authservice = authservice;
        this._validator = validator;
        this._usersservice = usersservice;
        this._tokenmanager = tokenmanager;

        this.postAuthHandler = this.postAuthHandler.bind(this);
        this.putAuthHandler = this.putAuthHandler.bind(this);
        this.deleteAuthHandler = this.deleteAuthHandler.bind(this);
    }

    async postAuthHandler(request, h) {
        try {
            // cek format username dan password
            this._validator.validatePostAuthPayload(request.payload);

            // cek keberadaan username dan password dalam DB kemudian mengembalikan id pengguna
            const userId = await this._usersservice.verifyUserCredential(request.payload);

            // generate access token dengan payload id pengguna
            const accessToken = this._tokenmanager.generateAccessToken({ userId });

            // generate refresh token dengan payload id pengguna
            const refreshToken = this._tokenmanager.generateRefreshToken({ userId });

            // menyimpan refresh token ke dalam DB
            await this._authservice.addRefreshToken(refreshToken);

            const response = h.response({
                status: 'success',
                data: {
                    accessToken,
                    refreshToken,
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

    async putAuthHandler(request, h) {
        try {
            // cek format refresh token
            this._validator.validatePutAuthPayload(request.payload);

            // mendapatkan refresh token
            const { refreshToken } = request.payload;

            // cek keberadaan refresh token di dalam database
            await this._authservice.verifyRefreshToken(refreshToken);

            // cek keabsahan refresh token dan mengembalikan id pengguna
            const { userId } = this._tokenmanager.verifyRefreshToken(refreshToken);

            // await this._authservice.deleteRefreshToken(refreshToken);

            // generate access token baru
            const accessToken = this._tokenmanager.generateAccessToken({ userId });

            const response = h.response({
                status: 'success',
                data: {
                    accessToken,
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

    async deleteAuthHandler(request, h) {
        try {
            // cek format refresh token
            this._validator.validateDeleteAuthPayload(request.payload);

            // mengambil refresh token
            const { refreshToken } = request.payload;

            // cek keberadaan refresh token di dalam database
            await this._authservice.verifyRefreshToken(refreshToken);

            // cek keabsahan refresh token
            this._tokenmanager.verifyRefreshToken(refreshToken);

            // hapus refresh token
            await this._authservice.deleteRefreshToken(refreshToken);

            const response = h.response({
                status: 'success',
                message: 'Refresh Token berhasil dihapus',
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

module.exports = AuthenticationsHandler;