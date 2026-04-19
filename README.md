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

## Quick start
```bash
#1) Clone the project
git clone [repo-url]
cd city-connect

#2) Install dependencies
npm install

#3) Start the frontend
cd ./frontend
ng s -o

#4) Access the frontend app
# http://localhost:4200

#5) Run the backend (in a separate terminal)
cd ./city-connect/backend
npm run start:dev
```
