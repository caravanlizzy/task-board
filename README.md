# Task Board

A modern, responsive task management application built with **Node.js**, **Express**, **HTMX**, and **SQLite**. This project demonstrates a powerful alternative to complex single-page application (SPA) frameworks by using server-side rendering combined with HTMX for dynamic, interactive front-end updates.

---

## 🚀 Purpose and Functionality

The **Task Board** is designed to help users organize their work efficiently through a clean, intuitive interface. It provides a visual representation of tasks across different stages of completion.

### Key Features:
- **Task Kanban Board**: A three-column view (To-Do, In Progress, Done) to visualize workflow and task distribution.
- **Dynamic Sidebar**: A "Recent Tasks" sidebar that updates automatically as tasks are modified, providing quick access to your work.
- **Full CRUD Operations**:
  - **Create**: Add new tasks with title, description, priority, and initial status.
  - **Read**: Detailed view for each task, including status indicators and priority highlights.
  - **Update**: Edit existing task details through a modern form interface.
  - **Delete**: Remove tasks with built-in confirmation to prevent accidental loss.
- **Priority System**: Tasks are categorized by priority (High, Medium, Low) with visual color coding.
- **Modern Dark UI**: A sleek, purple-themed dark mode interface built with Tailwind CSS.

---

## 🛠 Technical Explanation

The application follows a **Hypermedia Driven** architecture, prioritizing server-side logic and utilizing HTMX to handle front-end interactivity without the overhead of heavy JavaScript frameworks.

### Tech Stack:
- **Backend**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) - Handles routing and business logic.
- **Frontend Interactivity**: [HTMX](https://htmx.org/) - Allows for AJAX requests, CSS transitions, and WebSockets directly from HTML attributes.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
- **Database**: [SQLite](https://sqlite.org/) (via `better-sqlite3`) - A lightweight, file-based SQL database for persistent storage.
- **Templating**: JavaScript Template Strings - Clean, server-side HTML generation.

### How it Works:
1. **Hypermedia as the Engine of Application State (HATEOAS)**:
   The server responds with HTML fragments rather than JSON. HTMX intercepts clicks and form submissions, swaps the received HTML into the DOM, and updates the URL without a full page refresh.
   
2. **Event-Driven UI Updates**:
   The app uses custom HTTP headers (like `HX-Trigger: taskUpdated`) to synchronize different parts of the UI. For example, when a task is updated in the main content area, the sidebar automatically refreshes by listening for that specific event.

3. **Persistent Storage**:
   Data is stored in an SQLite database. By default, it uses a local `tasks.db` file. On the first run, the system automatically initializes the database schema, ensuring a "zero-config" setup.

---

## ☁️ Deployment on Railway

To deploy this application on Railway, you have two options for the database:

### Option 1: Persistent SQLite (Easiest)
1. **Volume Mounting**: Add a [Volume](https://docs.railway.app/guides/volumes) to your Railway service.
2. **Environment Variable**: Set the `DB_PATH` environment variable to point to the mounted volume path (e.g., `/app/data/tasks.db`).
3. **App Settings**: Ensure your app starts with `npm start`.

### Option 2: Managed PostgreSQL (Recommended for Production)
1. **Add Database**: Add a **PostgreSQL** service to your Railway project.
2. **Connect**: Railway automatically provides a `DATABASE_URL` to your app if they are in the same project.
3. **Automatic Switching**: The application will automatically detect `DATABASE_URL` and use PostgreSQL instead of SQLite.

### ⚠️ Note on "SQLite3" Railway Template
If you see errors related to `peewee.OperationalError: unable to open database file` or `wsgi.py`, you may have added a separate "SQLite3" service (which is a Python-based web interface). 
- This application **includes its own SQLite engine**. You do **not** need to add a separate SQLite service from the Railway template store.
- Simply follow the "Volume Mounting" steps above on your main application service.

---

## 📁 Project Structure

```text
TaskBoard/
├── src/
│   ├── data/
│   │   └── tasks.js        # SQLite database logic and CRUD operations
│   └── templates/
│       └── taskTemplates.js # HTML templates and UI components
├── index.js                # Express server and route definitions
├── package.json            # Project dependencies and scripts
└── tasks.db                # SQLite database file (generated on first run)
```

---

## 🏁 Getting Started

### Prerequisites:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation:
1. Clone or download the repository.
2. Navigate to the project root:
   ```bash
   cd TaskBoard
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application:
1. Start the server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to:
   ```text
   http://localhost:3001
   ```

---

## 📝 Technical Notes
- **Performance**: By shipping minimal JavaScript (only HTMX) and rendering HTML on the server, the application achieves extremely fast initial load times and high perceived performance.
- **Maintenance**: The logic is centralized on the server, reducing the complexity of state management between the frontend and backend.
