// src/hooks/useServerApi.ts
import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import type {
  CppBoolean,
  ServerStateKey,
  LogDataPayload,
  LogResponse,
  GetStateHookResponse,
  UpdateStateHookResponse,
  GetFullStateHookResponse,
  SensorData,
} from '../types/api';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL ?? 'http://compost-be.hyprhost.online:8900';
export const TRANSLATIONS: Record<ServerStateKey, string> = {
light: "Fan",
shredder: "Shredder",
resetFlag: "Reset",
stopFlag: "Stop",
waterPump: "Water pump"
}

// --- Types for History ---
export type HistoryDataPoint = {
  day: string;
  average_val: number;
  min_val: number;
  max_val: number;
};

// --- Query Keys Factory ---
export const serverApiQueryKeys = {
  all: ['serverApi'] as const,
  fullState: () => [...serverApiQueryKeys.all, 'fullState'] as const,
  stateKey: (key: ServerStateKey) => [...serverApiQueryKeys.all, 'state', key] as const,
  history: (type: string, start?: string, end?: string) => 
    [...serverApiQueryKeys.all, 'history', type, start, end] as const,
};

// --- Helper Functions for API Calls ---

/**
 * Parses a string value ("0" or "1") into a CppBoolean (0 or 1).
 * This is used because the GET /state/:key endpoint returns plain text "0" or "1".
 */
const parseCppBooleanString = (value: string): CppBoolean => {
  if (value === '0') return 0;
  if (value === '1') return 1;
  console.error(`Invalid CppBoolean string received from server: "${value}"`);
  throw new Error(`Invalid CppBoolean string: "${value}"`);
};

/**
 * API call to fetch a single state value by its key.
 * GET /state/:key
 */
const fetchStateByKey = async (key: ServerStateKey): Promise<GetStateHookResponse> => {
  const response = await fetch(`${API_BASE_URL}/state/${key}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[GET /state/${key} ${response.status}]: ${errorText || response.statusText}`);
  }
  const text = await response.text(); // Server sends "0" or "1" as plain text
  return parseCppBooleanString(text);
};

/**
 * API call to fetch the full server state.
 * GET /state
 */
const fetchFullServerState = async (): Promise<GetFullStateHookResponse> => {
  const response = await fetch(`${API_BASE_URL}/state`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[GET /state ${response.status}]: ${errorText || response.statusText}`);
  }
  // Server sends JSON: { "light": 0, "shredder": 1, ... } (numbers)
  return response.json() as Promise<GetFullStateHookResponse>;
};

/**
 * API call to update a server state.
 * POST /state/:key?value=0_or_1
 */
const updateServerStateByKey = async (params: {
  key: ServerStateKey;
  value: CppBoolean;
}): Promise<UpdateStateHookResponse> => {
  const { key, value } = params;
  const response = await fetch(`${API_BASE_URL}/state/${key}?value=${value}`, {
    method: 'POST',
    // Headers typically not needed for query param POST if no body,
    // but can be added if server requires specific Content-Type for request.input()
    // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[POST /state/${key} ${response.status}]: ${errorText || response.statusText}`);
  }
  toast.success(`${TRANSLATIONS[key]} turned ${value ? 'on' : 'off'} successfully`);
   console.log(`${TRANSLATIONS[key]} turned ${value ? 'on' : 'off'} successfully`);
  // Server sends JSON: { "keyName": 0_or_1 } (numbers)
  return response.json() as Promise<UpdateStateHookResponse>;
};

/**
 * API call to post log data.
 * POST /log?type=...&val=...
 */
const postLogEntry = async (payload: LogDataPayload): Promise<LogResponse> => {
  const { type, val } = payload;
  const response = await fetch(`${API_BASE_URL}/log?type=${type}&val=${val}`, {
    method: 'POST',
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[POST /log ${response.status}]: ${errorText || response.statusText}`);
  }
  const text = await response.text(); // Server sends "A1 OK" as plain text
  if (text.startsWith('A1 OK')) {
    return 'A1 OK';
  }
  throw new Error(`Unexpected log response: ${text}`);
};

/**
 * API call to fetch historical data.
 * GET /history?type=...&start=...&end=...
 */
const fetchHistoryData = async (params: {
  type: string;
  start?: string;
  end?: string;
}): Promise<HistoryDataPoint[]> => {
  const { type, start, end } = params;
  
  const searchParams = new URLSearchParams({ type });
  if (start) searchParams.append('start', start);
  if (end) searchParams.append('end', end);
  
  const response = await fetch(`${API_BASE_URL}/history?${searchParams.toString()}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[GET /history ${response.status}]: ${errorText || response.statusText}`);
  }
  
  const data = await response.json();
  
  // Handle error response from your controller
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data as HistoryDataPoint[];
};

// --- TanStack Query Hooks ---

/**
 * Hook to fetch a single server state value.
 * @param key The ServerStateKey to fetch.
 * @param options Optional TanStack Query options.
 */
export const useGetServerState = (
  key: ServerStateKey,
  options?: { enabled?: boolean; staleTime?: number }
) => {
  return useQuery<GetStateHookResponse, Error, GetStateHookResponse, QueryKey>({
    queryKey: serverApiQueryKeys.stateKey(key),
    queryFn: () => fetchStateByKey(key),
    ...options,
  });
};

export const useGetSensorData = (
  options: { enabled?: boolean; staleTime?: number }
) => {
  return useQuery<SensorData, Error, SensorData, QueryKey>({
    queryKey: ['sensorData'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/data`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`[GET /sensors ${response.status}]: ${errorText || response.statusText}`);
      }
      return response.json();
    },
    ...options,
  });
};

/**
 * Hook to fetch historical data.
 * @param type The data type to fetch history for (required).
 * @param start Optional start date (YYYY-MM-DD).
 * @param end Optional end date (YYYY-MM-DD).
 * @param options Optional TanStack Query options.
 */
export const useGetHistoryData = (
  type: string,
  start?: string,
  end?: string,
  options?: { enabled?: boolean; staleTime?: number }
) => {
  return useQuery<HistoryDataPoint[], Error, HistoryDataPoint[], QueryKey>({
    queryKey: serverApiQueryKeys.history(type, start, end),
    queryFn: () => fetchHistoryData({ type, start, end }),
    enabled: !!type && (options?.enabled !== false), // Only run if type is provided
    staleTime: 5 * 60 * 1000, // 5 minutes default stale time for historical data
    ...options,
  });
};

/**
 * Hook to fetch the full server state.
 * @param options Optional TanStack Query options.
 */
export const useGetFullServerState = (
  options?: { enabled?: boolean; staleTime?: number }
) => {
  return useQuery<GetFullStateHookResponse, Error, GetFullStateHookResponse, QueryKey>({
    queryKey: serverApiQueryKeys.fullState(),
    queryFn: fetchFullServerState,
    ...options,
  });
};

/**
 * Hook (mutation) to update a server state.
 * Invalidates relevant queries on success.
 */
export const useUpdateServerState = () => {
  const queryClient = useQueryClient();
  return useMutation<
    UpdateStateHookResponse,
    Error,
    { key: ServerStateKey; value: CppBoolean }
  >({
    mutationFn: updateServerStateByKey,
    onSuccess: (data, variables) => {
      // Invalidate the specific state key query
      queryClient.invalidateQueries({ queryKey: serverApiQueryKeys.stateKey(variables.key) });
      // Invalidate the full state query
      queryClient.invalidateQueries({ queryKey: serverApiQueryKeys.fullState() });

      // Optionally, optimistically update or setQueryData
      // Example: Update the specific key in the full state cache
      queryClient.setQueryData<GetFullStateHookResponse>(
        serverApiQueryKeys.fullState(),
        (oldData) => (oldData ? { ...oldData, ...data } : undefined)
      );
      // Example: Update the specific key cache
      queryClient.setQueryData<GetStateHookResponse>(
        serverApiQueryKeys.stateKey(variables.key),
        () => variables.value // The new value
      );
    },
  });
};

/**
 * Hook (mutation) to post a log entry.
 */
export const usePostLog = () => {
  return useMutation<LogResponse, Error, LogDataPayload>({
    mutationFn: postLogEntry,
    // onSuccess: (data) => { console.log('Log posted:', data); },
    // onError: (error) => { console.error('Failed to post log:', error); },
  });
};