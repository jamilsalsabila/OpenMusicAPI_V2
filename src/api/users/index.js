const UsersHandler = require("./handler");
const routes = require("./routes");

module.exports = {
    name: 'users',
    version: '1.0',
    register: async (server, options) => {
        const usersHandler = new UsersHandler(options.service, options.validator);
        server.route(routes(usersHandler));
    },
};