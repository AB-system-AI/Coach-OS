import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  data?: Record<string, unknown>;
}

async function sendWebPush(endpoint: string, p256dh: string, auth: string, payload: PushPayload) {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY?.trim();

  if (!vapidPublicKey || !vapidPrivateKey) {
    return false;
  }

  try {
    const webpush = await import("web-push").catch(() => null);
    if (!webpush) return false;

    webpush.setVapidDetails(
      `mailto:${process.env.VAPID_EMAIL ?? "noreply@coachos.app"}`,
      vapidPublicKey,
      vapidPrivateKey
    );

    await webpush.sendNotification(
      { endpoint, keys: { p256dh, auth } },
      JSON.stringify(payload)
    );
    return true;
  } catch (err) {
    logger.warn("[push] Web push delivery failed", { endpoint, err });
    return false;
  }
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const subscriptions = await db.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    logger.info("[push] No active push subscriptions for user", { userId });
    return { sent: 0, stored: 0 };
  }

  let sent = 0;
  for (const sub of subscriptions) {
    const ok = await sendWebPush(sub.endpoint, sub.p256dh, sub.auth, payload);
    if (ok) sent++;
  }

  return { sent, stored: subscriptions.length - sent };
}

export async function sendPushToTenant(tenantId: string, payload: PushPayload) {
  const members = await db.tenantMember.findMany({
    where: { tenantId, isActive: true },
    select: { userId: true },
  });

  let totalSent = 0;
  for (const { userId } of members) {
    const { sent } = await sendPushToUser(userId, payload);
    totalSent += sent;
  }

  return { totalSent, memberCount: members.length };
}

export async function registerPushSubscription(
  userId: string,
  endpoint: string,
  p256dh: string,
  auth: string
) {
  return db.pushSubscription.upsert({
    where: { endpoint },
    create: {
      userId,
      endpoint,
      p256dh,
      auth,
    },
    update: {
      userId,
    },
  });
}
