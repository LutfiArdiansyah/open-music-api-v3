/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("user_album_likes", {
    id: {
      type: "VARCHAR(30)",
      primaryKey: true,
    },
    user_id: {
      type: "VARCHAR(30)",
      notNull: true,
    },
    album_id: {
      type: "VARCHAR(30)",
      notNull: true,
    },
    created_at: {
      type: "timestamp without time zone",
      notNull: true,
    },
    updated_at: {
      type: "timestamp without time zone",
      notNull: true,
    },
  });

  pgm.addConstraint("user_album_likes", "fk_user_album_likes_2_users", {
    foreignKeys: [
      {
        columns: ["user_id"],
        references: "users(id)",
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        match: "SIMPLE",
      },
    ],
  });

  pgm.addConstraint("user_album_likes", "fk_user_album_likes_2_albums", {
    foreignKeys: [
      {
        columns: ["album_id"],
        references: "albums(id)",
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        match: "SIMPLE",
      },
    ],
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint("user_album_likes", "fk_user_album_likes_2_users", {
    ifExists: true,
  });

  pgm.dropConstraint("user_album_likes", "fk_user_album_likes_2_albums", {
    ifExists: true,
  });

  pgm.dropTable("user_album_likes");
};
