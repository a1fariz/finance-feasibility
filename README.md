# Finance Feasibility Application 📊

A full-stack, AI-powered web application for conducting financial feasibility studies and investment analysis. This tool helps businesses and investors calculate critical financial metrics (NPV, IRR, ROI, Payback Period) and provides strategic insights using Google's Gemini AI.

## 🚀 Features

- **Project Management:** Create, duplicate, update, and delete investment projects.
- **Financial Engine:** Automatic calculation of Net Present Value (NPV), Internal Rate of Return (IRR), Return on Investment (ROI), and Break-even Payback Period.
- **AI Strategic Insights:** Integrates with Gemini AI to generate professional, executive-level summaries, strengths, risks, and recommendations based on the financial metrics.
- **Secure Authentication:** Firebase Authentication (Google Sign-In) with secure session validation.
- **Export Capabilities:** Export your complete financial analysis and AI insights directly to PDF.
- **Responsive Design:** Beautiful, premium UI built with Tailwind CSS and Framer Motion.

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Recharts, Framer Motion, Lucide React.
- **Backend:** Node.js, Express.js (Serverless-ready for Vercel).
- **Database:** PostgreSQL (Supabase) accessed via Drizzle ORM.
- **Authentication:** Firebase Auth + Firebase Admin SDK.
- **AI Integration:** `@google/genai` (Gemini 3.5 Flash).
- **Deployment:** Vercel (Frontend & Serverless API).

## ⚙️ Local Development Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- A Supabase account and database
- A Firebase project (with Google Sign-In enabled)
- A Google Gemini API Key

### 2. Environment Variables
Create a `.env` file in the root of your project and populate it with your credentials:

```env
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Supabase PostgreSQL (Use Transaction/Session Pooler IPv4 URL)
SQL_HOST=your_supabase_pooler_host
SQL_PORT=5432
SQL_USER=your_db_user
SQL_PASSWORD=your_db_password
SQL_DB_NAME=postgres

# App Configuration
NODE_ENV=development
APP_URL=http://localhost:3000
```

*Note: You also need the `firebase-applet-config.json` in the root directory for Firebase initialization.*

### 3. Installation

Install all NPM dependencies:
```bash
npm install
```

### 4. Database Migration

Push the Drizzle ORM schema to your Supabase PostgreSQL database:
```bash
npm run db:push
```

### 5. Running the Application locally

Start the full-stack server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

## 🌐 Deployment (Vercel)

This project is configured out-of-the-box to be deployed on Vercel as a single monorepo.
- The `vercel.json` file handles the routing to separate the React SPA and the Express Serverless Functions.
- Make sure to add all your `.env` variables into the Vercel **Settings > Environment Variables** dashboard before deploying.
