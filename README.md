# ⚖️ Verit | Authentic Anonymous Feedback

**Verit** is a premium, privacy-first anonymous feedback platform designed for creators, builders, and professionals. Built with a high-end "Bento Grid" aesthetic, Verit allows users to receive honest, unfiltered thoughts through secure, customizable links.

![Verit Preview](https://res.cloudinary.com/ddni2vnua/image/upload/v1714123456/verit_preview.png)

---

## 🚀 The Tech Stack

### Frontend
- **React 19 & Vite**: Ultra-fast, modern component architecture.
- **Tailwind CSS 4**: Sophisticated styling with glassmorphism and premium color palettes.
- **Framer Motion**: Immersive page transitions and interactive animations.
- **Lucide React**: Clean, professional iconography.
- **html2canvas**: High-fidelity Instagram Story graphic generation.

### Backend
- **Node.js & Express**: Scalable API architecture.
- **MongoDB Atlas**: Secure, cloud-hosted document database.
- **Mongoose**: Robust data modeling.
- **JWT & Bcrypt**: Industry-standard security and authentication.

---

## 🧠 Integrated Power Tools

Verit integrates the world's best APIs to provide a seamless, safe experience:

1.  **Google Gemini AI**: Every message is scanned in real-time for toxicity and harassment, ensuring a safe community.
2.  **Razorpay**: A tiered subscription system (Pro & Ultra) for power users, processed through India's leading payment gateway.
3.  **Cloudinary**: Secure, anonymous hosting for image and video attachments within feedback.
4.  **Resend**: Instant transactional emails and high-speed OTP verification.
5.  **Geo-Mapping**: Automatic detection of feedback origin (Country/City) using IP intelligence.

---

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/sushmita-rgb/truthbox.git
cd truthbox
```

### 2. Backend Setup
Create a `.env` file in the `/backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
RESEND_API_KEY=your_key
GEMINI_API_KEY=your_key
ADMIN_EMAIL=admin@verit.app
ADMIN_PASSWORD=admin123
```

### 3. Run Locally
```bash
# In backend folder
npm install
npm run dev

# In frontend folder
npm install
npm run dev
```

---

## 📄 License
This project is for private use and development. Rebranding from TruthBox to Verit completed on April 26, 2026.

---

**Developed with ❤️ for the future of authentic communication.**
