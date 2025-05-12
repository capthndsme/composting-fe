// generate-api-client.js
const fs = require('fs');
const path = require('path');

const typesDir = path.join(__dirname, 'src', 'types');
const hooksDir = path.join(__dirname, 'src', 'hooks');

// Ensure directories exist
fs.mkdirSync(typesDir, { recursive: true });
fs.mkdirSync(hooksDir, { recursive: true });

// --- Template for src/types/api.ts ---
const apiTypesContent = `
// src/types/api.ts

/**
 * Represents a boolean value as 0 or 1, compatible with C++/Arduino conventions.
 */
export type CppBoolean = 0 | 1;

/**
 * Defines the valid keys for server-side states.
 */
export type ServerStateKey =
  | 'light'
  | 'resetFlag'
  | 'shredder'
  | 'stopFlag'
  | 'waterPump';

/**
 * Represents the complete server state object.
 * Values are CppBoolean (0 or 1).
 */
export type ServerState = {
  [K in ServerStateKey]: CppBoolean;
};

/**
 * Defines the types of data that can be logged and graphed.
 */
export type GraphableLogType =
  | 'humidity'
  | 'ph_level'
  | 'temperature'
  | 'soil_moisture'
  | 'soil_conductivity';

/**
 * Payload for posting new log data.
 */
export interface LogDataPayload {
  type: GraphableLogType;
  val: number;
}

/**
 * Expected response string from the server after successfully posting a log.
 */
export type LogResponse = 'A1 OK';

// --- Hook Response Types (after client-side parsing if needed) ---

/**
 * Response type for fetching a single server state key.
 * The server sends "0" or "1" as text, which is parsed to CppBoolean by the client.
 */
export type GetStateHookResponse = CppBoolean;

/**
 * Response type after updating a server state key.
 * Example: { shredder: 0 }
 */
export type UpdateStateHookResponse = Partial<ServerState>;

/**
 * Response type for fetching the full server state.
 * The server sends a JSON object with CppBoolean numbers.
 */
export type GetFullStateHookResponse = ServerState;
`;

// --- Template for src/hooks/useServerApi.ts ---
const apiHooksContent = `
// src/hooks/useServerApi.ts
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import type {
  CppBoolean,
  ServerStateKey,
  ServerState,
  GraphableLogType,
  LogDataPayload,
  LogResponse,
  GetStateHookResponse,
  UpdateStateHookResponse,
  GetFullStateHookResponse,
} from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://compost-be.hyprhost.online:8900';

// --- Query Keys Factory ---
export const serverApiQueryKeys = {
  all: ['serverApi'] as const,
  fullState: () => [...serverApiQueryKeys.all, 'fullState'] as const,
  stateKey: (key: ServerStateKey) => [...serverApiQueryKeys.all, 'state', key] as const,
};

// --- Helper Functions for API Calls ---

/**
 * Parses a string value ("0" or "1") into a CppBoolean (0 or 1).
 * This is used because the GET /state/:key endpoint returns plain text "0" or "1".
 */
const parseCppBooleanString = (value: string): CppBoolean => {
  if (value === '0') return 0;
  if (value === '1') return 1;
  console.error(\`Invalid CppBoolean string received from server: "\${value}"\`);
  throw new Error(\`Invalid CppBoolean string: "\${value}"\`);
};

/**
 * API call to fetch a single state value by its key.
 * GET /state/:key
 */
const fetchStateByKey = async (key: ServerStateKey): Promise<GetStateHookResponse> => {
  const response = await fetch(\`\${API_BASE_URL}/state/\${key}\`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(\`[GET /state/\${key} \${response.status}]: \${errorText || response.statusText}\`);
  }
  const text = await response.text(); // Server sends "0" or "1" as plain text
  return parseCppBooleanString(text);
};

/**
 * API call to fetch the full server state.
 * GET /state
 */
const fetchFullServerState = async (): Promise<GetFullStateHookResponse> => {
  const response = await fetch(\`\${API_BASE_URL}/state\`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(\`[GET /state \${response.status}]: \${errorText || response.statusText}\`);
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
  const response = await fetch(\`\${API_BASE_URL}/state/\${key}?value=\${value}\`, {
    method: 'POST',
    // Headers typically not needed for query param POST if no body,
    // but can be added if server requires specific Content-Type for request.input()
    // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(\`[POST /state/\${key} \${response.status}]: \${errorText || response.statusText}\`);
  }
  // Server sends JSON: { "keyName": 0_or_1 } (numbers)
  return response.json() as Promise<UpdateStateHookResponse>;
};

/**
 * API call to post log data.
 * POST /log?type=...&val=...
 */
const postLogEntry = async (payload: LogDataPayload): Promise<LogResponse> => {
  const { type, val } = payload;
  const response = await fetch(\`\${API_BASE_URL}/log?type=\${type}&val=\${val}\`, {
    method: 'POST',
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(\`[POST /log \${response.status}]: \${errorText || response.statusText}\`);
  }
  const text = await response.text(); // Server sends "A1 OK" as plain text
  if (text.startsWith('A1 OK')) {
    return 'A1 OK';
  }
  throw new Error(\`Unexpected log response: \${text}\`);
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
`;

// Write the files
try {
  fs.writeFileSync(path.join(typesDir, 'api.ts'), apiTypesContent.trim());
  console.log('Successfully created src/types/api.ts');

  fs.writeFileSync(path.join(hooksDir, 'useServerApi.ts'), apiHooksContent.trim());
  console.log('Successfully created src/hooks/useServerApi.ts');

  console.log('\nGeneration complete! Make sure to install @tanstack/react-query if you haven\'t already:');
  console.log('npm install @tanstack/react-query');
  console.log('or');
  console.log('yarn add @tanstack/react-query');
  console.log('\nRemember to configure REACT_APP_API_BASE_URL in your .env file if you want to override the default.');

} catch (error) {
  console.error('Error generating API client files:', error);
}