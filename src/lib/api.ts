import { Token } from '@/types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export async function fetchTokens(ids: string[] = []): Promise<Token[]> {
  try {
    const idsParam = ids.length > 0 ? ids.join(',') : 'bitcoin,ethereum,cardano,polkadot,chainlink,uniswap,aave,compound-governance-token,maker,synthetix-network-token';
    
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h,30d`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch token data');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return [];
  }
}

export async function fetchTokenPrice(tokenId: string): Promise<number> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${tokenId}&vs_currencies=usd`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch price for ${tokenId}`);
    }
    
    const data = await response.json();
    return data[tokenId]?.usd || 0;
  } catch (error) {
    console.error(`Error fetching price for ${tokenId}:`, error);
    return 0;
  }
}

export async function fetchTokenHistory(tokenId: string, days: number = 30): Promise<{ date: string; price: number }[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/${tokenId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch history for ${tokenId}`);
    }
    
    const data = await response.json();
    
    return data.prices.map(([timestamp, price]: [number, number]) => ({
      date: new Date(timestamp).toISOString().split('T')[0],
      price
    }));
  } catch (error) {
    console.error(`Error fetching history for ${tokenId}:`, error);
    return [];
  }
}

// Map common token symbols to CoinGecko IDs
const SYMBOL_TO_ID_MAP: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'ADA': 'cardano',
  'DOT': 'polkadot',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'AAVE': 'aave',
  'COMP': 'compound-governance-token',
  'MKR': 'maker',
  'SNX': 'synthetix-network-token',
  'SUSHI': 'sushi',
  'YFI': 'yearn-finance',
  'CRV': 'curve-dao-token',
  'BAL': 'balancer',
  '1INCH': '1inch'
};

export function getTokenIdFromSymbol(symbol: string): string {
  return SYMBOL_TO_ID_MAP[symbol.toUpperCase()] || symbol.toLowerCase();
}