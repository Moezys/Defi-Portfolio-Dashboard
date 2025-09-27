import { Holding, Portfolio } from '@/types';
import { getTokenIdFromSymbol, fetchTokenPrice } from './api';

export async function calculatePortfolioValue(holdings: Holding[]): Promise<Portfolio> {
  const updatedHoldings: Holding[] = [];
  let totalValue = 0;
  let totalProfitLoss = 0;
  
  for (const holding of holdings) {
    const tokenId = getTokenIdFromSymbol(holding.symbol);
    const currentPrice = await fetchTokenPrice(tokenId);
    
    const currentValue = holding.amount * currentPrice;
    let profitLoss = 0;
    let profitLossPercentage = 0;
    
    if (holding.acquisition_price) {
      const acquisitionValue = holding.amount * holding.acquisition_price;
      profitLoss = currentValue - acquisitionValue;
      profitLossPercentage = acquisitionValue > 0 ? (profitLoss / acquisitionValue) * 100 : 0;
    }
    
    const updatedHolding: Holding = {
      ...holding,
      current_value: currentValue,
      profit_loss: profitLoss,
      profit_loss_percentage: profitLossPercentage
    };
    
    updatedHoldings.push(updatedHolding);
    totalValue += currentValue;
    totalProfitLoss += profitLoss;
  }
  
  const totalProfitLossPercentage = totalValue > 0 ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100 : 0;
  
  return {
    total_value: totalValue,
    total_profit_loss: totalProfitLoss,
    total_profit_loss_percentage: totalProfitLossPercentage,
    holdings: updatedHoldings
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatPercentage(percentage: number): string {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
}

export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

export function getColorForChange(value: number): string {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
}

export function calculatePnLHistory(holdings: Holding[], days: number = 30): Promise<{ date: string; total_value: number; profit_loss: number }[]> {
  // This is a simplified implementation
  // In a real app, you'd fetch historical prices for each token and calculate historical portfolio values
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  
  const history = [];
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const randomMultiplier = 0.8 + Math.random() * 0.4; // Simulate price fluctuation
    
    const totalValue = holdings.reduce((sum, holding) => {
      return sum + (holding.current_value || 0) * randomMultiplier;
    }, 0);
    
    const profitLoss = holdings.reduce((sum, holding) => {
      return sum + (holding.profit_loss || 0) * randomMultiplier;
    }, 0);
    
    history.push({
      date: date.toISOString().split('T')[0],
      total_value: totalValue,
      profit_loss: profitLoss
    });
  }
  
  return Promise.resolve(history);
}