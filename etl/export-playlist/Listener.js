/* eslint-disable no-underscore-dangle */
class Listener {
  constructor(playlistService, mail) {
    this._playlistService = playlistService;
    this._mail = mail;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { userId, targetEmail, playlistId } = JSON.parse(
        message.content.toString(),
      );

      const playlist = await this._playlistService.getPlaylists(
        userId,
        playlistId,
      );

      const result = await this._mail.send(
        targetEmail,
        'Export Playlist',
        'Terlampir hasil dari ekspor playlist',
        [
          {
            filename: 'playlist.json',
            content: playlist,
          },
        ],
      );

      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;
