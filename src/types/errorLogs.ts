// Types for the Error Logs API

export interface BotErrorLog {
  bot_id: string;
  bot_name: string;
  is_running: boolean;
  process_id?: string;
  error_logs: string[];
  last_error?: string;
  log_timestamp: string;
  has_errors: boolean;
}

export interface ErrorLogsQueryParams {
  lines?: number;
  only_errors?: boolean;
}

// Response types
export interface BotErrorLogResponse extends BotErrorLog {}

export interface AllBotsErrorLogsResponse extends Array<BotErrorLog> {}

// Hook return types
export interface UseBotErrorLogsReturn {
  errorLogs: BotErrorLog | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseAllBotsErrorLogsReturn {
  errorLogs: BotErrorLog[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}