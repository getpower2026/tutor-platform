"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

const COLORS = ["#000000", "#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#ffffff"];
const SIZES = [2, 5, 10, 20];

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

  // 上傳目前畫布狀態
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

  // 下載最新畫布狀態（polling）
  const download = useCallback(async () => {
    if (dirty.current) return; // 自己正在畫，跳過
    const res = await fetch(`/api/whiteboard/${id}`).catch(() => null);
    if (!res) return;
    const { data } = await res.json();
    if (!data) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = data;
  }, [id]);

  // 初始化 canvas 白色背景
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }

    // 初次載入遠端資料
    download();

    // 每 2 秒 polling
    const poll = setInterval(download, 2000);
    // 每 1.5 秒上傳
    const push = setInterval(upload, 1500);
    return () => { clearInterval(poll); clearInterval(push); };
  }, [download, upload]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    drawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
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

  const stopDraw = () => {
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

  const resetView = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f3f4f6" }}>
      {/* 工具列 */}
      <div style={{ background: "#1f2937", padding: "8px 16px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", flexShrink: 0 }}>
        <span style={{ color: "white", fontWeight: "bold", fontSize: "14px" }}>✏️ TutorLink 白板</span>

        {/* 筆 / 橡皮擦 */}
        <div style={{ display: "flex", gap: "6px" }}>
          <ToolBtn active={tool === "pen"} onClick={() => setTool("pen")}>筆</ToolBtn>
          <ToolBtn active={tool === "eraser"} onClick={() => setTool("eraser")}>橡皮擦</ToolBtn>
        </div>

        {/* 顏色 */}
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {COLORS.map((c) => (
            <button key={c} onClick={() => { setColor(c); setTool("pen"); }}
              style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: color === c && tool === "pen" ? "3px solid #60a5fa" : "2px solid #6b7280", cursor: "pointer" }}
            />
          ))}
        </div>

        {/* 粗細 */}
        <div style={{ display: "flex", gap: "4px" }}>
          {SIZES.map((s) => (
            <button key={s} onClick={() => setSize(s)}
              style={{ width: 32, height: 28, background: size === s ? "#3b82f6" : "#374151", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}
            >
              {s}px
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
          <button onClick={resetView}
            style={{ padding: "4px 12px", background: "#374151", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
          >
            ⬆ 回到頂端
          </button>
          <button onClick={clearCanvas}
            style={{ padding: "4px 12px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}
          >
            清除白板
          </button>
        </div>
      </div>

      {/* 畫布 */}
      <canvas
        ref={canvasRef}
        style={{ flex: 1, width: "100%", cursor: tool === "eraser" ? "cell" : "crosshair", touchAction: "none" }}
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
      style={{ padding: "4px 10px", background: active ? "#3b82f6" : "#374151", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
    >
      {children}
    </button>
  );
}
