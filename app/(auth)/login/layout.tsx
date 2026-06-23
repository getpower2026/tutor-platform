import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "登入 | TutorLink 家教平台",
  description: "登入 TutorLink，開始尋找家教老師或管理您的預約課程。",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
