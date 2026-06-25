"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { BookingModal } from "@/components/booking/BookingModal";
import { Star, Clock, GraduationCap, Languages, BookOpen, Calendar, MessageSquare, Phone } from "lucide-react";
import { formatNTD } from "@/lib/utils";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
      ))}
    </div>
  );
}

export default function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    setTeacher(null);
    setLoading(true);
    Promise.all([
      fetch(`/api/teachers/${id}`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`/api/teachers/${id}/reviews`).then((r) => r.json()),
    ]).then(([teacherData, reviewsData]) => {
      setTeacher(teacherData);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
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
            <div className="w-36 h-36 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {teacher.photoUrl ? (
                <img src={teacher.photoUrl} alt={teacher.user.name} className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-5xl font-bold text-primary-600">${teacher.user.name[0]}</span>`;
                  }}
                />
              ) : (
                <span className="text-5xl font-bold text-primary-600">{teacher.user.name[0]}</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{teacher.user.name}</h1>
              <div className="flex items-center gap-2 text-amber-500 mb-3">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-bold text-lg">{teacher.rating > 0 ? teacher.rating.toFixed(1) : "尚無評分"}</span>
                {teacher.reviewCount > 0 && (
                  <span className="text-gray-400">({teacher.reviewCount} 則評價)</span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 教學 {teacher.experience} 年</span>
                <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {teacher.education}</span>
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

            {/* 評價區塊 */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-500" />
                學生評價
                {reviews.length > 0 && (
                  <span className="text-sm font-normal text-gray-400">（{reviews.length} 則）</span>
                )}
              </h2>

              {reviews.length === 0 ? (
                <p className="text-gray-400 text-sm">尚無評價</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                          {review.reviewer.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {review.reviewer.name[0]}{"*".repeat(Math.max(0, review.reviewer.name.length - 1))}
                          </div>
                          <div className="flex items-center gap-2">
                            <StarDisplay rating={review.rating} />
                            <span className="text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString("zh-TW")}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 text-sm leading-relaxed pl-11">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

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
