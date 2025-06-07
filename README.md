 
# HEALTHCARE MANAGEMENT SYSTEM

A full-stack web application designed to efficiently manage patient data using MongoDB, Node.js, and Express.js. This system streamlines patient registration, medical records, appointments, prescriptions, and more — all stored in a flexible NoSQL schema.

## 📌 Problem Statement

Healthcare professionals handle a diverse set of data — personal info, medical history, lab results, prescriptions, and appointments. Traditional relational databases struggle with such semi-structured, variable data. This project solves the problem using MongoDB, a schema-less, document-oriented NoSQL database optimized for complex healthcare records.

## 🎯 Objectives
* Efficiently manage patient records with CRUD operations.
* Use MongoDB for fast, scalable, flexible data storage.
* Implement search, filtering, and analytics using aggregation.
* Experience real-world data modeling and backend development.
* Optional login system for doctors, nurses, and staff.



##  🧩 Core Modules

| Module                  | Description                                                                |
| ----------------------- | -------------------------------------------------------------------------- |
| **Patient Management**  | Add, update, search, and delete patient records.                           |
| **Appointments**        | Book, update, or delete patient appointments.                              |
| **Medical Records**     | Store doctor notes, diagnoses, consultation details.                       |
| **Lab Results**         | Upload and view patient lab reports.                                       |
| **Prescriptions**       | Manage prescription data and medicine logs.                                |
| **User Authentication** | Role-based login for admin, doctors, nurses, and receptionists (optional). |
| **Analytics**           | Use MongoDB aggregation to generate health insights.                       |

## 🖼️ UI Pages
* login.html
* signup.html
* admin_dashboard.html
* doctor_dashboard.html
* nurse_dashboard.html
* receptionist_dashboard.html
* patient_detail.html

## 🗂️ Project Structure
```http
  HealthCare/
├── backend/
│   ├── config/              # db.js file
│   ├── controllers/         # All route logic (e.g., patientController.js)
│   ├── middleware/          # Middleware (e.g., auth)
│   ├── models/              # Mongoose schemas (e.g., Patient.js, Appointment.js)
│   ├── routes/              # API route handlers
│   ├── uploads/             # File upload storage
│   ├── .env                 # Environment variables
│   ├── server.js            # Main entry point
├── *.html                   # Frontend HTML files
├── package.json

```
## 🚀 Tech Stack
| Layer        | Technology             |
| ------------ | ---------------------- |
| **Frontend** | HTML, CSS, JavaScript  |
| **Backend**  | Node.js, Express.js    |
| **Database** | MongoDB + Mongoose ODM |

## ⚙️ Installation & Run Locally

```http
# 1. Clone the repository
git clone https://github.com/Manoj0011290/IITGCS_24061453_T2_HealthCare_Management_System
cd IITGCS_24061453_T2_HealthCare_Management_System

# 2. Install backend dependencies
cd backend
npm install express mongoose dotenv bcryptjs jsonwebtoken express-async-handler multer

# 3. Run the server
npm install -g nodemon
npx nodemon server.js 
```

## 🔍 Features
* 💾 Add/Search/Update/Delete Patient Records
* 📋 Manage Appointments & Consultations
* 🧪 Upload and track Lab Results
* 💊 Maintain Prescriptions and Doctor Notes
* 🔐  Login for doctors, nurses, receptionists with role access
* 📂 Uploads and secure file storage

## Video Presentation
   https://drive.google.com/file/d/1Yf_uQYstdSthVmHQiXrCp1qouCRE1GRQ/view?usp=sharing
## Author

- [@MANOJ GOWDA B S](https://www.github.com/Manoj0011290)

 
