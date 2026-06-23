import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "上課說明 | TutorLink 家教平台使用教學",
  description: "詳細說明如何在 TutorLink 上找家教、預約老師、進入視訊教室上課。包含老師註冊教學與學生使用步驟。",
  alternates: { canonical: "https://www.tutorlink.cc/guide" },
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
