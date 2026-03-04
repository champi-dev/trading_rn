import { create } from 'zustand';
import api from '../services/api';

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface TrendingStock {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

interface MarketState {
  watchlist: WatchlistItem[];
  trending: TrendingStock[];
  fetchWatchlist: () => Promise<void>;
  fetchTrending: () => Promise<void>;
  addToWatchlist: (symbol: string) => Promise<void>;
  removeFromWatchlist: (symbol: string) => Promise<void>;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  watchlist: [],
  trending: [],

  fetchWatchlist: async () => {
    const { data } = await api.get('/watchlist');
    set({ watchlist: data.items });
  },

  fetchTrending: async () => {
    const { data } = await api.get('/market/trending');
    set({ trending: data.stocks });
  },

  addToWatchlist: async (symbol) => {
    await api.post('/watchlist', { symbol });
    get().fetchWatchlist();
  },

  removeFromWatchlist: async (symbol) => {
    await api.delete(`/watchlist/${symbol}`);
    set({ watchlist: get().watchlist.filter((i) => i.symbol !== symbol) });
  },
}));
