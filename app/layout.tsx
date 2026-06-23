import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

const noto = Noto_Sans_TC({ subsets: ["latin"], variable: "--font-noto" });

export const metadata: Metadata = {
  title: "TutorLink｜免費家教媒合平台，線上一對一教學",
  description: "TutorLink 是免費的家教媒合平台，提供國小、國中、高中、高職線上一對一教學。輕鬆找到適合的家教老師，直接與老師聯繫，完全免費使用。",
  keywords: "家教, 線上家教, 一對一教學, 找家教, 家教平台, 國小家教, 國中家教, 高中家教, 線上教學, TutorLink",
  openGraph: {
    title: "TutorLink｜免費家教媒合平台",
    description: "免費找到最適合的家教老師，線上一對一教學，國小國中高中皆有。",
    url: "https://www.tutorlink.cc",
    siteName: "TutorLink",
    locale: "zh_TW",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className={noto.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
