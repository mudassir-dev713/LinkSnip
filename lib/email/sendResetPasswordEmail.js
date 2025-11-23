import Mailjet from 'node-mailjet';
import { ResetPasswordEmail } from '@/EmailTemplates/ResetPasswordEmail';

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

export async function sendResetPasswordEmail(email, token) {
  const subject = 'Reset Your Password';
  const html = ResetPasswordEmail(token);

  try {
    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_SENDER_EMAIL,
            Name: '', // optional
          },
          To: [
            {
              Email: email,
            },
          ],
          Subject: subject,
          HTMLPart: html,
          TextPart: 'Click To this Link to Reset Password ',
        },
      ],
    });

    console.log('Mailjet response:', result.body);
    return result.body;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
}
