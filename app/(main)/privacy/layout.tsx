import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隱私權政策 | TutorLink",
  description: "TutorLink 平台隱私權政策，說明個人資料蒐集、處理、利用及保護方式。",
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
