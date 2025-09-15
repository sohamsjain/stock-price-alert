import axiosInstance from '@/lib/axios';
import { Ticker } from '@/types';

export const tickersApi = {
  /**
   * Search tickers by symbol or name
   */
  searchTickers: async (query: string, page = 1, per_page = 10): Promise<{
    tickers: Ticker[];
    total: number;
    page: number;
    per_page: number;
  }> => {
    const response = await axiosInstance.get('/tickers/', {
      params: { q: query, page, per_page }
    });
    return response.data;
  },
};