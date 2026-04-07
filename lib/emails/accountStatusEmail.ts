// lib/emails/accountStatusEmail.ts

interface DeactivationEmailProps {
    userName: string
    reason: string
    supportEmail: string
  }
  
  interface ActivationEmailProps {
    userName: string
    supportEmail: string
  }
  
  export function getDeactivationEmail({ userName, reason, supportEmail }: DeactivationEmailProps): string {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Account Deactivated</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <tr>
              <td style="background:#dc2626;padding:32px 40px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">CivicFix</h1>
                <p style="margin:8px 0 0;color:#fecaca;font-size:14px;">Account Notification</p>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;">Your Account Has Been Deactivated</h2>
                <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">Hi <strong>${userName}</strong>,</p>
                <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                  Your CivicFix account has been <strong style="color:#dc2626;">deactivated</strong> by our admin team.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr>
                    <td style="background:#fef2f2;border:1px solid #fecaca;border-left:4px solid #dc2626;border-radius:8px;padding:16px 20px;">
                      <p style="margin:0 0 6px;color:#991b1b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Reason for Deactivation</p>
                      <p style="margin:0;color:#7f1d1d;font-size:15px;line-height:1.5;">${reason}</p>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.6;">While your account is deactivated:</p>
                <ul style="margin:0 0 24px;padding-left:20px;color:#374151;font-size:15px;line-height:1.8;">
                  <li>You will not be able to log in</li>
                  <li>Your previously submitted reports remain in the system</li>
                  <li>Your data is safely stored and not deleted</li>
                </ul>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                  <tr>
                    <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #16a34a;border-radius:8px;padding:20px;">
                      <p style="margin:0 0 8px;color:#14532d;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">How to Reactivate Your Account</p>
                      <p style="margin:0 0 12px;color:#166534;font-size:15px;line-height:1.6;">
                        If you believe this was a mistake or would like to appeal, contact our support team:
                      </p>
                      <p style="margin:0;font-size:15px;">
                        📧 <a href="mailto:${supportEmail}" style="color:#16a34a;font-weight:600;text-decoration:none;">${supportEmail}</a>
                      </p>
                      <p style="margin:10px 0 0;color:#166534;font-size:13px;line-height:1.5;">
                        In your email, include your registered email address and the reason you are requesting reactivation.
                        Our admin team will review and respond within 2–3 business days.
                      </p>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0;color:#374151;font-size:15px;">Regards,<br/><strong>The CivicFix Team</strong></p>
              </td>
            </tr>
            <tr>
              <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
                <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                  This is an automated message. Do not reply directly.<br/>
                  Contact us at <a href="mailto:${supportEmail}" style="color:#6b7280;">${supportEmail}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`
  }
  
  export function getActivationEmail({ userName, supportEmail }: ActivationEmailProps): string {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Account Reactivated</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <tr>
              <td style="background:#16a34a;padding:32px 40px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">CivicFix</h1>
                <p style="margin:8px 0 0;color:#bbf7d0;font-size:14px;">Account Notification</p>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;">Your Account Has Been Reactivated 🎉</h2>
                <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">Hi <strong>${userName}</strong>,</p>
                <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                  Your CivicFix account has been <strong style="color:#16a34a;">reactivated</strong> by our admin team.
                  You can now log in and access all features again.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                  <tr>
                    <td align="center">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://civicfix.com'}/login"
                        style="display:inline-block;background:#16a34a;color:#ffffff;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;text-decoration:none;">
                        Login to Your Account
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;color:#6b7280;font-size:14px;line-height:1.6;">
                  If you have any concerns, contact us at
                  <a href="mailto:${supportEmail}" style="color:#2563eb;text-decoration:none;">${supportEmail}</a>.
                </p>
                <p style="margin:24px 0 0;color:#374151;font-size:15px;">Welcome back!<br/><strong>The CivicFix Team</strong></p>
              </td>
            </tr>
            <tr>
              <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
                <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                  This is an automated message. Do not reply directly.<br/>
                  Contact us at <a href="mailto:${supportEmail}" style="color:#6b7280;">${supportEmail}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`
  }