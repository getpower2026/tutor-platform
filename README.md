# TutorLink - 一對一家教平台

## 快速開始

### 1. 安裝 Node.js
前往 https://nodejs.org 下載並安裝 LTS 版本。

### 2. 安裝依賴
```bash
cd tutor-platform
npm install
```

### 3. 設定環境變數
```bash
cp .env.example .env
```
編輯 `.env`，填入以下服務的金鑰：

| 服務 | 說明 | 取得方式 |
|------|------|----------|
| PostgreSQL | 資料庫 | 本地安裝或用 [Supabase](https://supabase.com) 免費版 |
| NextAuth | 登入系統 | 隨機產生：`openssl rand -base64 32` |
| Daily.co | 視訊通話 | [daily.co](https://daily.co) 免費註冊 |
| Stripe | 金流付款 | [stripe.com](https://stripe.com) 測試模式 |

### 4. 初始化資料庫
```bash
npm run db:push    # 建立資料表
npm run db:seed    # 建立示範老師資料
```

### 5. 啟動開發伺服器
```bash
npm run dev
```

開啟 http://localhost:3000

---

## 平台功能

- **首頁** `/` — 介紹、CTA
- **老師列表** `/teachers` — 搜尋、篩選老師
- **老師詳細** `/teachers/[id]` — 老師介紹、預約
- **登入/註冊** `/login` `/register` — 學生/老師帳號
- **控制台** `/dashboard` — 預約管理
- **老師編輯** `/dashboard/profile` — 填寫個人檔案
- **預約確認** `/booking/[id]` — 付款結果
- **視訊教室** `/room/[id]` — Daily.co 視訊

## 技術架構

- **前端**: Next.js 14 (App Router) + Tailwind CSS
- **後端**: Next.js API Routes
- **資料庫**: PostgreSQL + Prisma ORM
- **認證**: NextAuth.js (Email + Google)
- **視訊**: Daily.co WebRTC SDK
- **金流**: Stripe (支援台灣信用卡)

## 平台抽成機制

平台預設抽成 15%（可在 `.env` 的 `PLATFORM_FEE_PERCENT` 修改）。
付款由 Stripe 處理，課程完成後自動撥款給老師。
