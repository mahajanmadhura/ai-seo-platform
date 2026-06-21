# AI SEO Audit Platform

A modern web application for analyzing website SEO metrics, checking links, and generating comprehensive reports.

---

## 🛠️ Getting Started

Follow the steps below to set up and run both the backend and frontend servers.

### 1. Prerequisites

Before running the application, make sure you have the following installed:
- **Node.js** (v18+ recommended)
- **Python** (v3.10+ recommended)
- **Redis Server** (required for Celery background tasks)

---

### 2. Backend Setup (Django + Celery)

The backend is built with Django, Django REST Framework, and Celery for asynchronous background tasks.

#### Step 2.1: Navigate to the Backend Directory
Open a terminal and navigate to the `backend` folder:
```bash
cd backend
```

#### Step 2.2: Set Up Virtual Environment & Install Dependencies
Create a Python virtual environment and install the required dependencies:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\activate

# Activate virtual environment (macOS/Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Step 2.3: Run Database Migrations
Apply database migrations to set up the SQLite database:
```bash
python manage.py migrate
```

#### Step 2.4: Start the Django Development Server
Run the local development server:
```bash
python manage.py runserver
```
*The Django server will run at `http://127.0.0.1:8000/`.*

#### Step 2.5: Start Celery Worker (Background Tasks)
Ensure your **Redis Server** is running locally (usually on `localhost:6379`), then open a **separate terminal**, navigate to the `backend` folder, activate the virtual environment, and start the Celery worker:
```bash
# Activate virtual environment (Windows)
.\venv\Scripts\activate

# Start Celery
celery -A config worker --loglevel=info
```

---

### 3. Frontend Setup (React + Vite)

The frontend is a React single-page application built using Vite and Tailwind CSS.

#### Step 3.1: Navigate to the Frontend Directory
Open a new terminal and navigate to the `frontend` folder:
```bash
cd frontend
```

#### Step 3.2: Configure Environment Variables
Create a `.env` file from the example template:
```bash
copy .env.example .env
# On macOS/Linux: cp .env.example .env
```
Ensure that `VITE_API_BASE_URL` is set to your Django backend URL (default is `http://localhost:8000`).

#### Step 3.3: Install Dependencies
Install all package dependencies (including `lucide-react` for icons):
```bash
npm install
```

#### Step 3.4: Start the Vite Development Server
Run the local development server:
```bash
npm run dev
```
*The React frontend will be accessible at `http://localhost:5173/` (or the URL displayed in your terminal).*
