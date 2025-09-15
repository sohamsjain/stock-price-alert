import axiosInstance from '@/lib/axios';
import { Tag } from '@/types';

export const tagsApi = {
  /**
   * Search tags by name
   */
  searchTags: async (query: string, page = 1, per_page = 20): Promise<{
    tags: Tag[];
    total: number;
    page: number;
    per_page: number;
  }> => {
    const response = await axiosInstance.get('/tags/', {
      params: { q: query, page, per_page }
    });
    return response.data;
  },
};