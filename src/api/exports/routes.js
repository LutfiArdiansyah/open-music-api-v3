const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{playlistId}',
    handler: handler.postExportPlaylistssHandler,
    options: {
      auth: 'om_jwt',
    },
  },
];

module.exports = routes;
