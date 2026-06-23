"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { Loader2, PhoneOff, Video, PenLine } from "lucide-react";

// Load Excalidraw only on client side (it uses browser APIs)
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false, loading: () => <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}><Loader2 style={{ width: 24, height: 24, animation: "spin 1s linear infinite" }} /></div> }
);

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [tab, setTab] = useState<"video" | "whiteboard">("video");
  const [roomUrl, setRoomUrl] = useState("");
  const [error, setError] = useState("");
  const [leaveModal, setLeaveModal] = useState(false);
  const [completing, setCompleting] = useState(false);
  const isTeacher = session?.user?.role === "TEACHER";

  // Excalidraw sync via Pusher
  const excalidrawApiRef = useRef<any>(null);
  const lastSyncRef = useRef<string>("");
  const pusherRef = useRef<any>(null);
  const mySocketIdRef = useRef<string>("");
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingElementsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/rooms/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.message) { setError(d.message); return; }
        setRoomUrl(`https://${process.env.NEXT_PUBLIC_DAILY_DOMAIN}/${d.roomName}?t=${d.token}`);
      });
  }, [id, session]);

  // Pusher setup
  useEffect(() => {
    if (!session) return;
    let channel: any;
    import("pusher-js").then(({ default: Pusher }) => {
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      });
      pusherRef.current = pusher;
      pusher.connection.bind("connected", () => {
        mySocketIdRef.current = pusher.connection.socket_id;
      });
      channel = pusher.subscribe(`whiteboard-${id}`);
      channel.bind("elements", (data: any) => {
        if (data.senderSocketId && data.senderSocketId === mySocketIdRef.current) return;
        if (excalidrawApiRef.current && data.elements) {
          excalidrawApiRef.current.updateScene({ elements: data.elements });
        }
      });
    });
    return () => {
      pusherRef.current?.unsubscribe(`whiteboard-${id}`);
      pusherRef.current?.disconnect();
    };
  }, [id, session]);

  const handleExcalidrawChange = useCallback((elements: readonly any[]) => {
    const json = JSON.stringify(elements);
    if (json === lastSyncRef.current) return;
    lastSyncRef.current = json;
    pendingElementsRef.current = elements as any[];

    // Debounce 300ms then flush
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => {
      const toSend = pendingElementsRef.current;
      if (!toSend.length) return;
      fetch(`/api/whiteboard/${id}/stroke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elements: toSend, senderSocketId: mySocketIdRef.current }),
      }).catch(() => {});
    }, 300);
  }, [id]);

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

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginLeft: "8px" }}>
          <button
            onClick={() => setTab("video")}
            style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 12px", background: tab === "video" ? "#3b82f6" : "#374151", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}
          >
            <Video style={{ width: 14, height: 14 }} /> 視訊
          </button>
          <button
            onClick={() => setTab("whiteboard")}
            style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 12px", background: tab === "whiteboard" ? "#7c3aed" : "#374151", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}
          >
            <PenLine style={{ width: 14, height: 14 }} /> 白板
          </button>
        </div>

        <button
          onClick={() => setLeaveModal(true)}
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}
        >
          <PhoneOff style={{ width: 14, height: 14 }} /> 離開教室
        </button>
      </div>

      {/* Content area — both always mounted, CSS toggle */}
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        {/* Video iframe — always mounted */}
        <div style={{ position: "absolute", inset: 0, display: tab === "video" ? "block" : "none" }}>
          {roomUrl && (
            <iframe
              src={roomUrl}
              allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          )}
        </div>

        {/* Whiteboard — always mounted once session ready */}
        <div style={{ position: "absolute", inset: 0, display: tab === "whiteboard" ? "block" : "none", background: "#fff" }}>
          {session && (
            <div style={{ width: "100%", height: "100%", isolation: "isolate" }}>
              <Excalidraw
                theme="light"
                excalidrawAPI={(api) => { excalidrawApiRef.current = api; }}
                onChange={handleExcalidrawChange}
                UIOptions={{
                  canvasActions: { export: false, loadScene: false, saveAsImage: true, saveToActiveFile: false },
                }}
              />
            </div>
          )}
        </div>
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
                  <button onClick={handleComplete} disabled={completing}
                    style={{ padding: "13px", background: "#22c55e", color: "white", fontWeight: "bold", fontSize: "15px", border: "none", borderRadius: "12px", cursor: "pointer" }}>
                    {completing ? "處理中..." : "✅ 結束課程並標記完成"}
                  </button>
                  <button onClick={() => router.push("/dashboard")}
                    style={{ padding: "11px", background: "#f3f4f6", color: "#374151", fontSize: "13px", border: "none", borderRadius: "12px", cursor: "pointer" }}>
                    直接離開（不標記完成）
                  </button>
                  <button onClick={() => setLeaveModal(false)}
                    style={{ padding: "8px", background: "transparent", color: "#9ca3af", fontSize: "12px", border: "none", cursor: "pointer" }}>
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
                  <button onClick={() => router.push("/dashboard")}
                    style={{ padding: "13px", background: "#ef4444", color: "white", fontWeight: "bold", fontSize: "15px", border: "none", borderRadius: "12px", cursor: "pointer" }}>
                    離開教室
                  </button>
                  <button onClick={() => setLeaveModal(false)}
                    style={{ padding: "8px", background: "transparent", color: "#9ca3af", fontSize: "12px", border: "none", cursor: "pointer" }}>
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
