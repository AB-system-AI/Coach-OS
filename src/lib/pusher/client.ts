"use client";

import PusherJS from "pusher-js";

let pusherClient: PusherJS | null = null;

export function getPusherClient(): PusherJS | null {
  if (pusherClient) return pusherClient;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY?.trim();
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER?.trim() ?? "mt1";

  if (!key) return null;

  pusherClient = new PusherJS(key, {
    cluster,
    authEndpoint: "/api/pusher/auth",
  });

  return pusherClient;
}

export function subscribeToRoom(
  roomId: string,
  onMessage: (data: unknown) => void
): () => void {
  const pusher = getPusherClient();
  if (!pusher) {
    return () => {};
  }

  const channel = pusher.subscribe(`room-${roomId}`);
  channel.bind("new-message", onMessage);

  return () => {
    channel.unbind("new-message", onMessage);
    pusher.unsubscribe(`room-${roomId}`);
  };
}
