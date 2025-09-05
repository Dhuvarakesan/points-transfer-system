// src/config.ts
export interface AppConfig {
    serverBaseUrl: string;
    secretKey: string;
    allowedHosts: string[]; // Array of allowed hosts
    sessionWarningTimeMs: number; // Session warning time in milliseconds
    inactivityTimeoutMs: number; // Inactivity timeout in milliseconds
    gracePeriodMs: number; // Grace period in milliseconds
}

export function getConfig(): AppConfig {
    return {
        serverBaseUrl: import.meta.env.VITE_SERVER_BASE_URL || "env_not_defained_endpoint",
        secretKey: import.meta.env.VITE_SECRET_KEY || "",
        allowedHosts: import.meta.env.VITE_ALLOWED_HOSTS,
        sessionWarningTimeMs: (parseInt(import.meta.env.VITE_SESSION_WARNING_TIME || "30", 10)) * 60 * 1000, // Convert minutes to milliseconds
        inactivityTimeoutMs: (parseInt(import.meta.env.VITE_INACTIVITY_TIMEOUT || "5", 10)) * 60 * 1000, // Convert minutes to milliseconds
        gracePeriodMs: (parseInt(import.meta.env.VITE_GRACE_PERIOD || "30", 10)) * 1000, // Convert seconds to milliseconds
    };
}
