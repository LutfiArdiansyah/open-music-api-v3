/* eslint-disable no-underscore-dangle */
const AuthorizationError = require('../../exceptions/AuthorizationError');
const Response = require('../../utils/Response');
const NotFoundError = require('../../exceptions/NotFoundError');

class ExportsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postExportPlaylistssHandler = this.postExportPlaylistssHandler.bind(this);
  }

  async postExportPlaylistssHandler(request, h) {
    this._validator.validateExportPlaylistPayload(request.payload);

    const message = {
      userId: request.auth.credentials.id,
      targetEmail: request.payload.targetEmail,
      playlistId: request.params.playlistId,
    };

    const result = await this._service.getRawPlaylistById(message.playlistId);

    if (!result || result.length === 0) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result[0];

    if (playlist.owner !== message.userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }

    await this._service.sendMessage('export:playlist', JSON.stringify(message));

    return Response.put(h, 'success', 'Permintaan Anda sedang kami proses');
  }
}

module.exports = ExportsHandler;
