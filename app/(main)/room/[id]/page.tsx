"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, PenLine, PhoneOff } from "lucide-react";

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

  const handleLeave = () => setLeaveModal(true);

  const handleComplete = async () => {
    setCompleting(true);
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    }).catch(() => {});
    setCompleting(false);
    router.push("/dashboard");
  };

  const handleLeaveOnly = () => router.push("/dashboard");

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
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {!roomUrl && (
            <span style={{ color: "#9ca3af", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
              連線中...
            </span>
          )}
          <a
            href={`/whiteboard/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "#7c3aed", color: "white", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "bold", textDecoration: "none" }}
          >
            <PenLine style={{ width: 14, height: 14 }} />
            開啟白板
          </a>
          <button
            onClick={handleLeave}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "#ef4444", color: "white", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "bold", border: "none", cursor: "pointer" }}
          >
            <PhoneOff style={{ width: 14, height: 14 }} />
            離開教室
          </button>
        </div>
      </div>

      {/* Daily.co iframe */}
      {roomUrl && (
        <iframe
          src={roomUrl}
          allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
          style={{ flex: 1, border: "none", width: "100%", minHeight: 0 }}
        />
      )}

      {/* 離開 Modal */}
      {leaveModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "400px", textAlign: "center", boxShadow: "0 25px 60px rgba(0,0,0,0.4)" }}>
            {isTeacher ? (
              <>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
                <h3 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "8px" }}>課堂結束了嗎？</h3>
                <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px", lineHeight: "1.6" }}>
                  按「結束並標記完成」後，<br />學生即可為這堂課評價老師。
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    style={{ width: "100%", padding: "14px", background: "#22c55e", color: "white", fontWeight: "bold", fontSize: "16px", border: "none", borderRadius: "12px", cursor: "pointer" }}
                  >
                    {completing ? "處理中..." : "✅ 結束課程並標記完成"}
                  </button>
                  <button
                    onClick={handleLeaveOnly}
                    style={{ width: "100%", padding: "12px", background: "#f3f4f6", color: "#374151", fontSize: "14px", border: "none", borderRadius: "12px", cursor: "pointer" }}
                  >
                    直接離開（不標記完成）
                  </button>
                  <button
                    onClick={() => setLeaveModal(false)}
                    style={{ width: "100%", padding: "10px", background: "transparent", color: "#9ca3af", fontSize: "13px", border: "none", cursor: "pointer" }}
                  >
                    取消，繼續上課
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>👋</div>
                <h3 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "8px" }}>要離開教室嗎？</h3>
                <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
                  課程結束後可在控制台評價老師。
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button
                    onClick={handleLeaveOnly}
                    style={{ width: "100%", padding: "14px", background: "#ef4444", color: "white", fontWeight: "bold", fontSize: "16px", border: "none", borderRadius: "12px", cursor: "pointer" }}
                  >
                    離開教室
                  </button>
                  <button
                    onClick={() => setLeaveModal(false)}
                    style={{ width: "100%", padding: "10px", background: "transparent", color: "#9ca3af", fontSize: "13px", border: "none", cursor: "pointer" }}
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
