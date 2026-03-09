import { create } from 'zustand';
import api from '../services/api';

interface Holding {
  symbol: string;
  companyName: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

interface Summary {
  totalValue: number;
  cashBalance: number;
  investedValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayGainLoss: number;
}

interface PortfolioState {
  holdings: Holding[];
  summary: Summary | null;
  fetchHoldings: () => Promise<void>;
  fetchSummary: () => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  holdings: [],
  summary: null,

  fetchHoldings: async () => {
    const { data } = await api.get('/portfolio/holdings');
    set({ holdings: data.holdings });
  },

  fetchSummary: async () => {
    const { data } = await api.get('/portfolio/summary');
    set({ summary: data });
  },
}));
