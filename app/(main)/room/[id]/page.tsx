"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DailyIframe from "@daily-co/daily-js";
import { Loader2, PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, PenLine, VideoIcon, MonitorOff } from "lucide-react";

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const callRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "joined" | "error">("loading");
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [tab, setTab] = useState<"video" | "whiteboard">("video");
  const [participants, setParticipants] = useState<any[]>([]);

  const cleaned = (id as string).replace(/[^a-zA-Z0-9]/g, "");
  const roomId = cleaned.slice(0, 20).padEnd(20, "a");
  const roomKey = cleaned.slice(0, 22).padEnd(22, "b");
  const excalidrawUrl = `https://excalidraw.com/#room=${roomId},${roomKey}`;

  const updateParticipants = useCallback((call: any) => {
    const parts = Object.values(call.participants() || {});
    setParticipants([...parts]);
  }, []);

  useEffect(() => {
    if (!session) return;
    let call: any;

    async function joinRoom() {
      const res = await fetch(`/api/rooms/${id}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || "無法進入教室");
        setStatus("error");
        return;
      }
      const { roomName, token } = await res.json();

      call = DailyIframe.createCallObject();
      callRef.current = call;

      call.on("joined-meeting", () => {
        setStatus("joined");
        updateParticipants(call);
      });
      call.on("participant-joined", () => updateParticipants(call));
      call.on("participant-updated", () => updateParticipants(call));
      call.on("participant-left", () => updateParticipants(call));
      call.on("track-started", () => updateParticipants(call));
      call.on("track-stopped", () => updateParticipants(call));
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
        {/* Video Grid */}
        <div
          className="absolute inset-0 p-3 grid gap-3"
          style={{
            display: tab === "video" ? "grid" : "none",
            gridTemplateColumns: participants.length > 1 ? "1fr 1fr" : "1fr",
          }}
        >
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="text-lg">正在連線視訊，請允許攝影機與麥克風權限...</p>
            </div>
          )}
          {participants.map((p: any) => (
            <ParticipantTile key={p.session_id} participant={p} />
          ))}
        </div>

        {/* Whiteboard */}
        {tab === "whiteboard" && (
          <iframe
            src={excalidrawUrl}
            className="absolute inset-0 w-full h-full border-none"
            allow="clipboard-read; clipboard-write"
          />
        )}
      </div>

      {/* Controls */}
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

function ParticipantTile({ participant }: { participant: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const videoTrack = participant.tracks?.video?.persistentTrack ?? participant.tracks?.video?.track;
  const audioTrack = participant.tracks?.audio?.persistentTrack ?? participant.tracks?.audio?.track;
  const videoState = participant.tracks?.video?.state;
  const isVideoPlayable = videoState === "playable" && !!videoTrack;

  useEffect(() => {
    if (videoRef.current) {
      if (isVideoPlayable && videoTrack) {
        const stream = new MediaStream([videoTrack]);
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [videoTrack, isVideoPlayable]);

  useEffect(() => {
    if (audioRef.current && !participant.local && audioTrack) {
      const stream = new MediaStream([audioTrack]);
      audioRef.current.srcObject = stream;
      audioRef.current.play().catch(() => {});
    }
  }, [audioTrack, participant.local]);

  const isVideoOff = !isVideoPlayable;

  return (
    <div className="relative bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center">
      {isVideoOff ? (
        <div className="flex flex-col items-center gap-2 text-gray-300">
          <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-2xl font-bold">
            {(participant.user_name || "?")[0]}
          </div>
          <span className="text-sm">{participant.user_name || "參與者"}</span>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted={participant.local}
          playsInline
          className="w-full h-full object-cover"
        />
      )}
      {!participant.local && <audio ref={audioRef} autoPlay />}
      {/* Name tag */}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {participant.user_name || "參與者"}{participant.local ? "（你）" : ""}
      </div>
      {/* Muted icon */}
      {participant.audio === false && (
        <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
          <MicOff className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
}
