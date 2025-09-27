export interface Token {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_30d: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

export interface Holding {
  symbol: string;
  amount: number;
  acquisition_date: string;
  acquisition_price?: number;
  current_value?: number;
  profit_loss?: number;
  profit_loss_percentage?: number;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  amount: number;
  price: number;
  date: string;
  total: number;
}

export interface Portfolio {
  total_value: number;
  total_profit_loss: number;
  total_profit_loss_percentage: number;
  holdings: Holding[];
}

export interface User {
  email: string;
  name?: string;
  isAuthenticated: boolean;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  total_value: number;
  profit_loss: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}