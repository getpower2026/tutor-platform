"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

export default function WhiteboardReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight - 64;
    canvas.width = w; canvas.height = h;
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);
  }, []);

  const loadPage = useCallback(async (page: number) => {
    setLoading(true);
    initCanvas();
    const res = await fetch(`/api/whiteboard/${id}?page=${page}`).catch(() => null);
    if (!res) { setLoading(false); return; }
    const { data } = await res.json();
    if (data) {
      const canvas = canvasRef.current;
      if (!canvas) { setLoading(false); return; }
      const ctx = canvas.getContext("2d")!;
      const img = new Image();
      img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height); setLoading(false); };
      img.src = data;
    } else { setLoading(false); }
  }, [id, initCanvas]);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/whiteboard/${id}`, { method: "PATCH" })
      .then((r) => r.json())
      .then(({ pages }) => {
        const max = Math.max(...pages, 1);
        setTotalPages(max);
        loadPage(1);
      });
  }, [id, session, loadPage]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    loadPage(page);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f3f4f6", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "#1f2937", padding: "8px 16px", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0, height: 64 }}>
        <button onClick={() => router.push("/dashboard")} style={{ display: "flex", alignItems: "center", gap: "4px", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontSize: "13px" }}>
          <ArrowLeft style={{ width: 16, height: 16 }} /> 返回控制台
        </button>
        <span style={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>📓 白板筆記回顧</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={() => currentPage > 1 && goToPage(currentPage - 1)} disabled={currentPage <= 1}
            style={{ padding: "5px 8px", background: "#374151", color: "white", border: "none", borderRadius: "6px", cursor: currentPage > 1 ? "pointer" : "not-allowed", opacity: currentPage <= 1 ? 0.4 : 1 }}>
            <ChevronLeft style={{ width: 16, height: 16 }} />
          </button>
          <span style={{ color: "white", fontSize: "14px", minWidth: "80px", textAlign: "center" }}>第 {currentPage} / {totalPages} 頁</span>
          <button onClick={() => currentPage < totalPages && goToPage(currentPage + 1)} disabled={currentPage >= totalPages}
            style={{ padding: "5px 8px", background: "#374151", color: "white", border: "none", borderRadius: "6px", cursor: currentPage < totalPages ? "pointer" : "not-allowed", opacity: currentPage >= totalPages ? 0.4 : 1 }}>
            <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      {/* 頁碼快速跳轉 */}
      {totalPages > 1 && (
        <div style={{ background: "#374151", padding: "4px 16px", display: "flex", gap: "6px", flexShrink: 0 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => goToPage(p)}
              style={{ padding: "3px 10px", background: currentPage === p ? "#7c3aed" : "#4b5563", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "12px" }}>
              第 {p} 頁
            </button>
          ))}
        </div>
      )}

      {/* Canvas */}
      <div style={{ flex: 1, position: "relative" }}>
        {loading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: "14px" }}>
            載入中...
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: "block" }} />
      </div>
    </div>
  );
}
