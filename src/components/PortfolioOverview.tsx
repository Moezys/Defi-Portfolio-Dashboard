'use client';

import { Portfolio } from '@/types';
import { formatCurrency, formatPercentage, getColorForChange } from '@/lib/portfolio';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';

interface PortfolioOverviewProps {
  portfolio: Portfolio | null;
  isLoading: boolean;
}

export default function PortfolioOverview({ portfolio, isLoading }: PortfolioOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-32 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg mr-3">
              <DollarSign className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">$0.00</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg mr-3">
              <TrendingUp className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total P/L</p>
              <p className="text-2xl font-bold text-gray-900">$0.00</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg mr-3">
              <Percent className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">P/L Percentage</p>
              <p className="text-2xl font-bold text-gray-900">0.00%</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profitLossColor = getColorForChange(portfolio.total_profit_loss);
  const isProfit = portfolio.total_profit_loss >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-2 bg-indigo-100 rounded-lg mr-3">
            <DollarSign className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Value</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(portfolio.total_value)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {portfolio.holdings.length} {portfolio.holdings.length === 1 ? 'token' : 'tokens'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg mr-3 ${isProfit ? 'bg-green-100' : 'bg-red-100'}`}>
            {isProfit ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total P/L</p>
            <p className={`text-2xl font-bold ${profitLossColor}`}>
              {formatCurrency(portfolio.total_profit_loss)}
            </p>
            <p className="text-xs text-gray-500 mt-1">30-day calculation</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg mr-3 ${isProfit ? 'bg-green-100' : 'bg-red-100'}`}>
            <Percent className={`h-5 w-5 ${isProfit ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">P/L Percentage</p>
            <p className={`text-2xl font-bold ${profitLossColor}`}>
              {formatPercentage(portfolio.total_profit_loss_percentage)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Since acquisition</p>
          </div>
        </div>
      </div>
    </div>
  );
}