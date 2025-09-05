/*
  # Stockify Database Schema

  1. New Tables
    - `users`
      - `id` (bigint, primary key, auto-increment)
      - `name` (varchar, not null)
      - `email` (varchar, not null, unique)
      - `created_at` (timestamp, default now())
    
    - `stocks`
      - `id` (bigint, primary key, auto-increment) 
      - `stock_name` (varchar, not null)
      - `stock_code` (varchar, not null, unique)
      - `logo_url` (text, nullable)
    
    - `user_stocks` (junction table)
      - `id` (bigint, primary key, auto-increment)
      - `user_id` (bigint, not null, foreign key to users.id)
      - `stock_id` (bigint, not null, foreign key to stocks.id)
      - `created_at` (timestamp, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for stocks table
    - Users can only access their own user_stocks records

  3. Sample Data
    - Popular stocks like Apple, Microsoft, Google, Amazon, Tesla
*/

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Create stocks table
CREATE TABLE IF NOT EXISTS public.stocks (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  stock_name character varying NOT NULL,
  stock_code character varying NOT NULL UNIQUE,
  logo_url text,
  CONSTRAINT stocks_pkey PRIMARY KEY (id)
);

-- Create user_stocks junction table
CREATE TABLE IF NOT EXISTS public.user_stocks (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL,
  stock_id bigint NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_stocks_pkey PRIMARY KEY (id),
  CONSTRAINT user_stocks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT user_stocks_stock_id_fkey FOREIGN KEY (stock_id) REFERENCES public.stocks(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stocks ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Stocks table policies (public read access)
CREATE POLICY "Anyone can read stocks"
  ON public.stocks
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- User_stocks table policies
CREATE POLICY "Users can read own stock selections"
  ON public.user_stocks
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own stock selections"
  ON public.user_stocks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own stock selections"
  ON public.user_stocks
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Insert sample stocks data
INSERT INTO public.stocks (stock_name, stock_code, logo_url) VALUES
('Apple Inc.', 'AAPL', 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'),
('Microsoft Corporation', 'MSFT', 'https://images.pexels.com/photos/2444429/pexels-photo-2444429.jpeg'),
('Alphabet Inc.', 'GOOGL', 'https://images.pexels.com/photos/2148222/pexels-photo-2148222.jpeg'),
('Amazon.com Inc.', 'AMZN', 'https://images.pexels.com/photos/1043902/pexels-photo-1043902.jpeg'),
('Tesla Inc.', 'TSLA', 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg'),
('Meta Platforms Inc.', 'META', 'https://images.pexels.com/photos/5082568/pexels-photo-5082568.jpeg'),
('NVIDIA Corporation', 'NVDA', 'https://images.pexels.com/photos/2312369/pexels-photo-2312369.jpeg'),
('Netflix Inc.', 'NFLX', 'https://images.pexels.com/photos/1601773/pexels-photo-1601773.jpeg')
ON CONFLICT (stock_code) DO NOTHING;