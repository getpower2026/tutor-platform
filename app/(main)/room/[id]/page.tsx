"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { Loader2, PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, PenLine, VideoIcon, Star } from "lucide-react";

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star className={`w-10 h-10 ${(hover || value) >= s ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  );
}

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

  // 離開後的 modal 狀態
  const [leaveModal, setLeaveModal] = useState<"teacher" | "student" | null>(null);
  const [starRating, setStarRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [teacherName, setTeacherName] = useState("");

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
        userName: session?.user?.name || "使用者",
      });
    }

    // 取得老師名稱（給學生評價用）
    if (session.user.role === "STUDENT") {
      fetch(`/api/bookings/${id}`).then((r) => r.json()).then((d) => {
        if (d.teacher?.name) setTeacherName(d.teacher.name);
      }).catch(() => {});
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

  const handleLeaveClick = () => {
    callRef.current?.leave();
    if (session?.user.role === "TEACHER") {
      setLeaveModal("teacher");
    } else {
      setLeaveModal("student");
    }
  };

  const handleTeacherComplete = async (markComplete: boolean) => {
    if (markComplete) {
      await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      }).catch(() => {});
    }
    router.push("/dashboard");
  };

  const handleSubmitReview = async (skip: boolean) => {
    if (!skip) {
      if (starRating === 0) { alert("請選擇星數"); return; }
      setSubmittingReview(true);
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, rating: starRating, comment: reviewComment }),
      }).catch(() => {});
      setSubmittingReview(false);
    }
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
        <div
          ref={containerRef}
          className="absolute inset-0"
          style={{ display: tab === "video" ? "block" : "none" }}
        />
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
          onClick={handleLeaveClick}
          className="flex flex-col items-center gap-1 px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="text-xs">離開教室</span>
        </button>
      </div>

      {/* 老師離開 Modal */}
      {leaveModal === "teacher" && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-xl font-bold mb-2">課程結束了嗎？</h3>
            <p className="text-gray-500 text-sm mb-6">標記完成後，學生可以對您進行評價。</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleTeacherComplete(true)}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl"
              >
                ✅ 標記課程完成並離開
              </button>
              <button
                onClick={() => handleTeacherComplete(false)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl"
              >
                直接離開（不標記完成）
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 學生評價 Modal */}
      {leaveModal === "student" && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">⭐</div>
              <h3 className="text-xl font-bold">為這堂課評分</h3>
              {teacherName && <p className="text-gray-500 text-sm mt-1">評價 {teacherName} 老師</p>}
            </div>

            <div className="mb-5 text-center">
              <StarPicker value={starRating} onChange={setStarRating} />
              <p className="text-sm text-gray-400 mt-2">
                {starRating === 1 ? "😞 很差" : starRating === 2 ? "😐 普通" : starRating === 3 ? "🙂 還不錯" : starRating === 4 ? "😊 很好" : starRating === 5 ? "🤩 非常棒！" : "點選星星評分"}
              </p>
            </div>

            <div className="mb-5">
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
                rows={3}
                placeholder="留下評論（選填）..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleSubmitReview(true)}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 text-sm"
              >
                跳過
              </button>
              <button
                onClick={() => handleSubmitReview(false)}
                disabled={submittingReview || starRating === 0}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-xl"
              >
                {submittingReview ? "送出中..." : "送出評價"}
              </button>
            </div>
          </div>
        </div>
      )}
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
