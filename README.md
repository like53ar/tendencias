# 🌌 ZenCrypto Analytics

A professional-grade cryptocurrency analysis dashboard designed for high-performance and "Zen" aesthetics.

![ZenCrypto Dashboard Screenshot](file:///C:/Users/fabar/.gemini/antigravity/brain/939caa81-6de1-4222-86f4-ad38caab341c/dashboard_real_1774406397529.png)

## 🚀 Overview

ZenCrypto Analytics offers a real-time view into the crypto market with a clean, high-contrast dark interface ("Zen"). It integrates backend analytics with a modern frontend to provide actionable insights for traders.

### Key Features

- **Live Ticker**: High-performance scrolling ticker for 25+ major cryptocurrency pairs.
- **Dynamic Watchlist**: Fully customizable watchlist with live prices and 24h changes.
- **Advanced Charting**: Integrated TradingView-style candles with SMA20, SMA200, and RSI indicators.
- **Predictive Analytics**: 24h price projection based on linear regression models.
- **Support & Resistance**: Automatic detection of key market levels.
- **Multiple Timeframes**: Analyze markets from 15m to 1w intervals.
- **Optimized UI**: Premium design using the "Inter" typography system for maximum readability.

---

## 🏗️ Architecture

- **Frontend**: Angular 19+ (Standalone Components, RxJS, HttpClient)
- **Backend**: Python (Flask, Flask-CORS, Pandas, NumPy, Scikit-learn)
- **Market Data**: Binance (via `ccxt` library)

---

## 🛠️ Getting Started

### Prerequisites

- **Python 3.10+** (with `pip`)
- **Node.js 18+** (with `npm`)
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/like53ar/tendencias.git
   cd tendencias
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   # Recommend using a virtual environment
   python -m venv venv
   .\venv\Scripts\activate
   pip install flask flask-cors pandas numpy scikit-learn ccxt
   ```

3. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application (Windows)

The simplest way is to use the provided shortcut on the desktop or run the internal script:

- Double-click `start_zen_analytics.vbs` in the root folder.
- This will launch both the backend and frontend in silent mode and open the dashboard once ready.

**Manual Launch:**
- **Backend**: `cd backend && python app.py` (Runs on port 5000)
- **Frontend**: `cd frontend && npm run start` (Runs on port 4200)

---

## 🎨 Design Aesthetics

This project follows a "Zen" design philosophy:
- **Unified Palette**: Deep-space backgrounds with neon-pulse accents.
- **Premium Typography**: "Inter" font system for a modern, tech-focused feel.
- **Smooth Interaction**: Fluid transitions and real-time updates without page reloads.

---

## 🤝 Contribution

Feel free to fork this project and submit pull requests for any feature improvements or bug fixes.

---

## ⚖️ License

Private Project - Internal Use Only.
