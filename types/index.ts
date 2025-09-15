// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  is_admin: boolean;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// Ticker related types
export interface Ticker {
  id: string;
  symbol: string;
  exchange: string;
  name: string;
  last_price: number;
  last_updated: string;
}

// Tag related types
export interface Tag {
  id: string;
  name: string;
}

export interface TagCreateRequest {
  name: string;
}

// Trade related types
export type TradeSide = 'BUY' | 'SELL';
export type TradeType = 'Crossing Above' | 'Crossing Below';
export type TradeStatus = 'Active' | 'Entry' | 'Stop Loss' | 'Target';
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '1D' | '1W' | '1M';
export type TradeETA = '1 Minute' | '5 Minutes' | '15 Minutes' | '1 Hour' | '1 Day' | '1 Week' | '1 Month' | 'Far';

export interface Trade {
  id: string;
  symbol: string;
  last_price: number;
  status: TradeStatus;
  side: TradeSide;
  type?: TradeType | null;
  notes?: string | null;
  entry: number;
  stoploss?: number | null;
  target?: number | null;
  timeframe?: Timeframe | null;
  score?: number | null;
  entry_x?: Date | null;
  stoploss_x?: Date | null;
  target_x?: Date | null;
  entry_eta?: Date | null;
  stoploss_eta?: Date | null;
  target_eta?: Date | null;
  entry_at?: Date | null;
  stoploss_at?: Date | null;
  target_at?: Date | null;
  created_at: Date;
  edited_at?: Date | null;
  updated_at: Date;
  status_updated_at?: Date | null;
  ticker: Ticker;
  risk_reward_ratio?: number | null;
  risk_per_unit?: number | null;
  reward_per_unit?: number | null;
  tags: Tag[];
}


export interface TradeCreateRequest {
  ticker_id: string;
  side: TradeSide;
  entry: number;
  stoploss?: number | null;
  target?: number | null;
  timeframe?: Timeframe | null;
  notes?: string | null;
  score?: number | null;
  entry_x?: string | null;
  stoploss_x?: string | null;
  target_x?: string | null;
  tags?: TagCreateRequest[];
}

export interface TradeUpdateRequest extends Partial<TradeCreateRequest> {
  tags?: TagCreateRequest[];
  type?: TradeType | null;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

// Error types
export interface ApiError {
  error: string;
  details?: Record<string, any>;
  status?: number;
}