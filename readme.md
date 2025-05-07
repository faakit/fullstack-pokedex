# ⚡️ Pokédex Explorer: Fullstack Edition

Welcome to **Pokédex Explorer**, a modern, fullstack Pokémon catalog that brings the world of Pokémon to your fingertips! This project combines a robust NestJS backend with a sleek React frontend, delivering a seamless and interactive Pokédex experience.

---

## 🚀 What Can It Do?

- **Lightning-Fast Pokémon List:** Instantly list and view Pokémons with blazing speed, thanks to caching.
- **Interactive UI:** Enjoy a beautiful, responsive interface with infinite scrolling, detailed Pokémon modals, and type color-coding for easy identification.
- **Smart Caching:** Multi-layered caching (in-memory + Redis) ensures rapid responses and reduced load on external APIs.
- **Scheduled Tasks:** Automatic cache pre-warming keeps your experience smooth, even with large datasets.
- **Developer Friendly:** Modern tech stack, clear project structure, and robust testing.

---

## 🛠️ Tech Stack

- **Backend:** NestJS, TypeScript, Redis, Jest, ESLint, Prettier
- **Frontend:** React 18, TypeScript, TailwindCSS, Zustand, Vite, Vitest, Testing Library

---

## 🖥️ How It Works

1. **Backend (NestJS):**

   - Exposes RESTful endpoints for listing Pokémon, fetching details, and retrieving images.
   - Implements multi-layer caching and scheduled jobs for optimal performance.
   - Easily configurable via environment variables.

2. **Frontend (React):**
   - Connects to the backend API for real-time Pokémon data.
   - Features infinite scrolling, interactive cards, and detailed modals.
   - Fully responsive and visually appealing.

---

## 📦 Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm or yarn
- Redis (for backend caching)

### Quickstart

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   ```

2. **Start the backend:**

   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example
   npm run start:dev
   ```

3. **Start the frontend:**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open your browser:**  
   Visit [http://localhost:5173](http://localhost:5173) and start exploring!

---

## 🌐 API Endpoints

- `GET /pokemon` — List Pokémon (supports pagination)
- `GET /pokemon/:id` — Get Pokémon details
- `GET /pokemon/:id/front-image` — Get front sprite
- `GET /pokemon/:id/back-image` — Get back sprite

---

## 🧩 Project Structure

- `backend/` — NestJS API, caching, scheduled tasks, tests
- `frontend/` — React app, components, hooks, services, tests

---

## ✨ Why You'll Love It

- **Super Fast:** Thanks to smart caching and efficient data fetching.
- **Beautiful UI:** Modern, mobile-friendly, and fun to use.
- **Extensible:** Easy to add new features or integrate with other services.
- **Battle-Tested:** Comprehensive tests and code quality tools included.

---

Unleash the power of Pokémon data with Pokédex Explorer!  
Gotta catch 'em all—faster and prettier than ever!
