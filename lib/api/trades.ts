import axiosInstance from '@/lib/axios';
import { Trade, TradeCreateRequest, TradeUpdateRequest } from '@/types';

export const tradesApi = {
  /**
   * Get all trades with optional filtering
   */
  getTrades: async (): Promise<{ trades: Trade[]; total: number }> => {
    const response = await axiosInstance.get('/trades/');
    return response.data;
  },

  /**
   * Get a single trade by ID
   */
  getTrade: async (id: string): Promise<{ trade: Trade }> => {
    const response = await axiosInstance.get(`/trades/${id}`);
    return response.data;
  },

  /**
   * Create a new trade
   */
  createTrade: async (data: TradeCreateRequest): Promise<{ trade: Trade; message: string }> => {
    const response = await axiosInstance.post('/trades/', data);
    return response.data;
  },

  /**
   * Update an existing trade
   */
  updateTrade: async (id: string, data: TradeUpdateRequest): Promise<{ trade: Trade; message: string }> => {
    const response = await axiosInstance.put(`/trades/${id}`, data);
    return response.data;
  },

  /**
   * Delete a trade
   */
  deleteTrade: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/trades/${id}`);
    return response.data;
  },

  /**
   * Delete multiple trades
   */
  deleteMultipleTrades: async (ids: string[]): Promise<{ message: string }> => {
    const response = await axiosInstance.delete('/trades/delete-multiple', { data: { ids } });
    return response.data;
  },
};