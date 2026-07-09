export interface WhatsAppMessage {
  to: string;
  body: string;
  mediaUrl?: string;
}

export interface WhatsAppResult {
  sid: string;
  status: string;
}

function getTwilioCredentials() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_WHATSAPP_FROM?.trim();
  return { accountSid, authToken, from };
}

function getCloudApiCredentials() {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  return { token, phoneNumberId };
}

async function sendViaTwilio(message: WhatsAppMessage): Promise<WhatsAppResult> {
  const { accountSid, authToken, from } = getTwilioCredentials();

  if (!accountSid || !authToken || !from) {
    throw new Error(
      "[CoachOS] WhatsApp via Twilio requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM."
    );
  }

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const body = new URLSearchParams({
    From: `whatsapp:${from}`,
    To: `whatsapp:${message.to}`,
    Body: message.body,
    ...(message.mediaUrl ? { MediaUrl: message.mediaUrl } : {}),
  });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[CoachOS] Twilio WhatsApp failed: ${text}`);
  }

  const data = (await res.json()) as { sid: string; status: string };
  return { sid: data.sid, status: data.status };
}

async function sendViaCloudApi(message: WhatsAppMessage): Promise<WhatsAppResult> {
  const { token, phoneNumberId } = getCloudApiCredentials();

  if (!token || !phoneNumberId) {
    throw new Error(
      "[CoachOS] WhatsApp Cloud API requires WHATSAPP_CLOUD_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID."
    );
  }

  const to = message.to.replace(/\D/g, "");
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message.body },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[CoachOS] WhatsApp Cloud API failed: ${text}`);
  }

  const data = (await res.json()) as { messages: { id: string }[] };
  return { sid: data.messages?.[0]?.id ?? "unknown", status: "sent" };
}

export async function sendWhatsApp(message: WhatsAppMessage): Promise<WhatsAppResult> {
  const { accountSid } = getTwilioCredentials();
  const { token } = getCloudApiCredentials();

  if (accountSid) {
    return sendViaTwilio(message);
  }

  if (token) {
    return sendViaCloudApi(message);
  }

  throw new Error(
    "[CoachOS] No WhatsApp provider configured. Set either Twilio credentials " +
      "(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM) or " +
      "WhatsApp Cloud API credentials (WHATSAPP_CLOUD_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID)."
  );
}
