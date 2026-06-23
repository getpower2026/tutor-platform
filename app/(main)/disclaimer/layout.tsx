import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "免責聲明 | TutorLink",
  description: "TutorLink 平台免責聲明與使用條款。",
  robots: { index: false },
};

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
