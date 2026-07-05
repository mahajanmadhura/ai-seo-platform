# AI SEO Audit Platform & Crawler Engine

A modern web application for analyzing website SEO metrics, checking links, and generating comprehensive reports.

---

## 🏗️ Architecture

* **Frontend:** React + Vite, Tailwind CSS
* **Backend:** Django REST Framework (DRF)
* **Task Queue:** Celery
* **Message Broker:** Redis
* **Web Scraper:** BeautifulSoup4 + Requests
* **External APIs:** Google PageSpeed Insights API, Groq API (Llama-3-70b)
* **Database:** SQLite (local dev) / PostgreSQL

## ✨ Features Included

1. **Deep Crawler:** Breadth-First Search (BFS) queue crawling up to 5 pages per audit.
2. **On-Page SEO:** Grades Titles, H1-H3s, Keyword Density, and Meta tags.
3. **Technical SEO:** Extracts `robots.txt`, `sitemap.xml`, Schema.org JSON, and Hreflang tags.
4. **Mobile SEO:** Verifies viewport configuration and mobile tap targets.
5. **Security SEO:** Validates SSL certificates, Mixed Content, and HTTP Security Headers (HSTS, CSP).
6. **Performance SEO:** Fetches real-world LCP, FCP, CLS, TTFB, and FID via Google PageSpeed API.
7. **Link Analysis:** Categorizes internal, external, and broken (404) links.
8. **AI Engine:** Summarizes database issues into actionable, 2-sentence consulting advice.

---

## 🛠️ Getting Started

Follow the steps below to set up and run both the backend and frontend servers.

### 1. Prerequisites

Before running the application, make sure you have the following installed:
- **Node.js** (v18+ recommended)
- **Python** (v3.10+ recommended)
- **Redis Server** (required for Celery background tasks)

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

#### Step 2.3: Configure Environment Variables
Create a `.env` file in the `backend` directory and configure the following variables:
```env
GROQ_API_KEY="your_groq_api_key_here"
PAGESPEED_API_KEY="your_google_pagespeed_api_key_here"
```

#### Step 2.4: Run Database Migrations
Apply database migrations to set up the database:
```bash
python manage.py migrate
```

#### Step 2.5: Start the Django Development Server
Run the local development server:
```bash
python manage.py runserver
```
*The Django server will run at `http://127.0.0.1:8000/`.*

#### Step 2.6: Start Celery Worker (Background Tasks)
Ensure your **Redis Server** is running locally (usually on `localhost:6379`), then open a **separate terminal**, navigate to the `backend` folder, activate the virtual environment, and start the Celery worker (use `--pool=solo` on Windows):
```bash
# Activate virtual environment (Windows)
.\venv\Scripts\activate

# Start Celery
celery -A config worker --loglevel=info --pool=solo
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
*The React frontend will be accessible at `http://localhost:5173/`.*

