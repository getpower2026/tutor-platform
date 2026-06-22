"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { Loader2, PhoneOff, Mic, MicOff, Video, VideoOff, Monitor } from "lucide-react";

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);
  const [status, setStatus] = useState<"loading" | "joined" | "error">("loading");
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  useEffect(() => {
    let call: DailyCall;

    async function joinRoom() {
      const res = await fetch(`/api/rooms/${id}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || "無法進入教室");
        setStatus("error");
        return;
      }
      const { roomName, token } = await res.json();

      call = DailyIframe.createFrame(containerRef.current!, {
        showLeaveButton: false,
        showFullscreenButton: true,
        iframeStyle: { width: "100%", height: "100%", border: "none" },
      });
      callRef.current = call;

      call.on("joined-meeting", () => setStatus("joined"));
      call.on("error", () => { setError("視訊連線錯誤"); setStatus("error"); });

      await call.join({
        url: `https://${process.env.NEXT_PUBLIC_DAILY_DOMAIN}/${roomName}`,
        token,
      });
    }

    joinRoom();
    return () => { call?.destroy(); };
  }, [id]);

  const toggleMute = () => { callRef.current?.setLocalAudio(muted); setMuted(!muted); };
  const toggleVideo = () => { callRef.current?.setLocalVideo(videoOff); setVideoOff(!videoOff); };
  const shareScreen = () => callRef.current?.startScreenShare();
  const leaveRoom = () => { callRef.current?.leave(); router.push("/dashboard"); };

  if (status === "error") return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-xl mb-4">{error}</p>
        <button onClick={() => router.push("/dashboard")} className="btn-secondary">回到控制台</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
        <span className="text-white font-medium">給力一對一線上家教 視訊教室</span>
        {status === "loading" && (
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            連線中...
          </div>
        )}
      </div>

      {/* Video container */}
      <div ref={containerRef} className="flex-1" />

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-center gap-4">
        <button
          onClick={toggleMute}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${muted ? "bg-red-500 text-white" : "bg-gray-600 text-white hover:bg-gray-500"}`}
        >
          {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button
          onClick={toggleVideo}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${videoOff ? "bg-red-500 text-white" : "bg-gray-600 text-white hover:bg-gray-500"}`}
        >
          {videoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>
        <button
          onClick={shareScreen}
          className="w-12 h-12 rounded-full bg-gray-600 text-white hover:bg-gray-500 flex items-center justify-center"
        >
          <Monitor className="w-5 h-5" />
        </button>
        <button
          onClick={leaveRoom}
          className="w-14 h-12 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
