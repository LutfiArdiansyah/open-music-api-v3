/* eslint-disable no-return-await */
/* eslint-disable no-underscore-dangle */
const nodemailer = require('nodemailer');

class Nodemailer {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: process.env.MAIL_SMTP_HOST,
      port: process.env.MAIL_SMTP_PORT,
      secure: true,
      auth: {
        type: 'LOGIN',
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async send(to, subject, message, attachments) {
    const mail = {
      from: '[Open Music] V3 - Lutfi Ardiansyah',
      to,
      subject,
      text: message,
      attachments,
    };

    return await this._transporter.sendMail(mail);
  }
}

module.exports = Nodemailer;
