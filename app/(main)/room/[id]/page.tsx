"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, PenLine } from "lucide-react";

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [roomUrl, setRoomUrl] = useState("");
  const [whiteboardUrl, setWhiteboardUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;

    fetch(`/api/rooms/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.message) { setError(d.message); return; }
        setRoomUrl(`https://${process.env.NEXT_PUBLIC_DAILY_DOMAIN}/${d.roomName}?t=${d.token}`);
      });

    // Witeboard：用 booking ID 的前 20 碼當房間 ID，自動建立、無需帳號
    const wbId = (id as string).replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);
    setWhiteboardUrl(`https://witeboard.com/${wbId}`);
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {whiteboardUrl && (
            <a
              href={whiteboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "#7c3aed", color: "white", padding: "6px 14px",
                borderRadius: "8px", fontSize: "14px", fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              <PenLine style={{ width: 16, height: 16 }} />
              開啟白板（新分頁）
            </a>
          )}
          {!roomUrl && (
            <span style={{ color: "#9ca3af", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
              連線中，請稍候...
            </span>
          )}
        </div>
      </div>

      {/* Daily.co 視訊 */}
      {roomUrl && (
        <iframe
          src={roomUrl}
          allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
          style={{ flex: 1, border: "none", width: "100%", minHeight: 0 }}
        />
      )}
    </div>
  );
}
