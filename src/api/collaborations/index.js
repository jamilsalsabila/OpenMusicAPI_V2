const CollaborationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'collaborations',
    version: '1.0',
    register: async (server, options) => {
        const collaborationsHandler = new CollaborationsHandler(options.validator, options.collabsservice, options.playlistsservice);
        server.route(routes(collaborationsHandler));
    }
};