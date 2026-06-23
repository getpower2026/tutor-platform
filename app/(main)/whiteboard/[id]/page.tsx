"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

function getExcalidrawUrl(bookingId: string) {
  const roomId = bookingId.replace(/-/g, "").slice(0, 20).padEnd(20, "0");
  const key = btoa(bookingId).replace(/[^a-zA-Z0-9]/g, "").slice(0, 22).padEnd(22, "A");
  return `https://excalidraw.com/#room=${roomId},${key}`;
}

export default function WhiteboardReviewPage() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    window.location.href = getExcalidrawUrl(id);
  }, [id]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", flexDirection: "column", gap: "12px" }}>
      <div style={{ fontSize: "32px" }}>📓</div>
      <p style={{ color: "#6b7280", fontSize: "15px" }}>正在開啟白板筆記...</p>
    </div>
  );
}
