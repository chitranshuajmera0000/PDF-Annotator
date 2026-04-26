# 📄 PDF Annotator

<div align="center">

![Project Banner](https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80)

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**A modern, full-stack PDF management and annotation platform designed for seamless reading and persistent note-taking.**

[Explore Features](#-key-features) • [Technical Architecture](#-system-architecture) • [Setup Guide](#-getting-started) • [API Reference](#-api-documentation)

</div>

---

## 🌟 Overview

**PDF Annotator** is a comprehensive full-stack application that empowers users to manage their digital PDF library with precision. Beyond just a viewer, it provides advanced text highlighting and annotation capabilities, ensuring that your insights are preserved across sessions. 

Built with the **MERN stack**, the application leverages the power of `react-pdf` for high-performance document rendering and a robust Node.js backend for secure data persistence.

---

## 🔥 Key Features

### 📂 Smart Library Management
- **Centralized Dashboard:** A personalized library view for every user to manage their uploaded documents.
- **Secure Storage:** PDF files are stored on a secure server environment with unique UUID tracking.
- **File Operations:** Rename or delete your documents with instant backend synchronization.

### 🖋️ Advanced Annotation Suite
- **Precision Highlighting:** Select any text within the PDF to highlight it in real-time.
- **Persistent Memory:** All highlights, including their exact coordinates, page numbers, and timestamps, are saved to MongoDB.
- **Auto-Restoration:** Re-opening a PDF automatically fetches and renders all previous annotations exactly where you left them.
- **Note Integration:** Attach custom notes to specific highlights for deeper context.

### 🔐 Security & Auth
- **JWT Authentication:** Secure user sessions using JSON Web Tokens.
- **Private Access:** Every user has their own private space; your PDFs and highlights are yours alone.
- **Scalable Architecture:** Built to handle concurrent users and growing document libraries.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 (Vite-powered)
- **PDF Engine:** `react-pdf` & `pdfjs-dist`
- **State Management:** React Context / Hooks
- **Styling:** Tailwind CSS
- **Networking:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Auth:** JWT (JSON Web Token)
- **File Handling:** Multer
- **ID Generation:** UUID v4

---

## 🏗️ System Architecture

The application follows a decoupled client-server architecture:

1.  **Frontend (React):** Communicates with the backend via RESTful APIs. It handles the complex logic of calculating text coordinates for highlights and rendering them on the canvas.
2.  **Backend (Express):** Manages authentication, PDF metadata, and the CRUD (Create, Read, Update, Delete) operations for highlights.
3.  **Storage Layer:**
    *   **MongoDB:** Stores user credentials, PDF metadata (UUIDs, names), and annotation data (coordinates, text, color).
    *   **Filesystem:** Stores the actual `.pdf` binary files, indexed by their UUIDs for fast retrieval.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- MongoDB instance (Local or Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/PDF-Annotator.git
cd PDF-Annotator
```

### 2. Backend Configuration
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
```
Run the backend:
```bash
npm run dev
```

### 3. Frontend Configuration
```bash
cd ../frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 🔌 API Documentation

| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/api/auth/signup` | `POST` | Register a new user | No |
| `/api/auth/login` | `POST` | Authenticate and receive JWT | No |
| `/api/pdfs` | `GET` | List all PDFs for the user | Yes |
| `/api/pdfs` | `POST` | Upload a new PDF | Yes |
| `/api/pdfs/:uuid` | `DELETE`| Remove a PDF | Yes |
| `/api/highlights/:pdfId` | `GET` | Fetch all highlights for a PDF | Yes |
| `/api/highlights` | `POST` | Save a new highlight | Yes |

---

## 📈 Future Roadmap
- [ ] **Collaborative Reading:** Real-time shared annotations for teams.
- [ ] **Dark Mode:** Enhanced viewing experience for night owls.
- [ ] **Search Engine:** Deep search through text within uploaded PDFs.
- [ ] **Mobile App:** Dedicated React Native application for on-the-go reading.

---

## 🤝 Contributing
Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  Developed with ❤️ by [Your Name]
</div>
