"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { BookOpen, Loader2, AlertTriangle, Camera } from "lucide-react";

const SUBJECTS = ["國文", "英文", "數學", "社會", "歷史", "地理", "公民", "自然", "物理", "化學", "生物", "地科", "理化", "全民英檢", "多益", "劍橋英檢"];
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS: Record<string, string> = {
  monday: "週一", tuesday: "週二", wednesday: "週三", thursday: "週四",
  friday: "週五", saturday: "週六", sunday: "週日",
};

type FormData = {
  name: string;
  email: string;
  password: string;
  role: "STUDENT" | "TEACHER";
  phone: string;
  bio: string;
  hourlyRate: number;
  experience: number;
  education: string;
};

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const defaultRole = params.get("role") === "teacher" ? "TEACHER" : "STUDENT";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { role: defaultRole },
  });

  const role = watch("role");
  const [agreedDisclaimer, setAgreedDisclaimer] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showAgreeAlert, setShowAgreeAlert] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [showPhone, setShowPhone] = useState(false);
  const [trialClass, setTrialClass] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [subjectError, setSubjectError] = useState(false);
  const [availError, setAvailError] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const allAgreed = agreedDisclaimer && agreedPrivacy && agreedTerms;

  const toggleSubject = (s: string) => {
    setSubjectError(false);
    setSelectedSubjects((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoError(false);
  };

  const onSubmit = async (data: FormData) => {
    if (!allAgreed) { setShowAgreeAlert(true); return; }

    // teacher validation
    if (data.role === "TEACHER") {
      let hasError = false;
      if (!photoFile) { setPhotoError(true); hasError = true; }
      if (selectedSubjects.length === 0) { setSubjectError(true); hasError = true; }
      if (!Object.values(availability).some(Boolean)) { setAvailError(true); hasError = true; }
      if (hasError) { setError("請填寫所有必填欄位"); return; }
    }

    setLoading(true);
    setError("");

    // 1. 建立帳號
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        subjects: selectedSubjects,
        availability,
        showPhone,
        trialClass,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      setError(err.message || "註冊失敗");
      setLoading(false);
      return;
    }
    const { id: userId } = await res.json();

    // 2. 登入
    const signInRes = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    if (signInRes?.error) {
      setError("帳號建立成功，但自動登入失敗，請手動登入");
      setLoading(false);
      return;
    }

    // 3. 上傳照片（老師）
    if (data.role === "TEACHER" && photoFile) {
      const formData = new FormData();
      formData.append("file", photoFile);
      const upRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (upRes.ok) {
        const { url } = await upRes.json();
        await fetch(`/api/teachers/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoUrl: url }),
        });
      }
    }

    router.push(data.role === "TEACHER" ? "/dashboard" : "/teachers");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="card p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-primary-600">
            <BookOpen className="w-7 h-7" />
            TutorLink
          </Link>
          <h1 className="text-2xl font-bold mt-4">建立帳號</h1>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(["STUDENT", "TEACHER"] as const).map((r) => (
            <label
              key={r}
              className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                role === r ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input {...register("role")} type="radio" value={r} className="sr-only" />
              <span className="text-2xl mb-1">{r === "STUDENT" ? "🎓" : "👨‍🏫"}</span>
              <span className="font-medium text-sm">{r === "STUDENT" ? "我是學生" : "我是老師"}</span>
            </label>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-300 text-red-600 text-sm px-4 py-3 rounded-lg font-medium">{error}</div>}

          {/* 姓名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名 <span className="text-red-500">*</span></label>
            <input {...register("name", { required: "請輸入姓名" })} className="input" placeholder="王小明" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input {...register("email", { required: "❌ Email 為必填" })} type="email" className="input" placeholder="your@email.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
            {!errors.email && role === "TEACHER" && (
              <p className="text-red-600 text-xs mt-1 font-medium">⚠️ 學生預約時，通知將發送至此信箱</p>
            )}
          </div>

          {/* 密碼 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密碼 <span className="text-red-500">*</span></label>
            <input
              {...register("password", { required: "請輸入密碼", minLength: { value: 8, message: "密碼至少 8 個字元" } })}
              type="password" className="input" placeholder="至少 8 個字元"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {/* 手機 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">聯絡手機 <span className="text-red-500">*</span></label>
            <input
              {...register("phone", { required: "❌ 手機號碼為必填", minLength: { value: 8, message: "❌ 手機號碼格式不正確" } })}
              type="tel" className="input" placeholder="0912-345-678"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone.message}</p>}
          </div>

          {/* ===== 老師專屬欄位 ===== */}
          {role === "TEACHER" && (
            <div className="space-y-5 border-t border-gray-200 pt-5">
              <p className="text-sm font-bold text-primary-700 bg-primary-50 rounded-lg px-3 py-2">👨‍🏫 以下為老師必填資料</p>

              {/* 照片 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">老師照片 <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => fileRef.current?.click()}
                    className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer border-2 overflow-hidden transition-colors ${photoError ? "border-red-500 bg-red-50" : "border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"}`}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="預覽" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className={`w-7 h-7 ${photoError ? "text-red-400" : "text-gray-400"}`} />
                    )}
                  </div>
                  <div>
                    <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary text-sm">選擇照片</button>
                    <p className="text-xs text-gray-400 mt-1">支援 JPG、PNG，建議正方形</p>
                    {photoError && <p className="text-red-500 text-xs mt-1 font-medium">❌ 請上傳老師照片</p>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </div>
              </div>

              {/* 個人簡介 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">個人簡介 <span className="text-red-500">*</span></label>
                <div className="bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 mb-2">
                  <p className="text-amber-800 text-xs font-medium">⚠️ 家長會依據簡介選擇老師，請詳細填寫教學經歷、擅長科目及教學風格</p>
                </div>
                <textarea
                  {...register("bio", {
                    validate: (v) => role !== "TEACHER" || (v && v.trim().length >= 20) || "❌ 個人簡介為必填，至少 20 個字",
                  })}
                  className="input resize-none" rows={5}
                  placeholder="例如：我是台大數學系畢業，有 3 年家教經驗，擅長用生活化例子解說數學..."
                />
                {errors.bio && (
                  <p className="text-red-500 text-sm mt-1 font-medium bg-red-50 border border-red-300 rounded px-3 py-2">{errors.bio.message}</p>
                )}
              </div>

              {/* 時薪 + 年資 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">時薪 (NTD) <span className="text-red-500">*</span></label>
                  <input
                    {...register("hourlyRate", { required: "必填", min: { value: 100, message: "最低 100" }, valueAsNumber: true })}
                    type="number" className="input" placeholder="500"
                  />
                  {errors.hourlyRate && <p className="text-red-500 text-xs mt-1">{errors.hourlyRate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">教學年資 <span className="text-red-500">*</span></label>
                  <input
                    {...register("experience", { required: "必填", min: { value: 0, message: "不能為負數" }, valueAsNumber: true })}
                    type="number" className="input" placeholder="3"
                  />
                  {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience.message}</p>}
                </div>
              </div>

              {/* 學歷 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">學歷 <span className="text-red-500">*</span></label>
                <input
                  {...register("education", { validate: (v) => role !== "TEACHER" || (!!v && v.trim().length > 0) || "請填寫學歷" })}
                  className="input" placeholder="台灣大學 數學系"
                />
                {errors.education && <p className="text-red-500 text-xs mt-1">{errors.education.message}</p>}
              </div>

              {/* 公開手機 + 試上 */}
              <div className="space-y-2">
                <div
                  onClick={() => setShowPhone((v) => !v)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors select-none ${showPhone ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className={`w-10 h-6 rounded-full flex items-center transition-colors flex-shrink-0 ${showPhone ? "bg-green-500" : "bg-gray-300"}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${showPhone ? "translate-x-4" : "translate-x-0"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">在「尋找老師」頁面公開顯示手機號碼</p>
                    <p className="text-xs text-gray-400">{showPhone ? "✅ 家長可直接看到並撥打您的手機" : "關閉 — 手機號碼不對外公開"}</p>
                  </div>
                </div>
                <div
                  onClick={() => setTrialClass((v) => !v)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors select-none ${trialClass ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className={`w-10 h-6 rounded-full flex items-center transition-colors flex-shrink-0 ${trialClass ? "bg-blue-500" : "bg-gray-300"}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${trialClass ? "translate-x-4" : "translate-x-0"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">開放學生試上</p>
                    <p className="text-xs text-gray-400">{trialClass ? "✅ 開放學生申請試上一堂課" : "關閉 — 不開放試上"}</p>
                  </div>
                </div>
              </div>

              {/* 教授科目 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  教授科目 <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal ml-1">（至少選一項）</span>
                </label>
                <div className={`flex flex-wrap gap-2 p-3 rounded-xl border-2 ${subjectError ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
                  {SUBJECTS.map((s) => (
                    <button
                      key={s} type="button" onClick={() => toggleSubject(s)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedSubjects.includes(s) ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {subjectError && <p className="text-red-500 text-xs mt-1 font-medium">❌ 請至少選擇一個教授科目</p>}
              </div>

              {/* 可授課時段 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  可授課時段（天） <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal ml-1">（至少選一天）</span>
                </label>
                <div className={`grid grid-cols-4 gap-2 p-3 rounded-xl border-2 ${availError ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
                  {DAYS.map((day) => (
                    <button
                      key={day} type="button"
                      onClick={() => { setAvailError(false); setAvailability((prev) => ({ ...prev, [day]: !prev[day] })); }}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                        availability[day] ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {DAY_LABELS[day]}
                    </button>
                  ))}
                </div>
                {availError && <p className="text-red-500 text-xs mt-1 font-medium">❌ 請至少選擇一個可授課天數</p>}
              </div>
            </div>
          )}

          {/* 三項條款同意 */}
          <div className="space-y-3">
            {[
              { href: "/disclaimer", label: "免責聲明", agreed: agreedDisclaimer, set: setAgreedDisclaimer },
              { href: "/privacy",    label: "隱私權政策", agreed: agreedPrivacy,    set: setAgreedPrivacy },
              { href: "/terms",      label: "服務條款",   agreed: agreedTerms,      set: setAgreedTerms },
            ].map(({ href, label, agreed, set }) => (
              <div
                key={href}
                onClick={() => { set(!agreed); setShowAgreeAlert(false); }}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors select-none ${
                  agreed ? "border-primary-500 bg-primary-50" : showAgreeAlert && !agreed ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  agreed ? "bg-primary-600 border-primary-600" : showAgreeAlert && !agreed ? "border-red-500" : "border-gray-400"
                }`}>
                  {agreed && <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <p className="text-sm text-gray-700">
                  我已閱讀並同意{" "}
                  <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-primary-600 font-bold underline hover:text-primary-700">
                    TutorLink {label}
                  </a>
                </p>
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base font-bold">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />建立中...</> : "建立帳號"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          已有帳號？{" "}
          <Link href="/login" className="text-primary-600 font-medium hover:underline">立即登入</Link>
        </p>
      </div>

      {/* 未勾選條款警示 Modal */}
      {showAgreeAlert && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">請勾選所有條款</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              您必須閱讀並勾選同意「免責聲明」、「隱私權政策」及「服務條款」後，才能完成註冊。
            </p>
            <button
              onClick={() => { setShowAgreeAlert(false); setAgreedDisclaimer(true); setAgreedPrivacy(true); setAgreedTerms(true); }}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl mb-2"
            >
              ✅ 我全部同意
            </button>
            <button onClick={() => setShowAgreeAlert(false)} className="w-full py-2 text-gray-400 text-sm hover:text-gray-600">
              返回查看
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
