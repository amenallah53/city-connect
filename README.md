<p align="center">
    <img src="https://img.shields.io/badge/Made_with-Angular-red.svg">
    <img src="https://img.shields.io/badge/API-REST-blue.svg">
    <img src="https://img.shields.io/badge/Backend-Node.js%2FExpress-green.svg">
    <img src="https://img.shields.io/badge/Database-PostgreSQL-316192.svg?logo=postgresql&logoColor=white">
    <img src="https://img.shields.io/badge/Automation-n8n-EA4B71.svg?logo=n8n&logoColor=white">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg">
    <img src="https://img.shields.io/badge/Groupe-IGL3-blue.svg">
</p>

<p align="center">
    <a href="https://www.youtube.com/watch?v=-KEhpdYU2NU">
        <img src="https://img.shields.io/badge/▶️ Live Demo-Watch on YouTube-FF0000.svg?style=for-the-badge&logo=youtube&logoColor=white" alt="Live Demo">
    </a>
</p>

## 🎬 Demo
> Watch the full demo on YouTube: [https://www.youtube.com/watch?v=-KEhpdYU2NU](https://www.youtube.com/watch?v=-KEhpdYU2NU)

## Used technologies
### Frontend
- **Framework**: Angular 21
- **Langage**: TypeScript 5.7.2
- **Styling**: CSS personnalisé avec variables CSS
- **Rendu**: Server-Side Rendering (SSR) avec Angular Universal

### Backend & Services
- **API Backend**: Node.js/Express (http://localhost:5000)
- **Database**: PostgreSQL
- **HTTP Client**: Angular HttpClient
- **State Management**: RxJS avec BehaviorSubjects

### Workflow Automation
- **Tool**: [n8n](https://n8n.io/) — used to automate backend workflows and orchestrate data pipelines between services

### Build & Tools
- **Build Tool**: Angular CLI avec esbuild
- **Package Manager**: npm
- **Node Version**: >=18.19.1

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.19.1
- npm
- PostgreSQL running locally

### Installation

```bash
# 1) Clone the project
git clone [repo-url]
cd city-connect

# 2) Install root dependencies
npm install

# 3) Install frontend dependencies
cd frontend && npm install && cd ..

# 4) Install backend dependencies
cd backend && npm install && cd ..

# 5) Install admin dependencies
cd admin && npm install && cd ..

# 6) Set up the database
# Run the SQL script against your PostgreSQL instance
psql -U your_user -d your_db -f city-connect-db-script.sql
```

### Running the app

From the **root directory**, you can use these combined scripts:

```bash
# Run frontend + backend together
npm run dev

# Run admin + frontend + backend all at once
npm run dev:admin
```

Or start each part individually in separate terminals:

```bash
# Terminal 1 — Frontend (http://localhost:4200)
npm run start-frontend

# Terminal 2 — Backend (http://localhost:5000)
npm run start-backend

# Terminal 3 — Admin panel (http://localhost:4300)
npm run start-admin
```

---

## 🏗️ Project Architecture

City-Connect is split into **three main apps** — a citizen-facing frontend, an admin dashboard, and a backend. The backend itself follows a **microservices architecture** with a dedicated API Gateway routing all traffic to isolated, independently runnable services.

---
