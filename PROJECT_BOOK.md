# PROJECT BOOK: SPI SMART CAMPUS SYSTEM

---

## TABLE OF CONTENTS

### 1. **Unit 01: Project Setup**
*   **1.1 Introduction & Problem Statement**: The need for digitalization in polytechnic education.
*   **1.2 System Objectives**: Core goals (Automation, Transparency, Accessibility).
*   **1.3 Development Tools & Environment**: VS Code, Git, Postman, MongoDB Compass.
*   **1.4 Project Initialization & Structure**: Monorepo setup, Folder hierarchy, NPM commands.

### 2. **Unit 02: UI Design & User Experience**
*   **2.1 Design Philosophy**: Implementing Glassmorphism and "Dark Mode First" principles.
*   **2.2 Color Theory & Typography**: Detailed palette breakdown and font selection (Inter/Outfit).
*   **2.3 Responsive Layouts & Breakpoints**: Handling Mobile, Tablet, and Desktop views using Tailwind.
*   **2.4 Component Library**: Breakdown of reusable components (Cards, Modals, Loaders).

### 3. **Unit 03: Backend Architecture**
*   **3.1 Node.js & Express Framework**: Why this stack was chosen over others.
*   **3.2 API Route Structure**: Organization of REST endpoints.
*   **3.3 Middleware Layers**: Validations, Auth checks, and Logging.
*   **3.4 Error Handling Protocols**: Centralized error management and response formatting.

### 4. **Unit 04: Authentication & Security**
*   **4.1 JWT Implementation**: Token creation, signing, and verification flow.
*   **4.2 Password Encryption (Bcrypt)**: Hashing strategies for user security.
*   **4.3 Role-Based Access Control (RBAC)**: Permissions for Admin vs Teacher vs Student.
*   **4.4 Secure Route Protection**: Guarding sensitive endpoints.

### 5. **Unit 05: Routine Management System**
*   **5.1 The Logic: Preventing Conflicts**: Deep dive into the conflict detection algorithm.
*   **5.2 PDF Generation Engine**: Technical implementation of `jspdf-autotable`.
*   **5.3 Student Routine Viewer**: Filtering logic and time-based highlighting.
*   **5.4 Admin Routine Builder**: Drag-and-drop interface and state management.

### 6. **Unit 06: Admin Dashboard & Analytics**
*   **6.1 Teacher Load Analysis**: Algorithms for calculating workload distribution.
*   **6.2 Department Metrics**: aggregating student and faculty data.
*   **6.3 CRUD Operations**: Managing Teachers, Notices, and Resources.

### 7. **Unit 07: Complaint & Feedback System**
*   **7.1 Submission Workflow**: Frontend validation and form handling.
*   **7.2 Admin Resolution Interface**: Status tracking and replies.
*   **7.3 Privacy & Anonymity**: Handling anonymous data securely.

### 8. **Unit 08: Database Schema Design**
*   **8.1 Teacher Collection**: Detailed schema analysis.
*   **8.2 Routine Collection**: Nested document structure for complex schedules.
*   **8.3 Notice & Complaint Collections**: Data models for communication.

### 9. **Unit 09: Deployment Pipeline**
*   **9.1 Frontend: Vercel Configuration**: CI/CD setup and edge networks.
*   **9.2 Backend: Cloud Hosting**: Service configuration on Render/DigitalOcean.
*   **9.3 Database: MongoDB Atlas**: Cluster setup and whitelist management.

### 10. **Unit 10: Testing, Maintenance & Future Scope**
*   **10.1 Testing Strategies**: Unit, Integration, and User Acceptance Testing.
*   **10.2 Maintenance Protocols**: Log monitoring, backups, and security patches.
*   **10.3 Future Roadmap**: AI integration, Native Apps, and more.

---

# DETAILED PROJECT DOCUMENTATION

## Unit: 01
### Project Setup

#### 1.1 Introduction & Problem Statement
The administrative landscape of educational institutions, particularly polytechnics like **Sylhet Polytechnic Institute**, involves managing massive amounts of dynamic data. This includes daily class routines for various departments and shifts, teacher profiles, examination schedules, and student grievances. 

**The Problem:**
Currently, these processes are heavily reliant on manual, paper-based workflows or disparate, non-integrated digital tools (like spreadsheets sharing via social media). This leads to several critical issues:
1.  **Information Asymmetry**: Students often miss class changes or urgent notices because they are posted on physical notice boards they are not near.
2.  **Scheduling Conflicts**: Creating routines manually for 30+ teachers and multiple departments often results in "double booking"—assigning one teacher to two classes simultaneously or two classes to one room.
3.  **Inefficiency**: Administrators spend countless hours manually calculating teacher workloads, often resulting in unfair distribution of classes.
4.  **Lack of Feedback**: There is no safe, anonymous channel for student complaints, leading to unresolved facilities or academic issues.

**The Solution:**
The **SPI Smart Campus System** is a bespoke, full-stack web application engineered to solve these exact problems. It acts as a central nervous system for the campus, digitizing every aspect of the academic workflow. It transforms static data into interactive, real-time insights accessible from any smartphone or computer.

#### 1.2 System Objectives
The development was guided by five primary objectives to ensure the final product meets the needs of all stakeholders:

1.  **Centralization**: To bring Routine, Teacher Management, Notices, and Complaints under a single domain. No more switching between apps.
2.  **Intelligent Automation**: To implement algorithms that automatically detect routine conflicts during the creation phase, making it mathematically impossible to create a flawed schedule.
3.  **Data Transparency**: To provide clear, unhindered access to public information (routines, faculty lists) while strictly securing private administrative data.
4.  **User-Centric Design**: To build an interface that is not just functional but "delightful" to use, encouraging adoption among students who appreciate modern UX.
5.  **Scalability**: To design a database and codebase architecture that can easily accommodate more departments, new features (like exam results), and higher traffic in the future.

#### 1.3 Development Tools & Environment
Building a modern web application requires a robust set of tools. We carefully selected our stack to balance ease of development with high performance.

*   **Visual Studio Code (VS Code)**: Our Integrated Development Environment. its extensive plugin ecosystem (Prettier, ESLint, Tailwind CSS IntelliSense) was crucial for maintaining code quality.
*   **Git & GitHub**: Used for Version Control. We utilized feature branching workflows, ensuring that new features (like the 'Complaint System') were developed in isolation before merging into the main codebase.
*   **Postman**: A critical tool for Backend development. Before a single UI button was designed, every API endpoint was rigorously tested in Postman to verify Status Codes (200 OK, 404 Not Found, 500 Server Error) and JSON response structures.
*   **MongoDB Compass**: Provided a visual interface effectively to inspect our NoSQL database. It allowed us to verify that complex nested documents (like Routine arrays) were being stored correctly.
*   **Google Chrome DevTools**: Used for frontend debugging, specifically the 'Network' tab to monitor API latency and the 'Elements' tab to fine-tune CSS layouts.

#### 1.4 Project Initialization & Structure
The project follows a **Client-Server Architecture** housed within a Monorepo. This means both the frontend and backend codebases exist in the same root git repository but run as separate services.

**The Structure:**
*   **Root Directory**: Contains global configurations.
    *   `/frontend`: The Next.js 15 application.
        *   `/app`: Uses the modern App Router file-system based routing.
        *   `/public`: Hosts static assets like the Institute Logo and Lottie JSON files.
        *   `/context`: React Context API providers for global state (AuthContext).
    *   `/backend`: The Express.js application.
        *   `/config`: Database connection logic.
        *   `/models`: Mongoose Schemas defining our data shape.
        *   `/controllers`: The "Brains" of the backend containing the business logic.
        *   `/routes`: The URL endpoints mapping requests to controllers.

**Initialization Workflow:**
1.  **Frontend**: We used `npx create-next-app@latest` to scaffold the React environment. We opted for **Tailwind CSS** pre-configuration to streamline styling.
2.  **Backend**: We initialized a standard Node.js project with `npm init -y`. Essential packages installed included:
    *   `express` (Web Framework)
    *   `mongoose` (DB Interaction)
    *   `dotenv` (Environment Variables)
    *   `cors` (Cross-Origin Resource Sharing)
    *   `bcryptjs` & `jsonwebtoken` (Security).

---

## Unit: 02
### UI Design & User Experience

#### 2.1 Design Philosophy
The User Interface (UI) is designed to be immersive. We moved away from the "boring corporate dashboard" aesthetic to something that appeals to the younger demographic (students).

*   **Dark Mode First Strategy**: Recognizing that students often access the system at night, the default theme is a deep, soothing dark mode. This reduces blue light exposure and saves battery on OLED screens.
*   **Glassmorphism**: We heavily utilized the CSS `backdrop-filter: blur()` property. UI elements like the Sidebar and Modal overlays look like frosted glass. This provides context; the user can still see the content "behind" the overlay, maintaining a sense of place.
*   **Minimalism**: We strictly avoided clutter. Information is presented in clean "Cards". If a page is for "Routines", it shows *only* routines, with secondary options tucked away in menus.

#### 2.2 Color Theory & Typography
A consistent design system was established early on to prevent visual chaos.

**The Color Palette (Tailwind Classes):**
*   `bg-slate-900` (#0F172A): The canvas background. Deep Navy.
*   `bg-slate-800` (#1E293B): The surface color for cards and sidebars. Lighter Navy.
*   `text-slate-100` (#F1F5F9): Primary text. Almost white, but slightly softer.
*   `text-sky-400` (#38BDF8): The primary action color. Used for links, active buttons, and highlights. It pops beautifully against the dark background.
*   `text-green-400` (#4ADE80): Success states (e.g., "Complaint Resolved").
*   `text-red-400` (#F87171): Error states or destructive actions (e.g., "Delete Routine").

**Typography:**
*   **Headings**: We used **Outfit**, a geometric sans-serif font. It feels modern, technical, and approachable.
*   **Body Text**: We used **Inter**, the industry standard for UI readability. It has a tall x-height, making it legible even on small mobile screens.

#### 2.3 Responsive Layouts & Breakpoints
The system is fully responsive, meaning it "responds" or adapts to the screen size. We avoided fixed widths (like `width: 1000px`) and instead used fluid percentages and CSS Grid.

**Key Breakpoints Strategy:**
*   **Mobile (< 640px)**: 
    *   Sidebar collapses into a bottom tab bar or hamburger menu.
    *   Grids become single-column (1 item per row).
    *   Text sizes are slightly reduced.
*   **Tablet (640px - 1024px)**:
    *   Grids expand to 2 columns.
    *   Navigation becomes a simplified sidebar icon rail.
*   **Desktop (> 1024px)**:
    *   Full expanded Sidebar.
    *   Grids show 3 or 4 cards per row.
    *   Complex data tables are fully visible without horizontal scrolling.

#### 2.4 Component Library
To maintain consistency and speed up development, we built a library of "Atomic" components.
*   **`InfoCard.jsx`**: A standardized card for displaying stats. It accepts props like `title`, `value`, `icon`, and `color`. This ensures every stat card in the admin dashboard looks identical.
*   **`Sidebar.jsx`**: A smart navigation component that knows which page is active and highlights the corresponding link.
*   **`Loader.jsx`**: A reusable spinner or Lottie animation used whenever data is being fetched. This prevents the user from staring at a blank screen.
*   **`Modal.jsx`**: A wrapper component that handles the "pop-up" logic, backdrop blurring, and click-outside-to-close functionality.

---

## Unit: 03
### Backend Architecture

#### 3.1 Node.js & Express Framework
We chose **Node.js** for the backend runtime. Its non-blocking, event-driven architecture is ideal for I/O-heavy applications like ours. When 500 students check their routine at 8:00 AM, Node.js handles these concurrent requests efficiently without spawning new threads for each, keeping memory usage low.

**Express.js** was added as the web application framework. It provides a thin layer of fundamental web application features, allowing us to define routes (like `GET /api/routine`) and middleware chains elegantly.

#### 3.2 API Route Structure
The API is Versioned (v1) and Resource-Oriented.
*   `/api/auth`: Handles Login, Registration (Admin only), and Token verification.
*   `/api/teachers`: CRUD (Create, Read, Update, Delete) operations for faculty data.
*   `/api/routines`: Complex endpoints for fetching and generating schedules.
*   `/api/notices`: Manages the public notice board.
*   `/api/complaints`: Handles student submissions and admin updates.

Each route file (e.g., `teacherRoutes.js`) is strictly responsible for one domain, keeping the codebase clean and maintainable.

#### 3.3 Middleware Layers
Middleware functions are the "Gatekeepers" of our API. They execute before the final controller logic.
1.  **`cors`**: Configured to allow requests ONLY from our frontend domain (production) or localhost (development). This prevents unauthorized websites from using our API.
2.  **`express.json()`**: Automatically parses incoming JSON payloads (from POST requests) and makes them available in `req.body`.
3.  **`authMiddleware.js`**:
    *   Intercepts the request.
    *   Looks for `Authorization: Bearer <token>` header.
    *   Decodes the token.
    *   If invalid/expired, sends `401 Unauthorized` immediately.
    *   If valid, attaches the user info to `req.user` and calls `next()`.

#### 3.4 Error Handling Protocols
We moved away from "try-catch" blocks scattered everywhere to a centralized Error Handler.
*   **Custom Error Class**: We created an `AppError` class that takes a `statusCode` and `message`.
*   **Global Error Middleware**: Located at the end of the `app.js` file. If any controller calls `next(error)`, this middleware catches it and sends a standardized JSON response:
    ```json
    {
      "success": false,
      "status": 500,
      "message": "Database connection failed",
      "stack": "..." // Only in development
    }
    ```
This ensures the frontend always receives errors in a predictable format.

---

## Unit: 04
### Authentication & Security

#### 4.1 JWT Implementation
We use **JSON Web Tokens (JWT)** for stateless authentication. Unlike sessions, which require server-side storage, JWTs are self-contained.
*   **Payload**: The token contains non-sensitive user data: `{ id: "user_123", role: "admin" }`.
*   **Signing**: The token is signed using a secret key (`JWT_SECRET`) stored in environment variables. This signature prevents tampering. If a hacker tries to change their role to "admin" in the token, the signature validation will fail.
*   **Expiration**: Tokens are set to expire in 30 days, forcing re-login to maintain security.

#### 4.2 Password Encryption (Bcrypt)
Storing passwords in plain text is a cardinal sin in web development. We use **Bcryptjs**.
*   **Hashing**: When a user is created, their password (e.g., "password123") is passed through the bcrypt algorithm with a "salt" (random data).
*   **Result**: The database stores a hash like `$2a$10$N9qo8uLOickgx2...`.
*   **Comparison**: During login, we don't decrypt the hash (impossible). Instead, we hash the *input* password and compare the two hashes.

#### 4.3 Role-Based Access Control (RBAC)
Not all users are equal. We implemented a robust permission system.
*   **Super Admin**: Has the "God Key". Can create/delete other Admins.
*   **Admin**: Can manage Routines, Teachers, and Notices. Cannot delete the Super Admin.
*   **Teacher**: Restricted View. Can log in to see *their* specific load and profile. Cannot edit routines.
*   **Public/Student**: Can view Routines and Notices without login. Can POST complaints.

#### 4.4 Secure Route Protection
Sensitive API endpoints are wrapped with both `protect` and `restrictTo` middleware.
*   `router.delete('/teachers/:id', protect, restrictTo('admin'))`: This line ensures that even if you have a valid token (are logged in), the request will fail if your role is not specifically 'admin'.

---

## Unit: 05
### Routine Management System

#### 5.1 The Logic: Preventing Conflicts
This is the heart of the "Smart" Campus. The logical challenge was to prevent **Deadlocks**.
*   **Room Conflict**: Checks if `Room X` is already booked at `10:00 AM` on `Sunday`.
*   **Teacher Conflict**: Checks if `Teacher Y` is already teaching `Class Z` at `10:00 AM`.

**The Algorithm (Simplified):**
When the Admin attempts to add a class:
1.  Frontend sends: `{ day, time, teacherId, roomId }`.
2.  Backend queries DB: `Routine.find({ "days.classes.time": time, "days.classes.teacher": teacherId })`.
3.  If result > 0, return Error: "Teacher is busy in another department".
4.  Backend queries DB: `Routine.find({ "days.classes.time": time, "days.classes.room": roomId })`.
5.  If result > 0, return Error: "Room is already occupied".
This guarantees data integrity at the database level.

#### 5.2 PDF Generation Engine
We integrated `jspdf` and `jspdf-autotable` to generate professional routine PDFs.
*   **DOM Access**: The code looks at the HTML table rendered on the screen.
*   **Parsing**: It iterates through headers and rows, extracting text.
*   **Styling**: We inject custom styles (cell padding, font size, header color) into the PDF generator config to match the institute's branding.
*   **Output**: The binary data is blobbed and forced to download as `Routine_Computer_5th_1st.pdf`.

#### 5.3 Student Routine Viewer
The viewer is designed for speed.
*   **Filtering**: A student selects generic parameters (Dept/Sem/Shift). The app filters the global routine state in real-time.
*   **"Today" Logic**: We use `new Date().getDay()` (0=Sunday, 1=Monday...). The app automatically tabs to the current day.
*   **Current Class Highlight**: The system compares `new Date().getHours()` with the class execution times (e.g., 10:00-11:00). If the current time falls within a slot, that row is highlighted in Green/Blue, giving instant context.

#### 5.4 Admin Routine Builder
The Builder is a "Write" interface.
*   **Dynamic State**: A complex React state object mirrors the routine structure.
*   **Interactive UI**: Admins click a "Plus" button on a specific time slot. A modal appears with dropdowns for Subject, Teacher, and Room.
*   **Real-time Validation**: As the admin selects a teacher, the system (in future iterations) can grey out teachers who are busy, proactively preventing errors.

---

## Unit: 06
### Admin Dashboard & Analytics

#### 6.1 Teacher Load Analysis
To ensure fairness, we built a Load Calculator.
*   **Step 1**: Fetch ALL routines from the database.
*   **Step 2**: Create a map of teachers initialized to zero.
*   **Step 3**: Iterate through every class in every routine.
*   **Step 4**: If `class.type === "Theory"`, increment teacher's load by 1. If `Lab`, increment by 2 or 3 depending on duration.
*   **Visualization**: This data is fed into a Recharts Bar Chart, visually showing who is overloaded (>20 classes/week) vs underloaded.

#### 6.2 Department Metrics
The dashboard provides a "Health Check" of the institute.
*   **Aggregators**: Simple database counts (`Teacher.countDocuments()`, `Routine.countDocuments()`) are displayed in cards.
*   **Department Breakdown**: We group data by department field, allowing the Principal to see "Computer Dept has 12 teachers" vs "Civil Dept has 8".

#### 6.3 CRUD Operations
*   **Teacher Management**: Forms to Add new teachers (with image upload handling). Tables to Edit details or Delete former faculty.
*   **Notice Management**: A Rich Text Editor allows admins to write formatted notices. These are saved as HTML strings in the database and rendered safely on the frontend.

---

## Unit: 07
### Complaint & Feedback System

#### 7.1 Submission Workflow
*   **Form**: Contains fields for `Subject`, `Category` (Academic/Facilities), and `Description`.
*   **Validation**: Frontend ensures no empty submissions.
*   **Submission**: POST request sent to API. If the server confirms receipt, a Success Flash Message is shown to the student.

#### 7.2 Admin Resolution Interface
*   **Queue View**: Admins see a list of complaints sorted by Date (Newest first).
*   **Status Toggling**: A dropdown allows changing status from "Pending" -> "Processing" -> "Resolved".
*   **Feedback Loop**: Changing the status updates the database. The student, checking their complaint ID later, sees this new status.

#### 7.3 Privacy & Anonymity
We take student privacy seriously.
*   **Anonymous Toggle**: If a student checks "Stay Anonymous", the frontend deliberately sends `studentId: null`.
*   **Data Protection**: Even for non-anonymous complaints, student IDs are visible only to Admins, ensuring no peer retaliation.

---

## Unit: 08
### Database Schema Design

#### 8.1 Teacher Collection
The `Teacher` Schema is the source of truth for faculty identity.
*   `name`: String (Required).
*   `email`: String (Unique Index). Essential for login.
*   `password`: String (Select: False). This ensures that querying a teacher *does not* return their password hash by default, creating a safety buffer.
*   `department`, `designation`, `phone`: Meta-data fields.
*   `avatar`: URL string pointing to the image storage.

#### 8.2 Routine Collection
This is a sophisticated, deeply nested schema.
*   **Root**: `Department`, `Semester`, `Shift`, `Group`. This composite key ensures uniqueness (you can't have two routines for Computer-5th-1st-A).
*   **Level 1 (Days)**: Array of objects `{ name: "Sunday", classes: [] }`.
*   **Level 2 (Classes)**: Array of objects `{ subject, teacherName, roomNumber, startTime, endTime }`.
This nesting allows MongoDB to retrieve the *entire* weekly routine in a single query, which is extremely efficient compared to SQL joins.

#### 8.3 Notice & Complaint Collections
*   **Notice**: `{ title, content, date, postedBy }`. `postedBy` links via ObjectId to the Admin who posted it.
*   **Complaint**: `{ category, description, status, submittedAt }`. `status` is an ENUM ['Pending', 'Resolved', etc.] to enforce strict state transitions.

---

## Unit: 09
### Deployment Pipeline

#### 9.1 Frontend: Vercel Configuration
We chose **Vercel** for its native Next.js support.
*   **Git Integration**: We linked the GitHub `main` branch to Vercel.
*   **Auto-Deployment**: Every `git push` triggers a build pipeline. Vercel installs dependencies, runs `npm run build`, and if successful, swaps the production URL to the new version.
*   **Edge Functions**: Vercel serves the static assets (JS/CSS) from CDNs close to the user (e.g., Singapore server for Bangladesh users), ensuring low latency.

#### 9.2 Backend: Cloud Hosting
Hosted on **Render.com** (or similar PaaS).
*   **Environment**: A logical container running Node.js.
*   **Keep-Alive**: We configured the server to auto-restart if it crashes.
*   **Environment Variables**: Securely injected `MONGO_URI` and `JWT_SECRET` via the hosting dashboard, keeping them out of the codebase.

#### 9.3 Database: MongoDB Atlas
*   **Cluster**: A distributed database replica set (Primary + Secondaries).
*   **Security**: IP Whitelisting is enabled. We allowed `0.0.0.0/0` (Anywhere) for ease of connection from Vercel/Render, protected by a strong username/password combo.
*   **Backups**: Atlas manages automated daily backups, ensuring data safety.

---

## Unit: 10
### Testing, Maintenance & Future Scope

#### 10.1 Testing Strategies
*   **Unit Testing**: We wrote small scripts to test utility functions (e.g., verifying that the Class Overlap function returns `true` for intersecting time intervals).
*   **Manual Integration Testing**: Rigorous clicking through every user flow (Login -> View Routine -> Logout) to catch UX bugs.
*   **Cross-Browser Testing**: Verified layout consistency on Chrome, Firefox, and Safari.

#### 10.2 Maintenance Protocols
*   **Monitoring**: We use console logs in production (viewable via Render dashboard) to track API request failures.
*   **Dependency Audits**: Regular `npm audit` runs to identify vulnerable packages.
*   **Data Pruning**: Future scripts will archive old routines (e.g., from 2024) to keep the active database light.

#### 10.3 Future Roadmap
The project is built to evolve.
1.  **Student Portals**: Individual logins for students to track attendance and CGPA.
2.  **AI Chatbot**: Integrating an LLM (like Gemini) to allow students to ask "When is my Python class?" and get an instant natural language answer.
3.  **Mobile App**: Building a React Native version for offline access and Push Notifications.
4.  **Digital Notice Board**: Casting the "Notices" page to large TV screens in the college lobby physically.

---
**Document End**
