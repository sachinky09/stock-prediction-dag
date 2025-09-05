
# Stockify — Modern Stock Selection and Prediction Platform

Stockify is a **full-stack stock selection and prediction platform** designed to help users select their favorite stocks, view real-time data, and make smarter investment decisions.  
It features a **Next.js frontend** with **Supabase backend**, Google authentication, and Twelve Data API integration for live market data.

---

## **Features**

- **Google Authentication** (via Supabase OAuth)
- **Landing Page** with modern gradient UI and call-to-action buttons
- **Stock Selection**: Browse stocks, select favorites, and save preferences to the database
- **Dashboard**:
  - Displays selected stocks with **real-time live graphs**
  - Unique graph for each stock using Twelve Data API
  - Clean, corporate-grade UI
- **AuthGuard**:
  - Blocks access to protected routes if not signed in
  - Shows popup and redirects to landing page
- **Responsive UI**:
  - Works seamlessly on desktop, tablet, and mobile

---

## **Tech Stack**

### Frontend
- [Next.js 13+](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/) for stock graphs

### Backend
- [Supabase](https://supabase.com/) for database and authentication
- [PostgreSQL](https://www.postgresql.org/)
- [Twelve Data API](https://twelvedata.com/) for live stock market data

---

## **Database Schema**

### `users`
| Column     | Type      | Constraints |
|------------|-----------|-------------|
| id         | bigint    | Primary key |
| name       | varchar   | Required |
| email      | varchar   | Required, unique |
| created_at | timestamp | Default now() |

### `stocks`
| Column      | Type      | Constraints |
|-------------|-----------|-------------|
| id          | bigint    | Primary key |
| stock_name  | varchar   | Required |
| stock_code  | varchar   | Required, unique |
| logo_url    | text      | Optional |

### `user_stocks`
| Column      | Type      | Constraints |
|-------------|-----------|-------------|
| id          | bigint    | Primary key |
| user_id     | bigint    | Foreign key → users.id |
| stock_id    | bigint    | Foreign key → stocks.id |
| created_at  | timestamp | Default now() |

### `email_logs` (future backend feature)
| Column      | Type      | Constraints |
|-------------|-----------|-------------|
| id          | bigint    | Primary key |
| user_id     | bigint    | Foreign key → users.id |
| stocks      | text      | JSON or comma-separated list |
| email_status| varchar   | Default 'pending' |
| error_message | text    | Optional |
| sent_at     | timestamp | Optional |

---

## **Project Structure**

```
src/
│
├── app/
│   ├── dashboard/
│   │   └── page.js          # Dashboard page with stock graphs
│   ├── select-stocks/
│   │   └── page.js          # Stock selection page
│   ├── globals.css          # Global styles (Tailwind)
│   ├── layout.js            # Root layout wrapper with Navbar
│   └── page.js               # Landing page
│
├── components/
│   ├── layout/
│   │   ├── AuthGuard.jsx     # Protects routes and handles redirects
│   │   └── Navbar.jsx        # Top navigation bar
│   │
│   └── stock/
│       ├── StockGraph.js     # Real-time graph component
│       └── StockCard.js      # (Optional) Stock display component
│
├── lib/
│   └── supabaseClient.js     # Supabase client and user check logic
│
└── utils/
    └── fetchStockAPI.js      # Helper to fetch data from Twelve Data API
```

---

## **Getting Started**

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/stockify.git
cd stockify
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Variables**
Create a `.env.local` file in the root directory and add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_TWELVEDATA_API_KEY=your_twelvedata_api_key
```

For backend email service (future feature):
```
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM=Stockify <no-reply@yourdomain.com>
BASE_URL=http://localhost:3000
```

### **4. Run the Development Server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## **Pages Overview**

| Page             | Description |
|------------------|-------------|
| `/`              | Landing page with hero section and sign-in button |
| `/select-stocks` | Browse stocks and select favorites |
| `/dashboard`     | View selected stocks with live unique graphs |

---

## **How It Works**

1. **User Sign In**  
   - Google OAuth through Supabase.
   - User checked in `users` table → if new, added automatically.

2. **Stock Selection**  
   - All stocks displayed from `stocks` table.
   - User clicks to toggle selection → stored in `user_stocks`.

3. **Dashboard**  
   - Fetch user's selected stocks.
   - For each stock, Twelve Data API provides live data.
   - Data rendered in unique `Chart.js` graphs.

4. **AuthGuard**  
   - Blocks access to `/select-stocks` and `/dashboard` if not signed in.
   - Shows popup message and redirects to `/`.

---

## **Future Enhancements**

- Scheduled email delivery with daily predictions.
- Stock trend prediction models using AI/ML APIs.
- Portfolio analysis and advanced filtering.
- Improved analytics dashboard.

---


