# AI SEO Audit Engine

This is the core SEO analysis and web crawling engine for the AI SEO Platform. It features an asynchronous distributed crawling system that analyzes websites across the 6 Pillars of SEO, integrates with Google's PageSpeed API for Core Web Vitals, and utilizes Groq (Llama-3) to generate custom AI SEO consulting reports.

## 🏗️ Architecture

* **Framework:** Django REST Framework (DRF)
* **Task Queue:** Celery
* **Message Broker:** Redis (Docker)
* **Web Scraper:** BeautifulSoup4 + Requests
* **External APIs:** Google PageSpeed Insights API, Groq API (Llama-3-70b)
* **Database:** PostgreSQL

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

## ⚙️ Prerequisites

Before running this module, ensure you have the following installed:
* Python 3.10+
* Redis (Running via Docker or natively)
* PostgreSQL

## 🔐 Environment Variables

Create a `.env` file in your main project directory and add the following API keys:

```env
# Required for AI Recommendations
GROQ_API_KEY="your_groq_api_key_here"

# Required for Performance & Mobile Core Web Vitals
PAGESPEED_API_KEY="your_google_pagespeed_api_key_here"
```

## 🚀 Installation & Setup

1. **Install Dependencies**
   ```bash
   pip install django djangorestframework celery redis beautifulsoup4 requests python-dotenv groq
   ```

2. **Run Database Migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Start Redis (Docker)**
   If using Docker for Windows/Mac:
   ```bash
   docker run -d -p 6379:6379 redis
   ```

## 🏃‍♂️ Running the Engine

To run the full asynchronous engine, you need **two separate terminals**.

**Terminal 1: Start the Django Server**
```bash
python manage.py runserver
```

**Terminal 2: Start the Celery Worker**
*(Note: The `--pool=solo` flag is required for Windows environments to prevent forking errors).*
```bash
celery -A config worker --pool=threads --concurrency=10 -l info 
```

## 🧪 Testing the API

You can trigger an audit by sending a POST request to the start endpoint. 
*(Ensure you have at least one Website created in the database first!)*

**Using Python:**
```python
import requests

url = "http://127.0.0.1:8000/api/v1/audits/start/"
payload = {
    "website_id": 1, 
    "key_word": "your_target_keyword"
}

response = requests.post(url, json=payload)
print(response.json())
```
Watch the Celery terminal to see the live crawling logs and the final AI output!