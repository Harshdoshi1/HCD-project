# Student Performance Analyzer – Web Portal (HOD, Faculty, CC)

A role-based web application for academic and extracurricular evaluation used by Heads of Departments (HODs), Faculty members, and Class Coordinators. This system enables efficient grade entry, activity tracking, subject allocation, and ranking computation.

---

## 🔍 Overview

This web portal enables:
- **HODs** to assign subjects and define evaluation weightages.
- **Faculty** to enter academic scores and track student activities.
- **Class Coordinators** to manage student data and view reports.

---

## 🧰 Tech Stack

- **Frontend**: React.js (Vite)
- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Vercel (frontend), Vercel (backend) , Database (Aiven)

---

## 📦 Core Features

### 🎓 Academic Management
- Manual grade entry (ESE, IA, CSE, Term Work, Viva, Faculty Feedback)
- Bulk grade upload via Excel
- Automatic validation of grade limits
- Academic report generation per student

### 🏅 Extracurricular Tracking
- Activity input (hackathons, internships, events, sports)
- Points assignment with weightage (e.g., 1 point/month for offline internships)
- Combined scoring for academic + non-academic contributions

### 🔐 Role-Based Access
- **HOD**: Assign faculty, define subject weightages, manage access
- **Faculty**: Enter and manage grades and activities for assigned subjects only
- **CC**: View consolidated reports, assist in data management

### 🔧 System Functionality
- Secure JWT login for authenticated access
- Semester-wise subject mapping and trend tracking

---

## ⚙️ Setup Instructions

Clone Repository

git clone https://github.com/Harshdoshi1/HCD-project.git

## 📁 Project Structure

student-analysis/
├── backend/       # Node.js + Express API
├── frontend/      # React.js Admin Web UI
└── README.md

## 👨‍💻 Authors

Harsh Doshi

Krish Mamtora

Rishit Rathod
