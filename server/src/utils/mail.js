import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendResetPasswordEmail(to, name, link) {
  const mailOptions = {
    from: `"AI Resume Evaluator" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset Your Password - AI Resume Evaluator',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 25px;">
          <h2 style="color: #1e40af;">AI Resume Evaluator</h2>
          <p style="font-size: 16px; color: #333;">
            Hi <strong>${name}</strong>,
          </p>
          <p style="font-size: 15px; color: #333;">
            We received a request to reset your password. Click the button below to set a new password:
          </p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${link}" target="_blank"
              style="background-color: #2563eb; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #555;">
            If you didn’t request this, you can safely ignore this email.
          </p>
          <p style="font-size: 13px; color: #777; margin-top: 25px;">
            — The AI Resume Evaluator Team
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reset email sent to ${to}`);
  } catch (err) {
    console.error('Email send failed:', err);
    throw new Error('Failed to send reset email');
  }
}
