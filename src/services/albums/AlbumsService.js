/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapDtoAlbum, mapDtoSong } = require('../../dto/album');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async updateCover(cover, albumId) {
    const query = {
      text: 'UPDATE albums set cover = $1, updated_at = $2 WHERE id = $3',
      values: [cover, new Date(), albumId],
    };

    await this._pool.query(query);
  }

  async addAlbum({ name, year }) {
    const auditDate = new Date();

    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, auditDate, auditDate],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows.map(mapDtoAlbum);
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const albums = await this._pool.query(query);

    if (this.validateResult(albums)) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = albums.rows.map(mapDtoAlbum)[0];

    const songs = await this._pool.query({
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [album.id],
    });

    return {
      ...album,
      ...{ songs: songs.rows.map(mapDtoSong) },
    };
  }

  async getRAWAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const albums = await this._pool.query(query);

    if (this.validateResult(albums)) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    return albums.rows[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, new Date(), id],
    };

    const result = await this._pool.query(query);

    if (this.validateResult(result)) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (this.validateResult(result)) {
      throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
    }
  }

  async likeOrDislike(albumId, userId) {
    await this.validateAlbum(albumId);

    const isLikes = await this.validateLikes(albumId, userId);

    if (isLikes) {
      await this.dislike(albumId, userId);
    } else {
      await this.like(userId, albumId);
    }
    await this._cacheService.delete(`album:${albumId}`);
  }

  async getCountAlbumLikes(id) {
    try {
      const result = await this._cacheService.get(`album:${id}`);

      return { data: JSON.parse(result), isRedis: true };
    } catch (error) {
      const queryLikes = {
        text: 'SELECT COUNT(1) as likes FROM user_album_likes WHERE album_id = $1',
        values: [id],
      };

      const likes = await this._pool.query(queryLikes);

      // eslint-disable-next-line radix
      const result = { likes: parseInt(likes.rows[0].likes) };

      await this._cacheService.set(`album:${id}`, JSON.stringify(result));

      return { data: result, isRedis: false };
    }
  }

  async like(userId, albumId) {
    const auditDate = new Date();

    const id = `likes-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3, $4, $5)',
      values: [id, userId, albumId, auditDate, auditDate],
    };
    await this._pool.query(query);
  }

  async dislike(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };
    await this._pool.query(query);
  }

  async validateLikes(albumId, userId) {
    const queryLikes = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const likes = await this._pool.query(queryLikes);

    if (!this.validateResult(likes)) {
      return true;
    }
    return false;
  }

  async validateAlbum(albumId) {
    const queryAlbum = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [albumId],
    };

    const album = await this._pool.query(queryAlbum);

    if (this.validateResult(album)) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }

  // eslint-disable-next-line class-methods-use-this
  validateResult(result) {
    return (
      !result || !result.rows || !result.rows.length || result.rows.length === 0
    );
  }
}

module.exports = AlbumService;
