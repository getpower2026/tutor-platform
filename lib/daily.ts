const DAILY_API_KEY = process.env.DAILY_API_KEY!;
const DAILY_DOMAIN = process.env.DAILY_DOMAIN!;

export async function createDailyRoom(bookingId: string, expiresAt: Date) {
  const res = await fetch("https://api.daily.co/v1/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name: `booking-${bookingId}`,
      privacy: "private",
      properties: {
        exp: Math.floor(expiresAt.getTime() / 1000),
        max_participants: 2,
        enable_chat: true,
        enable_screenshare: true,
        start_video_off: false,
        start_audio_off: false,
        enable_prejoin_ui: false,
      },
    }),
  });

  if (!res.ok) throw new Error("Failed to create Daily room");
  return res.json() as Promise<{ name: string; url: string }>;
}

export async function createDailyToken(roomName: string, isOwner: boolean) {
  const res = await fetch("https://api.daily.co/v1/meeting-tokens", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        is_owner: isOwner,
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      },
    }),
  });

  if (!res.ok) throw new Error("Failed to create Daily token");
  const data = await res.json();
  return data.token as string;
}

export function getDailyRoomUrl(roomName: string) {
  return `https://${DAILY_DOMAIN}/${roomName}`;
}
