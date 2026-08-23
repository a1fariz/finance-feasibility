# 📊 Finance Feasibility — AI-Powered Investment Feasibility & Valuation Suite

<p align="center">
  <img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19"/>
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Node.js%20%2F%20Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
  <img src="https://img.shields.io/badge/ORM-Drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM"/>
  <img src="https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini AI"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
</p>

**Finance Feasibility** adalah aplikasi web full-stack modern yang mengintegrasikan mesin komputasi kelayakan finansial mendalam dengan kecerdasan buatan (**Google Gemini AI**). Aplikasi ini membantu pelaku bisnis, analis keuangan, dan investor dalam menganalisis kelayakan proyek investasi melalui kalkulasi otomatis metrik finansial (NPV, IRR, ROI, Payback Period) serta laporan analisis strategis tingkat eksekutif.

🌐 **Live Demo:** [finance-feasibility.alfarizi.my.id](https://finance-feasibility.alfarizi.my.id/)

---

## 📑 Daftar Isi
- [Fitur Unggulan](#-fitur-unggulan)
- [Teknologi & Stack](#-teknologi--stack)
- [Metrik Finansial yang Dihitung](#-metrik-finansial-yang-dihitung)
- [Panduan Menjalankan Secara Lokal](#-panduan-menjalankan-secara-lokal)
- [Panduan Deployment Vercel](#-panduan-deployment-vercel)
- [Author & Lisensi](#-author--lisensi)

---

## ✨ Fitur Unggulan

- 💼 **Manajemen Proyek Investasi Komprehensif**: Buat, duplikasi, sunting, dan kelola skenario investasi modal (*Capex* dan *Opex*) multi-tahun.
- 📈 **Financial Engine Presisi**: Kalkulasi instan otomatis untuk:
  - **Net Present Value (NPV)** dengan tingkat diskonto fleksibel.
  - **Internal Rate of Return (IRR)** berbasis iterasi numerik.
  - **Return on Investment (ROI)** & Profitability Index (PI).
  - **Break-Even & Payback Period** (waktu pengembalian modal modal).
- 🤖 **AI Strategic Insights (Google Gemini AI)**: Menghasilkan ringkasan eksekutif, identifikasi kekuatan finansial, analisis risiko mendalam, dan rekomendasi mitigasi strategis secara otomatis.
- 🔐 **Autentikasi Aman**: Firebase Authentication (Google One-Tap / OAuth Sign-In) dengan validasi sesi token aman di backend.
- 📄 **Ekspor Laporan PDF Profesional**: Unduh ringkasan kajian kelayakan proyek dan rekomendasi AI ke dalam format dokumen PDF yang siap dipresentasikan ke stakeholder.
- 🎨 **Antarmuka Premium**: Visualisasi interaktif menggunakan Recharts, animasi transisi Framer Motion, serta desain bertema gelap/terang modern dengan Tailwind CSS.

---

## 🛠️ Teknologi & Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Framer Motion, Lucide React.
- **Backend / API**: Node.js & Express.js (Arsitektur Serverless-ready untuk Vercel Functions).
- **Database & ORM**: PostgreSQL (Supabase) via **Drizzle ORM**.
- **Otentikasi**: Firebase Authentication & Firebase Admin SDK.
- **Kecerdasan Buatan**: `@google/genai` (Google Gemini 2.0 Flash / 1.5 Flash).
- **Ekspor Dokumen**: JSPDF / HTML2Canvas untuk rendering laporan analitis.

---

## 📊 Metrik Finansial yang Dihitung

| Metrik | Singkatan | Deskripsi |
|---|---|---|
| **Net Present Value** | **NPV** | Nilai bersih arus kas masa depan yang didiskontokan ke nilai saat ini. Proyek layak jika NPV > 0. |
| **Internal Rate of Return** | **IRR** | Tingkat diskonto yang membuat NPV sama dengan nol. Proyek layak jika IRR > Biaya Modal (WACC). |
| **Payback Period** | **PP** | Waktu yang dibutuhkan agar akumulasi arus kas masuk dapat menutup nilai investasi awal. |
| **Return on Investment** | **ROI** | Rasio efisiensi keuntungan investasi dibandingkan total biaya yang dikeluarkan. |

---

## 🚀 Panduan Menjalankan Secara Lokal

### 1. Prasyarat
- **Node.js** (v18 atau lebih baru).
- Akun dan database **Supabase PostgreSQL**.
- Akun **Firebase Console** (Google Sign-In aktif).
- **Google Gemini API Key** dari [Google AI Studio](https://aistudio.google.com/).

### 2. Konfigurasi Lingkungan (`.env`)
Buat berkas `.env` di direktori *root* proyek:

```env
# Google Gemini AI Key
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase PostgreSQL Connection
SQL_HOST=your_supabase_pooler_host
SQL_PORT=5432
SQL_USER=your_db_user
SQL_PASSWORD=your_db_password
SQL_DB_NAME=postgres

# Konfigurasi Aplikasi
NODE_ENV=development
APP_URL=http://localhost:3000
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Migrasi Skema Database
Push skema Drizzle ORM ke database Supabase Anda:
```bash
npm run db:push
```

### 5. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka browser Anda di `http://localhost:3000`.

---

## ☁️ Panduan Deployment Vercel

Proyek ini telah dikonfigurasi penuh untuk di-deploy ke **Vercel** sebagai monorepo terpadu:
- Berkas `vercel.json` secara otomatis mengarahkan rute statis React SPA dan rute dinamis Express Serverless API.
- Masukkan seluruh variabel `.env` pada dashboard **Vercel Project Settings > Environment Variables**.

---

## 👨‍💻 Author

Dikembangkan oleh **Muhammad Hafiz Alfarizi** ([@a1fariz](https://github.com/a1fariz)).  
*Dibuat untuk mempermudah pengambilan keputusan investasi berbasis data dan AI.*
