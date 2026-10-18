export function VerificationEmail(verifyUrl) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Verify Your Email</title>
      <style>
        @media (max-width: 600px) {
          .container {
            width: 90% !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f7;">
      <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f7; padding: 30px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" class="container" style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <h1 style="margin: 0; color: #333333;">Welcome to Our App 🎉</h1>
                </td>
              </tr>
              <tr>
                <td style="color: #555555; font-size: 16px; line-height: 1.6;">
                  <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
                  <p style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                      Verify Email
                    </a>
                  </p>
                  <p>If you didn’t create an account, you can safely ignore this email.</p>
                  <p style="margin-top: 30px;">Best regards,<br /><strong>LinkSnip Team</strong></p>
                </td>
              </tr>
              <tr>
                <td style="font-size: 12px; color: #999999; text-align: center; padding-top: 40px;">
                  © ${new Date().getFullYear()}LinkSnip Inc. All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}
