import { VerificationEmail } from '@/EmailTemplates/VerificationEmail';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email, token) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify?token=${token}`;
  const subject = 'Verify your email';
  const html = VerificationEmail(verifyUrl);

  try {
    const response = await resend.emails.send({
      from: 'LinkSnip@resend.dev',
      to: 'anonymous260260a@gmail.com',
      subject,
      html,
    });

    console.log('Resend response:', response);
    return response;
  } catch (error) {
    console.error(' Failed to send verification email:', error);
    throw error;
  }
}
