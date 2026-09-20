# CivicTrack - AI-Powered Municipal Infrastructure & Dispatch System

CivicTrack is a modern, full-stack civic reporting and infrastructure management platform. It empowers citizens to report civic hazards (potholes, street lights, water leaks, sanitation issues, and traffic signals) and utilizes an intelligent AI Dispatch Agent to analyze, eliminate duplicate work orders, and route complaints directly to the appropriate municipal engineering departments.

---

## 🌟 Key Features

- **AI Department Auto-Routing**: Automatically identifies civic context and keywords from text and voice recordings to dispatch complaints directly to the responsible division (e.g., *Bureau of Street Lighting*, *Water & Sewer Authority*, *Department of Transportation*).
- **Automated Duplicate Prevention Radar**: Cross-references category, GPS coordinates, municipal ward, and semantic descriptions against active work orders. Strictly blocks redundant tickets from being registered, allowing citizens instead to add photo evidence and upvote existing tickets.
- **Offline PWA & Background Sync**: Full service worker caching and IndexedDB outbox. Citizens can capture complaints offline; reports automatically synchronize upon network restoration.
- **Multi-Ward GIS Interactive Map**: Ward-level visualization with custom map pins, category filters, and live dispatch tracking.
- **Role-Based Access Control**:
  - **Citizen Mode**: Fast 1-tap photo reporting, voice recording transcription, tracking status, and endorsements.
  - **Municipal Officer Mode**: Live work order updates, priority re-assignment, crew dispatch, and SLA monitoring.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js 18+ or 20+ installed
- npm or pnpm or yarn

### Installation
```bash
# 1. Clone your repository
git clone https://github.com/<your-username>/civictrack.git

# 2. Enter project folder
cd civictrack

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 📦 Production Build & Deployment

```bash
# Build optimized production bundle
npm run build
```
The production bundle is compiled into the `dist/` directory.

### Deploy to Vercel (Free & Instant - 1 Minute)
1. Push this project to your GitHub account (`github.com/<username>/civictrack`).
2. Go to [vercel.com](https://vercel.com) and log in with GitHub.
3. Click **"Add New Project"** and import your `civictrack` repository.
4. Click **Deploy**. Vercel will give you a clean URL:
   `https://civictrack-<your-name>.vercel.app`

### Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and click **"Import an existing project from GitHub"**.
2. Select your repository, set build command to `npm run build`, and publish directory to `dist`.
3. Click **Deploy Site**.

---

## 🛠️ Technology Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion
- **Icons**: Lucide React
- **Build System**: Vite
- **Offline & Storage**: Service Workers, Cache API, LocalStorage persistence
- **Architecture**: Client-side SPA with municipal dispatch engine
