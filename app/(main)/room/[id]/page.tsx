"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, PhoneOff, PenLine } from "lucide-react";

// 從 booking ID 產生固定的 Excalidraw 協作房間連結
function getExcalidrawUrl(bookingId: string) {
  // 用 booking ID 的字元產生 20 位 roomId 和 22 位 key
  const roomId = bookingId.replace(/-/g, "").slice(0, 20).padEnd(20, "0");
  const key = btoa(bookingId).replace(/[^a-zA-Z0-9]/g, "").slice(0, 22).padEnd(22, "A");
  return `https://excalidraw.com/#room=${roomId},${key}`;
}

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [roomUrl, setRoomUrl] = useState("");
  const [error, setError] = useState("");
  const [leaveModal, setLeaveModal] = useState(false);
  const [completing, setCompleting] = useState(false);
  const isTeacher = session?.user?.role === "TEACHER";

  useEffect(() => {
    if (!session) return;
    fetch(`/api/rooms/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.message) { setError(d.message); return; }
        setRoomUrl(`https://${process.env.NEXT_PUBLIC_DAILY_DOMAIN}/${d.roomName}?t=${d.token}`);
      });
  }, [id, session]);

  const handleComplete = async () => {
    setCompleting(true);
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    }).catch(() => {});
    router.push("/dashboard");
  };

  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-xl mb-4">{error}</p>
        <button onClick={() => router.push("/dashboard")} className="px-4 py-2 bg-gray-600 rounded-lg">回到控制台</button>
      </div>
    </div>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#111", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "#1f2937", padding: "6px 12px", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <span style={{ color: "white", fontWeight: "bold", fontSize: "14px" }}>TutorLink 視訊教室</span>

        {!roomUrl && (
          <span style={{ color: "#9ca3af", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />連線中...
          </span>
        )}

        {/* 白板按鈕 */}
        <a
          href={getExcalidrawUrl(id)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 12px", background: "#7c3aed", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold", textDecoration: "none" }}
        >
          <PenLine style={{ width: 14, height: 14 }} /> 開啟白板
        </a>

        <button
          onClick={() => setLeaveModal(true)}
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}
        >
          <PhoneOff style={{ width: 14, height: 14 }} /> 離開教室
        </button>
      </div>

      {/* Daily.co 視訊 */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {roomUrl && (
          <iframe
            src={roomUrl}
            allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        )}
      </div>

      {/* Leave Modal */}
      {leaveModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "380px", textAlign: "center" }}>
            {isTeacher ? (
              <>
                <div style={{ fontSize: "44px", marginBottom: "10px" }}>📋</div>
                <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>課堂結束了嗎？</h3>
                <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "20px", lineHeight: 1.6 }}>
                  按「結束並標記完成」後，<br />學生即可為這堂課評價老師。
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    style={{ padding: "13px", background: "#22c55e", color: "white", fontWeight: "bold", fontSize: "15px", border: "none", borderRadius: "12px", cursor: "pointer" }}
                  >
                    {completing ? "處理中..." : "✅ 結束課程並標記完成"}
                  </button>
                  <button
                    onClick={() => router.push("/dashboard")}
                    style={{ padding: "11px", background: "#f3f4f6", color: "#374151", fontSize: "13px", border: "none", borderRadius: "12px", cursor: "pointer" }}
                  >
                    直接離開（不標記完成）
                  </button>
                  <button
                    onClick={() => setLeaveModal(false)}
                    style={{ padding: "8px", background: "transparent", color: "#9ca3af", fontSize: "12px", border: "none", cursor: "pointer" }}
                  >
                    取消，繼續上課
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: "44px", marginBottom: "10px" }}>👋</div>
                <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>要離開教室嗎？</h3>
                <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "20px" }}>課程結束後可在控制台評價老師。</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    onClick={() => router.push("/dashboard")}
                    style={{ padding: "13px", background: "#ef4444", color: "white", fontWeight: "bold", fontSize: "15px", border: "none", borderRadius: "12px", cursor: "pointer" }}
                  >
                    離開教室
                  </button>
                  <button
                    onClick={() => setLeaveModal(false)}
                    style={{ padding: "8px", background: "transparent", color: "#9ca3af", fontSize: "12px", border: "none", cursor: "pointer" }}
                  >
                    取消，繼續上課
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
