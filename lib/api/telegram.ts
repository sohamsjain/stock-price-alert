import axiosInstance from '@/lib/axios';

export interface TelegramVerificationResponse {
  verification_code: string;
  expires_at: string;
  bot_username: string;
}

export interface TelegramStatusResponse {
  connected: boolean;
  username: string | null;
  connected_at: string | null;
}

export interface TelegramDisconnectResponse {
  message: string;
}

export const telegramApi = {
  /**
   * Generate verification code for Telegram linking
   */
  generateCode: async (): Promise<TelegramVerificationResponse> => {
    const response = await axiosInstance.post<TelegramVerificationResponse>(
      '/telegram/generate-code'
    );
    return response.data;
  },

  /**
   * Disconnect Telegram from user account
   */
  disconnect: async (): Promise<TelegramDisconnectResponse> => {
    const response = await axiosInstance.post<TelegramDisconnectResponse>(
      '/telegram/disconnect'
    );
    return response.data;
  },

  /**
   * Get current Telegram connection status
   */
  getStatus: async (): Promise<TelegramStatusResponse> => {
    const response = await axiosInstance.get<TelegramStatusResponse>(
      '/telegram/status'
    );
    return response.data;
  },
};