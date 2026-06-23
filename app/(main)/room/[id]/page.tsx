"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, PhoneOff, Video, PenLine, Eraser, Trash2 } from "lucide-react";

const COLORS = ["#000000", "#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ffffff"];

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

  // Canvas state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");

  // Pusher client events (peer-to-peer, no server roundtrip)
  const channelRef = useRef<any>(null);
  const mySocketIdRef = useRef<string>("");
  const bufferRef = useRef<{ x: number; y: number; lx: number; ly: number; c: string; s: number; e: boolean }[]>([]);
  const flushRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/rooms/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.message) { setError(d.message); return; }
        setRoomUrl(`https://${process.env.NEXT_PUBLIC_DAILY_DOMAIN}/${d.roomName}?t=${d.token}`);
      });
  }, [id, session]);

  // Pusher private channel (client events = peer-to-peer, no Vercel cold start)
  useEffect(() => {
    if (!session) return;
    import("pusher-js").then(({ default: Pusher }) => {
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        authEndpoint: "/api/pusher/auth",
      });
      pusher.connection.bind("connected", () => {
        mySocketIdRef.current = pusher.connection.socket_id;
      });
      const ch = pusher.subscribe(`private-whiteboard-${id}`);
      channelRef.current = ch;

      // Receive strokes from the other side
      ch.bind("client-strokes", (data: any) => {
        const canvas = canvasRef.current;
        if (!canvas || !data.pts) return;
        const ctx = canvas.getContext("2d")!;
        data.pts.forEach((pt: any) => {
          ctx.beginPath();
          ctx.globalCompositeOperation = pt.e ? "destination-out" : "source-over";
          ctx.strokeStyle = pt.c;
          ctx.lineWidth = pt.s;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.moveTo(pt.lx * canvas.width, pt.ly * canvas.height);
          ctx.lineTo(pt.x * canvas.width, pt.y * canvas.height);
          ctx.stroke();
        });
        ctx.globalCompositeOperation = "source-over";
      });

      // Receive clear command
      ch.bind("client-clear", () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Flush buffer every 80ms
      flushRef.current = setInterval(() => {
        if (!bufferRef.current.length || !channelRef.current) return;
        try {
          channelRef.current.trigger("client-strokes", { pts: bufferRef.current });
        } catch {}
        bufferRef.current = [];
      }, 80);

      return () => {
        pusher.unsubscribe(`private-whiteboard-${id}`);
        pusher.disconnect();
        if (flushRef.current) clearInterval(flushRef.current);
      };
    });
  }, [id, session]);

  // Init canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement!;
    const w = container.clientWidth;
    const h = container.clientHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }, []);

  useEffect(() => {
    if (tab === "whiteboard") {
      setTimeout(initCanvas, 50);
    }
  }, [tab, initCanvas]);

  // Drawing helpers
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const src = "touches" in e ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) / rect.width,
      y: (src.clientY - rect.top) / rect.height,
    };
  };

  const drawSegment = (lx: number, ly: number, x: number, y: number, isEraser: boolean, c: string, s: number) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.beginPath();
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.strokeStyle = c;
    ctx.lineWidth = s;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(lx * canvas.width, ly * canvas.height);
    ctx.lineTo(x * canvas.width, y * canvas.height);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    // Buffer for Pusher send
    bufferRef.current.push({ x, y, lx, ly, c, s, e: isEraser });
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current || !lastPos.current) return;
    const pos = getPos(e);
    const isEraser = tool === "eraser";
    drawSegment(lastPos.current.x, lastPos.current.y, pos.x, pos.y, isEraser, isEraser ? "#000000" : color, isEraser ? 20 : brushSize);
    lastPos.current = pos;
  };

  const endDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawing.current = false;
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    try { channelRef.current?.trigger("client-clear", {}); } catch {}
  };

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
      <div style={{ background: "#1f2937", padding: "6px 12px", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}>
        <span style={{ color: "white", fontWeight: "bold", fontSize: "14px" }}>TutorLink 視訊教室</span>
        {!roomUrl && (
          <span style={{ color: "#9ca3af", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />連線中...
          </span>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginLeft: "4px" }}>
          <button onClick={() => setTab("video")}
            style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 12px", background: tab === "video" ? "#3b82f6" : "#374151", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
            <Video style={{ width: 14, height: 14 }} /> 視訊
          </button>
          <button onClick={() => setTab("whiteboard")}
            style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 12px", background: tab === "whiteboard" ? "#7c3aed" : "#374151", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
            <PenLine style={{ width: 14, height: 14 }} /> 白板
          </button>
        </div>

        {/* Whiteboard tools (only visible on whiteboard tab) */}
        {tab === "whiteboard" && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            {COLORS.map((c) => (
              <button key={c} onClick={() => { setColor(c); setTool("pen"); }}
                style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: color === c && tool === "pen" ? "3px solid #60a5fa" : "2px solid #6b7280", cursor: "pointer", flexShrink: 0 }} />
            ))}
            <select value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))}
              style={{ background: "#374151", color: "white", border: "none", borderRadius: "4px", padding: "2px 4px", fontSize: "12px" }}>
              {[2, 4, 8, 16].map((s) => <option key={s} value={s}>{s}px</option>)}
            </select>
            <button onClick={() => setTool("eraser")}
              style={{ display: "flex", alignItems: "center", gap: "3px", padding: "4px 8px", background: tool === "eraser" ? "#f59e0b" : "#374151", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "12px" }}>
              <Eraser style={{ width: 13, height: 13 }} /> 橡皮擦
            </button>
            <button onClick={clearCanvas}
              style={{ display: "flex", alignItems: "center", gap: "3px", padding: "4px 8px", background: "#374151", color: "#f87171", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "12px" }}>
              <Trash2 style={{ width: 13, height: 13 }} /> 清除
            </button>
          </div>
        )}

        <button onClick={() => setLeaveModal(true)}
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
          <PhoneOff style={{ width: 14, height: 14 }} /> 離開
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        {/* Video */}
        <div style={{ position: "absolute", inset: 0, display: tab === "video" ? "block" : "none" }}>
          {roomUrl && (
            <iframe src={roomUrl} allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
              style={{ width: "100%", height: "100%", border: "none" }} />
          )}
        </div>

        {/* Whiteboard canvas */}
        <div style={{ position: "absolute", inset: 0, display: tab === "whiteboard" ? "block" : "none", background: "#fff" }}>
          <canvas
            ref={canvasRef}
            style={{ display: "block", cursor: tool === "eraser" ? "cell" : "crosshair", touchAction: "none", width: "100%", height: "100%" }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
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
