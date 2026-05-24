# 🩸 LifeFlow — Blood Bank Management System

A complete full-stack Blood Bank Management System built with **React + Vite + Tailwind CSS** on the frontend and **Node.js + Express** on the backend, using a local JSON file database (auto-falls back if MongoDB is unavailable).

---

## 🚀 Quick Start

### 1. Start the Backend

```bash
cd backend
npm run dev
```

Server starts at: **http://localhost:5000**

### 2. Start the Frontend (new terminal)

```bash
cd frontend
npm run dev
```

App opens at: **http://localhost:3000**

---

## 🔐 Default Login Credentials

| Role      | Email                      | Password      |
|-----------|----------------------------|---------------|
| **Admin**    | admin@bloodbank.com     | admin123      |
| **Donor**    | donor@gmail.com         | donor123      |
| **Hospital** | hospital@central.com    | hospital123   |

---

## 🗂️ Project Structure

```
blood-bank/
├── backend/                  # Express.js API
│   ├── config/db.js          # MongoDB + JSON fallback connection
│   ├── controllers/          # Business logic per resource
│   ├── models/               # Mongoose schemas + MockModel
│   ├── routes/               # REST API routes
│   ├── middleware/            # Auth + error handlers
│   ├── data/                 # JSON database files (auto-created)
│   ├── utils/seed.js         # Seed script
│   └── server.js             # Entry point (port 5000)
│
└── frontend/                 # React + Vite app
    └── src/
        ├── context/          # AuthContext + NotificationContext (Toast)
        ├── layouts/          # DashboardLayout (sidebar, topbar, notifs)
        ├── pages/            # LandingPage, Login, Register, Dashboard...
        ├── components/       # Chatbot, reusable UI
        └── services/api.js   # Axios client (proxied via Vite)
```

---

## ✨ Features

### Authentication
- JWT-based login/register with bcrypt password hashing
- Role-based access: **Admin**, **Donor**, **Hospital**

### Admin Dashboard
- KPI cards: donors, stock units, pending/approved requests, low-stock alerts
- Recharts: inventory bar, demand pie, monthly donations area chart
- Recent activities table (requests + appointments)

### Donor Management
- Full CRUD with search/filter by name, email, blood group, gender
- Paginated table, view profile modal, edit/delete actions

### Blood Inventory
- 8 blood group stock cards with color-coded level indicators (Critical / Low / Moderate / Adequate)
- Add / Remove / Set stock with modal form
- Auto-creates low-stock notifications on updates

### Blood Requests
- Hospitals submit requests; admin approve/reject with stock deduction validation
- Emergency levels: Normal / Urgent / Critical (animated for Critical)

### Appointments
- Donors book slots with date picker + time slot selector
- Admin approves → completes (auto-adds 1 unit to inventory + updates donor's last donation date)
- 90-day eligibility gate enforced on booking

### Reports & Analytics
- Full KPI summary, bar/area/pie charts
- CSV export for inventory + monthly donations

### AI Chatbot
- Floating FAQ assistant (keyword-based, no API key needed)
- Covers: eligibility, gaps, compatibility, donation types, post-care

### Dark / Light Mode
- Toggle in top navbar, persisted to localStorage

---

## 🗄️ Database

- **MongoDB**: Connect by editing `backend/.env` → `MONGODB_URI`
- **Auto-fallback**: If MongoDB is unavailable, data is saved in `backend/data/*.json`

### Re-seed the database

```bash
cd backend
npm run seed
```

---

## 🛠️ Tech Stack

| Layer     | Technology                                        |
|-----------|---------------------------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS, Framer Motion       |
| Charts    | Recharts (Bar, Area, Pie)                         |
| Icons     | Lucide React                                      |
| Backend   | Node.js, Express.js, JWT, bcryptjs                |
| Database  | MongoDB (Mongoose) with local JSON fallback       |
| HTTP      | Axios (with interceptor for auth tokens)          |
