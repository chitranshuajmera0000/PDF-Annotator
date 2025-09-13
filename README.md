

# PDF Annotator Full Stack

A modern web application for uploading, viewing, and annotating PDF files. Users can highlight text, add notes, and manage their own PDF library—all securely stored and restored per user. Built with React, Node.js, Express, and MongoDB.

## Problem Statement
Build a full-stack React application that allows users to upload PDF files, highlight text within the document, and persist these highlights for later viewing. The application supports user login, saving uploaded PDFs and their annotations to a backend, and reloading them with previously saved highlights. PDF files are stored locally on the server machine. Each file and its highlights are uniquely tracked using UUIDs.

## Objective & Core Features

### Frontend (React)
1. **User Authentication**
	- Registration and login using email/password
	- JWT tokens for session handling
2. **PDF Upload and Viewer**
	- Upload PDF files from local system
	- In-browser PDF display with pagination
3. **Text Highlighting**
	- Select and highlight text across any page
	- Each highlight stores: PDF UUID, page number, highlighted text, position/bounding box, and timestamp
4. **Persisting Highlights**
	- Save highlights in backend (MongoDB) associated with user and PDF UUID
5. **Restoring Highlights**
	- Retrieve and display highlights when a PDF is re-opened
6. **My Library (Dashboard)**
	- List of uploaded PDFs for the logged-in user
	- Open, rename, or delete files

### Backend (Node.js + Express)
1. **Authentication APIs**
	- Endpoints for login, signup, and token verification
2. **PDF Upload API**
	- Accept and store uploaded PDF files on local file system
	- Generate and return a UUID for each PDF
	- Save metadata (filename, user ID, UUID) in MongoDB
3. **Highlight API**
	- Endpoints to create, retrieve, update, or delete highlights by PDF UUID and user
	- Data stored in MongoDB under associated user and PDF
4. **PDF Listing API**
	- Fetch list of uploaded PDFs for a logged-in user

## Tech Stack
- **Frontend:** React, react-pdf, pdfjs-dist, axios
- **Backend:** Node.js, Express, multer, uuid, mongoose
- **Database:** MongoDB
- **Authentication:** JWT-based login
- **Storage:** Local file system (PDFs saved on backend)

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm
- MongoDB (local or Atlas)

### Backend
1. `cd backend`
2. `npm install`
3. Create a `.env` file in `backend/` (see below)
4. `npm run dev` (for development) or `npm start`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open the Vite URL (usually http://localhost:5173)

### Sample `.env` (backend/.env)
```
MONGODB_URI=mongodb://localhost:27017/pdf-annotator
JWT_SECRET=replace_with_secure_random
PORT=5000
```

## API Endpoints (Summary)

**Authentication**
- POST `/api/auth/signup` — create user
- POST `/api/auth/login` — login (returns JWT)
- GET `/api/auth/authenticate` — verify token / get user info

**PDFs**
- GET `/api/pdfs` — list user's PDFs
- POST `/api/pdfs` — upload (multipart form, `pdfFile`)
- GET `/api/pdfs/:uuid` — stream/view PDF
- PUT `/api/pdfs/:uuid` — rename PDF
- DELETE `/api/pdfs/:uuid` — delete PDF (and file)

**Highlights**
- GET `/api/highlights/:pdfId` — list highlights for a PDF
- POST `/api/highlights` — create highlight ({ pdfId, pageNumber, text, position, color })
- PUT `/api/highlights/:id` — update highlight (e.g., add note)
- DELETE `/api/highlights/:id` — delete highlight

## Data Model (Summary)
- **PDF:** { uuid, originalName, storedName, user, uploadDate }
- **Highlight:** { pdfId, pageNumber, position, color, text, user, note, time }

## Success Criteria
- Each user can upload, annotate, and view only their own PDFs and highlights
- Highlights are accurately saved and restored using PDF UUIDs
- Uploaded files are correctly stored and managed on the server file system
- Application behaves reliably across login sessions
