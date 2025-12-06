# 🚀 SPI Smart Campus Backend

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

**Sylhet Polytechnic Institute - Smart Campus Backend API**

This is the backend server for the SPI Smart Campus application. It provides a robust RESTful API to manage teachers, routines, departments, and other campus-related data, serving as the core logic layer for the frontend application.

---

## 🛠️ Tech Stack

- **Runtime Environment:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) (using Mongoose ODM)
- **CORS:** Cross-Origin Resource Sharing enabled
- **Environment Management:** Dotenv

---

## 🔌 API Endpoints

| Resource | Base Endpoint | Description |
| :--- | :--- | :--- |
| **Teachers** | `/api/teachers` | Manage faculty profiles (CRUD) |
| **Departments** | `/api/departments` | Manage academic departments |
| **Routines** | `/api/routines` | Create, read, update, and delete class schedules |
| **Subjects** | `/api/subjects` | Manage course subjects |
| **Rooms** | `/api/rooms` | Manage classroom information |
| **Stats** | `/api/stats` | Dashboard statistics and analytics |

---

## ⚙️ Installation & Setup

Follow these steps to get the backend running locally.

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local instance or Atlas connection string)

### 2. Clone the Repository
```bash
git clone https://github.com/asaduzzaman8316/spi-routine-system.git
cd spi-backend  # Navigate to the backend directory
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Application Configuration
Create a `.env` file in the root directory (`backend/.env`) with the following variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/spi_db
```

### 5. Run the Server
**Development Mode (using Nodemon):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`.

---

## 📂 Project Structure

```
backend/
├── config/             # Database connection configuration
├── controllers/        # Request handling logic
├── models/             # Mongoose data schemas
├── routes/             # API route definitions
├── server.js           # Entry point
└── package.json        # Dependencies and scripts
```

---

## 🤝 Contributing

Contributions are welcome! Please create a pull request for any feature enhancements or bug fixes.

---

## 📜 License

This project is licensed under the MIT License.
