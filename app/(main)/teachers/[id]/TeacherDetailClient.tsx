"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BookingModal } from "@/components/booking/BookingModal";
import { Calendar, Phone } from "lucide-react";
import { Star } from "lucide-react";
import { formatNTD } from "@/lib/utils";

export function BookingPanel({ teacher }: { teacher: any }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showBooking, setShowBooking] = useState(false);

  return (
    <div className="card p-6 h-fit">
      <h2 className="font-bold text-lg mb-4">預約課程</h2>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">參考時薪</span>
          <span className="font-medium">{formatNTD(teacher.hourlyRate)} / 小時</span>
        </div>
        {teacher.rating > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500">評分</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{teacher.rating.toFixed(1)}</span>
            </div>
          </div>
        )}
        {teacher.showPhone && teacher.phone && (
          <div className="border-t pt-3">
            <p className="text-xs text-gray-400 mb-1">老師手機，可直接聯絡溝通</p>
            <a href={`tel:${teacher.phone}`} className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-base transition-colors">
              <Phone className="w-4 h-4" />
              {teacher.phone}
            </a>
          </div>
        )}
        <div className="border-t pt-3 text-xs text-gray-400">
          實際收費由老師與家長自行討論，本平台完全免費。
        </div>
      </div>
      <button
        onClick={() => session ? setShowBooking(true) : router.push("/login")}
        className="btn-primary w-full mt-4"
      >
        選擇時段
      </button>
      {showBooking && (
        <BookingModal teacher={teacher} onClose={() => setShowBooking(false)} />
      )}
    </div>
  );
}

export function BookNowButton({ teacher }: { teacher: any }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showBooking, setShowBooking] = useState(false);

  return (
    <>
      <button
        onClick={() => session ? setShowBooking(true) : router.push("/login")}
        className="btn-primary px-8 py-3 text-base"
      >
        <Calendar className="w-4 h-4 mr-2" />
        立即預約
      </button>
      {showBooking && (
        <BookingModal teacher={teacher} onClose={() => setShowBooking(false)} />
      )}
    </>
  );
}
