"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useForm } from "react-hook-form";
import { Loader2, Save, Camera } from "lucide-react";

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
  phone: string;
};

export default function TeacherProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session?.user.role !== "TEACHER") router.push("/dashboard");
  }, [status, session, router]);

  useEffect(() => {
    if (session) {
      fetch(`/api/teachers/${session.user.id}`).then((r) => r.json()).then((d) => {
        if (d.id) {
          reset({ bio: d.bio, hourlyRate: d.hourlyRate, experience: d.experience, education: d.education, phone: d.phone || "" });
          setSelectedSubjects(d.subjects || []);
          setPhotoUrl(d.photoUrl || "");
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

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const localUrl = URL.createObjectURL(file);
    setPhotoUrl(localUrl);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`照片上傳失敗：${err.message || res.status}，請重試`);
        setPhotoUrl("");
        setUploading(false);
        return;
      }
      const { url } = await res.json();
      setPhotoUrl(url);
      // save immediately to DB
      const patchRes = await fetch(`/api/teachers/${session?.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl: url }),
      });
      if (patchRes.ok) {
        alert("照片已儲存成功！");
      } else {
        alert("照片上傳成功，但儲存失敗，請按「儲存」再試一次");
      }
    } catch (err) {
      alert(`發生錯誤：${err}，請重試`);
      setPhotoUrl("");
    }
    setUploading(false);
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

          {/* Photo upload */}
          <div className="card p-6">
            <h2 className="font-bold mb-4">老師照片</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                {photoUrl ? (
                  <img src={photoUrl} alt="老師照片" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="btn-secondary text-sm"
                >
                  {uploading ? <><Loader2 className="w-3 h-3 animate-spin inline mr-1" />上傳中...</> : "選擇照片"}
                </button>
                <p className="text-xs text-gray-400 mt-1">支援 JPG、PNG，建議正方形</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
          </div>

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">手機號碼</label>
              <input
                {...register("phone")}
                type="tel"
                className="input"
                placeholder="0912-345-678"
              />
              <p className="text-xs text-gray-400 mt-1">僅顯示給老師您同意的家長</p>
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
          <button type="submit" disabled={saving || uploading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            儲存個人檔案
          </button>
        </form>
      </div>
    </div>
  );
}
