// src/types/api.ts

/**
 * Represents a boolean value as 0 or 1, compatible with C++/Arduino conventions.
 */
export type CppBoolean = 0 | 1;

/**
 * Defines the valid keys for server-side states.
 */
export type ServerStateKey = "light" | "resetFlag" | "shredder" | "stopFlag" | "waterPump";

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
export type GraphableLogType = "humidity" | "ph_level" | "temperature" | "soil_moisture" | "soil_conductivity";

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
export type LogResponse = "A1 OK";

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

export type SensorData = {
   humidity: number;
   ph_level: number;
   soil_conductivity: number;
   soil_moisture: number;
   temperature: number;
};
