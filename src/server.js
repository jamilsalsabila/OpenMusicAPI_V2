require('dotenv').config();

// Eksternal Library
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// API
const albums = require('./api/albums');
const authentications = require('./api/authentications');
const songs = require('./api/songs');
const users = require('./api/users');
const playlists = require('./api/playlists');
const collaborations = require('./api/collaborations');

// SERVICES
const AlbumsService = require('./services/postgres/AlbumsService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const SongsService = require('./services/postgres/SongsService');
const UsersService = require('./services/postgres/UsersService');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const CollaborationsService = require('./services/postgres/CollaborationsService');

// VALIDATOR
const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const UsersValidator = require('./validator/users');
const AuthValidator = require('./validator/authentications');
const PlaylistsValidator = require('./validator/playlists');
const CollaborationsValidator = require('./validator/collaborations');

// TOKENMANAGER
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationError = require('./exceptions/AuthenticationError');

const init = async () => {
    const albumsService = new AlbumsService();
    const songsService = new SongsService();
    const usersService = new UsersService();
    const authservice = new AuthenticationsService();
    const collaborationsService = new CollaborationsService();
    const playlistsService = new PlaylistsService(collaborationsService);

    const server = Hapi.server({
        host: process.env.HOST,
        port: process.env.PORT,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    // registrasi plugin eksternal
    await server.register([
        {
            plugin: Jwt,
        },
    ]);

    // mendefinisikan strategi autentikasi jwt
    server.auth.strategy(
        'openmusic_jwt',
        'jwt',
        {
            keys: process.env.ACCESS_TOKEN_KEY,
            verify: {
                aud: false,
                iss: false,
                sub: false,
                maxAgeSec: process.env.ACCESS_TOKEN_AGE,
            },
            validate: (artifacts) => {
                return {
                    isValid: true,
                    credentials: {
                        userId: artifacts.decoded.payload.userId,
                    },
                };
            },
        }
    );

    // registrasi plugin internal
    await server.register([
        {
            plugin: albums,
            options: {
                service: albumsService,
                validator: AlbumsValidator,
            },
        },
        {
            plugin: songs,
            options: {
                service: songsService,
                validator: SongsValidator,
            },
        },
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UsersValidator,
            },
        },
        {
            plugin: authentications,
            options: {
                authservice: authservice,
                validator: AuthValidator,
                tokenmanager: TokenManager,
                usersservice: usersService,
            },
        },
        {
            plugin: playlists,
            options: {
                validator: PlaylistsValidator,
                playlistsservice: playlistsService,
                songsservice: songsService,
            }
        },
        {
            plugin: collaborations,
            options: {
                validator: CollaborationsValidator,
                collabsservice: collaborationsService,
                playlistsservice: playlistsService,
            },
        },
    ]);

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();