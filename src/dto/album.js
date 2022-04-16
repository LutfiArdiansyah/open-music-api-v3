const mapDtoAlbum = ({
  id, name, year, cover,
}) => ({
  id,
  name,
  year,
  coverUrl:
    cover == null
      ? null
      : `http://${process.env.HOST}:${process.env.PORT}/upload/images/${cover}`,
});

const mapDtoSong = ({ id, title, performer }) => ({
  id,
  title,
  performer,
});

module.exports = { mapDtoAlbum, mapDtoSong };
