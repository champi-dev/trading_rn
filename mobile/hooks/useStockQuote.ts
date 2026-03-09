import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  volume: number;
  marketCap: number;
  pe: number;
  week52High: number;
  week52Low: number;
}

export function useStockQuote(symbol: string) {
  return useQuery<StockQuote>({
    queryKey: ['quote', symbol],
    queryFn: async () => {
      const { data } = await api.get(`/market/quote/${symbol}`);
      return data;
    },
    refetchInterval: 15000,
    enabled: !!symbol,
  });
}

export function useStockHistory(symbol: string, range: string = '1mo') {
  return useQuery({
    queryKey: ['history', symbol, range],
    queryFn: async () => {
      const { data } = await api.get(`/market/history/${symbol}?range=${range}`);
      return data.prices;
    },
    enabled: !!symbol,
  });
}
