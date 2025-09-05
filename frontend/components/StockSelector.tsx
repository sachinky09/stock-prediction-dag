'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import StockCard from './StockCard';
import { Check, Loader2 } from 'lucide-react';

interface Stock {
  id: number;
  stock_name: string;
  stock_code: string;
  logo_url: string | null;
}

export default function StockSelector() {
  const [user, setUser] = useState<User | null>(null);
  const [appUserId, setAppUserId] = useState<number | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStocks, setSelectedStocks] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);

          // Ensure user exists in our users table and always return id
          const { data: userRow, error: userError } = await supabase
            .from('users')
            .upsert(
              {
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                email: session.user.email!,
              },
              { onConflict: 'email' }
            )
            .select('id')
            .single();

          if (userError || !userRow) {
            console.error('Error upserting user:', userError);
            showMessage('error', 'Failed to load user');
            return;
          }

          setAppUserId(userRow.id);

          await Promise.all([
            loadStocks(),
            loadUserStocks(userRow.id)
          ]);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        showMessage('error', 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const loadStocks = async () => {
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .order('stock_name');

    if (error) {
      console.error('Error loading stocks:', error);
      showMessage('error', 'Failed to load stocks');
      return;
    }

    setStocks(data || []);
  };

  const loadUserStocks = async (userId: number) => {
    const { data, error } = await supabase
      .from('user_stocks')
      .select('stock_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error loading user stocks:', error);
      return;
    }

    const selectedIds = new Set(data?.map(item => item.stock_id) || []);
    setSelectedStocks(selectedIds);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleToggleStock = (stock: Stock) => {
    setSelectedStocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stock.id)) {
        newSet.delete(stock.id);
      } else {
        newSet.add(stock.id);
      }
      return newSet;
    });
  };

  const handleSaveSelections = async () => {
    if (!appUserId) return;

    setSaving(true);
    try {
      // Delete existing selections
      const { error: deleteError } = await supabase
        .from('user_stocks')
        .delete()
        .eq('user_id', appUserId);

      if (deleteError) {
        console.error('Error deleting existing selections:', deleteError);
        showMessage('error', 'Failed to update selections');
        return;
      }

      // Insert new selections
      if (selectedStocks.size > 0) {
        const insertData = Array.from(selectedStocks).map(stockId => ({
          user_id: appUserId,
          stock_id: stockId
        }));

        const { error: insertError } = await supabase
          .from('user_stocks')
          .insert(insertData);

        if (insertError) {
          console.error('Error inserting selections:', insertError);
          showMessage('error', 'Failed to save selections');
          return;
        }
      }

      showMessage('success', 'Selections saved successfully!');
    } catch (error) {
      console.error('Error saving selections:', error);
      showMessage('error', 'Failed to save selections');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Select Your Stocks
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the stocks you want to track and analyze. You can update your selections anytime.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`
            mb-8 p-4 rounded-lg max-w-md mx-auto text-center
            ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}
          `}>
            {message.text}
          </div>
        )}

        {/* Stock Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {stocks.map((stock) => (
            <StockCard
              key={stock.id}
              stock={stock}
              isSelected={selectedStocks.has(stock.id)}
              onToggleSelect={handleToggleStock}
            />
          ))}
        </div>

        {/* Save Button */}
        <div className="text-center">
          <button
            onClick={handleSaveSelections}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Save Selections ({selectedStocks.size})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
