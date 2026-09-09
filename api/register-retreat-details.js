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

const DEPOSITS = { shared: 1925, single: 2425 };
const ROOM_LABELS = { shared: 'Shared Occupancy', single: 'Single Occupancy' };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    firstName, lastName, address, mobile, email, gender, source,
    roomType, roommateName, roommateEmail,
    extraPT, extraNutrition, extraMassage, extraWineTasting, extendTrip,
    dietary, health, paymentMethod, houseRulesAck,
  } = req.body;

  if (!firstName || !lastName || !address || !mobile || !email || !gender || !source || !roomType || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (roomType === 'shared' && (!roommateName || !roommateEmail)) {
    return res.status(400).json({ error: 'Roommate details are required for a shared room' });
  }
  if (!houseRulesAck) {
    return res.status(400).json({ error: 'House Rules must be acknowledged' });
  }

  const fullName = `${firstName} ${lastName}`;
  const deposit = DEPOSITS[roomType];
  const roomLabel = ROOM_LABELS[roomType] || roomType;

  const extras = [];
  if (extraPT) extras.push('1:1 PT Session (£75)');
  if (extraNutrition) extras.push('Nutritional Consultation (£75)');
  if (extraMassage) extras.push('Massage (included, opted in)');
  if (extraWineTasting) extras.push('Second Wine Tasting (£120pp)');

  // Log the full booking independently of whether the emails below
  // succeed - this is the only backup record of a submission, so a Gmail
  // auth failure or similar shouldn't cost the booking entirely.
  await saveBooking({
    firstName, lastName, address, mobile, email, gender, source,
    roomType, roommateName, roommateEmail,
    extraPT, extraNutrition, extraMassage, extraWineTasting, extendTrip,
    dietary, health, paymentMethod, houseRulesAck,
  });

  // ── Auto-reply to the guest ─────────────────────────────────────────────
  const paymentBlock = paymentMethod === 'bacs'
    ? `<p style="font-family:Georgia,serif;font-size:15px;line-height:1.8;color:rgba(44,24,16,0.82);margin:0 0 8px;"><strong style="color:#2C1810;">Payment:</strong> Bank transfer (BACS). We'll send you our account details and a payment reference separately, please don't send anything until you hear from us.</p>`
    : `<p style="font-family:Georgia,serif;font-size:15px;line-height:1.8;color:rgba(44,24,16,0.82);margin:0 0 8px;"><strong style="color:#2C1810;">Payment:</strong> Card payment. We'll send you a secure payment link within 24 hours (a 3% processing charge applies).</p>`;

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

          <tr>
            <td align="center" style="background:#F5EFE0;padding:36px 48px 24px;">
              <img src="https://innamo.travel/innamo-logo-email.png" alt="Innamo" width="220" style="display:block;margin:0 auto;">
            </td>
          </tr>
          <tr>
            <td align="center" style="background:#2C1810;padding:12px 48px;">
              <p style="font-family:Georgia,serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,239,224,0.45);margin:0;">Wine &amp; Wellness Retreat</p>
            </td>
          </tr>

          <tr>
            <td style="background:#fff;padding:52px 48px 44px;">
              <p style="font-family:Georgia,serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#C4622D;margin:0 0 20px;">Registration received</p>
              <p style="font-family:Georgia,serif;font-size:26px;font-style:italic;font-weight:400;color:#2C1810;margin:0 0 28px;line-height:1.3;">
                Dear ${firstName},
              </p>
              <p style="font-family:Georgia,serif;font-size:16px;line-height:1.8;color:rgba(44,24,16,0.82);margin:0 0 20px;">
                Thank you for completing your registration for the Wine &amp; Wellness Retreat, 8&ndash;15 May 2027 at Villa Cecconi, near Siena. We'll be in touch within 24 hours to confirm your place.
              </p>

              <p style="font-family:Georgia,serif;font-size:15px;line-height:1.8;color:rgba(44,24,16,0.82);margin:0 0 8px;"><strong style="color:#2C1810;">Room:</strong> ${roomLabel}, £${deposit} deposit due</p>
              ${roomType === 'shared' ? `<p style="font-family:Georgia,serif;font-size:15px;line-height:1.8;color:rgba(44,24,16,0.82);margin:0 0 8px;"><strong style="color:#2C1810;">Rooming with:</strong> ${roommateName}</p>` : ''}
              ${extras.length ? `<p style="font-family:Georgia,serif;font-size:15px;line-height:1.8;color:rgba(44,24,16,0.82);margin:0 0 8px;"><strong style="color:#2C1810;">Extras:</strong> ${extras.join(', ')}</p>` : ''}
              ${dietary ? `<p style="font-family:Georgia,serif;font-size:15px;line-height:1.8;color:rgba(44,24,16,0.82);margin:0 0 8px;"><strong style="color:#2C1810;">Dietary notes:</strong> ${dietary}</p>` : ''}
              ${health ? `<p style="font-family:Georgia,serif;font-size:15px;line-height:1.8;color:rgba(44,24,16,0.82);margin:0 0 8px;"><strong style="color:#2C1810;">Health/movement notes:</strong> ${health}</p>` : ''}
              ${extendTrip ? `<p style="font-family:Georgia,serif;font-size:15px;line-height:1.8;color:rgba(44,24,16,0.82);margin:0 0 8px;">We'll also be in touch separately about extending your stay in Italy before or after the retreat.</p>` : ''}
              ${paymentBlock}

              <p style="font-family:Georgia,serif;font-size:16px;line-height:1.8;color:rgba(44,24,16,0.82);margin:24px 0 0;">
                Any questions at all, just reply to this email.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#EDE4CC;padding:36px 48px;">
              <p style="font-family:Georgia,serif;font-size:16px;font-style:italic;color:#2C1810;margin:0 0 4px;">Nesse</p>
              <p style="font-family:Georgia,serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(44,24,16,0.45);margin:0 0 16px;">Innamo Travel, in partnership with HerSpace London</p>
              <p style="font-family:Georgia,serif;font-size:12px;color:rgba(44,24,16,0.4);margin:0;">
                <a href="https://innamo.travel" style="color:#C4622D;text-decoration:none;">innamo.travel</a> &nbsp;&middot;&nbsp;
                <a href="mailto:innamotravel@gmail.com" style="color:rgba(44,24,16,0.4);text-decoration:none;">innamotravel@gmail.com</a>
              </p>
            </td>
          </tr>

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

  // ── Notification to Nesse ───────────────────────────────────────────────
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
              <p style="font-family:Georgia,serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#C4622D;margin:0 0 6px;">Full retreat booking</p>
              <p style="font-family:Georgia,serif;font-size:22px;font-style:italic;color:#F5EFE0;margin:0;">${fullName}</p>
            </td>
          </tr>
          <tr>
            <td style="background:#fff;padding:36px 40px;">
              <p style="font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#2C1810;margin:0 0 6px;"><strong>Email:</strong> <a href="mailto:${email}" style="color:#C4622D;">${email}</a></p>
              <p style="font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#2C1810;margin:0 0 6px;"><strong>Mobile:</strong> ${mobile}</p>
              <p style="font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#2C1810;margin:0 0 6px;"><strong>Address:</strong> ${address}</p>
              <p style="font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#2C1810;margin:0 0 6px;"><strong>Gender:</strong> ${gender}</p>
              <p style="font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#2C1810;margin:0 0 6px;"><strong>Heard about us via:</strong> ${source}</p>
              <p style="font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#2C1810;margin:0 0 6px;"><strong>Room:</strong> ${roomLabel}, £${deposit} deposit due</p>
              ${roomType === 'shared' ? `<p style="font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#2C1810;margin:0 0 6px;"><strong>Roommate:</strong> ${roommateName} (${roommateEmail})</p>` : ''}
              ${extras.length ? `<p style="font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#2C1810;margin:0 0 6px;"><strong>Extras:</strong> ${extras.join(', ')}</p>` : ''}
              ${dietary ? `<p style="font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#2C1810;margin:0 0 6px;"><strong>Dietary:</strong> ${dietary}</p>` : ''}
              ${health ? `<p style="font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#2C1810;margin:0 0 6px;"><strong>Health/movement:</strong> ${health}</p>` : ''}
              ${extendTrip ? `<p style="font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#C4622D;margin:0 0 6px;"><strong>Wants to extend their trip!</strong> Follow up about pre/post retreat stays.</p>` : ''}
              <p style="font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#2C1810;margin:0;"><strong>Payment method:</strong> ${paymentMethod === 'bacs' ? 'Bank transfer (BACS), send them the account details and reference' : 'Card, send them a secure payment link (+3%)'}</p>
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
        subject: 'Your Wine & Wellness Retreat registration is in',
        html: clientEmail,
      }),
      transporter.sendMail({
        from: '"Innamo" <innamotravel@gmail.com>',
        to: 'innamotravel@gmail.com',
        replyTo: email,
        subject: `Full retreat booking: ${fullName}`,
        html: nesseEmail,
      }),
    ]);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}

async function saveBooking(fields) {
  try {
    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/innamo_retreat_bookings`, {
      method: 'POST',
      headers: {
        'apikey':        process.env.SUPABASE_PUBLISHABLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SECRET_SERVICE_KEY}`,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify([{
        first_name:         fields.firstName,
        last_name:          fields.lastName,
        address:            fields.address,
        mobile:             fields.mobile,
        email:              fields.email,
        gender:             fields.gender,
        source:             fields.source,
        room_type:          fields.roomType,
        roommate_name:      fields.roommateName || null,
        roommate_email:     fields.roommateEmail || null,
        extra_pt:           !!fields.extraPT,
        extra_nutrition:    !!fields.extraNutrition,
        extra_massage:      !!fields.extraMassage,
        extra_wine_tasting: !!fields.extraWineTasting,
        extend_trip:        !!fields.extendTrip,
        dietary:            fields.dietary || null,
        health:             fields.health || null,
        payment_method:     fields.paymentMethod,
        house_rules_ack:    !!fields.houseRulesAck,
      }]),
    });
    if (!res.ok) {
      console.error('Failed to save retreat booking:', res.status, await res.text());
    }
  } catch (err) {
    console.error('Failed to save retreat booking:', err.message);
  }
}
