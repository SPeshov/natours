const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate in gmail "less secure app" option
  });

  // 2) define the email options

  const emailOptions = {
    from: 'Stojan Peshov <stojan.peshov@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3) Actually send the email

  await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
