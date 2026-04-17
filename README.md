# 🔒 TruthBox

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</div>

<br/>

**TruthBox** is a modern, privacy-first anonymous feedback platform. It allows users to generate specific, custom links for their questions, issues, or ideas—supporting image and video attachments—so anyone can leave honest, unfiltered thoughts with zero identity traces.

## ✨ Key Features

- **100% Anonymous Delivery**: Drop brutal honesty or kind words safely. Identity is completely protected.
- **Rich Media Support**: Ask questions and natively attach local files (images, videos) or direct web URLs.
- **Granular Custom Links**: Instead of passing around one generic profile link, generate dedicated unique URLs for **every single question/issue** you have.
- **Dynamic Dashboard**: Easily view, manage, and track all the custom links you've made, and read private feedback tied contextually to each link.
- **Premium Aesthetics**: Engineered with deep glass-morphism panels, vivid ambient glows, and fully responsive pure CSS styling for high-end luxury feel.
- **Secure Authentication**: Encrypted password matching and rigorous JWT (JSON Web Token) architecture.

## 🛠️ Tech Stack

#### Frontend
- **React 18** (Vite bundler) for blazing-fast modular components.
- **TailwindCSS v4** for utility-first, robust responsive styling.
- **React Router DOM** for instantaneous client-side navigation.
- **Axios** mapped to an API utility module to intercept and inject secure tokens.

#### Backend
- **Node.js runtime** powered by **Express.js**.
- **MongoDB** integration modeled smoothly via **Mongoose**.
- **Multer** for seamless `multipart/form-data` handling to process image and video file streams locally.
- **Bcrypt & JSONWebToken** locking down the API endpoints safely behind cryptographic schemas.

---

## 🚀 Installation & Local Environment

Follow these steps to run **TruthBox** on your own local device.

### Prerequisites:
Make sure you have Node JS and NPM installed on your machine. You will also need a MongoDB Database URI.

### 1. Backend Setting
```bash
# Enter the backend directory
cd backend

# Install all NodeJS dependencies
npm install

# (Optional) Create a .env file and supply a MONGO_URI string
# e.g., MONGO_URI=mongodb+srv://<username>:<password>@cluster/truthbox

# Spin up the development server using nodemon
npm run dev
```
*The backend server will instantiate securely on `http://localhost:5000`.*

### 2. Frontend Settings
```bash
# Enter the frontend directory via a new terminal tab
cd frontend

# Install Vite React frontend dependencies
npm install

# Boot up the Vite client engine
npm run dev
```
*Vite will launch TruthBox on `http://localhost:5173`. You can now open your browser!*

---

## 🌍 Production Environment Deployment

TruthBox has been fully pre-configured with dynamic URL routing (`import.meta.env`) to support instant CI/CD deployment globally.

1. **Deploy Backend (e.g., Render, Railway)**
   - Create a Web Service pointing to the `./backend` root directory.
   - Run Build Command: `npm install`
   - Run Start Command: `npm run start` 

2. **Deploy Frontend (e.g., Vercel, Netlify)**
   - Connect platform to this GitHub repository. Ensure Root Directory targets `./frontend`.
   - Setup Environment Variables: Add `VITE_API_URL` mapped to the secure HTTPS link you generated in step 1 (Example: `https://truthbox.onrender.com/api`).
   - Deploy.

---
> Designed with precision and style. Unfiltered Feedback, Zero Judgment.
