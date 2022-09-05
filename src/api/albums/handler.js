const ClientError = require('../../exceptions/ClientError');

class AlbumsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.postAlbumHandler = this.postAlbumHandler.bind(this);
        this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
        this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
        this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    }

    async postAlbumHandler(request, h) {
        try {
            this._validator.validateAlbumPayload(request.payload);

            const id = await this._service.addAlbum(request.payload);
            const response = h.response({
                status: 'success',
                data: {
                    albumId: id,
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
            console.error(error);
            return response;
        }
    }

    async getAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const album = await this._service.getAlbumById(id);
            const response = h.response({
                status: 'success',
                data: {
                    album,
                }
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

    async putAlbumByIdHandler(request, h) {
        try {
            this._validator.validateAlbumPayload(request.payload);
            const { id } = request.params;
            await this._service.updateAlbumById(id, request.payload);

            const response = h.response({
                status: 'success',
                message: `Album dengan id ${id} berhasil di update`,
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

    async deleteAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params;
            await this._service.deleteAlbumById(id);

            const response = h.response({
                status: 'success',
                message: `Album dengan id ${id} berhasil dihapus`,
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

module.exports = AlbumsHandler;