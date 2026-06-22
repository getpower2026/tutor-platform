import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Search, Video, CreditCard, Star, BookOpen, Users, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            在家就能學習<br />找到最適合你的老師
          </h1>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            TutorLink 連結專業老師與求知學生，透過安全的視訊系統，隨時隨地一對一上課。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/teachers" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors text-lg">
              <Search className="w-5 h-5" />
              尋找老師
            </Link>
            <Link href="/register?role=teacher" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 text-white font-semibold rounded-xl border-2 border-primary-300 hover:bg-primary-400 transition-colors text-lg">
              成為老師
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">如何使用</h2>
          <p className="text-gray-500 text-center mb-12">三個簡單步驟，開始你的學習之旅</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Search, step: "1", title: "搜尋老師", desc: "依科目、價格、時段篩選，找到最適合的老師" },
              { icon: CreditCard, step: "2", title: "預約付款", desc: "選擇時段，線上安全付款，即刻確認預約" },
              { icon: Video, step: "3", title: "視訊上課", desc: "在平台內直接視訊，無需安裝任何軟體" },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-primary-600" />
                </div>
                <div className="text-sm font-bold text-primary-600 mb-2">步驟 {step}</div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { icon: Users, value: "500+", label: "專業老師" },
            { icon: BookOpen, value: "10,000+", label: "堂已完成課程" },
            { icon: Star, value: "4.9", label: "平均評分" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label}>
              <Icon className="w-8 h-8 text-primary-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">{value}</div>
              <div className="text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">為什麼選擇 TutorLink</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: "安全付款保障", desc: "透過 Stripe 國際支付，所有交易加密保護，課程完成後才撥款給老師" },
              { icon: Video, title: "高品質視訊", desc: "使用 Daily.co 專業視訊技術，支援螢幕分享、虛擬白板，上課體驗流暢" },
              { icon: Star, title: "真實評價系統", desc: "所有評價來自實際上過課的學生，確保資訊透明可信" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">創辦人介紹｜汪主任</h2>
          <p className="text-gray-500 text-center mb-12">14年一對一補教經驗，用心媒合每一位學生與老師</p>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            {/* Left: text */}
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>您好，我是汪主任。</p>
              <p>從事一對一補教事業超過<strong>14年</strong>，長期專注於學生與老師的媒合服務，累積豐富的教學管理與學習輔導經驗。多年來，已成功協助無數學生找到適合的老師，也幫助許多老師發揮專業，創造雙贏的教學成果。</p>
              <p>在經營實體一對一補習班的過程中，我深刻了解每位學生的學習需求都不同，因此始終堅持「<strong>因材施教、精準媒合</strong>」的理念，讓學生能夠找到最適合自己的老師，提升學習效率與成績表現。</p>
              <p className="font-bold text-red-600">如今，我將14年的實體教學經驗延伸至線上平台，希望透過科技與專業服務，打破地域限制，讓更多學生都能享有優質的一對一教學資源。</p>
              <p>無論您是想提升學業成績、準備升學考試，或是培養專業技能，我們都將用最認真的態度，協助您找到最適合的老師，開啟更有效率的學習之路。</p>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="font-bold text-gray-800">汪主任</p>
                <p className="text-sm text-gray-500">平台創辦人 ｜ 14年一對一補教經驗</p>
              </div>
            </div>
            {/* Right: news + store */}
            <div className="grid grid-cols-2 gap-4">
              <img src="/founder-news.png" alt="汪主任接受媒體採訪" className="rounded-xl object-cover w-full h-48 shadow-md" />
              <img src="/founder-store.jpg" alt="給力一對一實體教室外觀" className="rounded-xl object-cover w-full h-48 shadow-md" />
              <img src="/founder-class1.jpg" alt="教室環境1" className="rounded-xl object-cover w-full h-48 shadow-md" />
              <img src="/founder-class2.jpg" alt="教室環境2" className="rounded-xl object-cover w-full h-48 shadow-md" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">準備好開始了嗎？</h2>
        <p className="text-primary-100 mb-8">立即免費註冊，開始你的學習旅程</p>
        <Link href="/register" className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors text-lg">
          免費開始
        </Link>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        © 2024 TutorLink. 保留所有權利。
      </footer>
    </div>
  );
}
