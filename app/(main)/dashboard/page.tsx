"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Calendar, Video, Clock, CheckCircle, XCircle, AlertCircle, User, KeyRound, RefreshCw } from "lucide-react";
import { formatDateTime, formatNTD } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:   { label: "待確認", color: "text-amber-600 bg-amber-50",  icon: AlertCircle },
  CONFIRMED: { label: "已確認", color: "text-blue-600 bg-blue-50",    icon: CheckCircle },
  COMPLETED: { label: "已完成", color: "text-green-600 bg-green-50",  icon: CheckCircle },
  CANCELLED: { label: "已取消", color: "text-gray-500 bg-gray-50",    icon: XCircle },
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
      return () => clearInterval(interval);
    }
  }, [session]);

  const handleAction = async (bookingId: string, newStatus: "CONFIRMED" | "CANCELLED") => {
    setActionLoading(bookingId + newStatus);
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: newStatus } : b));
    setActionLoading(null);
  };

  if (status === "loading" || !session) return null;

  const isTeacher = session.user.role === "TEACHER";
  const upcoming = bookings.filter((b) => b.status === "CONFIRMED" && new Date(b.startTime) > new Date());
  const pending = bookings.filter((b) => b.status === "PENDING");
  const past = bookings.filter((b) => b.status === "COMPLETED");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
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
                    </div>
                    <div className="flex items-center gap-2">
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
                      {canJoin && (
                        <Link
                          href={`/room/${booking.id}`}
                          className="inline-flex items-center gap-1 text-sm text-primary-600 font-medium hover:underline"
                        >
                          <Video className="w-3 h-3" />
                          進入教室
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
