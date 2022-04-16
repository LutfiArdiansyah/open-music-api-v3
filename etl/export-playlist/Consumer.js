require('dotenv').config();
const amqp = require('amqplib');
const PlaylistService = require('./PlaylistService');
const Mail = require('./Nodemailer');
const Listener = require('./Listener');

const init = async () => {
  const playlistService = new PlaylistService();
  const mail = new Mail();
  const listener = new Listener(playlistService, mail);

  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  await channel.assertQueue('export:playlist', {
    durable: true,
  });

  channel.consume('export:playlist', listener.listen, { noAck: true });
};

init();
