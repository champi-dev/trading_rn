import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function usePortfolioHoldings() {
  return useQuery({
    queryKey: ['portfolio', 'holdings'],
    queryFn: async () => {
      const { data } = await api.get('/portfolio/holdings');
      return data.holdings;
    },
    refetchInterval: 15000,
  });
}

export function usePortfolioSummary() {
  return useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: async () => {
      const { data } = await api.get('/portfolio/summary');
      return data;
    },
    refetchInterval: 15000,
  });
}

export function useTransactions(params?: { symbol?: string; type?: string; limit?: number }) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const { data } = await api.get('/transactions', { params });
      return data;
    },
  });
}
