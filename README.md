
# Stockify — Modern Stock Selection and Prediction Platform

Stockify is a full‑stack stock selection and prediction platform. The **frontend** is a polished, responsive **Next.js (TypeScript)** app using **Supabase Auth** and **Twelve Data API** for live charts. The **backend** is an **Apache Airflow** pipeline that fetches data, runs predictions, and sends daily emails.

---

## Highlights

- Google login via Supabase OAuth; user is added to DB on first sign‑in (name + email) and never duplicated
- Protected routes; unauthenticated users see a popup and are redirected
- Select favorite stocks and store preferences
- Dashboard with unique, real‑time graphs per stock
- Airflow DAG schedules daily predictions and email delivery
- Clean, corporate UI (dark gradient, responsive, TailwindCSS)

---

## Tech Stack

**Frontend**
- Next.js 13+ (App Router, TypeScript)
- TailwindCSS
- react-chartjs-2 + Chart.js
- Supabase JS client

**Backend**
- Apache Airflow
- Python 3.x
- Supabase (PostgreSQL)
- Twelve Data API
- SMTP (Nodemailer-like behavior implemented in Python)

---

## Database Schema (Supabase)

### users
- id bigint PK
- name varchar NOT NULL
- email varchar UNIQUE NOT NULL
- created_at timestamp DEFAULT now()

### stocks
- id bigint PK
- stock_name varchar NOT NULL
- stock_code varchar UNIQUE NOT NULL
- logo_url text

### user_stocks
- id bigint PK
- user_id bigint FK → users.id
- stock_id bigint FK → stocks.id
- created_at timestamp DEFAULT now()

### email_logs (backend, optional)
- id bigint PK
- user_id bigint FK → users.id
- stocks text
- email_status varchar DEFAULT 'pending'
- error_message text
- sent_at timestamp

---

## Project Structure

```
project-root/
│
├─ frontend/
│  ├─ app/
│  │  ├─ dashboard/
│  │  │  └─ page.tsx
│  │  ├─ select-stocks/
│  │  │  └─ page.tsx
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  │
│  ├─ components/
│  │  └─ ui/
│  │     ├─ Navbar.tsx
│  │     ├─ StockCard.tsx
│  │     ├─ StockGraph.tsx
│  │     └─ StockSelector.tsx
│  │
│  ├─ hooks/
│  │  └─ use-toast.ts
│  │
│  ├─ lib/
│  │  ├─ api.ts
│  │  ├─ supabase.ts
│  │  └─ utils.ts
│  │
│  ├─ supabase/
│  │  └─ migrations/
│  │     └─ 20250905014506_bright_surf.sql
│  │
│  ├─ next-env.d.ts
│  ├─ next.config.js
│  ├─ postcss.config.js
│  ├─ tailwind.config.ts
│  ├─ tsconfig.json
│  ├─ package.json
│  ├─ pnpm-lock.yaml
│  ├─ .eslintrc.json
│  ├─ .gitignore
│  └─ .env.local
│
└─ backend/
   ├─ dags/
   │  └─ stock_prediction_dag.py
   ├─ data/
   │  ├─ historical/
   │  └─ predictions/
   ├─ utils/
   │  ├─ db_utils.py
   │  ├─ fetch_stock.py
   │  ├─ send_email.py
   │  └─ train_model.py
   ├─ requirements.txt
   ├─ .env
   ├─ venv/
   └─ test.py
```

---

## Frontend Setup

1) Go to the frontend folder
```bash
cd frontend
```

2) Install dependencies (choose one)
```bash
npm install
# or
pnpm install
```

3) Environment variables (`frontend/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_TWELVEDATA_API_KEY=your_twelvedata_api_key
```

4) Run the app
```bash
npm run dev
# or
pnpm dev
```
Open http://localhost:3000

### Frontend Behavior

- On sign‑in with Google, the app ensures a user row exists in `users` (name + email). If it exists, nothing is added.
- Protected pages (`/dashboard`, `/select-stocks`) use a client guard; unauthenticated users see a toast/popup and are redirected to `/`.
- Stock selection writes rows into `user_stocks`.
- Dashboard queries the user’s selected stocks and renders a unique Chart.js line graph for each using Twelve Data API.

---

## Backend Setup (Airflow)

1) Go to backend
```bash
cd backend
```

2) Create and activate venv
```bash
python3 -m venv venv
source venv/bin/activate
```

3) Install requirements
```bash
pip install -r requirements.txt
```

4) Backend environment (`backend/.env`)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
TWELVEDATA_API_KEY=your_twelvedata_api_key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=Stockify <no-reply@yourdomain.com>
```

5) Initialize and run Airflow
```bash
airflow db init
airflow webserver -p 8080
airflow scheduler
```
Open http://localhost:8080 and enable the DAG.

### DAG Overview

- `dags/stock_prediction_dag.py` orchestrates:
  1. Read users + selections from Supabase
  2. Fetch latest stock data via Twelve Data API
  3. Run prediction routine in `utils/train_model.py`
  4. Compose and send HTML email via `utils/send_email.py`
  5. Optionally log outcomes in `email_logs`

---

## Migrations

- SQL migration files live in `frontend/supabase/migrations/`
- Apply via Supabase SQL Editor or Supabase CLI (`supabase db push`)
- Ensure tables exist before running the app

---

## Git Layout

- Separate `.gitignore` files in `frontend/` and `backend/`
- Initialize git at project root
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

To overwrite a non‑empty remote with local:
```bash
git push -f origin main
```

---

## Scripts (frontend/package.json)

Common scripts:
- `dev` — start dev server
- `build` — production build
- `start` — run production server
- `lint` — linting

---

## Notes

- Emails are handled by the backend only; the frontend never sends email.
- Keep API keys in env files; never commit `.env.local` or `backend/.env`.
- Each dashboard card renders a unique graph for its stock symbol.

---