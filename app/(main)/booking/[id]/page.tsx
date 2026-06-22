"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { CheckCircle, Clock, Calendar, Video, Loader2 } from "lucide-react";
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

  const isPaid = booking?.paymentStatus === "PAID";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="card p-8 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isPaid ? "bg-green-100" : "bg-amber-100"}`}>
            {isPaid
              ? <CheckCircle className="w-10 h-10 text-green-600" />
              : <Clock className="w-10 h-10 text-amber-600" />}
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {isPaid ? "預約成功！" : "等待付款確認"}
          </h1>
          <p className="text-gray-500 mb-8">
            {isPaid
              ? "課程已確認，開課前 10 分鐘可以進入視訊教室"
              : "付款處理中，請稍候..."}
          </p>

          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1 text-gray-500"><Calendar className="w-4 h-4" /> 上課時間</span>
              <span className="font-medium">{booking && formatDateTime(booking.startTime)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">老師</span>
              <span className="font-medium">{booking?.teacher?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">費用</span>
              <span className="font-medium">{booking && formatNTD(booking.totalAmount)}</span>
            </div>
          </div>

          <div className="space-y-3">
            {isPaid && (
              <button
                onClick={() => router.push(`/room/${id}`)}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                <Video className="w-5 h-5" />
                進入視訊教室
              </button>
            )}
            <button onClick={() => router.push("/dashboard")} className="btn-secondary w-full py-3">
              回到控制台
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
