import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服務條款 | TutorLink",
  description: "TutorLink 平台服務條款，說明平台性質、使用者責任及相關規範。",
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
