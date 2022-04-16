/* eslint-disable prefer-destructuring */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylists(userId, playlistId) {
    const result = { playlist: {} };

    const queryPlaylist = {
      text: `select
                p.id,
                p.name
            from
                playlists p
            where
                p.id = $1
            and p.owner = $2`,
      values: [playlistId, userId],
    };

    const playlist = await this._pool.query(queryPlaylist);

    if (this.validateResult(playlist)) {
      return result;
    }

    result.playlist = playlist.rows[0];

    const songs = await this._pool.query({
      text: `select
                s.id,
                s.title,
                s.performer
            from
                playlist_songs ps,
                songs s
            where
                ps.song_id = s.id
                and ps.playlist_id = $1`,
      values: [playlistId],
    });

    if (!this.validateResult(songs)) {
      result.playlist.songs = songs.rows;
    }

    return JSON.stringify(result);
  }

  validateResult(result) {
    return (
      !result || !result.rows || !result.rows.length || result.rows.length === 0
    );
  }
}

module.exports = PlaylistsService;
