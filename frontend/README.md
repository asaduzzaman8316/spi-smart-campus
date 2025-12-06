# 🎓 SPI Smart Campus Frontend

![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Redux](https://img.shields.io/badge/Redux-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

**Sylhet Polytechnic Institute - Smart Campus Portal**

A modern, full-stack web application designed to streamline class scheduling and management for students and faculty at Sylhet Polytechnic Institute. This system allows students to view their daily class routines, find teachers, and access important campus information through a sleek, responsive interface.

---

## 🚀 Key Features

### 📅 Intelligent Routine System
- **Dynamic Filtering:** Filter class schedules by Department, Semester, Shift, and Group.
- **Smart "Today" View:** Automatically highlights the current day's schedule for quick access.
- **PDF Export:** Download routine tables as formatted PDFs for offline use.

### 👥 Faculty Directory
- **Teacher Profiles:** Searchable list of faculty members with contact details and designations.
- **Department Integration:** Easily filter teachers by their specific department.

### 🛠️ Admin Dashboard
- **Routine Builder:** Interactive drag-and-drop interface for creating complex class schedules.
- **Teacher Manager:** Admin tools to add, edit, and remove teacher profiles.
- **Department Management:** Centralized control over department data.

### ✨ Modern UI/UX
- **Responsive Design:** Fully optimized for mobile, tablet, and desktop screens.
- **Dark Mode:** Elegant dark-themed interface with glassmorphism components.
- **Interactive:** Smooth animations powered by Lottie and AOS.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **Backend Integration:** REST API (Express/Node.js) & Firebase (Auth/Firestore)
- **Tools:** Lucide React (Icons), jsPDF (PDF Generation), React Toastify (Notifications)

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- Backend Server (Running on port 5000)

### Installation

1.  **Navigate to the frontend directory**
    ```bash
    cd frontend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the `frontend` root with your configuration:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000/api
    NEXT_PUBLIC_FIREBASE_API_KEY=your_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
    # ... other firebase config
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

5.  **Access the App**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
frontend/
├── app/                  # Next.js App Router pages
│   ├── dashboard/        # Admin management pages
│   ├── routine/          # Public routine viewer
│   ├── teacher/          # Teacher directory
│   └── today/            # Today's schedule
├── components/           # Reusable UI components
├── Lib/                  # API helpers & configuration
└── public/               # Static assets
```

---

## 📞 Contact

**Sylhet Polytechnic Institute**
*Empowering Future Engineers*
