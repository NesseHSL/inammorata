import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'innamotravel@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, dates, destination, tier, dream } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const firstName = name.split(' ')[0];
  const calendlyLink = 'https://calendly.com/innamotravel';

  // ── Auto-reply to the client ──────────────────────────────────────────────
  const clientEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#F5EFE0;font-family:Georgia,serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5EFE0;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="background:#F5EFE0;padding:36px 48px 24px;">
              <img src="https://innamo.travel/innamo-logo-email.png" alt="Innamo" width="220" style="display:block;margin:0 auto;">
            </td>
          </tr>
          <tr>
            <td align="center" style="background:#2C1810;padding:12px 48px;">
              <p style="font-family:Georgia,serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,239,224,0.45);margin:0;">For the love of Italy</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#fff;padding:52px 48px 44px;">
              <p style="font-family:Georgia,serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#C4622D;margin:0 0 20px;">Your enquiry</p>
              <p style="font-family:Georgia,serif;font-size:26px;font-style:italic;font-weight:400;color:#2C1810;margin:0 0 28px;line-height:1.3;">
                Dear ${firstName},
              </p>
              <p style="font-family:Georgia,serif;font-size:16px;line-height:1.8;color:rgba(44,24,16,0.82);margin:0 0 20px;">
                Thank you for reaching out to Innamo. Your enquiry has arrived safely, and Nesse will be in touch personally within 48 hours.
              </p>
              <p style="font-family:Georgia,serif;font-size:16px;line-height:1.8;color:rgba(44,24,16,0.82);margin:0 0 32px;">
                In the meantime, if you would like to arrange a short exploratory call to talk through what you have in mind, you are very welcome to book a time directly. Calls are available weekdays between 12 and 5pm. For weekend appointments, simply reply to this email.
              </p>

              <!-- Calendly CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 36px;">
                <tr>
                  <td align="center" style="background:#2C1810;padding:16px 36px;">
                    <a href="${calendlyLink}" style="font-family:Georgia,serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#F5EFE0;text-decoration:none;">Book an exploratory call</a>
                  </td>
                </tr>
              </table>

              ${destination ? `<p style="font-family:Georgia,serif;font-size:15px;line-height:1.8;color:rgba(44,24,16,0.65);margin:0 0 8px;"><strong style="color:#2C1810;">Destination:</strong> ${destination}</p>` : ''}
              ${dates ? `<p style="font-family:Georgia,serif;font-size:15px;line-height:1.8;color:rgba(44,24,16,0.65);margin:0 0 8px;"><strong style="color:#2C1810;">Travel dates:</strong> ${dates}</p>` : ''}
              ${tier ? `<p style="font-family:Georgia,serif;font-size:15px;line-height:1.8;color:rgba(44,24,16,0.65);margin:0 0 24px;"><strong style="color:#2C1810;">Service:</strong> ${tier}</p>` : ''}
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td style="background:#EDE4CC;padding:36px 48px;">
              <p style="font-family:Georgia,serif;font-size:16px;font-style:italic;color:#2C1810;margin:0 0 4px;">Nesse</p>
              <p style="font-family:Georgia,serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(44,24,16,0.45);margin:0 0 16px;">Founder, Innamo</p>
              <p style="font-family:Georgia,serif;font-size:12px;color:rgba(44,24,16,0.4);margin:0;">
                <a href="https://innamo.travel" style="color:#C4622D;text-decoration:none;">innamo.travel</a> &nbsp;&middot;&nbsp;
                <a href="mailto:innamotravel@gmail.com" style="color:rgba(44,24,16,0.4);text-decoration:none;">innamotravel@gmail.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 48px 0;">
              <p style="font-family:Georgia,serif;font-size:11px;letter-spacing:0.12em;color:rgba(44,24,16,0.3);margin:0;">
                Innamo &nbsp;&middot;&nbsp; Bespoke luxury Italian travel, curated
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

  // ── Notification to Nesse ─────────────────────────────────────────────────
  const nesseEmail = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5EFE0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5EFE0;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <tr>
            <td align="center" style="background:#F5EFE0;padding:24px 40px 16px;">
              <img src="https://innamo.travel/innamo-logo-email.png" alt="Innamo" width="160" style="display:block;margin:0 auto;">
            </td>
          </tr>
          <tr>
            <td style="background:#2C1810;padding:20px 40px;">
              <p style="font-family:Georgia,serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#C4622D;margin:0 0 6px;">New enquiry</p>
              <p style="font-family:Georgia,serif;font-size:22px;font-style:italic;color:#F5EFE0;margin:0;">${name}</p>
            </td>
          </tr>
          <tr>
            <td style="background:#fff;padding:36px 40px;">
              <p style="font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#2C1810;margin:0 0 6px;"><strong>Email:</strong> <a href="mailto:${email}" style="color:#C4622D;">${email}</a></p>
              ${destination ? `<p style="font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#2C1810;margin:0 0 6px;"><strong>Destination:</strong> ${destination}</p>` : ''}
              ${dates ? `<p style="font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#2C1810;margin:0 0 6px;"><strong>Travel dates:</strong> ${dates}</p>` : ''}
              ${tier ? `<p style="font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#2C1810;margin:0 0 6px;"><strong>Service tier:</strong> ${tier}</p>` : ''}
              ${dream ? `<p style="font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#2C1810;margin:0 0 0;"><strong>Their dream:</strong><br>${dream}</p>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await Promise.all([
      transporter.sendMail({
        from: '"Innamo" <innamotravel@gmail.com>',
        to: email,
        subject: 'Your Innamo enquiry',
        html: clientEmail,
      }),
      transporter.sendMail({
        from: '"Innamo" <innamotravel@gmail.com>',
        to: 'innamotravel@gmail.com',
        replyTo: email,
        subject: `New enquiry: ${name}${destination ? ' — ' + destination : ''}`,
        html: nesseEmail,
      }),
    ]);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
