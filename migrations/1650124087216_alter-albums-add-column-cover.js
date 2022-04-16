/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("albums", { cover: "TEXT" }, { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropColumns("albums", ["cover"], { ifExists: true });
};
