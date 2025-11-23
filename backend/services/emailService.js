const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, text) {
  try {
    await transporter.sendMail({
      from: `"Admin Pengaduan" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("Email terkirim ke:", to);
  } catch (error) {
    console.error("Gagal mengirim email:", error);
  }
}

module.exports = { sendEmail };
