"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { BookOpen, Loader2 } from "lucide-react";

type FormData = {
  name: string;
  email: string;
  password: string;
  role: "STUDENT" | "TEACHER";
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

  const onSubmit = async (data: FormData) => {
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input {...register("email", { required: "請輸入 Email" })} type="email" className="input" placeholder="your@email.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            {role === "TEACHER" && (
              <p className="text-red-600 text-xs mt-1 font-medium">⚠️ 老師請填寫常用信箱，當學生預約上課時，系統將以此 Email 通知您。</p>
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
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "建立帳號"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          已有帳號？{" "}
          <Link href="/login" className="text-primary-600 font-medium hover:underline">立即登入</Link>
        </p>
      </div>
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
