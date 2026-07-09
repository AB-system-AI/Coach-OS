import Pusher from "pusher";

let pusherServer: Pusher | null = null;

export function getPusherServer(): Pusher | null {
  if (pusherServer) return pusherServer;

  const appId = process.env.PUSHER_APP_ID?.trim();
  const key = process.env.PUSHER_KEY?.trim();
  const secret = process.env.PUSHER_SECRET?.trim();
  const cluster = process.env.PUSHER_CLUSTER?.trim() ?? "mt1";

  if (!appId || !key || !secret) {
    return null;
  }

  pusherServer = new Pusher({ appId, key, secret, cluster, useTLS: true });
  return pusherServer;
}

export async function triggerPusherEvent(
  channel: string,
  event: string,
  data: unknown
): Promise<void> {
  const pusher = getPusherServer();
  if (!pusher) {
    console.log("[pusher:skipped] No Pusher credentials configured", { channel, event });
    return;
  }
  await pusher.trigger(channel, event, data);
}
