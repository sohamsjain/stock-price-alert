import * as z from 'zod';

export const tradeCreateFormSchema = z.object({
  ticker_id: z.string().min(1, 'Please select a ticker'),
  side: z.enum(['BUY', 'SELL']),
  entry: z.number().min(0.01, 'Entry price must be greater than 0'),
  stoploss: z.number().min(0.01, 'Stop loss must be greater than 0').optional(),
  target: z.number().min(0.01, 'Target must be greater than 0').optional(),
  timeframe: z.enum(['1m', '5m', '15m', '1h', '1D', '1W', '1M']).optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  score: z.number().min(1).optional(),
  entry_x: z.string().optional(), // ISO string for datetime
  stoploss_x: z.string().optional(),
  target_x: z.string().optional(),
  tags: z.array(z.object({
    name: z.string().min(1, 'Tag name is required')
  })).optional(),
})

export type TradeCreateFormData = z.infer<typeof tradeCreateFormSchema>;

export const tradeUpdateFormSchema = z.object({
  ticker_id: z.string().optional(),

  side: z.enum(['BUY', 'SELL']).optional(),

  type: z.enum(['Crossing Above', 'Crossing Below']).optional(),

  entry: z.number().min(0.01, 'Entry price must be greater than 0').optional(),

  stoploss: z.number().min(0.01, 'Stop loss must be greater than 0').optional(),
  target: z.number().min(0.01, 'Target must be greater than 0').optional(),

  timeframe: z.enum(['1m', '5m', '15m', '1h', '1D', '1W', '1M']).optional(),

  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  score: z.number().min(1).optional(),

  entry_x: z.string().datetime().optional(),
  stoploss_x: z.string().datetime().optional(),
  target_x: z.string().datetime().optional(),

  tags: z.array(z.object({
    name: z.string().min(1, 'Tag name is required'),
  })).optional(),
})

export type TradeUpdateFormData = z.infer<typeof tradeUpdateFormSchema>;

// Schema for trade filtering
export const tradeFilterSchema = z.object({
  search: z.string().optional(),
  status: z.array(z.string()).optional(),
  side: z.array(z.string()).optional(),
  type: z.array(z.string()).optional(),
  timeframe: z.array(z.string()).optional(),
});

export type TradeFilterData = z.infer<typeof tradeFilterSchema>;