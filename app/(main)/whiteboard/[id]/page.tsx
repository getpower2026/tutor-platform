"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

const COLORS = ["#000000", "#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#ffffff"];
const SIZES = [2, 5, 10, 20];
const TOOLBAR_H = 48;

export default function WhiteboardPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const dirty = useRef(false);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight - TOOLBAR_H;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d");
    if (ctx) { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h); }
  }, []);

  const upload = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !dirty.current) return;
    dirty.current = false;
    const data = canvas.toDataURL("image/png");
    await fetch(`/api/whiteboard/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    }).catch(() => {});
  }, [id]);

  const download = useCallback(async () => {
    if (dirty.current) return;
    const res = await fetch(`/api/whiteboard/${id}`).catch(() => null);
    if (!res) return;
    const { data } = await res.json();
    if (!data) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
    img.src = data;
  }, [id]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // 稍微延遲確保 DOM 已渲染
    const t = setTimeout(() => {
      initCanvas();
      download();
    }, 100);

    window.addEventListener("resize", initCanvas);
    const poll = setInterval(download, 2000);
    const push = setInterval(upload, 1500);

    return () => {
      clearTimeout(t);
      clearInterval(poll);
      clearInterval(push);
      window.removeEventListener("resize", initCanvas);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [initCanvas, download, upload]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
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
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = tool === "eraser" ? size * 4 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
    dirty.current = true;
  };

  const stopDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawing.current = false;
    lastPos.current = null;
    if (dirty.current) upload();
  };

  const clearCanvas = async () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    dirty.current = true;
    await upload();
  };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", background: "#f3f4f6" }}>
      {/* 工具列 */}
      <div style={{ height: TOOLBAR_H, background: "#1f2937", padding: "0 12px", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, overflowX: "auto" }}>
        <span style={{ color: "white", fontWeight: "bold", fontSize: "13px", flexShrink: 0 }}>✏️ 白板</span>

        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
          <ToolBtn active={tool === "pen"} onClick={() => setTool("pen")}>筆</ToolBtn>
          <ToolBtn active={tool === "eraser"} onClick={() => setTool("eraser")}>橡皮擦</ToolBtn>
        </div>

        <div style={{ display: "flex", gap: "3px", alignItems: "center", flexShrink: 0 }}>
          {COLORS.map((c) => (
            <button key={c} onClick={() => { setColor(c); setTool("pen"); }}
              style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: color === c && tool === "pen" ? "3px solid #60a5fa" : "2px solid #6b7280", cursor: "pointer", padding: 0 }}
            />
          ))}
        </div>

        <div style={{ display: "flex", gap: "3px", flexShrink: 0 }}>
          {SIZES.map((s) => (
            <button key={s} onClick={() => setSize(s)}
              style={{ width: 30, height: 26, background: size === s ? "#3b82f6" : "#374151", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "11px" }}
            >
              {s}
            </button>
          ))}
        </div>

        <button onClick={clearCanvas}
          style={{ marginLeft: "auto", padding: "4px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "bold", flexShrink: 0 }}
        >
          清除
        </button>
      </div>

      {/* 畫布 */}
      <canvas
        ref={canvasRef}
        style={{ display: "block", cursor: tool === "eraser" ? "cell" : "crosshair", touchAction: "none", flexShrink: 0 }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
    </div>
  );
}

function ToolBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      style={{ padding: "3px 8px", background: active ? "#3b82f6" : "#374151", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "12px" }}
    >
      {children}
    </button>
  );
}
