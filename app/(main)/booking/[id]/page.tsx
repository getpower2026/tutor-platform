"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { CheckCircle, Calendar, Video, Loader2, Phone, MessageCircle } from "lucide-react";
import { formatDateTime, formatNTD } from "@/lib/utils";

export default function BookingConfirmPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bookings/${id}`).then((r) => r.json()).then((d) => {
      setBooking(d);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  const teacherPhone = booking?.teacher?.teacherProfile?.phone;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">預約成功！</h1>
          <p className="text-gray-500 mb-8">老師已收到通知，請等候老師與您聯繫確認上課細節。</p>

          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1 text-gray-500"><Calendar className="w-4 h-4" /> 上課時間</span>
              <span className="font-medium">{booking && formatDateTime(booking.startTime)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">老師</span>
              <span className="font-medium">{booking?.teacher?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">參考時薪</span>
              <span className="font-medium">{booking && formatNTD(booking.totalAmount)}</span>
            </div>
          </div>

          {/* 老師聯絡資訊 */}
          {teacherPhone && (
            <div className="bg-primary-50 rounded-xl p-4 text-left mb-6">
              <p className="text-sm font-medium text-primary-700 mb-2">老師聯絡方式</p>
              <a href={`tel:${teacherPhone}`} className="flex items-center gap-2 text-primary-600 font-bold text-lg hover:underline">
                <Phone className="w-5 h-5" />
                {teacherPhone}
              </a>
              <p className="text-xs text-gray-400 mt-1">可直接致電或傳訊息給老師討論收費方式</p>
            </div>
          )}

          <div className="bg-blue-50 rounded-xl p-4 text-left mb-6 text-sm text-blue-700">
            <p className="flex items-center gap-2 font-medium mb-1"><MessageCircle className="w-4 h-4" /> 溫馨提醒</p>
            <p>收費方式請與老師自行討論，平台不經手任何費用。</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push(`/room/${id}`)}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              <Video className="w-5 h-5" />
              進入視訊教室
            </button>
            <button onClick={() => router.push("/dashboard")} className="btn-secondary w-full py-3">
              回到控制台
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
