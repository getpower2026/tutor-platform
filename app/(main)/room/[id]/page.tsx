"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, PhoneOff, Video, PenLine } from "lucide-react";
import Pusher from "pusher-js";

const COLORS = ["#000000", "#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#ffffff"];
const SIZES = [2, 5, 10, 20];

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [roomUrl, setRoomUrl] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"video" | "whiteboard">("video");
  const [leaveModal, setLeaveModal] = useState(false);
  const [completing, setCompleting] = useState(false);
  const isTeacher = session?.user?.role === "TEACHER";

  // Whiteboard state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const dirty = useRef(false);
  const lastDrawTime = useRef(0);
  const pusherRef = useRef<Pusher | null>(null);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [wbTool, setWbTool] = useState<"pen" | "eraser">("pen");

  useEffect(() => {
    if (!session) return;
    fetch(`/api/rooms/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.message) { setError(d.message); return; }
        setRoomUrl(`https://${process.env.NEXT_PUBLIC_DAILY_DOMAIN}/${d.roomName}?t=${d.token}`);
      });
  }, [id, session]);

  // ── Whiteboard canvas setup ──
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight - 88; // header + toolbar
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }, []);

  const upload = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !dirty.current) return;
    dirty.current = false;
    const data = canvas.toDataURL("image/png");
    fetch(`/api/whiteboard/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    }).catch(() => {});
  }, [id]);

  const download = useCallback(async () => {
    if (dirty.current) return;
    if (Date.now() - lastDrawTime.current < 3000) return;
    const res = await fetch(`/api/whiteboard/${id}`).catch(() => null);
    if (!res) return;
    const { data } = await res.json();
    if (!data) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
    img.src = data;
  }, [id]);

  // 在 canvas 上畫一條遠端筆跡（座標為 0~1 正規化比例）
  const applyStroke = useCallback((data: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (data.type === "clear") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }
    const x = data.x * canvas.width;
    const y = data.y * canvas.height;
    const px = data.px * canvas.width;
    const py = data.py * canvas.height;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(x, y);
    ctx.strokeStyle = data.tool === "eraser" ? "#ffffff" : data.color;
    ctx.lineWidth = data.tool === "eraser" ? data.size * 4 : data.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }, []);

  // Pusher 訂閱
  useEffect(() => {
    if (!session) return;
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    pusherRef.current = pusher;
    const channel = pusher.subscribe(`whiteboard-${id}`);
    channel.bind("stroke", (data: any) => {
      if (data.senderId === session.user.id) return; // 自己送出的不重複畫
      applyStroke(data);
    });
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`whiteboard-${id}`);
      pusher.disconnect();
    };
  }, [id, session, applyStroke]);

  useEffect(() => {
    const t = setTimeout(() => { initCanvas(); download(); }, 200);
    const poll = setInterval(download, 2000);
    const push = setInterval(upload, 1500);
    return () => { clearTimeout(t); clearInterval(poll); clearInterval(push); };
  }, [initCanvas, download, upload]);

  // Re-init canvas when switching to whiteboard tab
  useEffect(() => {
    if (tab === "whiteboard") {
      setTimeout(() => { initCanvas(); download(); }, 50);
    }
  }, [tab, initCanvas, download]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => { e.preventDefault(); drawing.current = true; lastPos.current = getPos(e); };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const pos = getPos(e);
    const px = lastPos.current!.x;
    const py = lastPos.current!.y;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = wbTool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = wbTool === "eraser" ? size * 4 : size;
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
    lastPos.current = pos; dirty.current = true; lastDrawTime.current = Date.now();
    // 即時廣播（座標正規化為 0~1 比例）
    const cw = canvasRef.current!.width;
    const ch = canvasRef.current!.height;
    fetch(`/api/whiteboard/${id}/stroke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ px: px / cw, py: py / ch, x: pos.x / cw, y: pos.y / ch, color, size, tool: wbTool }),
    }).catch(() => {});
  };

  const stopDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); drawing.current = false; lastPos.current = null;
    if (dirty.current) upload();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    dirty.current = true; upload();
    fetch(`/api/whiteboard/${id}/stroke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "clear" }),
    }).catch(() => {});
  };

  const handleComplete = async () => {
    setCompleting(true);
    await fetch(`/api/bookings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "COMPLETED" }) }).catch(() => {});
    router.push("/dashboard");
  };

  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="text-center"><p className="text-xl mb-4">{error}</p>
        <button onClick={() => router.push("/dashboard")} className="px-4 py-2 bg-gray-600 rounded-lg">回到控制台</button>
      </div>
    </div>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#111", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "#1f2937", padding: "6px 12px", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <span style={{ color: "white", fontWeight: "bold", fontSize: "14px", marginRight: "4px" }}>TutorLink 視訊教室</span>

        {/* Tabs */}
        <button onClick={() => setTab("video")} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", background: tab === "video" ? "#4f46e5" : "#374151", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>
          <Video style={{ width: 14, height: 14 }} /> 視訊
        </button>
        <button onClick={() => setTab("whiteboard")} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", background: tab === "whiteboard" ? "#7c3aed" : "#374151", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>
          <PenLine style={{ width: 14, height: 14 }} /> 白板
        </button>

        {!roomUrl && <span style={{ color: "#9ca3af", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}><Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />連線中...</span>}

        <button onClick={() => setLeaveModal(true)} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
          <PhoneOff style={{ width: 14, height: 14 }} /> 離開教室
        </button>
      </div>

      {/* Whiteboard toolbar — only shown on whiteboard tab */}
      {tab === "whiteboard" && (
        <div style={{ background: "#374151", padding: "4px 10px", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, overflowX: "auto" }}>
          <button onClick={() => setWbTool("pen")} style={{ padding: "3px 8px", background: wbTool === "pen" ? "#3b82f6" : "#4b5563", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "12px" }}>筆</button>
          <button onClick={() => setWbTool("eraser")} style={{ padding: "3px 8px", background: wbTool === "eraser" ? "#3b82f6" : "#4b5563", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "12px" }}>橡皮擦</button>
          {COLORS.map((c) => (
            <button key={c} onClick={() => { setColor(c); setWbTool("pen"); }}
              style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: color === c && wbTool === "pen" ? "3px solid #60a5fa" : "2px solid #6b7280", cursor: "pointer", padding: 0, flexShrink: 0 }}
            />
          ))}
          {SIZES.map((s) => (
            <button key={s} onClick={() => setSize(s)} style={{ width: 28, height: 24, background: size === s ? "#3b82f6" : "#4b5563", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px", flexShrink: 0 }}>{s}</button>
          ))}
          <button onClick={clearCanvas} style={{ marginLeft: "auto", padding: "3px 8px", background: "#ef4444", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "12px", flexShrink: 0 }}>清除</button>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        {/* Video iframe — always mounted */}
        {roomUrl && (
          <iframe
            src={roomUrl}
            allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", display: tab === "video" ? "block" : "none" }}
          />
        )}
        {/* Whiteboard canvas — always mounted */}
        <div style={{ position: "absolute", inset: 0, background: "#f3f4f6", display: tab === "whiteboard" ? "block" : "none" }}>
          <canvas
            ref={canvasRef}
            style={{ display: "block", width: "100%", height: "100%", cursor: wbTool === "eraser" ? "cell" : "crosshair", touchAction: "none" }}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
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
                <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "20px", lineHeight: 1.6 }}>按「結束並標記完成」後，<br />學生即可為這堂課評價老師。</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button onClick={handleComplete} disabled={completing} style={{ padding: "13px", background: "#22c55e", color: "white", fontWeight: "bold", fontSize: "15px", border: "none", borderRadius: "12px", cursor: "pointer" }}>
                    {completing ? "處理中..." : "✅ 結束課程並標記完成"}
                  </button>
                  <button onClick={() => router.push("/dashboard")} style={{ padding: "11px", background: "#f3f4f6", color: "#374151", fontSize: "13px", border: "none", borderRadius: "12px", cursor: "pointer" }}>直接離開（不標記完成）</button>
                  <button onClick={() => setLeaveModal(false)} style={{ padding: "8px", background: "transparent", color: "#9ca3af", fontSize: "12px", border: "none", cursor: "pointer" }}>取消，繼續上課</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: "44px", marginBottom: "10px" }}>👋</div>
                <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>要離開教室嗎？</h3>
                <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "20px" }}>課程結束後可在控制台評價老師。</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button onClick={() => router.push("/dashboard")} style={{ padding: "13px", background: "#ef4444", color: "white", fontWeight: "bold", fontSize: "15px", border: "none", borderRadius: "12px", cursor: "pointer" }}>離開教室</button>
                  <button onClick={() => setLeaveModal(false)} style={{ padding: "8px", background: "transparent", color: "#9ca3af", fontSize: "12px", border: "none", cursor: "pointer" }}>取消，繼續上課</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
