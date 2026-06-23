import { Navbar } from "@/components/layout/Navbar";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="card p-8 md:p-12">
          <h1 className="text-3xl font-bold mb-2">TutorLink 免責聲明</h1>
          <p className="text-gray-500 text-sm mb-8">最後更新：2026 年</p>

          <p className="text-gray-700 leading-relaxed mb-6">
            歡迎使用 TutorLink（以下簡稱「本平台」）。為保障所有使用者權益，請於使用本平台前詳細閱讀本免責聲明。
          </p>
          <p className="text-gray-700 leading-relaxed mb-10">
            使用者於註冊帳號、刊登資料、瀏覽網站、聯繫會員或使用本平台任何服務時，即表示已閱讀、瞭解並同意遵守本免責聲明之全部內容。
          </p>

          <Section title="一、平台性質聲明">
            <p>TutorLink 為提供教師與學生（或家長）資訊交流及媒合服務之網路平台。</p>
            <p>本平台僅提供資訊刊登、搜尋、瀏覽及聯繫功能，不參與雙方之聘僱關係、委任關係、課程契約、補習契約或其他法律關係之成立與履行。</p>
            <p>教師與學生（或家長）透過本平台建立聯繫後，其課程內容、教學方式、教學品質、上課地點、上課時間、課程費用、付款方式及其他合作條件，均由雙方自行協議並自行承擔相關權利義務。</p>
          </Section>

          <Section title="二、費用與金流責任">
            <p>TutorLink 為永久免費之資訊媒合平台，不向教師或學生（家長）收取任何媒合費、會員費、刊登費、抽成費、成交費或其他任何費用。</p>
            <p>本平台不經手任何學費、課程費用、訂金、教材費、交通費或其他任何款項，所有金流均由教師與學生（或家長）自行協議、自行支付及自行收取。</p>
            <p>本平台非課程契約之當事人，亦非金流保管機構、付款代理人或第三方支付服務提供者，因此對於任何付款、收款、退款、退費、欠款、呆帳、詐欺、違約或其他金錢糾紛，概不負任何法律責任。</p>
            <p className="mb-2">包括但不限於：</p>
            <ul>
              <li>家長繳費後未獲得約定課程服務。</li>
              <li>教師完成授課後未收到課程費用。</li>
              <li>課程品質不符預期所衍生之退費爭議。</li>
              <li>課程中途終止產生之費用爭議。</li>
              <li>匯款錯誤、轉帳失敗或其他付款問題。</li>
              <li>因任何原因造成之財產損失。</li>
            </ul>
            <p>上述事項均應由教師與學生（或家長）自行協商處理或循法律程序解決，與本平台無涉。</p>
          </Section>

          <Section title="三、教師資格與資料真實性">
            <p>教師於本平台刊登之學歷、經歷、證照、專長、教學經驗、得獎紀錄及其他相關資料，均由教師自行提供並自行負責。</p>
            <p>本平台無法逐一查核所有資料之真實性、完整性及正確性，因此不對任何教師資料作任何明示或默示之保證。</p>
            <p>學生或家長應自行判斷及查證教師資格是否符合自身需求。</p>
          </Section>

          <Section title="四、教學品質與學習成果">
            <p>本平台不保證任何教師之教學能力、教學品質、專業程度或服務水準。</p>
            <p>本平台亦不保證學生之學習成果、成績進步、考試錄取、證照取得或任何特定結果。</p>
            <p>所有教學成果均受學生學習態度、出席情況、個人能力、家庭環境及其他因素影響，本平台不負任何保證責任。</p>
          </Section>

          <Section title="五、教材與智慧財產權">
            <p>教師於授課過程中使用之教材、講義、圖片、影音、題庫、軟體、電子檔案及其他教學內容，應自行確認符合著作權法及相關智慧財產權規定。</p>
            <p>若教師使用未經授權之教材或侵害第三人智慧財產權而衍生任何民事、刑事或行政責任，均由教師自行承擔，與本平台無關。</p>
          </Section>

          <Section title="六、人身安全與行為責任">
            <p>本平台無法保證任何會員之品行、誠信、人格特質、專業能力、身心狀況或適任性。</p>
            <p className="mb-2">教師、學生或家長於課程進行期間，如發生下列情形，包括但不限於：</p>
            <ul>
              <li>詐欺行為</li>
              <li>暴力行為</li>
              <li>恐嚇行為</li>
              <li>騷擾行為</li>
              <li>性騷擾事件</li>
              <li>性侵害事件</li>
              <li>個人資料外洩</li>
              <li>誹謗行為</li>
              <li>妨害名譽行為</li>
              <li>違反法令之行為</li>
            </ul>
            <p>均應由行為人自行承擔相關法律責任，與本平台無涉。</p>
          </Section>

          <Section title="七、線上與實體授課風險">
            <p>教師與學生（或家長）自行約定之線上課程或實體課程，均屬雙方自行安排之行為。</p>
            <p>因實體授課所發生之人身傷害、財物損失、交通事故、意外事件或其他風險，以及因線上授課所發生之設備故障、網路中斷、帳號遭盜用、資料遺失等情形，均由雙方自行承擔，本平台不負任何責任。</p>
          </Section>

          <Section title="八、會員資料與背景查核">
            <p>本平台有權但無義務審查會員所提供之資料。</p>
            <p>本平台不保證會員身分之真實性、合法性或適任性。</p>
            <p>教師、學生及家長應自行進行必要之背景查核、資格確認及風險評估。</p>
          </Section>

          <Section title="九、平台服務中斷">
            <p>本平台將盡力維持系統正常運作，但不保證網站服務不中斷、不延遲、不發生錯誤或完全符合所有使用者需求。</p>
            <p>因系統維護、設備故障、駭客攻擊、病毒感染、網路異常、天災、政府命令或其他不可抗力因素所造成之服務中斷、資料遺失或其他損害，本平台不負任何責任。</p>
          </Section>

          <Section title="十、責任限制">
            <p className="mb-2">在法律允許之最大範圍內，本平台對於因使用或無法使用本平台服務所產生之任何直接、間接、附帶、特殊、懲罰性或衍生性損害，包括但不限於：</p>
            <ul>
              <li>財產損失</li>
              <li>商譽損失</li>
              <li>營業損失</li>
              <li>資料遺失</li>
              <li>利潤損失</li>
              <li>其他任何損害</li>
            </ul>
            <p>均不負任何賠償責任。</p>
          </Section>

          <Section title="十一、賠償責任">
            <p>若使用者因違反法令、侵害第三人權利、提供不實資料或違反本平台規定，而導致本平台遭受任何損害、訴訟、罰款、求償或其他法律責任時，該使用者應負完全賠償責任。</p>
          </Section>

          <Section title="十二、準據法與管轄法院">
            <p>本免責聲明之解釋、適用及相關爭議，均以中華民國（臺灣）法律為準據法。</p>
            <p>因本平台服務所生之任何爭議，雙方同意以臺灣新北地方法院為第一審管轄法院。</p>
          </Section>

          <Section title="十三、條款修訂">
            <p>本平台保留隨時修改、增訂或刪除本免責聲明內容之權利。</p>
            <p>修改後之內容公布於網站時即生效，使用者於修改後繼續使用本平台服務者，視為已同意接受修改後之內容。</p>
          </Section>

          <div className="mt-10 p-6 bg-red-50 border border-red-200 rounded-xl">
            <h2 className="text-lg font-bold text-red-700 mb-3">法律嚴正聲明</h2>
            <p className="text-red-700 text-sm leading-relaxed mb-3">
              TutorLink 僅提供資訊刊登與媒合服務，並非教師、學生或家長之代理人、雇主、仲介機構、補習班經營者、課程提供者或金流服務商。
            </p>
            <p className="text-red-700 text-sm leading-relaxed">
              任何教師與學生（家長）間所發生之教學、付款、退費、智慧財產權、人身安全、民事、刑事、行政或其他法律爭議，均應由雙方自行負責處理，與本平台無涉。
            </p>
          </div>

          <p className="text-center text-gray-500 text-sm mt-10 font-medium">
            使用本平台即表示使用者已閱讀、瞭解並同意本免責聲明全部內容。
          </p>
          <p className="text-center text-gray-400 text-xs mt-3">© 2026 TutorLink. 保留所有權利。</p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">{title}</h2>
      <div className="space-y-3 text-gray-700 leading-relaxed text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {children}
      </div>
    </div>
  );
}
