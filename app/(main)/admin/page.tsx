"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Users, BookOpen, Calendar, Phone, Mail, Clock, Trash2 } from "lucide-react";

const ADMIN_EMAIL = "tantriswang@gmail.com";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" });
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "待確認", CONFIRMED: "已確認", COMPLETED: "已完成", CANCELLED: "已取消",
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"teachers" | "students" | "bookings">("teachers");
  const [bookingFilter, setBookingFilter] = useState<"ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED">("ALL");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const [changingRole, setChangingRole] = useState<string | null>(null);

  const handleChangeRole = async (userId: string, name: string, newRole: "TEACHER" | "STUDENT") => {
    const label = newRole === "TEACHER" ? "老師" : "學生";
    if (!confirm(`確定要將「${name}」的身份改為${label}？`)) return;
    setChangingRole(userId);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      // 重新抓資料更新列表
      const d = await fetch("/api/admin/stats").then((r) => r.json());
      setData(d);
    } else {
      const err = await res.json().catch(() => ({}));
      alert(`變更失敗：${err.message || res.status}`);
    }
    setChangingRole(null);
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`確定要刪除「${name}」？此操作不可復原，相關預約也會一併刪除。`)) return;
    setDeleting(userId);
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (res.ok) {
      setData((prev: any) => ({
        ...prev,
        teachers: prev.teachers.filter((t: any) => t.user.id !== userId),
        students: prev.students.filter((s: any) => s.id !== userId),
      }));
    } else {
      const err = await res.json().catch(() => ({}));
      alert(`刪除失敗：${err.message || res.status}`);
    }
    setDeleting(null);
  };

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated" && session.user.email !== ADMIN_EMAIL) { router.push("/"); return; }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user.email === ADMIN_EMAIL) {
      fetch("/api/admin/stats").then((r) => r.json()).then((d) => { setData(d); setLoading(false); });
    }
  }, [status, session]);

  if (status === "loading" || loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">載入中...</div>
  );
  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">後台管理</h1>
        <p className="text-gray-500 mb-8">僅限管理員查看</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "老師總數", value: data.teachers.length, icon: Users, color: "text-blue-600 bg-blue-50" },
            { label: "學生總數", value: data.students.length, icon: BookOpen, color: "text-green-600 bg-green-50" },
            { label: "預約總數", value: data.bookings.length, icon: Calendar, color: "text-purple-600 bg-purple-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-bold">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["teachers", "students", "bookings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${tab === t ? "bg-primary-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
            >
              {t === "teachers" ? `老師 (${data.teachers.length})` : t === "students" ? `學生 (${data.students.length})` : `預約 (${data.bookings.length})`}
            </button>
          ))}
        </div>

        {/* Teachers */}
        {tab === "teachers" && (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["姓名", "Email", "手機", "科目", "時薪", "年資", "學歷", "註冊日", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.teachers.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{t.user.name}</td>
                    <td className="px-4 py-3 text-gray-500">
                      <a href={`mailto:${t.user.email}`} className="flex items-center gap-1 hover:text-primary-600">
                        <Mail className="w-3 h-3" />{t.user.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {t.phone ? (
                        <a href={`tel:${t.phone}`} className="flex items-center gap-1 hover:text-primary-600">
                          <Phone className="w-3 h-3" />{t.phone}
                        </a>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(t.subjects || []).map((s: string) => (
                          <span key={s} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">NT${t.hourlyRate}</td>
                    <td className="px-4 py-3">{t.experience} 年</td>
                    <td className="px-4 py-3 text-gray-500 max-w-32 truncate">{t.education || "—"}</td>
                    <td className="px-4 py-3 text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(t.user.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleChangeRole(t.user.id, t.user.name, "STUDENT")}
                          disabled={changingRole === t.user.id}
                          className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                        >
                          改為學生
                        </button>
                        <button
                          onClick={() => handleDelete(t.user.id, t.user.name)}
                          disabled={deleting === t.user.id}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3 h-3" />刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.teachers.length === 0 && <p className="text-center py-12 text-gray-400">尚無老師資料</p>}
          </div>
        )}

        {/* Students */}
        {tab === "students" && (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["姓名", "Email", "手機", "註冊日", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.students.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-gray-500">
                      <a href={`mailto:${s.email}`} className="flex items-center gap-1 hover:text-primary-600">
                        <Mail className="w-3 h-3" />{s.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {s.phone ? (
                        <a href={`tel:${s.phone}`} className="flex items-center gap-1 hover:text-primary-600">
                          <Phone className="w-3 h-3" />{s.phone}
                        </a>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(s.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleChangeRole(s.id, s.name, "TEACHER")}
                          disabled={changingRole === s.id}
                          className="px-2 py-1 text-xs text-green-600 hover:bg-green-50 rounded border border-green-200"
                        >
                          改為老師
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          disabled={deleting === s.id}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3 h-3" />刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.students.length === 0 && <p className="text-center py-12 text-gray-400">尚無學生資料</p>}
          </div>
        )}

        {/* Bookings */}
        {tab === "bookings" && (
          <div>
            {/* 篩選列 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {([
                { key: "ALL",       label: "全部",     color: "bg-gray-700 text-white" },
                { key: "PENDING",   label: "⏳ 等老師確認", color: "bg-amber-500 text-white" },
                { key: "CONFIRMED", label: "✅ 老師已接受", color: "bg-blue-500 text-white" },
                { key: "COMPLETED", label: "🎓 已完成",  color: "bg-green-500 text-white" },
                { key: "CANCELLED", label: "❌ 拒絕／取消", color: "bg-gray-400 text-white" },
              ] as const).map(({ key, label, color }) => {
                const count = key === "ALL" ? data.bookings.length : data.bookings.filter((b: any) => b.status === key).length;
                return (
                  <button key={key} onClick={() => setBookingFilter(key)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity ${bookingFilter === key ? color : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    {label} ({count})
                  </button>
                );
              })}
            </div>

            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["家長／學生", "邀請老師", "上課時間", "預約日", "狀態", "備註", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.bookings
                    .filter((b: any) => bookingFilter === "ALL" || b.status === bookingFilter)
                    .map((b: any) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{b.student?.name}</div>
                        <div className="text-xs text-gray-400">{b.student?.email}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-indigo-700">{b.teacher?.name}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(b.startTime).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(b.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          b.status === "CONFIRMED"  ? "bg-blue-100 text-blue-700" :
                          b.status === "COMPLETED"  ? "bg-green-100 text-green-700" :
                          b.status === "CANCELLED"  ? "bg-gray-100 text-gray-500" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {b.status === "PENDING" ? "⏳ 等老師確認" :
                           b.status === "CONFIRMED" ? "✅ 老師已接受" :
                           b.status === "COMPLETED" ? "🎓 已完成" : "❌ 拒絕／取消"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-32 truncate">{b.note || "—"}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={async () => {
                            if (!confirm(`確定要刪除此預約？`)) return;
                            const res = await fetch(`/api/admin/bookings/${b.id}`, { method: "DELETE" });
                            if (res.ok) setData((prev: any) => ({ ...prev, bookings: prev.bookings.filter((x: any) => x.id !== b.id) }));
                            else alert("刪除失敗");
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3 h-3" />刪除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.bookings.filter((b: any) => bookingFilter === "ALL" || b.status === bookingFilter).length === 0 && (
                <p className="text-center py-12 text-gray-400">此分類尚無資料</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
