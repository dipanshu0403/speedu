const nodemailer = require("nodemailer");

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("Email provider is not configured");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

async function sendOtpEmail(email, otp) {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  await transporter.sendMail({
    from,
    to: email,
    subject: "Your Speedu OTP",
    text: `Your Speedu OTP is ${otp}. It expires in 5 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
        <h2>Your Speedu OTP</h2>
        <p>Use this code to continue:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:4px">${otp}</p>
        <p>This OTP expires in 5 minutes.</p>
      </div>
    `,
  });

  return { sent: true, provider: "gmail" };
}

module.exports = {
  sendOtpEmail,
};
