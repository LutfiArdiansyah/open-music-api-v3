/* eslint-disable no-use-before-define */
/* eslint-disable no-underscore-dangle */
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

const Response = require('./src/utils/Response');

const albums = require('./src/api/albums');
const AlbumsService = require('./src/services/albums/AlbumsService');
const AlbumValidator = require('./src/validator/albums');

const songs = require('./src/api/songs');
const SongsService = require('./src/services/songs/SongService');
const SongValidator = require('./src/validator/songs');

const users = require('./src/api/users');
const UsersService = require('./src/services/users/UsersService');
const UsersValidator = require('./src/validator/users');

const authentications = require('./src/api/authentications');
const AuthenticationsService = require('./src/services/authentications/AuthenticationsService');
const TokenManager = require('./src/utils/TokenManager');
const AuthenticationsValidator = require('./src/validator/authentications');

const playlists = require('./src/api/playlists');
const PlaylistsService = require('./src/services/playlists/PlaylistsService');
const PlaylistsValidator = require('./src/validator/playlists');

const collaborations = require('./src/api/collaborations');
const CollaborationsService = require('./src/services/collaborations/CollaborationsService');
const CollaborationsValidator = require('./src/validator/collaborations');

const _exports = require('./src/api/exports');
const ProducerService = require('./src/services/rabbitmq/ProducerService');
const ExportsValidator = require('./src/validator/exports');

const StorageService = require('./src/services/storage/StorageService');

const CacheService = require('./src/services/redis/CacheService');

const init = async () => {
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService();
  const collaborationsService = new CollaborationsService();
  const storageService = new StorageService(
    path.resolve(__dirname, 'public/uploads/images'),
  );
  const cacheService = new CacheService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register(registerExternalPlugins());

  server.auth.strategy('om_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register(
    registerPlugins(
      usersService,
      authenticationsService,
      playlistsService,
      collaborationsService,
      storageService,
      cacheService,
    ),
  );

  server.ext('onPreResponse', Response.errorHandler());

  await server.start();

  console.log(`Application running on port ${server.info.uri}`);
};

init();

function registerPlugins(
  usersService,
  authenticationsService,
  playlistsService,
  collaborationsService,
  storageService,
  cacheService,
) {
  return [
    {
      plugin: albums,
      options: {
        service: new AlbumsService(cacheService),
        storageService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: new SongsService(),
        validator: SongValidator,
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
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        tokenManager: TokenManager,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
      },
    },
  ];
}

function registerExternalPlugins() {
  return [
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ];
}
