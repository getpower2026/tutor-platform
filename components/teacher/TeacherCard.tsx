import Link from "next/link";
import Image from "next/image";
import { Star, Clock, BookOpen } from "lucide-react";
import { formatNTD } from "@/lib/utils";

interface Props {
  teacher: {
    id: string;
    userId: string;
    bio: string;
    subjects: string[];
    hourlyRate: number;
    experience: number;
    rating: number;
    reviewCount: number;
    photoUrl?: string | null;
    user: { id: string; name: string; image: string | null };
  };
}

export function TeacherCard({ teacher }: Props) {
  return (
    <Link href={`/teachers/${teacher.userId}`} className="card p-6 hover:shadow-md transition-shadow block">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {(teacher.photoUrl || teacher.user.image) ? (
            <Image src={teacher.photoUrl || teacher.user.image!} alt={teacher.user.name} width={64} height={64} className="rounded-full object-cover" unoptimized />
          ) : (
            <span className="text-2xl font-bold text-primary-600">{teacher.user.name[0]}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate">{teacher.user.name}</h3>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{teacher.rating.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">({teacher.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
            <Clock className="w-3 h-3" />
            <span>教學經驗 {teacher.experience} 年</span>
          </div>
        </div>
      </div>

      <p className="text-gray-600 text-sm line-clamp-2 mb-4">{teacher.bio || "尚未填寫個人簡介"}</p>

      <div className="flex flex-wrap gap-1 mb-4">
        {teacher.subjects.slice(0, 4).map((s) => (
          <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full">
            <BookOpen className="w-3 h-3" />
            {s}
          </span>
        ))}
        {teacher.subjects.length > 4 && (
          <span className="text-xs text-gray-400 self-center">+{teacher.subjects.length - 4}</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-xl font-bold text-primary-600">{formatNTD(teacher.hourlyRate)}</span>
          <span className="text-gray-400 text-sm"> / 小時</span>
        </div>
        <span className="btn-primary text-sm px-4 py-1.5">預約</span>
      </div>
    </Link>
  );
}
