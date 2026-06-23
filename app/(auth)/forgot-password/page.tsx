"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Loader2, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setSent(true);
    } else {
      const d = await res.json();
      setError(d.message || "發生錯誤，請稍後再試");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-primary-600">
            <BookOpen className="w-7 h-7" />
            TutorLink
          </Link>
          <h1 className="text-2xl font-bold mt-4">忘記密碼</h1>
          <p className="text-gray-500 text-sm mt-2">輸入您的 Email，我們將發送重設密碼連結</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-bold text-lg mb-2">信件已寄出！</h2>
            <p className="text-gray-500 text-sm mb-6">請檢查 <strong>{email}</strong> 的收件匣，點擊信中連結重設密碼。連結將在 1 小時後失效。</p>
            <Link href="/login" className="btn-primary w-full block text-center">返回登入</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="your@email.com"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "發送重設連結"}
            </button>
            <p className="text-center text-sm text-gray-500">
              想起密碼了？{" "}
              <Link href="/login" className="text-primary-600 font-medium hover:underline">立即登入</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
