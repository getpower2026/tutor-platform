"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { BookOpen, Loader2 } from "lucide-react";

type FormData = { email: string; password: string };

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { ...data, redirect: false });
    if (res?.error) {
      setError("Email 或密碼錯誤");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-primary-600">
            <BookOpen className="w-7 h-7" />
            給力一對一線上家教
          </Link>
          <h1 className="text-2xl font-bold mt-4">歡迎回來</h1>
          <p className="text-gray-500 mt-1">登入你的帳號</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              {...register("email", { required: "請輸入 Email" })}
              type="email"
              className="input"
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密碼</label>
            <input
              {...register("password", { required: "請輸入密碼" })}
              type="password"
              className="input"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "登入"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          還沒有帳號？{" "}
          <Link href="/register" className="text-primary-600 font-medium hover:underline">立即註冊</Link>
        </p>
      </div>
    </div>
  );
}
