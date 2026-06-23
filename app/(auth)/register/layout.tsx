import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "免費註冊 | TutorLink 家教平台",
  description: "免費加入 TutorLink，學生可預約家教老師，老師可建立個人檔案接受學生預約，線上一對一視訊教學。",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
