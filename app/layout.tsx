import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

const noto = Noto_Sans_TC({ subsets: ["latin"], variable: "--font-noto" });

export const metadata: Metadata = {
  title: "給力一對一線上家教",
  description: "找到最適合你的老師，在家就能學習",
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
