"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, PhoneOff, Video, PenLine } from "lucide-react";

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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const lastDrawTime = useRef(0);
  const lastSeenTs = useRef(0);
  const uploading = useRef(false);
  const forceDownload = useRef(false);

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

  // ── Canvas init ──
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight - 88;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }, []);

  // ── Upload canvas to DB ──
  const upload = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || uploading.current) return;
    uploading.current = true;
    const data = canvas.toDataURL("image/jpeg", 0.7);
    try {
      await fetch(`/api/whiteboard/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
    } finally {
      uploading.current = false;
    }
  }, [id]);

  // ── Poll DB every 500ms, apply if newer and not drawing ──
  const poll = useCallback(async () => {
    if (!forceDownload.current && Date.now() - lastDrawTime.current < 2000) return;
    forceDownload.current = false;
    const res = await fetch(`/api/whiteboard/${id}`).catch(() => null);
    if (!res) return;
    const { data, updatedAt } = await res.json();
    if (!data || updatedAt <= lastSeenTs.current) return;
    lastSeenTs.current = updatedAt;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = data;
  }, [id]);

  useEffect(() => {
    const t = setTimeout(() => { initCanvas(); poll(); }, 200);
    const interval = setInterval(poll, 300);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, [initCanvas, poll]);

  useEffect(() => {
    if (tab === "whiteboard") {
      setTimeout(() => { initCanvas(); lastSeenTs.current = 0; forceDownload.current = true; poll(); }, 50);
    }
  }, [tab, initCanvas, poll]);

  // ── Drawing ──
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = wbTool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = wbTool === "eraser" ? size * 4 : size;
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
    lastPos.current = pos;
    lastDrawTime.current = Date.now();
  };

  const stopDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current) return;
    drawing.current = false;
    lastPos.current = null;
    // 放開後立即存 DB，讓對方 500ms 內就能看到
    upload();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    lastDrawTime.current = Date.now();
    upload();
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

      {/* 白板工具列 */}
      {tab === "whiteboard" && (
        <div style={{ background: "#374151", padding: "4px 10px", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, overflowX: "auto" }}>
          <button onClick={() => setWbTool("pen")} style={{ padding: "3px 8px", background: wbTool === "pen" ? "#3b82f6" : "#4b5563", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "12px" }}>筆</button>
          <button onClick={() => setWbTool("eraser")} style={{ padding: "3px 8px", background: wbTool === "eraser" ? "#3b82f6" : "#4b5563", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "12px" }}>橡皮擦</button>
          {COLORS.map((c) => (
            <button key={c} onClick={() => { setColor(c); setWbTool("pen"); }}
              style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: color === c && wbTool === "pen" ? "3px solid #60a5fa" : "2px solid #6b7280", cursor: "pointer", padding: 0, flexShrink: 0 }} />
          ))}
          {SIZES.map((s) => (
            <button key={s} onClick={() => setSize(s)} style={{ width: 28, height: 24, background: size === s ? "#3b82f6" : "#4b5563", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px", flexShrink: 0 }}>{s}</button>
          ))}
          <button onClick={clearCanvas} style={{ marginLeft: "auto", padding: "3px 8px", background: "#ef4444", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "12px", flexShrink: 0 }}>清除</button>
        </div>
      )}

      {/* 內容區 */}
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        {roomUrl && (
          <iframe
            src={roomUrl}
            allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", display: tab === "video" ? "block" : "none" }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: "#f3f4f6", display: tab === "whiteboard" ? "block" : "none" }}>
          <canvas
            ref={canvasRef}
            style={{ display: "block", cursor: wbTool === "eraser" ? "cell" : "crosshair", touchAction: "none" }}
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
