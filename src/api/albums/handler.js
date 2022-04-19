/* eslint-disable no-else-return */
/* eslint-disable no-underscore-dangle */
const Response = require('../../utils/Response');

class AlbumHandler {
  constructor(service, storageService, validator) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumHandler = this.getAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postUploadCoverHandler = this.postUploadCoverHandler.bind(this);
    this.postLikesAlbums = this.postLikesAlbums.bind(this);
    this.getCountAlbumsLikes = this.getCountAlbumsLikes.bind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validatePayload(request.payload);

    return Response.post(h, 'success', 'Album berhasil ditambahkan', {
      albumId: await this._service.addAlbum(request.payload),
    });
  }

  async postLikesAlbums(request, h) {
    await this._service.likeOrDislike(
      request.params.id,
      request.auth.credentials.id,
    );

    return Response.put(h, 'success', 'Data berhasil di simpan');
  }

  async getCountAlbumsLikes(request, h) {
    const { data, isRedis } = await this._service.getCountAlbumLikes(
      request.params.id,
    );
    if (isRedis) {
      return Response.getCache(h, 'success', data);
    } else {
      return Response.get('success', data);
    }
  }

  async postUploadCoverHandler(request, h) {
    const { cover } = request.payload;

    const { id } = request.params;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);

    const oldCover = await this._service.getRAWAlbumById(id);

    await this._service.updateCover(filename, id);

    if (oldCover.cover) {
      await this._storageService.removeFile(oldCover.cover);
    }

    return Response.put(h, 'success', 'Sampul berhasil diunggah');
  }

  async getAlbumHandler() {
    return Response.get('success', {
      albums: await this._service.getAlbums(),
    });
  }

  async getAlbumByIdHandler(request) {
    return Response.get('success', {
      album: await this._service.getAlbumById(request.params.id),
    });
  }

  async putAlbumByIdHandler(request) {
    this._validator.validatePayload(request.payload);

    await this._service.editAlbumById(request.params.id, request.payload);

    return Response.putOrDelete('success', 'Album berhasil diperbarui');
  }

  async deleteAlbumByIdHandler(request) {
    await this._service.deleteAlbumById(request.params.id);

    return Response.putOrDelete('success', 'Album berhasil dihapus');
  }
}

module.exports = AlbumHandler;
