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
          <h1 className="text-xl sm:text-5xl font-bold mb-6 leading-tight">
            <span className="bg-yellow-300 text-yellow-900 px-2 rounded">免費</span>在家就能學習<br />找到最適合你的老師
          </h1>
          <p className="text-base sm:text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
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

      {/* 免責聲明 */}
      <section className="bg-gray-900 text-white py-4 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-base font-bold text-yellow-300 tracking-wide">
            ⚠️ 本免費平台不負任何責任。請家長仔細篩選老師。請老師仔細篩選學生、家長。
          </p>
        </div>
      </section>

      {/* 免費聲明 */}
      <section className="bg-red-600 text-white py-5 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg font-bold tracking-wide">
            ⚠️ 注意！本平台不收任何費用，免費提供。家長與老師請自行談妥費用進行收費。
          </p>
          <p className="text-sm mt-1 text-red-100">
            建議家長上課前確認老師良民證、畢業證書或在學證明。
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">如何使用</h2>
          <p className="text-gray-500 text-center mb-12">三個簡單步驟，開始你的學習之旅</p>
          <div className="flex justify-center gap-16 flex-wrap">
            {[
              { icon: Search, step: "1", title: "搜尋老師", desc: "依科目、時段篩選，找到最適合的老師" },
              { icon: Video, step: "2", title: "預約上課", desc: "選擇時段，即刻確認預約，免費開始學習" },
              { icon: BookOpen, step: "3", title: "進入視訊平台", desc: "老師確認後，點「進入教室」即可線上上課" },
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


      {/* Subjects */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">學科教學</h2>
          <p className="text-gray-500 text-center mb-12">涵蓋 國小 國中 高中 高職，以及各大英語檢定</p>
          <div className="grid md:grid-cols-2 gap-8">

            {/* 學制 */}
            <div className="card p-6">
              <h3 className="font-bold text-lg text-primary-600 mb-4">📚 適用學制</h3>
              <div className="flex flex-wrap gap-2">
                {["國小", "國中", "高中", "高職"].map((s) => (
                  <span key={s} className="px-5 py-2.5 bg-primary-50 text-primary-700 rounded-full font-bold text-base">{s}</span>
                ))}
              </div>
            </div>

            {/* 國文 英文 數學 */}
            <div className="card p-6">
              <h3 className="font-bold text-lg text-primary-600 mb-4">✏️ 主科</h3>
              <div className="flex flex-wrap gap-2">
                {["國文", "英文", "數學"].map((s) => (
                  <span key={s} className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-full font-bold text-base">{s}</span>
                ))}
              </div>
            </div>

            {/* 社會 */}
            <div className="card p-6">
              <h3 className="font-bold text-lg text-primary-600 mb-4">🌏 社會領域</h3>
              <div className="flex flex-wrap gap-2">
                {["社會", "歷史", "地理", "公民"].map((s) => (
                  <span key={s} className="px-5 py-2.5 bg-green-50 text-green-700 rounded-full font-bold text-base">{s}</span>
                ))}
              </div>
            </div>

            {/* 自然 */}
            <div className="card p-6">
              <h3 className="font-bold text-lg text-primary-600 mb-4">🔬 自然領域</h3>
              <div className="flex flex-wrap gap-2">
                {["自然", "物理", "化學", "生物", "地科", "理化"].map((s) => (
                  <span key={s} className="px-5 py-2.5 bg-orange-50 text-orange-700 rounded-full font-bold text-base">{s}</span>
                ))}
              </div>
            </div>

            {/* 英檢 & 升學 */}
            <div className="card p-6 md:col-span-2">
              <h3 className="font-bold text-lg text-primary-600 mb-4">🏆 英語檢定 & 升學考試</h3>
              <div className="flex flex-wrap gap-2">
                {["全民英檢 (GEPT)", "多益 (TOEIC)", "劍橋英檢", "升私中"].map((s) => (
                  <span key={s} className="px-5 py-2.5 bg-purple-50 text-purple-700 rounded-full font-bold text-base">{s}</span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">為什麼選擇 TutorLink</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: "免費使用", desc: "平台完全免費，不收取任何手續費，老師與家長直接電話討論收費方式、上課時間" },
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
          <p className="text-red-600 text-center mb-12">14年一對一補教經驗，用心媒合每一位學生與老師</p>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            {/* Left: text */}
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>您好，我是汪主任，畢業於國立臺北教育大學。</p>
              <p>從事補教事業超過<strong>14年</strong>，長期專注於學生與老師的媒合服務，累積豐富的教學管理與學習輔導經驗。多年來，已成功協助無數學生找到適合的老師，也幫助許多老師發揮專業，創造雙贏的教學成果。</p>
              <p>在經營實體補習班的過程中，我深刻了解每位學生的學習需求都不同，因此始終堅持「<strong>因材施教、精準媒合</strong>」的理念，讓學生能夠找到最適合自己的老師，提升學習效率與成績表現。</p>
              <p>如今，我將14年的教學與媒合經驗延伸至線上平台，希望透過科技與專業服務，打破地域限制，讓更多學生都能享有優質的學習資源。</p>
              <p><span className="font-bold text-red-600">本平台提供免費使用的老師與學生媒合服務，</span>學生可依照需求尋找合適老師，老師也能免費刊登資料、拓展教學機會。我們致力於打造一個公開、透明且便利的教育媒合平台，降低尋找師資與學習資源的門檻，讓更多人受惠於優質教育。</p>
              <p>14年來，我不僅經營實體補習班，更親自參與學生學習規劃、家長溝通、師資招募與課程安排，累積豐富的實務經驗。我相信，好的教育不只是教學，更是為學生找到最適合的學習方式與老師。</p>
              <p>無論您是想提升學業成績、準備升學考試、學習語言、培養專業技能，或尋找適合自己的教學夥伴，我們都將以最認真的態度，協助您找到最適合的老師，開啟更有效率、更有成果的學習之路。</p>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="font-bold text-gray-800">汪主任｜<span className="text-red-600">14年補教經驗 × 師資媒合 × 免費使用平台</span></p>
                <p className="text-sm text-gray-500 mt-1">讓每位學生都能遇見好老師，讓每位老師都能找到適合的學生。</p>
              </div>
            </div>
            {/* Right: news + store */}
            <div className="grid grid-cols-1 gap-4">
              <img src="/founder-news.png" alt="汪主任接受媒體採訪" className="rounded-xl object-cover w-full h-72 shadow-md" />
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
        <div className="mb-3">
          <a
            href="https://line.me/ti/p/V2ivQqxGeK"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-colors text-sm"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
            LINE 聯絡汪主任
          </a>
          <p className="text-gray-500 text-xs mt-2">有任何網站問題或使用疑問，歡迎透過 LINE 與我們聯繫</p>
        </div>
        <div className="mb-2">
          <a href="/disclaimer" className="text-gray-500 hover:text-gray-300 underline text-xs">免責聲明</a>
        </div>
        © 2026 TutorLink. 保留所有權利。
      </footer>
    </div>
  );
}
