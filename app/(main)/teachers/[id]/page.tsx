import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Star, Clock, GraduationCap, BookOpen, MessageSquare } from "lucide-react";
import { formatNTD } from "@/lib/utils";
import { BookingPanel, BookNowButton } from "./TeacherDetailClient";

export const revalidate = 5;

export async function generateStaticParams() {
  const teachers = await prisma.teacherProfile.findMany({ select: { userId: true } });
  return teachers.map((t) => ({ id: t.userId }));
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
      ))}
    </div>
  );
}

export default async function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [teacher, reviews] = await Promise.all([
    prisma.teacherProfile.findFirst({
      where: { userId: id },
      include: { user: { select: { id: true, name: true, image: true, phone: true } } },
    }),
    prisma.review.findMany({
      where: { teacherId: id },
      include: { reviewer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!teacher) notFound();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card p-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-36 h-36 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {teacher.photoUrl ? (
                <img src={teacher.photoUrl} alt={teacher.user.name} className="w-full h-full object-cover" />
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
              <BookNowButton teacher={teacher} />
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

          <BookingPanel teacher={teacher} />
        </div>
      </div>
    </div>
  );
}
