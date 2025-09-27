'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import Header from '@/components/Header';
import PortfolioOverview from '@/components/PortfolioOverview';
import CSVImport from '@/components/CSVImport';
import HoldingsTable from '@/components/HoldingsTable';
import ProfitLossChart from '@/components/ProfitLossChart';
import TransactionsTable from '@/components/TransactionsTable';
import { Holding, Portfolio, Transaction } from '@/types';
import { calculatePortfolioValue, calculatePnLHistory } from '@/lib/portfolio';

// Mock transactions data
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'buy',
    symbol: 'BTC',
    amount: 0.5,
    price: 42000,
    date: '2024-01-15T10:30:00Z',
    total: 21000
  },
  {
    id: '2',
    type: 'buy',
    symbol: 'ETH',
    amount: 2.5,
    price: 2800,
    date: '2024-02-01T14:15:00Z',
    total: 7000
  },
  {
    id: '3',
    type: 'sell',
    symbol: 'BTC',
    amount: 0.1,
    price: 45000,
    date: '2024-02-15T09:45:00Z',
    total: 4500
  },
  {
    id: '4',
    type: 'buy',
    symbol: 'ADA',
    amount: 1000,
    price: 0.65,
    date: '2024-02-20T16:20:00Z',
    total: 650
  },
  {
    id: '5',
    type: 'buy',
    symbol: 'DOT',
    amount: 100,
    price: 8.5,
    date: '2024-03-01T11:10:00Z',
    total: 850
  },
  {
    id: '6',
    type: 'sell',
    symbol: 'ETH',
    amount: 0.5,
    price: 3200,
    date: '2024-03-10T13:30:00Z',
    total: 1600
  },
];

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [chartData, setChartData] = useState<Array<{ date: string; total_value: number; profit_loss: number }>>([]);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);

  // Load saved holdings on component mount
  useEffect(() => {
    if (user) {
      const savedHoldings = localStorage.getItem('defi-holdings');
      if (savedHoldings) {
        try {
          const parsedHoldings = JSON.parse(savedHoldings);
          setHoldings(parsedHoldings);
        } catch (error) {
          console.error('Error parsing saved holdings:', error);
        }
      }
    }
  }, [user]);

  // Calculate portfolio value when holdings change
  useEffect(() => {
    if (holdings.length > 0) {
      setIsLoadingPortfolio(true);
      calculatePortfolioValue(holdings)
        .then(async (portfolioData) => {
          setPortfolio(portfolioData);
          
          // Calculate historical P/L data
          const historyData = await calculatePnLHistory(portfolioData.holdings);
          setChartData(historyData);
          
          setIsLoadingPortfolio(false);
        })
        .catch(error => {
          console.error('Error calculating portfolio:', error);
          setIsLoadingPortfolio(false);
        });
    } else {
      setPortfolio(null);
      setChartData([]);
    }
  }, [holdings]);

  const handleImportHoldings = (newHoldings: Holding[]) => {
    setHoldings(newHoldings);
    localStorage.setItem('defi-holdings', JSON.stringify(newHoldings));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="dashboard">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview */}
        <div data-testid="portfolio-overview">
          <PortfolioOverview 
            portfolio={portfolio} 
            isLoading={isLoadingPortfolio} 
          />
        </div>

        {/* CSV Import/Export */}
        <div className="mb-8">
          <CSVImport 
            onImport={handleImportHoldings}
            currentHoldings={portfolio?.holdings || []}
          />
        </div>

        {/* P/L Chart */}
        <div className="mb-8">
          <ProfitLossChart 
            data={chartData}
            isLoading={isLoadingPortfolio}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Holdings Table */}
          <div className="lg:col-span-2">
            <HoldingsTable 
              holdings={portfolio?.holdings || []}
              isLoading={isLoadingPortfolio}
            />
          </div>
          
          {/* Transactions Table */}
          <div className="lg:col-span-2">
            <TransactionsTable 
              transactions={MOCK_TRANSACTIONS}
              isLoading={false}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
