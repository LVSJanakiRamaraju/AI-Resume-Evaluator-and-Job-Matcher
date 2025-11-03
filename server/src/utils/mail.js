import nodemailer from 'nodemailer';

function buildTransportOptions() {
  if (process.env.SMTP_HOST) {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: process.env.SMTP_REJECT_UNAUTHORIZED === 'false' ? { rejectUnauthorized: false } : undefined,
    };
  }

  if (process.env.EMAIL_SERVICE) {
    return {
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };
  }

  return {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
}

const transporter = nodemailer.createTransport(buildTransportOptions());

transporter.verify()
  .then(() => {
    console.log('Email transporter verified');
  })
  .catch((err) => {
    console.warn('Email transporter verification failed. Emails may not be sent.');
    console.warn(err && err.message ? err.message : err);
  });

export async function sendResetPasswordEmail(to, name, link) {
  const from = process.env.EMAIL_FROM || `"AI Resume Evaluator" <${process.env.EMAIL_USER}>`;

  const mailOptions = {
    from,
    to,
    subject: 'Reset Your Password - AI Resume Evaluator',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 25px;">
          <h2 style="color: #1e40af;">AI Resume Evaluator</h2>
          <p style="font-size: 16px; color: #333;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 15px; color: #333;">We received a request to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${link}" target="_blank" style="background-color: #2563eb; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #555;">If you didn’t request this, you can safely ignore this email.</p>
          <p style="font-size: 13px; color: #777; margin-top: 25px;">— The AI Resume Evaluator Team</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Reset email sent to ${to}; messageId=${info.messageId}`);
    return info;
  } catch (err) {
    console.error('Email send failed:', err && err.message ? err.message : err);
    throw new Error('Failed to send reset email');
  }
}
