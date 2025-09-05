'use client';

import Image from 'next/image';
import StockGraph from './StockGraph';

interface Stock {
  id: number;
  stock_name: string;
  stock_code: string;
  logo_url: string | null;
}

interface StockCardProps {
  stock: Stock;
  showGraph?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (stock: Stock) => void;
  className?: string;
}

export default function StockCard({ 
  stock, 
  showGraph = false, 
  isSelected = false, 
  onToggleSelect,
  className = ""
}: StockCardProps) {
  const handleClick = () => {
    if (onToggleSelect) {
      onToggleSelect(stock);
    }
  };

  return (
    <div 
      className={`
        relative group cursor-pointer transition-all duration-300 
        bg-white/70 backdrop-blur-lg border border-white/20 
        rounded-2xl p-6 hover:bg-white/80 hover:shadow-xl
        hover:-translate-y-1 ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50/70' : ''}
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Selection Indicator */}
      {onToggleSelect && (
        <div className={`
          absolute top-4 right-4 w-6 h-6 rounded-full border-2 
          transition-all duration-200 
          ${isSelected 
            ? 'bg-blue-500 border-blue-500' 
            : 'border-gray-300 group-hover:border-blue-400'
          }
        `}>
          {isSelected && (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Stock Header */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
          {stock.logo_url ? (
            <Image
              src={stock.logo_url}
              alt={`${stock.stock_name} logo`}
              width={48}
              height={48}
              className="rounded-xl object-cover"
            />
          ) : (
            <div className="text-lg font-bold text-blue-600">
              {stock.stock_code.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {stock.stock_code}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-1">
            {stock.stock_name}
          </p>
        </div>
      </div>

      {/* Stock Graph */}
      {showGraph && (
        <div className="mt-4">
          <StockGraph symbol={stock.stock_code} />
        </div>
      )}

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}