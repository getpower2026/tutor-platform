"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [roomUrl, setRoomUrl] = useState("");
  const [whiteboardUrl, setWhiteboardUrl] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"video" | "whiteboard">("video");

  useEffect(() => {
    if (!session) return;
    fetch(`/api/rooms/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.message) { setError(d.message); return; }
        setRoomUrl(`https://${process.env.NEXT_PUBLIC_DAILY_DOMAIN}/${d.roomName}?t=${d.token}`);
      });

    // tldraw 共享白板：同一個 room id 即可即時同步
    const cleaned = (id as string).replace(/[^a-zA-Z0-9]/g, "").slice(0, 24);
    setWhiteboardUrl(`https://tldraw.com/r/${cleaned}`);
  }, [id, session]);

  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-xl mb-4">{error}</p>
        <button onClick={() => router.push("/dashboard")} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">回到控制台</button>
      </div>
    </div>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#111" }}>
      {/* Header */}
      <div style={{ background: "#1f2937", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ color: "white", fontWeight: "bold" }}>TutorLink 視訊教室</span>
        {!roomUrl && (
          <span style={{ color: "#9ca3af", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
            連線中，請稍候...
          </span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ background: "#374151", display: "flex", flexShrink: 0 }}>
        {(["video", "whiteboard"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 24px",
              fontSize: "14px",
              fontWeight: 500,
              color: tab === t ? "white" : "#9ca3af",
              background: tab === t ? "#111827" : "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            {t === "video" ? "📹 視訊上課" : "✏️ 白板"}
          </button>
        ))}
      </div>

      {/* Content — 兩個 iframe 都常駐，用 display 切換 */}
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        {roomUrl && (
          <iframe
            src={roomUrl}
            allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", display: tab === "video" ? "block" : "none" }}
          />
        )}
        {whiteboardUrl && (
          <iframe
            src={whiteboardUrl}
            allow="clipboard-read; clipboard-write"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", display: tab === "whiteboard" ? "block" : "none" }}
          />
        )}
      </div>
    </div>
  );
}
