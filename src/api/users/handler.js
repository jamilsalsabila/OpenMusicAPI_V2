const ClientError = require("../../exceptions/ClientError");

class UsersHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.postUserHandler = this.postUserHandler.bind(this);
        this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
    }

    async postUserHandler(request, h) {
        try {
            this._validator.validateUserPayload(request.payload);
            const userId = await this._service.addUser(request.payload);

            const response = h.response({
                status: 'success',
                data: {
                    userId,
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

    async getUserByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const user = await this._service.getUserById(id);

            const response = h.response({
                status: 'success',
                data: {
                    user,
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
}

module.exports = UsersHandler;