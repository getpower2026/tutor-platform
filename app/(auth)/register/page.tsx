"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { BookOpen, Loader2, AlertTriangle } from "lucide-react";

type FormData = {
  name: string;
  email: string;
  password: string;
  role: "STUDENT" | "TEACHER";
  phone: string;
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

  const allAgreed = agreedDisclaimer && agreedPrivacy && agreedTerms;

  const onSubmit = async (data: FormData) => {
    if (!allAgreed) {
      setShowAgreeAlert(true);
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      setError(err.message || "註冊失敗");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    router.push(data.role === "TEACHER" ? "/dashboard/profile" : "/teachers");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="card p-8 w-full max-w-md">
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
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input {...register("name", { required: "請輸入姓名" })} className="input" placeholder="王小明" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*必填</span></label>
            <input {...register("email", { required: "❌ Email 為必填，老師通知將發送至此信箱" })} type="email" className="input" placeholder="your@email.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
            {!errors.email && role === "TEACHER" && (
              <p className="text-red-600 text-xs mt-1 font-medium">⚠️ 老師請填寫常用信箱，當學生預約上課時，系統將以此 Email 通知您。</p>
            )}
            {!errors.email && role === "STUDENT" && (
              <p className="text-amber-600 text-xs mt-1 font-medium">⚠️ 請填寫常用信箱，老師接受或拒絕預約時，通知將發送至此信箱。</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密碼</label>
            <input
              {...register("password", { required: "請輸入密碼", minLength: { value: 8, message: "密碼至少 8 個字元" } })}
              type="password"
              className="input"
              placeholder="至少 8 個字元"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">聯絡手機 <span className="text-red-500">*必填</span></label>
            <input
              {...register("phone", { required: "❌ 手機號碼為必填", minLength: { value: 8, message: "❌ 手機號碼格式不正確" } })}
              type="tel"
              className="input"
              placeholder="0912-345-678"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone.message}</p>}
          </div>

          {/* 三項條款同意 */}
          <div className="space-y-3">
            {[
              { key: "disclaimer" as const, href: "/disclaimer", label: "免責聲明", agreed: agreedDisclaimer, set: setAgreedDisclaimer },
              { key: "privacy"    as const, href: "/privacy",    label: "隱私權政策", agreed: agreedPrivacy,    set: setAgreedPrivacy },
              { key: "terms"      as const, href: "/terms",      label: "服務條款",   agreed: agreedTerms,      set: setAgreedTerms },
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
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary-600 font-bold underline hover:text-primary-700"
                  >
                    TutorLink {label}
                  </a>
                </p>
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "建立帳號"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          已有帳號？{" "}
          <Link href="/login" className="text-primary-600 font-medium hover:underline">立即登入</Link>
        </p>
      </div>

      {/* 未勾選警示 Modal */}
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
            <button
              onClick={() => setShowAgreeAlert(false)}
              className="w-full py-2 text-gray-400 text-sm hover:text-gray-600"
            >
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
