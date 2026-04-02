# Realtime Flight Updates

A modern, responsive flight tracking application displaying real-time departures and arrivals for Swedish airports with a beautiful sunset-themed UI.

**Live Demo:** https://seunajetomobi.github.io/realtime-flight-updates/

---

## 🛠️ Technology Stack

| Tool/Framework | Purpose |
|---|---|
| **React 18** | UI component framework |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Lightning-fast build tool |
| **Tailwind CSS** | Utility-first CSS framework |
| **WebSocket** | Real-time flight data streaming |
| **Node.js** | Local flight data broadcaster |
| **GitHub Pages** | Free static hosting |
| **GitHub Actions** | Automated CI/CD deployment |

---

## 📋 Development Steps

### 1. **Project Setup**
   - Scaffolded Vite + React + TypeScript project
   - Configured Tailwind CSS for styling
   - Set up component structure (App.tsx, AirportDetail.tsx)

### 2. **Core Features Implemented**
   - Airport selector sidebar with Swedish airport list
   - Real-time flight data display (departures & arrivals)
   - Flight detail modal with timeline and booking info
   - WebSocket connection for live updates
   - Mock data fallback for GitHub Pages deployment

### 3. **UI/UX Enhancements**
   - Applied sunset orange-to-yellow gradient background
   - Yellow flight tables with amber borders (#FEF08A, #CA8A04)
   - Gold accents for headers and titles (#FBBF24)
   - Responsive design for mobile/tablet/desktop
   - 20% opacity overlay for modal visibility

### 4. **Data Management**
   - Built Node.js flight broadcaster (WebSocket server on port 8080)
   - Converts flight data to standardized format
   - Auto-detects environment (localhost vs GitHub Pages)
   - Provides mock flight data as fallback

### 5. **Deployment Pipeline**
   - Initialized Git repository locally
   - Created GitHub Actions workflow for automated builds
   - Configured base path for GitHub Pages subdirectory
   - Set up permissions for CI/CD deployment
   - Auto-deploys on every push to `main` branch

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation & Development
```bash
cd swiftrafik

# Install dependencies
npm install

# Start development server (runs on localhost:5173)
npm run dev

# In another terminal, start the flight broadcaster
node ../simple-app/broadcaster.js
```

Visit `http://localhost:5173` and select an airport to see real-time flight data.

### Production Build
```bash
npm run build
# Output: dist/ folder ready for deployment
```

---

## 📱 Key Pages

| Page | Description |
|---|---|
| **Homepage** | Airport selector with sidebar navigation and sunset gradient |
| **Airport Detail** | Flight listings (departures & arrivals) with real-time updates |
| **Flight Modal** | Detailed flight information with timeline and booking details |

---

## 🎨 Color Scheme

- **Background**: Sunset gradient (#FFFACD → #FF6347)
- **Tables**: Pale yellow (#FEF08A) with amber borders (#CA8A04)
- **Headers**: Gold (#FBBF24) on dark text (#78350F)
- **Status Badges**: Green (boarding), Blue (on-time), Red (delayed)

---

## 🔄 How GitHub Pages Deployment Works

1. **Push code** to `main` branch
2. **GitHub Actions** automatically:
   - Checks out code
   - Installs dependencies
   - Runs build (`npm run build`)
   - Uploads `dist/` folder output
   - Deploys to GitHub Pages
3. **Site goes live** at `https://seunajetomobi.github.io/realtime-flight-updates/`

**Zero manual deployment needed** — all automatic!

---

## ✨ Features

✅ Real-time flight updates via WebSocket  
✅ 10 Swedish airports pre-configured  
✅ Responsive mobile-first design  
✅ Flight status tracking (On-time, Delayed, Boarding, etc.)  
✅ Terminal & security wait time info  
✅ Modal overlay with flight details & timeline  
✅ Automatic fallback mock data for static hosting  
✅ One-click deployment via GitHub Pages  

---

## 📦 Project Structure

```
swiftrafik/
├── src/
│   ├── App.tsx           # Homepage with airport selector
│   ├── AirportDetail.tsx # Airport detail page with flights
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── dist/                 # Built output (generated)
├── vite.config.ts        # Vite configuration with GitHub Pages base path
├── tailwind.config.cjs   # Tailwind configuration
├── .github/workflows/
│   └── deploy.yml        # GitHub Actions CI/CD pipeline
└── package.json          # Dependencies & scripts
```

---

## 🔗 Links

- **GitHub Repo**: https://github.com/seunajetomobi/realtime-flight-updates
- **Live Site**: https://seunajetomobi.github.io/realtime-flight-updates/
- **Local Dev**: http://localhost:5173

---

**Built with ❤️ using React, TypeScript, and modern web technologies**
