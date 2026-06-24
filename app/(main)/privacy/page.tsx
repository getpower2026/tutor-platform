import { Navbar } from "@/components/layout/Navbar";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="card p-8 md:p-12">
          <h1 className="text-3xl font-bold mb-2">隱私權政策</h1>
          <p className="text-gray-500 text-sm mb-8">最後更新日期：2026年6月24日</p>

          <p className="text-gray-700 mb-8 leading-relaxed">
            歡迎您使用 TutorLink（以下簡稱「本平台」）。本平台重視您的個人資料保護與隱私權，為保障您的權益，特制定本隱私權政策，說明本平台蒐集、處理、利用及保護個人資料之方式。當您使用本平台服務時，即表示您已閱讀、了解並同意本隱私權政策之內容。
          </p>

          {[
            {
              title: "一、適用範圍",
              items: [
                "本隱私權政策適用於您使用本平台網站及相關服務時所提供之個人資料。",
                "本政策不適用於透過本平台連結至其他第三方網站之行為，該等網站應依其各自之隱私權政策辦理。",
              ],
            },
            {
              title: "三、個人資料蒐集目的",
              items: [
                "提供教師與學生之媒合服務。",
                "提供會員服務及功能。",
                "回覆使用者詢問與客服需求。",
                "發送系統通知或重要公告。",
                "維護網站安全與防範不法行為。",
                "統計分析及改善服務品質。",
                "配合法令規定及主管機關要求。",
                "其他與本平台營運相關之合理用途。",
              ],
            },
            {
              title: "四、個人資料利用方式",
              items: [
                "本平台僅於蒐集目的範圍內使用您的個人資料。",
                "除有下列情形外，本平台不會任意出售、交換、出租或提供您的個人資料予第三人：",
                "• 經您事先同意。",
                "• 法律規定或司法機關要求。",
                "• 為維護公共利益或避免重大危害。",
                "• 為保護本平台、其他使用者或第三人之合法權益。",
                "• 其他依法得提供之情形。",
              ],
            },
            {
              title: "五、教師公開資料",
              items: [
                "教師於本平台刊登之資料，包括但不限於姓名、教學科目、教學經歷、學歷、自我介紹、照片及其他公開資訊，將提供學生及家長瀏覽查詢。",
                "教師於刊登資料時，即表示同意本平台公開展示其所提供之資訊，以利媒合作業進行。",
                "教師應自行確認所提供資料之真實性、合法性及可公開性。",
              ],
            },
            {
              title: "六、Cookie 使用",
              items: [
                "為提升服務品質及使用體驗，本平台可能使用 Cookie 技術記錄使用者偏好及網站使用情形。",
                "使用者可自行於瀏覽器設定拒絕 Cookie 或於使用後清除 Cookie，但部分網站功能可能因此無法正常運作。",
              ],
            },
            {
              title: "七、資料安全",
              items: [
                "本平台將採取合理之技術與管理措施保護個人資料安全，避免未經授權之存取、洩漏、竄改、毀損或其他侵害情形。",
                "惟網際網路資料傳輸仍存在一定風險，本平台無法保證資料傳輸或儲存之絕對安全。",
                "使用者應妥善保管自身帳號、密碼及個人資訊，避免遭他人冒用。",
              ],
            },
            {
              title: "八、個人資料之更正與刪除",
              items: [
                "使用者得依相關法令規定，向本平台請求：查詢或閱覽個人資料、製給個人資料複製本、補充或更正個人資料、停止蒐集處理或利用個人資料、刪除個人資料。",
                "本平台得於確認申請人身分後，依法律規定及合理作業期間內辦理。",
              ],
            },
            {
              title: "九、未成年人保護",
              items: [
                "未滿十八歲之使用者，應於法定代理人或監護人同意下使用本平台服務。",
                "法定代理人或監護人應負責監督未成年人於本平台之使用行為。",
              ],
            },
            {
              title: "十、隱私權政策之修訂",
              items: [
                "本平台有權隨時修改本隱私權政策內容。",
                "修訂後之內容將公布於本平台網站，不另行個別通知。",
                "使用者於修訂後繼續使用本平台服務者，視為已同意修訂後之內容。",
              ],
            },
            {
              title: "十一、聯絡方式",
              items: [
                "如對本隱私權政策有任何疑問，或欲行使個人資料查詢、更正、刪除等權利，請透過本平台網站下方之官方 LINE 與我們聯繫。",
              ],
            },
          ].map(({ title, items }) => (
            <div key={title} className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li key={i} className="text-gray-700 leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          ))}

          {/* 二、蒐集之個人資料 — 表格式呈現 */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">二、蒐集之個人資料</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-indigo-50 rounded-xl p-4">
                <h3 className="font-semibold text-indigo-800 mb-2">（一）教師資料</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {["姓名或暱稱","聯絡電話","電子郵件","LINE ID 或其他聯絡方式","教學科目","學歷","教學經歷","教學地區","自我介紹","個人照片","其他自行提供之資訊"].map(t => (
                    <li key={t}>• {t}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <h3 className="font-semibold text-green-800 mb-2">（二）學生或家長資料</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {["姓名或暱稱","聯絡電話","電子郵件","LINE ID 或其他聯絡方式","學習需求","上課地區","其他自行提供之資訊"].map(t => (
                      <li key={t}>• {t}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">（三）系統自動蒐集資料</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {["IP 位址","瀏覽器類型","裝置資訊","網站瀏覽紀錄","Cookie 資訊","使用時間及操作紀錄"].map(t => (
                      <li key={t}>• {t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
            <p className="font-semibold text-gray-700">TutorLink</p>
            <p>永久免費教師與學生媒合平台</p>
          </div>
        </div>
      </div>
    </div>
  );
}
