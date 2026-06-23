"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { Loader2, PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, PenLine, VideoIcon } from "lucide-react";

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);
  const [status, setStatus] = useState<"loading" | "joined" | "error">("loading");
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [tab, setTab] = useState<"video" | "whiteboard">("video");

  const cleaned = (id as string).replace(/[^a-zA-Z0-9]/g, "");
  const roomId = cleaned.slice(0, 20).padEnd(20, "a");
  const roomKey = cleaned.slice(0, 22).padEnd(22, "b");
  const excalidrawUrl = `https://excalidraw.com/#room=${roomId},${roomKey}`;

  useEffect(() => {
    if (!session) return;
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
        showFullscreenButton: false,
        showParticipantsBar: false,
        iframeStyle: { width: "100%", height: "100%", border: "none" },
      });
      callRef.current = call;

      call.on("joined-meeting", () => setStatus("joined"));
      call.on("error", () => { setError("視訊連線錯誤"); setStatus("error"); });

      await call.join({
        url: `https://${process.env.NEXT_PUBLIC_DAILY_DOMAIN}/${roomName}`,
        token,
        userName: session.user.name || "使用者",
      });
    }

    joinRoom();
    return () => { call?.destroy(); };
  }, [id, session]);

  const toggleMute = () => {
    const next = !muted;
    callRef.current?.setLocalAudio(!next);
    setMuted(next);
  };

  const toggleVideo = () => {
    const next = !videoOff;
    callRef.current?.setLocalVideo(!next);
    setVideoOff(next);
  };

  const toggleScreen = async () => {
    if (sharing) {
      await callRef.current?.stopScreenShare();
      setSharing(false);
    } else {
      await callRef.current?.startScreenShare();
      setSharing(true);
    }
  };

  const leaveRoom = () => {
    callRef.current?.leave();
    router.push("/dashboard");
  };

  if (status === "error") return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-xl mb-4">{error}</p>
        <button onClick={() => router.push("/dashboard")} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">回到控制台</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <span className="text-white font-bold">TutorLink 視訊教室</span>
        {status === "loading" && (
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            連線中，請稍候...
          </div>
        )}
        {status === "joined" && (
          <span className="text-green-400 text-sm font-medium">● 已連線</span>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-gray-700 flex">
        <button
          onClick={() => setTab("video")}
          className={`flex items-center gap-2 px-6 py-2 text-sm font-medium transition-colors ${tab === "video" ? "bg-gray-900 text-white" : "text-gray-300 hover:text-white"}`}
        >
          <VideoIcon className="w-4 h-4" />
          視訊上課
        </button>
        <button
          onClick={() => setTab("whiteboard")}
          className={`flex items-center gap-2 px-6 py-2 text-sm font-medium transition-colors ${tab === "whiteboard" ? "bg-gray-900 text-white" : "text-gray-300 hover:text-white"}`}
        >
          <PenLine className="w-4 h-4" />
          白板
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Daily.co iframe — always mounted, hidden when on whiteboard */}
        <div
          ref={containerRef}
          className="absolute inset-0"
          style={{ display: tab === "video" ? "block" : "none" }}
        />
        {/* Whiteboard */}
        {tab === "whiteboard" && (
          <iframe
            src={excalidrawUrl}
            className="absolute inset-0 w-full h-full border-none"
            allow="clipboard-read; clipboard-write"
          />
        )}
      </div>

      {/* 中文控制列 */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-center gap-3 flex-wrap">
        <ControlBtn
          onClick={toggleMute}
          active={muted}
          label={muted ? "取消靜音" : "靜音"}
          icon={muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        />
        <ControlBtn
          onClick={toggleVideo}
          active={videoOff}
          label={videoOff ? "開啟鏡頭" : "關閉鏡頭"}
          icon={videoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        />
        <ControlBtn
          onClick={toggleScreen}
          active={sharing}
          label={sharing ? "停止分享" : "分享螢幕"}
          icon={sharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          activeColor="bg-blue-600"
        />
        <button
          onClick={leaveRoom}
          className="flex flex-col items-center gap-1 px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="text-xs">離開教室</span>
        </button>
      </div>
    </div>
  );
}

function ControlBtn({ onClick, active, label, icon, activeColor = "bg-red-500" }: {
  onClick: () => void; active: boolean; label: string; icon: React.ReactNode; activeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl font-medium transition-colors text-white ${active ? activeColor : "bg-gray-600 hover:bg-gray-500"}`}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}
