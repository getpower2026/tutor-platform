"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { UserCheck, Search, CalendarCheck, Video, BookOpen, Phone, CheckCircle, ChevronRight, Monitor, Tablet, PenLine, Wifi, Eye } from "lucide-react";

function PencilToolHint() {
  const tools = ["🔒", "✋", "↖", "▭", "◇", "○", "→", "—", "✏️", "A", "🖼", "⬜", "△"];
  return (
    <div style={{ marginTop: "14px", background: "#fdf4ff", border: "1px solid #e9d5ff", borderRadius: "12px", padding: "12px 14px" }}>
      <p style={{ fontSize: "12px", color: "#7c3aed", fontWeight: "bold", marginBottom: "8px" }}>▼ Excalidraw 工具列 — 請點第 7 個「畫筆」（紅框）</p>
      <div style={{ display: "flex", gap: "2px", flexWrap: "wrap", alignItems: "center" }}>
        {tools.map((t, i) => (
          <div key={i} style={{
            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "6px", fontSize: "15px",
            background: i === 8 ? "#fff0f0" : "#f9fafb",
            border: i === 8 ? "2px solid #ef4444" : "1px solid #e5e7eb",
            boxShadow: i === 8 ? "0 0 0 2px #fca5a5" : "none",
            fontWeight: i === 8 ? "bold" : "normal",
            position: "relative",
          }}>
            {t}
            {i === 8 && (
              <span style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", fontSize: "10px", color: "#ef4444", fontWeight: "bold", whiteSpace: "nowrap" }}>← 點這個</span>
            )}
          </div>
        ))}
      </div>
      <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "8px" }}>點一下畫筆後，在白板上劃一次，白板就會正常顯示</p>
    </div>
  );
}

const TEACHER_STEPS: Array<{ icon: any; step: string; title: string; color: string; items: string[]; showPencilHint?: boolean }> = [
  {
    icon: UserCheck,
    step: "第一步",
    title: "註冊老師帳號",
    color: "bg-blue-50 text-blue-600",
    items: [
      "前往首頁，點擊「成為老師」免費註冊",
      "填寫姓名、常用 Email（學生預約時通知用）、手機號碼",
      "選擇角色：我是老師",
      "設定至少 8 個字元的密碼",
    ],
  },
  {
    icon: BookOpen,
    step: "第二步",
    title: "建立個人檔案",
    color: "bg-purple-50 text-purple-600",
    items: [
      "登入後點右上角「控制台」→「編輯個人檔案」",
      "上傳個人照片（讓家長認識您）",
      "填寫個人簡介、教學風格、學歷背景",
      "選擇教授科目（可多選）",
      "設定時薪與教學年資",
      "填寫手機號碼（家長必須經過你按同意後才會看到）",
      "填寫完畢後按「儲存」",
    ],
  },
  {
    icon: CalendarCheck,
    step: "第三步",
    title: "接受或拒絕預約",
    color: "bg-amber-50 text-amber-600",
    items: [
      "當學生送出預約申請，您會收到 Email 通知",
      "登入後至「控制台」查看待確認預約",
      "點「接受」→ 學生會收到確認通知並看到您的電話",
      "點「拒絕」→ 學生會收到拒絕通知",
      "接受後請自行與家長電話聯繫，討論收費方式與上課時間",
    ],
  },
  {
    icon: Video,
    step: "第四步",
    title: "進入視訊教室上課",
    color: "bg-green-50 text-green-600",
    items: [
      "預約確認後，控制台會出現「進入教室」按鈕",
      "上課時間到，點「進入教室」",
      "允許瀏覽器使用攝影機與麥克風",
      "等待學生進入同一個房間即可開始上課",
    ],
  },
  {
    icon: Monitor,
    step: "教學方法①",
    title: "電腦螢幕分享教學（最常用）",
    color: "bg-sky-50 text-sky-600",
    items: [
      "進入教室後，點下方工具列「分享螢幕」按鈕",
      "選擇要分享的視窗（例如 Word、PPT、瀏覽器、YouTube 影片）",
      "學生即可即時看到您的螢幕畫面",
      "適合：講義說明、題目解析、看影片、瀏覽網頁教學",
      "建議搭配麥克風同步說明，效果最佳",
    ],
  },
  {
    icon: PenLine,
    step: "教學方法②",
    title: "白板教學（彈出視窗，視訊不中斷）",
    color: "bg-violet-50 text-violet-600",
    items: [
      "進入視訊教室後，上方點「開啟白板」紫色按鈕",
      "白板會在新的彈出視窗開啟，視訊畫面不會中斷",
      "老師和學生都點「開啟白板」後，會自動進入同一個共用白板",
      "⚠️ 第一次進入白板，畫面可能顯示空白或歡迎畫面 — 請先點一下工具列第 7 個「畫筆工具」，白板就會正常顯示",
      "可用滑鼠或觸控筆在白板上書寫、畫圖、標示重點",
      "支援多種顏色、線條粗細、橡皮擦、文字輸入、幾何圖形",
      "適合：數學解題步驟、化學方程式、圖形說明、英文文法板書",
      "💡 若使用 iPad + Apple Pencil，搭配畫筆工具手寫效果最佳",
    ],
  },
  {
    icon: Tablet,
    step: "教學方法③",
    title: "iPad / 平板搭配手寫筆教學（推薦）",
    color: "bg-rose-50 text-rose-600",
    items: [
      "使用 iPad 或 Android 平板開啟瀏覽器，進入視訊教室",
      "搭配 Apple Pencil 或觸控筆，在虛擬白板上手寫板書",
      "書寫效果最接近實體黑板，學生體驗最佳",
      "也可用 iPad 分享螢幕，搭配 GoodNotes、Notability 等 App 教學",
      "⚠️ 建議使用 Safari 或 Chrome 瀏覽器開啟教室，效果最穩定",
    ],
  },
  {
    icon: Eye,
    step: "白板操作說明",
    title: "白板：老師寫、學生看得見嗎？",
    color: "bg-teal-50 text-teal-600",
    items: [
      "📋 白板是老師與學生「共用同一個白板」，雙方都能即時看到對方書寫的內容",
      "老師步驟：進入教室 → 點上方「開啟白板」紫色按鈕 → 白板在彈出視窗開啟",
      "學生步驟：進入教室 → 點上方「開啟白板」紫色按鈕 → 自動進入同一個白板",
      "⚠️ 第一次進入白板，畫面可能顯示空白 — 請點一下工具列第 7 個畫筆，就會正常顯示（見下圖紅框）",
      "老師可用橡皮擦清除，也可更換顏色、線條粗細",
      "學生也可以在白板上書寫，適合讓學生在白板上做練習題",
    ],
    showPencilHint: true,
  },
  {
    icon: Tablet,
    step: "iPad 使用說明",
    title: "iPad / 平板進入教室",
    color: "bg-rose-50 text-rose-600",
    items: [
      "iPad 使用 Safari 或 Chrome 瀏覽器直接開啟 tutorlink.cc，不需下載任何 App",
      "登入後至「控制台」→ 點「進入教室」即可",
      "⚠️ 進入教室時，瀏覽器會詢問是否允許使用「攝影機」和「麥克風」，請點「允許」",
      "搭配 Apple Pencil 或觸控筆，切換到「白板」頁籤即可手寫板書，效果最接近實體黑板",
      "💡 iPad 白板手寫建議：使用 Apple Pencil 時，在白板上用筆尖書寫即可，無需切換任何模式",
      "如果 Safari 無法使用攝影機，請前往 iPad「設定」→「Safari」→「攝影機」→ 設為「允許」",
      "建議老師用 iPad 手寫白板，同時學生用電腦觀看，搭配效果最佳",
    ],
  },
  {
    icon: Wifi,
    step: "注意事項",
    title: "上課前環境準備",
    color: "bg-gray-50 text-gray-600",
    items: [
      "確認網路穩定，建議使用 Wi-Fi，避免行動數據（易斷線）",
      "使用 Chrome 或 Safari 最新版本瀏覽器",
      "上課前測試攝影機與麥克風是否正常",
      "建議使用耳機，避免回音干擾",
      "準備好教材（PDF、圖片、題目）方便螢幕分享",
      "⚠️ 如遇視訊問題，請重新整理頁面或重新進入教室",
    ],
  },
];

const STUDENT_STEPS: Array<{ icon: any; step: string; title: string; color: string; items: string[]; showPencilHint?: boolean }> = [
  {
    icon: UserCheck,
    step: "第一步",
    title: "註冊學生帳號",
    color: "bg-blue-50 text-blue-600",
    items: [
      "前往首頁，點擊「免費開始」或「尋找老師」",
      "填寫姓名、常用 Email（老師回覆預約時通知用）、手機號碼",
      "選擇角色：我是學生",
      "設定至少 8 個字元的密碼",
      "⚠️ 請務必填寫常用信箱，老師接受或拒絕預約的通知將寄到此信箱",
    ],
  },
  {
    icon: Search,
    step: "第二步",
    title: "搜尋適合的老師",
    color: "bg-purple-50 text-purple-600",
    items: [
      "點上方「尋找老師」進入老師列表",
      "可依科目篩選（國文、英文、數學等）",
      "查看老師的簡介、教學年資、時薪",
      "點入老師頁面查看詳細資訊",
    ],
  },
  {
    icon: CalendarCheck,
    step: "第三步",
    title: "送出預約申請",
    color: "bg-amber-50 text-amber-600",
    items: [
      "在老師頁面點「預約上課」",
      "選擇上課日期與時段",
      "可填寫備註（例如：孩子目前年級、學習需求）",
      "點「確認預約」送出申請",
      "系統會發送通知給老師，請耐心等候老師回覆",
    ],
  },
  {
    icon: Phone,
    step: "第四步",
    title: "老師確認後聯繫",
    color: "bg-rose-50 text-rose-600",
    items: [
      "老師接受後，您會收到 Email 通知",
      "登入控制台可查看老師的手機號碼",
      "收到老師的 Email 也可看到老師手機號碼",
      "請主動致電老師，討論收費方式與正式上課時間",
      "⚠️ 本平台不收任何費用，收費方式請與老師直接協議",
    ],
  },
  {
    icon: Video,
    step: "第五步",
    title: "進入視訊教室上課",
    color: "bg-green-50 text-green-600",
    items: [
      "上課時間到，登入後至「控制台」",
      "點「進入教室」按鈕",
      "允許瀏覽器使用攝影機與麥克風",
      "第一次進入時會出現「Enter your name」，請輸入您的姓名",
      "畫面會出現「Are you ready to join?」，點「Join」按鈕進入教室",
      "等待老師進入同一個房間即可開始上課",
    ],
  },
  {
    icon: Eye,
    step: "白板操作說明",
    title: "怎麼看老師的白板內容？",
    color: "bg-teal-50 text-teal-600",
    items: [
      "進入教室後，上方有兩個頁籤：「視訊上課」和「白板」",
      "當老師在白板上書寫時，請點上方「白板」頁籤切換過去",
      "⚠️ 停留在「視訊上課」頁籤時，看不到白板內容，一定要切換到「白板」才能看到",
      "白板是共用的，學生也可以在白板上書寫，老師同樣能即時看到",
      "如果老師說「看白板」，請記得切換到白板頁籤",
    ],
  },
  {
    icon: Tablet,
    step: "iPad 使用說明",
    title: "用 iPad 或手機上課",
    color: "bg-rose-50 text-rose-600",
    items: [
      "用 iPad 或手機的 Safari / Chrome 瀏覽器開啟 tutorlink.cc，不需下載 App",
      "登入後至「控制台」→ 點「進入教室」",
      "⚠️ 瀏覽器會詢問是否允許「攝影機」和「麥克風」，請務必點「允許」",
      "如果 Safari 無法使用攝影機，請前往「設定」→「Safari」→「攝影機」→ 設為「允許」",
      "手機畫面較小，建議橫放使用，或改用平板、電腦效果更佳",
      "💡 建議使用 Wi-Fi 連線，行動數據容易造成畫面延遲或斷線",
    ],
  },
];

export default function GuidePage() {
  const [tab, setTab] = useState<"teacher" | "student">("student");

  const steps = tab === "teacher" ? TEACHER_STEPS : STUDENT_STEPS;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">上課說明</h1>
          <p className="text-gray-500">跟著步驟，輕鬆開始使用 TutorLink</p>
        </div>

        {/* Tab */}
        <div className="flex gap-3 mb-10 bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
          {(["student", "teacher"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${
                tab === t ? "bg-primary-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "student" ? "🎓 我是學生（家長）" : "👨‍🏫 我是老師"}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map(({ icon: Icon, step, title, color, items }, idx) => (
            <div key={idx} className="card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary-500 uppercase tracking-wide">{step}</p>
                  <h2 className="text-lg font-bold">{title}</h2>
                </div>
              </div>
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${item.startsWith("⚠️") ? "text-red-600 font-medium" : "text-gray-600"}`}>
                    {!item.startsWith("⚠️") && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {(steps[idx] as any).showPencilHint && <PencilToolHint />}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center space-y-3">
          {tab === "student" ? (
            <>
              <Link href="/register?role=student" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
                免費註冊學生帳號 <ChevronRight className="w-4 h-4" />
              </Link>
              <p className="text-sm text-gray-400">已有帳號？<Link href="/login" className="text-primary-600 hover:underline">立即登入</Link></p>
            </>
          ) : (
            <>
              <Link href="/register?role=teacher" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
                免費註冊老師帳號 <ChevronRight className="w-4 h-4" />
              </Link>
              <p className="text-sm text-gray-400">已有帳號？<Link href="/login" className="text-primary-600 hover:underline">立即登入</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
