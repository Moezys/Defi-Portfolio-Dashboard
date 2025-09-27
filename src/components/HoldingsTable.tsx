'use client';

import { Holding } from '@/types';
import { formatCurrency, formatPercentage, formatNumber, getColorForChange } from '@/lib/portfolio';
import { TrendingUp, TrendingDown, Coins } from 'lucide-react';

interface HoldingsTableProps {
  holdings: Holding[];
  isLoading: boolean;
}

export default function HoldingsTable({ holdings, isLoading }: HoldingsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Token Holdings</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Token Holdings</h2>
        </div>
        <div className="p-12 text-center">
          <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No holdings found</h3>
          <p className="text-gray-600 mb-6">
            Import your portfolio using the CSV upload feature above to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Token Holdings</h2>
      </div>
      
      {/* Mobile view */}
      <div className="md:hidden">
        <div className="divide-y divide-gray-200">
          {holdings.map((holding, index) => (
            <div key={index} className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-indigo-600">
                      {holding.symbol.substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{holding.symbol}</div>
                    <div className="text-sm text-gray-500">
                      {formatNumber(holding.amount, 6)} tokens
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {holding.current_value ? formatCurrency(holding.current_value) : '--'}
                  </div>
                  {holding.profit_loss !== undefined && (
                    <div className={`text-sm flex items-center justify-end ${getColorForChange(holding.profit_loss)}`}>
                      {holding.profit_loss >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {formatPercentage(holding.profit_loss_percentage || 0)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-500">P/L</div>
                  <div className={`text-sm font-medium ${getColorForChange(holding.profit_loss || 0)}`}>
                    {holding.profit_loss !== undefined ? formatCurrency(holding.profit_loss) : '--'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Acquired</div>
                  <div className="text-sm text-gray-900">
                    {new Date(holding.acquisition_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Token
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Value
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  P/L
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  P/L %
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acquired
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {holdings.map((holding, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-semibold text-indigo-600">
                          {holding.symbol.substring(0, 2)}
                        </span>
                      </div>
                      <div className="font-medium text-gray-900">{holding.symbol}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatNumber(holding.amount, 6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {holding.current_value ? formatCurrency(holding.current_value) : '--'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <span className={getColorForChange(holding.profit_loss || 0)}>
                      {holding.profit_loss !== undefined ? formatCurrency(holding.profit_loss) : '--'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {holding.profit_loss !== undefined ? (
                      <div className={`flex items-center justify-end ${getColorForChange(holding.profit_loss)}`}>
                        {holding.profit_loss >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {formatPercentage(holding.profit_loss_percentage || 0)}
                      </div>
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {new Date(holding.acquisition_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}