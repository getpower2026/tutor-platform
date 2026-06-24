"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Calendar, Video, Clock, CheckCircle, XCircle, AlertCircle, User, KeyRound, RefreshCw, Star } from "lucide-react";
import { formatDateTime, formatNTD } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:   { label: "等老師確認中", color: "text-orange-700 bg-orange-100 border border-orange-300 font-bold animate-pulse",  icon: AlertCircle },
  CONFIRMED: { label: "已確認", color: "text-blue-600 bg-blue-50",    icon: CheckCircle },
  COMPLETED: { label: "已完成", color: "text-green-600 bg-green-50",  icon: CheckCircle },
  CANCELLED: { label: "已取消", color: "text-gray-500 bg-gray-50",    icon: XCircle },
};

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="text-3xl transition-transform hover:scale-110"
        >
          <Star className={`w-8 h-8 ${(hover || value) >= s ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [missingPhone, setMissingPhone] = useState(false);
  const [reviewModal, setReviewModal] = useState<{ bookingId: string; teacherName: string } | null>(null);
  const [starRating, setStarRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchBookings = () => {
    fetch("/api/bookings").then((r) => r.json()).then((d) => {
      setBookings(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (session) {
      fetchBookings();
      const interval = setInterval(fetchBookings, 30000);
      if (session.user.role === "TEACHER") {
        fetch(`/api/teachers/${session.user.id}`).then((r) => r.json()).then((d) => {
          if (!d.phone) setMissingPhone(true);
        });
      }
      return () => clearInterval(interval);
    }
  }, [session]);

  const handleAction = async (bookingId: string, newStatus: "CONFIRMED" | "CANCELLED" | "COMPLETED") => {
    setActionLoading(bookingId + newStatus);
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: newStatus } : b));
    } else {
      const err = await res.json().catch(() => ({}));
      alert(`操作失敗：${err.message || res.status}，請重新整理後再試`);
    }
    setActionLoading(null);
  };

  const handleSubmitReview = async () => {
    if (!reviewModal || starRating === 0) { alert("請選擇星數"); return; }
    setSubmittingReview(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: reviewModal.bookingId, rating: starRating, comment: reviewComment }),
    });
    if (res.ok) {
      setBookings((prev) => prev.map((b) => b.id === reviewModal.bookingId ? { ...b, review: { id: "done" } } : b));
      setReviewModal(null);
      setStarRating(0);
      setReviewComment("");
      alert("感謝您的評價！");
    } else {
      const err = await res.json().catch(() => ({}));
      alert(`評價失敗：${err.message}`);
    }
    setSubmittingReview(false);
  };

  if (status === "loading" || !session) return null;

  const isTeacher = session.user.role === "TEACHER";
  const upcoming = bookings.filter((b) => b.status === "CONFIRMED" && new Date(b.startTime) > new Date());
  const pending = bookings.filter((b) => b.status === "PENDING");
  const past = bookings.filter((b) => b.status === "COMPLETED");
  const now = new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {isTeacher && missingPhone && (
        <div className="bg-red-600 text-white py-3 px-4 text-center font-medium">
          ⚠️ 您尚未填寫手機號碼！家長確認預約後將看不到您的聯絡方式。
          <Link href="/dashboard/profile" className="ml-3 underline font-bold">立即前往填寫 →</Link>
        </div>
      )}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">你好，{session.user.name} 👋</h1>
            <p className="text-gray-500 mt-1">{isTeacher ? "老師控制台" : "學生控制台"}</p>
          </div>
          <div className="flex gap-3">
            {isTeacher && (
              <Link href="/dashboard/profile" className="btn-secondary flex items-center gap-1">
                <User className="w-4 h-4" />
                編輯個人檔案
              </Link>
            )}
            {!isTeacher && (
              <Link href="/teachers" className="btn-primary">尋找老師</Link>
            )}
            <Link href="/change-password" className="btn-secondary flex items-center gap-1">
              <KeyRound className="w-4 h-4" />
              更改密碼
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "即將上課", value: upcoming.length, icon: Calendar, color: "text-blue-600 bg-blue-50" },
            { label: "待確認預約", value: pending.length, icon: AlertCircle, color: "text-amber-600 bg-amber-50" },
            { label: "已完成課程", value: past.length, icon: CheckCircle, color: "text-green-600 bg-green-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-lg">所有預約</h2>
            <button onClick={fetchBookings} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
              <RefreshCw className="w-4 h-4" />
              重新整理
            </button>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400">載入中...</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3" />
              <p>還沒有任何預約</p>
              {!isTeacher && (
                <Link href="/teachers" className="btn-primary inline-flex mt-4">立即尋找老師</Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {bookings.map((booking) => {
                const st = STATUS_MAP[booking.status] ?? STATUS_MAP.PENDING;
                const Icon = st.icon;
                const canJoin = booking.status === "CONFIRMED";
                const otherPerson = isTeacher ? booking.student : booking.teacher;
                const isPastConfirmed = booking.status === "CONFIRMED";
                const canReview = !isTeacher && booking.status === "COMPLETED" && !booking.review;

                return (
                  <div key={booking.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{otherPerson?.name}</span>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>
                          <Icon className="w-3 h-3" />
                          {st.label}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(booking.startTime)}
                      </div>
                      {booking.note && (
                        <div className="text-xs text-gray-400 mt-1">備註：{booking.note}</div>
                      )}
                      {!isTeacher && booking.status === "CONFIRMED" && booking.teacher?.teacherProfile?.phone && (
                        <div className="text-sm text-green-700 bg-green-50 rounded px-2 py-1 mt-1 font-medium">
                          📞 老師電話：{booking.teacher.teacherProfile.phone}
                        </div>
                      )}
                      {!isTeacher && booking.status === "COMPLETED" && booking.review && (
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          已評價
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {/* 學生可取消待確認的預約 */}
                      {!isTeacher && booking.status === "PENDING" && (
                        <button
                          onClick={() => {
                            if (confirm("確定要取消這筆預約嗎？")) handleAction(booking.id, "CANCELLED");
                          }}
                          disabled={!!actionLoading}
                          className="px-3 py-1.5 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200 font-medium"
                        >
                          取消預約
                        </button>
                      )}
                      {/* 學生或老師可刪除已完成或已取消的記錄 */}
                      {["COMPLETED", "CANCELLED"].includes(booking.status) && (
                        <button
                          onClick={async () => {
                            if (!confirm("確定要刪除這筆記錄嗎？")) return;
                            setActionLoading(booking.id + "DELETE");
                            const res = await fetch(`/api/bookings/${booking.id}`, { method: "DELETE" });
                            if (res.ok) {
                              setBookings((prev) => prev.filter((b) => b.id !== booking.id));
                            } else {
                              alert("刪除失敗，請重試");
                            }
                            setActionLoading(null);
                          }}
                          disabled={!!actionLoading}
                          className="px-3 py-1.5 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200 font-medium"
                        >
                          刪除記錄
                        </button>
                      )}
                      {/* 老師看到待確認時顯示接受/拒絕 */}
                      {isTeacher && booking.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleAction(booking.id, "CONFIRMED")}
                            disabled={!!actionLoading}
                            className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 font-medium"
                          >
                            接受
                          </button>
                          <button
                            onClick={() => handleAction(booking.id, "CANCELLED")}
                            disabled={!!actionLoading}
                            className="px-3 py-1.5 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200 font-medium"
                          >
                            拒絕
                          </button>
                        </>
                      )}
                      {/* 老師可標記已完成（課程結束後） */}
                      {isTeacher && isPastConfirmed && (
                        <button
                          onClick={() => {
                            if (confirm("確定要標記此課程為「已完成」？")) handleAction(booking.id, "COMPLETED");
                          }}
                          disabled={!!actionLoading}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 font-medium"
                        >
                          標記完成
                        </button>
                      )}
                      {canJoin && (
                        <Link
                          href={`/room/${booking.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg shadow"
                        >
                          <Video className="w-4 h-4" />
                          進入教室
                        </Link>
                      )}
                      {/* 查看白板各頁 */}
                      {booking.status === "COMPLETED" && (
                        <select
                          defaultValue=""
                          onChange={(e) => { if (e.target.value) { window.open(e.target.value, "_blank"); e.target.value = ""; } }}
                          className="text-xs border border-purple-200 bg-purple-50 text-purple-700 rounded-lg px-2 py-1.5 cursor-pointer font-medium"
                        >
                          <option value="" disabled>📄 查看白板</option>
                          {Array.from({ length: 50 }, (_, i) => i + 1).map((p) => {
                            const cleaned = booking.id.replace(/-/g,"").slice(0,17);
                            const roomId = (cleaned + String(p).padStart(2,"0") + "0").slice(0,20);
                            const key = btoa(booking.id + p).replace(/[^a-zA-Z0-9]/g,"").slice(0,22).padEnd(22,"A");
                            return <option key={p} value={`https://excalidraw.com/#room=${roomId},${key}`}>第 {p} 頁</option>;
                          })}
                        </select>
                      )}
                      {/* 學生評價按鈕 */}
                      {canReview && (
                        <button
                          onClick={() => {
                            setReviewModal({ bookingId: booking.id, teacherName: booking.teacher?.name });
                            setStarRating(0);
                            setReviewComment("");
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg"
                        >
                          <Star className="w-4 h-4" />
                          評價老師
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 評價 Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-1">評價老師</h3>
            <p className="text-gray-500 text-sm mb-6">評價 {reviewModal.teacherName} 老師的課程</p>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">請給星數評分</label>
              <StarPicker value={starRating} onChange={setStarRating} />
              <p className="text-sm text-gray-400 mt-1">
                {starRating === 1 ? "😞 很差" : starRating === 2 ? "😐 普通" : starRating === 3 ? "🙂 還不錯" : starRating === 4 ? "😊 很好" : starRating === 5 ? "🤩 非常棒！" : "點選星星評分"}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">留下評論（選填）</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="input resize-none"
                rows={4}
                placeholder="分享您的上課心得，幫助其他家長了解這位老師..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setReviewModal(null)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || starRating === 0}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-lg"
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
