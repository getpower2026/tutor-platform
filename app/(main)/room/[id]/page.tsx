"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { Loader2 } from "lucide-react";

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);
  const [status, setStatus] = useState<"loading" | "joined" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;
    let call: DailyCall;

    async function joinRoom() {
      const res = await fetch(`/api/rooms/${id}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || "無法進入教室");
        setStatus("error");
        return;
      }
      const { roomName, token } = await res.json();

      call = DailyIframe.createFrame(containerRef.current!, {
        showLeaveButton: true,
        showFullscreenButton: true,
        iframeStyle: { width: "100%", height: "100%", border: "none" },
      });
      callRef.current = call;

      call.on("joined-meeting", () => setStatus("joined"));
      call.on("left-meeting", () => router.push("/dashboard"));
      call.on("error", () => { setError("視訊連線錯誤"); setStatus("error"); });

      await call.join({
        url: `https://${process.env.NEXT_PUBLIC_DAILY_DOMAIN}/${roomName}`,
        token,
        userName: session?.user?.name || "使用者",
      });
    }

    joinRoom();
    return () => { call?.destroy(); };
  }, [id, session]);

  if (status === "error") return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-xl mb-4">{error}</p>
        <button onClick={() => router.push("/dashboard")} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">回到控制台</button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 flex flex-col" style={{ height: "100vh" }}>
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <span className="text-white font-bold">TutorLink 視訊教室</span>
        {status === "loading" && (
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            連線中，請稍候...
          </div>
        )}
        {status === "joined" && <span className="text-green-400 text-sm font-medium">● 已連線</span>}
      </div>
      <div ref={containerRef} style={{ flex: 1, minHeight: 0 }} />
    </div>
  );
}
