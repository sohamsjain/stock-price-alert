import { create } from 'zustand';
import { Trade, TradeCreateRequest, TradeUpdateRequest } from '@/types';
import { tradesApi } from '@/lib/api/trades';
import { toast } from 'sonner';

interface TradesState {
  trades: Trade[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  total: number;
  
  // Actions
  fetchTrades: () => Promise<void>;
  createTrade: (data: TradeCreateRequest) => Promise<Trade | null>;
  updateTrade: (id: string, data: TradeUpdateRequest) => Promise<Trade | null>;
  deleteTrade: (id: string) => Promise<boolean>;
  deleteMultipleTrades: (ids: string[]) => Promise<boolean>;
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  updateTradeInStore: (id: string, updatedTrade: Trade) => void;
  removeTradeFromStore: (id: string) => void;
  removeMultipleTradesFromStore: (ids: string[]) => void;
}

export const useTradesStore = create<TradesState>((set, get) => ({
  trades: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  total: 0,

  fetchTrades: async () => {
    try {
      set({ isLoading: true });
      const response = await tradesApi.getTrades();
      set({ 
        trades: response.trades, 
        total: response.total,
        isLoading: false 
      });
    } catch (error: any) {
      set({ isLoading: false });
      toast.error('Failed to fetch trades');
      console.error('Failed to fetch trades:', error);
    }
  },

  createTrade: async (data) => {
    try {
      set({ isCreating: true });
      const response = await tradesApi.createTrade(data);
      
      if (response.trade) {
        get().addTrade(response.trade);
        toast.success(response.message || 'Trade created successfully');
        set({ isCreating: false });
        return response.trade;
      }
      
      set({ isCreating: false });
      return null;
    } catch (error: any) {
      set({ isCreating: false });
      const errorMessage = error.response?.data?.error || 'Failed to create trade';
      toast.error(errorMessage);
      return null;
    }
  },

  updateTrade: async (id, data) => {
    try {
      set({ isUpdating: true });
      const response = await tradesApi.updateTrade(id, data);
      
      if (response.trade) {
        get().updateTradeInStore(id, response.trade);
        toast.success(response.message || 'Trade updated successfully');
        set({ isUpdating: false });
        return response.trade;
      }
      
      set({ isUpdating: false });
      return null;
    } catch (error: any) {
      set({ isUpdating: false });
      const errorMessage = error.response?.data?.error || 'Failed to update trade';
      toast.error(errorMessage);
      return null;
    }
  },

  deleteTrade: async (id) => {
    try {
      set({ isDeleting: true });
      const response = await tradesApi.deleteTrade(id);
      
      get().removeTradeFromStore(id);
      toast.success(response.message || 'Trade deleted successfully');
      set({ isDeleting: false });
      return true;
    } catch (error: any) {
      set({ isDeleting: false });
      const errorMessage = error.response?.data?.error || 'Failed to delete trade';
      toast.error(errorMessage);
      return false;
    }
  },

  deleteMultipleTrades: async (ids) => {
    try {
      set({ isDeleting: true });
      const response = await tradesApi.deleteMultipleTrades(ids);
      
      get().removeMultipleTradesFromStore(ids);
      toast.success(response.message || `${ids.length} trades deleted successfully`);
      set({ isDeleting: false });
      return true;
    } catch (error: any) {
      set({ isDeleting: false });
      const errorMessage = error.response?.data?.error || 'Failed to delete trades';
      toast.error(errorMessage);
      return false;
    }
  },

  setTrades: (trades) => {
    set({ trades, total: trades.length });
  },

  addTrade: (trade) => {
    set((state) => ({ 
      trades: [trade, ...state.trades],
      total: state.total + 1 
    }));
  },

  updateTradeInStore: (id, updatedTrade) => {
    set((state) => ({
      trades: state.trades.map(trade => 
        trade.id === id ? updatedTrade : trade
      )
    }));
  },

  removeTradeFromStore: (id) => {
    set((state) => ({
      trades: state.trades.filter(trade => trade.id !== id),
      total: state.total - 1
    }));
  },

  removeMultipleTradesFromStore: (ids) => {
    set((state) => ({
      trades: state.trades.filter(trade => !ids.includes(trade.id)),
      total: state.total - ids.length
    }));
  },
}));