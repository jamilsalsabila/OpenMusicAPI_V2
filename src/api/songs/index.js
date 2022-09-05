const routes = require('./routes');
const SongsHandler = require('./handler');

module.exports = {
    name: 'songs',
    version: '1.0',
    register: async (server, options) => {
        const songsHandler = new SongsHandler(options.service, options.validator);
        server.route(routes(songsHandler));
    },
}