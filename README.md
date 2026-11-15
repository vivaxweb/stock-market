# MockBull — Real-Time Stock Market & Paper Trading Simulator

A full-stack, real-time paper trading and stock market simulation platform engineered with a high-performance Node.js WebSocket backend and a modern React Native / Expo cross-platform frontend.

---

## 🌟 Features

- 📈 **Real-Time Market Data Engine**: Live ticker streaming, simulated price volatility, and dynamic market feeds.
- ⚡ **Order Execution Engine**: Market and limit order processing, automated portfolio valuation, and position tracking.
- 📊 **Options Chain & Derivatives**: Interactive options chain simulation with call/put Greeks and contracts.
- 🏆 **Gamification & Leaderboard**: Global user rankings, badges, streaks, and performance metrics.
- 🎓 **Trading Academy**: Interactive educational modules and financial literacy guides for beginner to advanced traders.
- 📱 **Cross-Platform Mobile/Web UI**: Sleek, responsive React Native interface powered by Expo.

---

## 🏗️ Architecture & Project Structure

`
stock-market/
├── client/              # React Native / Expo Mobile & Web Application
│   ├── src/
│   │   ├── screens/     # Dashboard, Academy, Leaderboard, Profile
│   │   ├── components/  # Charting, order modals, ticker ribbons
│   │   └── context/     # Global state & WebSocket client
│   ├── assets/          # App branding, stock icons, UI graphics
│   └── package.json
│
├── server/              # Real-Time WebSocket & REST Backend
│   ├── src/
│   │   ├── services/    # Market data, order engine, options chain, gamification
│   │   ├── data/        # Academy curriculum & stock universes
│   │   └── index.js     # Entry point (HTTP + WebSocket server)
│   └── package.json
│
└── shared/              # Shared TypeScript definitions & contracts
    └── types.ts
`

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- npm or yarn
- [Expo Go](https://expo.dev/go) (optional, for running on iOS/Android device)

---

### 1. Server Setup

`ash
cd server
npm install
npm run dev
`

The backend server will start on port 8080 (or specified PORT), serving REST endpoints and WebSocket connections at ws://localhost:8080.

---

### 2. Client Setup

`ash
cd ../client
npm install
npm start
`

Press:
- w to open in your web browser
-  to run on Android simulator
- i to run on iOS simulator
- Or scan the QR code with the **Expo Go** mobile app.

---

## 🛡️ License

Private project developed by vivaxweb.
