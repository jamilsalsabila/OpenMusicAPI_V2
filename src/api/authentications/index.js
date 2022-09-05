const routes = require('./routes');
const AuthenticationsHandler = require('./handler');

module.exports = {
    name: 'authentications',
    version: '1.0',
    register: async (server, options) => {
        const authenticationsHandler = new AuthenticationsHandler(
            options.authservice,
            options.validator,
            options.tokenmanager,
            options.usersservice
        );
        server.route(routes(authenticationsHandler));
    },
};