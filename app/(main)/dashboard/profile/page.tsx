"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useForm } from "react-hook-form";
import { Loader2, Save } from "lucide-react";

const SUBJECTS = ["數學", "英文", "物理", "化學", "中文", "日文", "程式設計", "音樂", "美術", "歷史", "地理", "生物"];
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS: Record<string, string> = {
  monday: "週一", tuesday: "週二", wednesday: "週三", thursday: "週四",
  friday: "週五", saturday: "週六", sunday: "週日",
};

type FormData = {
  bio: string;
  hourlyRate: number;
  experience: number;
  education: string;
};

export default function TeacherProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session?.user.role !== "TEACHER") router.push("/dashboard");
  }, [status, session, router]);

  useEffect(() => {
    if (session) {
      fetch(`/api/teachers/${session.user.id}`).then((r) => r.json()).then((d) => {
        if (d.id) {
          reset({ bio: d.bio, hourlyRate: d.hourlyRate, experience: d.experience, education: d.education });
          setSelectedSubjects(d.subjects || []);
          const avail: Record<string, boolean> = {};
          DAYS.forEach((day) => { avail[day] = !!d.availability?.[day]; });
          setAvailability(avail);
        }
        setLoading(false);
      });
    }
  }, [session, reset]);

  const toggleSubject = (s: string) => {
    setSelectedSubjects((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setSuccess(false);
    const avail: Record<string, boolean> = {};
    DAYS.forEach((d) => { if (availability[d]) avail[d] = true; });

    await fetch(`/api/teachers/${session!.user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, subjects: selectedSubjects, availability: avail, languages: ["中文"] }),
    });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">編輯個人檔案</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="card p-6 space-y-4">
            <h2 className="font-bold">基本資訊</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">個人簡介</label>
              <textarea
                {...register("bio", { required: "請填寫個人簡介" })}
                className="input resize-none"
                rows={4}
                placeholder="介紹你的教學風格、專長、學歷背景..."
              />
              {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">時薪 (NTD)</label>
                <input
                  {...register("hourlyRate", { required: true, min: 100, valueAsNumber: true })}
                  type="number"
                  className="input"
                  placeholder="500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">教學年資</label>
                <input
                  {...register("experience", { required: true, min: 0, valueAsNumber: true })}
                  type="number"
                  className="input"
                  placeholder="3"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">學歷</label>
              <input {...register("education")} className="input" placeholder="台灣大學 數學系" />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-bold mb-3">教授科目</h2>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSubject(s)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedSubjects.includes(s)
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-bold mb-3">可授課時段（天）</h2>
            <div className="grid grid-cols-4 gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setAvailability((prev) => ({ ...prev, [day]: !prev[day] }))}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    availability[day]
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {DAY_LABELS[day]}
                </button>
              ))}
            </div>
          </div>

          {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">✓ 儲存成功！</div>}
          <button type="submit" disabled={saving} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            儲存個人檔案
          </button>
        </form>
      </div>
    </div>
  );
}
