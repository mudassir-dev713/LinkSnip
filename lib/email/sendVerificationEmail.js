import Mailjet from 'node-mailjet';
import { VerificationEmail } from '@/EmailTemplates/VerificationEmail';

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

export async function sendVerificationEmail(email, token) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify?token=${token}`;
  const subject = 'Verify your email';
  const html = VerificationEmail(verifyUrl);

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
          TextPart: 'Please verify your email address by clicking the link.',
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
