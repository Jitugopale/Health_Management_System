# Health Management System (HMS)

A full-stack Health Management System built with **React**, **Node.js**, **Express**, and **SQL Server**. The system provides role-based access for Patients, Doctors, and Admins — covering everything from user registration and doctor management to appointment booking, in-app chat, and an AI health assistant.

---

## Project Motive

The goal of this project is to create a simple, scalable, and secure healthcare management platform where:

- Patients can register, browse doctors, book appointments, chat with their doctor, and get general health guidance from an AI assistant.
- Doctors can view and manage their appointments, approve or reject requests, update their profile, and communicate with patients.
- Admins can create doctor accounts, monitor all appointments, and view the full list of patients and doctors.

This project demonstrates a practical full-stack architecture using React + Vite on the frontend and Express + SQL Server on the backend, with JWT-based authentication and role-based access control throughout.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Axios, React Router v7 |
| Backend | Node.js, Express 5 |
| Database | Microsoft SQL Server (via `mssql`) |
| Auth | JSON Web Tokens (JWT), bcrypt |
| Email | Nodemailer (Gmail) |
| AI Assistant | Ollama (local LLM) |

---

## Folder Structure

```
Health_Management_System/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # Register, login, update profile, chat messages
│   │   ├── adminController.js      # Doctor creation, appointment views, dashboard counts
│   │   ├── doctorController.js     # Doctor profile, appointment management
│   │   └── patientController.js    # Doctor listing, appointment booking, AI chat
│   ├── middlewares/
│   │   ├── authMiddleware.js       # JWT verification for patients & doctors
│   │   └── adminMiddleware.js      # JWT verification restricted to Admin role
│   ├── routes/
│   │   ├── index.js                # Root router
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── doctorRoutes.js
│   │   └── patientRoutes.js
│   ├── services/
│   │   ├── gmail.js                # Nodemailer email service
│   │   ├── ollama.js               # Ollama LLM client
│   │   └── healthAgent.js          # AI health query handler
│   ├── db/
│   │   └── db.js                   # SQL Server connection pool
│   ├── .env.example
│   └── index.js                    # Express app entry point
│
└── frontend/
    └── src/
        ├── components/
        │   └── ChatWindow.jsx       # In-app doctor-patient chat UI
        ├── pages/
        │   ├── auth/               # Register, Login, Logout
        │   ├── admin/              # Dashboard, CreateDoctors, Appointments, Patients, Doctors
        │   ├── doctor/             # Dashboard, Appointments, UpdateInfo, UpdatePassword
        │   └── patient/            # BookAppointments, MyAppointments, UpdatePassword, ChatAgentWidget
        ├── App.jsx
        └── main.jsx
```

---

## Database Schema (SQL Server)

### Users Table
```sql
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(10) CHECK (role IN ('PATIENT', 'DOCTOR', 'ADMIN')) DEFAULT 'PATIENT',
    password VARCHAR(255) NOT NULL,
    phoneNo VARCHAR(15),
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
    age INT,
    createdAt DATETIME DEFAULT GETDATE()
);
```

### Doctors Table
```sql
CREATE TABLE doctors (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phoneNo VARCHAR(15),
    specialization VARCHAR(100) NOT NULL,
    experience INT NOT NULL,
    qualification VARCHAR(255),
    doctorId VARCHAR(20) NOT NULL UNIQUE,
    createdAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Doctors_User FOREIGN KEY (doctorId) REFERENCES users(userId)
);
```

### Appointments Table
```sql
CREATE TABLE appointments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    appointmentId NVARCHAR(50) UNIQUE NOT NULL,
    date DATETIME NULL,
    time NVARCHAR(50) NULL,
    status NVARCHAR(20) CHECK (status IN ('PENDING', 'BOOKED', 'REJECTED')) DEFAULT 'PENDING',
    notes NVARCHAR(MAX) NULL,
    patientId VARCHAR(20) NOT NULL,
    doctorId VARCHAR(20) NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Patient FOREIGN KEY (patientId) REFERENCES users(userId),
    CONSTRAINT FK_Doctor FOREIGN KEY (doctorId) REFERENCES doctors(doctorId)
);
```

### Chats Table
```sql
CREATE TABLE chats (
    id INT IDENTITY(1,1) PRIMARY KEY,
    appointmentId NVARCHAR(50) NOT NULL,
    senderId VARCHAR(20) NOT NULL,
    receiverId VARCHAR(20) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Chat_Appointment FOREIGN KEY (appointmentId) REFERENCES appointments(appointmentId),
    CONSTRAINT FK_Chat_Sender FOREIGN KEY (senderId) REFERENCES users(userId),
    CONSTRAINT FK_Chat_Receiver FOREIGN KEY (receiverId) REFERENCES users(userId)
);
```

---

## Environment Variables

Create a `.env` file inside the `backend/` folder based on `.env.example`:

```env
PORT=5000

DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_SERVER=localhost
DB_NAME=your_db_name

MAIL_USER=your_gmail@gmail.com
MAIL_PASSWORD=your_gmail_app_password

ADMIN_ID=your_admin_id
ADMIN_PASSWORD=your_admin_password

JWT_SECRET=your_jwt_secret_key

OLLAMA_URL=http://localhost:11434
GEN_MODEL=tinyllama
```

> For Gmail, use an **App Password** (not your regular Gmail password). Enable 2FA on your Google account first, then generate one from Google Account → Security → App Passwords.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/health-management-system.git
cd health-management-system
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Set up the database

Run the SQL scripts above in your SQL Server instance (via SSMS or Azure Data Studio) to create the required tables.

### 5. Set up Ollama (AI Assistant)

Install [Ollama](https://ollama.com) and pull the model you want to use:

```bash
ollama pull tinyllama
```

Make sure Ollama is running before starting the backend.

---

## API Overview

### Auth Routes — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register/patient` | Public | Register a new patient |
| POST | `/login` | Public | Login (Admin / Doctor / Patient) |
| GET | `/getUser` | Authenticated | Get logged-in user details |
| PUT | `/updateUser` | Authenticated | Update user profile |
| PUT | `/updatePassword` | Authenticated | Change password |
| POST | `/sendMessage` | Authenticated | Send a chat message |
| GET | `/getMessages/:appointmentId` | Authenticated | Get chat history |

### Admin Routes — `/api/admin`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/doctor/create` | Admin | Create a new doctor account |
| GET | `/appointments/pending/all` | Admin | View all pending appointments |
| GET | `/appointments/booked/all` | Admin | View all booked appointments |
| GET | `/appointments/rejected/all` | Admin | View all rejected appointments |
| GET | `/patients/all` | Admin | View all patients |
| GET | `/doctors/all` | Admin | View all doctors |
| GET | `/dashboard/counts` | Admin | Get dashboard summary counts |

### Doctor Routes — `/api/doctor`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/get/info` | Doctor | Get own profile |
| PUT | `/update/info` | Doctor | Update own profile |
| GET | `/appointments/pending` | Doctor | View own pending appointments |
| PUT | `/appointments/approve/:id` | Doctor | Approve an appointment |
| PUT | `/appointments/reject/:id` | Doctor | Reject an appointment |
| GET | `/appointments/booked/all` | Doctor | View own booked appointments |
| GET | `/appointments/reject/all` | Doctor | View own rejected appointments |
| GET | `/dashboard/counts` | Doctor | Get own dashboard counts |

### Patient Routes — `/api/patient`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/doctors/getAll` | Patient | Browse all available doctors |
| POST | `/request/appointment` | Patient | Request an appointment |
| GET | `/myAppointments` | Patient | View own appointments |
| POST | `/agent/chat` | Patient | Chat with AI health assistant |

---

## Role-Based Access

| Feature | Patient | Doctor | Admin |
|---|---|---|---|
| Register / Login | ✅ | ✅ | ✅ |
| Book appointments | ✅ | — | — |
| View own appointments | ✅ | ✅ | — |
| Approve / Reject appointments | — | ✅ | — |
| In-app chat (booked appointments only) | ✅ | ✅ | — |
| AI Health Assistant | ✅ | — | — |
| Create doctor accounts | — | — | ✅ |
| View all patients & doctors | — | — | ✅ |
| Dashboard overview | — | ✅ | ✅ |

---

## How IDs Are Generated

- **Patient IDs** — auto-incremented with prefix: `PAT001`, `PAT002`, ...
- **Doctor IDs** — auto-incremented with prefix: `DOC001`, `DOC002`, ...
- **Appointment IDs** — auto-incremented with prefix: `APP001`, `APP002`, ...

When a doctor is created, their login credentials (Doctor ID + temporary password) are automatically sent to their email.

---

## AI Health Assistant

The patient panel includes a floating chat widget powered by a locally running Ollama LLM. It:

- Greets users with a friendly welcome message.
- Uses a classifier prompt to determine if the query is health-related.
- Falls back to a keyword-based local check if the LLM classifier is unavailable.
- Only answers health, wellness, fitness, and symptom-related questions.
- Always reminds users it provides general information only — not medical advice.

---

## Features

- JWT-based authentication with role separation (Patient / Doctor / Admin)
- Bcrypt password hashing
- Auto-generated user IDs with role prefixes
- Email notifications on account creation and password changes
- Appointment lifecycle: PENDING → BOOKED / REJECTED
- In-app chat between doctor and patient (only for BOOKED appointments)
- AI health assistant (Ollama, runs fully locally)
- Clean modular folder structure

---

## Future Enhancements

- Patient medical history and reports
- Prescription module for doctors
- Real-time chat using WebSockets
- Notification system (in-app + email)
- Admin analytics dashboard with charts
- Mobile responsive UI improvements
