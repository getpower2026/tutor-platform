"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Calendar, Clock } from "lucide-react";
import { formatNTD } from "@/lib/utils";

interface Props {
  teacher: { userId: string; user: { name: string }; hourlyRate: number };
  onClose: () => void;
}

export function BookingModal({ teacher, onClose }: Props) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalAmount = teacher.hourlyRate * duration;
  const platformFee = Math.round(totalAmount * 0.15);

  const handleSubmit = async () => {
    if (!date || !startTime) { setError("請選擇日期與時間"); return; }
    setLoading(true);
    setError("");

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 3600000);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teacherId: teacher.userId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        note,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.message || "預約失敗");
      setLoading(false);
      return;
    }

    const { booking } = await res.json();
    router.push(`/booking/${booking.id}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">預約 {teacher.user.name} 老師</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" /> 上課日期
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Clock className="w-4 h-4" /> 開始時間
            </label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">上課時數</label>
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="input">
              <option value={1}>1 小時</option>
              <option value={1.5}>1.5 小時</option>
              <option value={2}>2 小時</option>
              <option value={3}>3 小時</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備註（選填）</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input resize-none"
              rows={2}
              placeholder="告訴老師你想學的內容..."
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
            <div className="flex justify-between"><span className="text-gray-500">課程費用</span><span>{formatNTD(totalAmount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">平台手續費 (15%)</span><span>{formatNTD(platformFee)}</span></div>
            <div className="flex justify-between font-bold border-t pt-2">
              <span>總計</span><span className="text-primary-600">{formatNTD(totalAmount + platformFee)}</span>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-3">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "確認預約並付款"}
          </button>
        </div>
      </div>
    </div>
  );
}
