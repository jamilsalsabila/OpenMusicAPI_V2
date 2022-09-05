const routes = require('./routes');
const PlaylistsHandler = require('./handler');

module.exports = {
    name: 'playlists',
    version: '1.0.0',
    register: async (server, options) => {
        const playlistsHandler = new PlaylistsHandler(
            options.validator,
            options.playlistsservice,
            options.songsservice
        );
        server.route(routes(playlistsHandler));
    }
};