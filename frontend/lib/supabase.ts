import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// For client components
export const supabase = createClientComponentClient()

// For server components and API routes
export const createSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          name: string
          email: string
          created_at: string
        }
        Insert: {
          name: string
          email: string
          created_at?: string
        }
        Update: {
          name?: string
          email?: string
          created_at?: string
        }
      }
      stocks: {
        Row: {
          id: number
          stock_name: string
          stock_code: string
          logo_url: string | null
        }
        Insert: {
          stock_name: string
          stock_code: string
          logo_url?: string | null
        }
        Update: {
          stock_name?: string
          stock_code?: string
          logo_url?: string | null
        }
      }
      user_stocks: {
        Row: {
          id: number
          user_id: number
          stock_id: number
          created_at: string
        }
        Insert: {
          user_id: number
          stock_id: number
          created_at?: string
        }
        Update: {
          user_id?: number
          stock_id?: number
          created_at?: string
        }
      }
    }
  }
}
