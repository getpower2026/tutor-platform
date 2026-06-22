"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { BookingModal } from "@/components/booking/BookingModal";
import { Star, Clock, GraduationCap, Languages, BookOpen, Calendar } from "lucide-react";
import { formatNTD } from "@/lib/utils";

export default function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    setTeacher(null);
    setLoading(true);
    fetch(`/api/teachers/${id}`, { cache: 'no-store' }).then((r) => r.json()).then((d) => {
      setTeacher(d);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
        <div className="card p-8"><div className="h-32 bg-gray-100 rounded" /></div>
      </div>
    </div>
  );

  if (!teacher) return <div>找不到老師</div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card p-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {teacher.user.image ? (
                <Image src={teacher.user.image} alt={teacher.user.name} width={96} height={96} className="rounded-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-primary-600">{teacher.user.name[0]}</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{teacher.user.name}</h1>
              <div className="flex items-center gap-2 text-amber-500 mb-3">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-bold text-lg">{teacher.rating.toFixed(1)}</span>
                <span className="text-gray-400">({teacher.reviewCount} 則評價)</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 教學 {teacher.experience} 年</span>
                <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {teacher.education}</span>
                <span className="flex items-center gap-1"><Languages className="w-4 h-4" /> {teacher.languages?.join("、")}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600 mb-1">{formatNTD(teacher.hourlyRate)}</div>
              <div className="text-gray-400 text-sm mb-4">每小時</div>
              <button
                onClick={() => session ? setShowBooking(true) : router.push("/login")}
                className="btn-primary px-8 py-3 text-base"
              >
                <Calendar className="w-4 h-4 mr-2" />
                立即預約
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-3">關於我</h2>
              <p className="text-gray-600 leading-relaxed">{teacher.bio || "尚未填寫個人簡介"}</p>
            </div>
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-500" />
                教授科目
              </h2>
              <div className="flex flex-wrap gap-2">
                {teacher.subjects.map((s: string) => (
                  <span key={s} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6 h-fit">
            <h2 className="font-bold text-lg mb-4">預約課程</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">課程費用</span>
                <span className="font-medium">{formatNTD(teacher.hourlyRate)} / 小時</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">平台手續費</span>
                <span className="font-medium">15%</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>付款保障</span>
                <span className="text-green-600">Stripe 加密</span>
              </div>
            </div>
            <button
              onClick={() => session ? setShowBooking(true) : router.push("/login")}
              className="btn-primary w-full mt-4"
            >
              選擇時段
            </button>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingModal
          teacher={teacher}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}
