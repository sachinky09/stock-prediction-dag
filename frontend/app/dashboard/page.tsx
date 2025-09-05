'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Navbar from '@/components/Navbar';
import StockCard from '@/components/StockCard';
import { BarChart3, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Stock {
  id: number;
  stock_name: string;
  stock_code: string;
  logo_url: string | null;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [appUserId, setAppUserId] = useState<number | null>(null);
  const [userStocks, setUserStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/');
          return;
        }

        setUser(session.user);

        // Ensure user exists in `users` table and get bigint id
        const { data: userRow, error: userError } = await supabase
          .from('users')
          .upsert(
            {
              name:
                session.user.user_metadata?.full_name ||
                session.user.email?.split('@')[0] ||
                'User',
              email: session.user.email!,
            },
            { onConflict: 'email' }
          )
          .select('id')
          .single();

        if (userError || !userRow) {
          console.error('Error upserting user:', userError);
          return;
        }

        setAppUserId(userRow.id);
        await loadUserStocks(userRow.id);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.push('/');
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  const loadUserStocks = async (appUserId: number) => {
    const { data, error } = await supabase
      .from('user_stocks')
      .select(`
        id,
        stock_id,
        stock:stocks (
          id,
          stock_name,
          stock_code,
          logo_url
        )
      `)
      .eq('user_id', appUserId);

    if (error) {
      console.error('Error loading user stocks:', error);
      return;
    }

    const stocks =
      data?.map((item) => ({
        id: item.stock.id,
        stock_name: item.stock.stock_name,
        stock_code: item.stock.stock_code,
        logo_url: item.stock.logo_url,
      })) || [];

    setUserStocks(stocks);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Your Dashboard
                </h1>
                <p className="text-xl text-gray-600">
                  Track your selected stocks with real-time data
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700 font-medium">
                      {userStocks.length} Stocks
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {userStocks.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-12 max-w-2xl mx-auto">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  No Stocks Selected
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Start building your portfolio by selecting stocks to track and
                  analyze
                </p>
                <Link
                  href="/select-stocks"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span>Select Stocks</span>
                  <TrendingUp className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="mb-8">
                <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Portfolio Overview
                    </h2>
                    <Link
                      href="/select-stocks"
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                    >
                      Edit Selections
                    </Link>
                  </div>
                </div>
              </div>

              {/* Stock Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {userStocks.map((stock) => (
                  <StockCard
                    key={stock.id}
                    stock={stock}
                    showGraph={true}
                    className="h-auto"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
