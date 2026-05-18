// src/config/foundry.config.ts

/**
 * Foundry Environment Configuration
 *
 * This configuration enables the app to work across different Foundry environments
 * (dev, staging, production) by changing only environment variables, not code.
 *
 * Required Environment Variables:
 * - VITE_FOUNDRY_AUTH_HOST: Host for identity/authentication services
 * - VITE_FOUNDRY_SERVICE_HOST: Host for integration/object/orchestration services
 * - VITE_FOUNDRY_APP_KEY: App key from Foundry Console
 * - VITE_FOUNDRY_APP_SECRET: App secret from Foundry Console
 */

export interface FoundryConfig {
  // Identity/authentication service host
  authHost: string;

  // Runtime services (integration, object, orchestration) host
  serviceHost: string;

  // App credentials
  appKey: string;
  appSecret: string;
}

export const foundryConfig: FoundryConfig = {
  authHost: import.meta.env.VITE_FOUNDRY_AUTH_HOST || '',
  serviceHost: import.meta.env.VITE_FOUNDRY_SERVICE_HOST || '',
  appKey: import.meta.env.VITE_FOUNDRY_APP_KEY || '',
  appSecret: import.meta.env.VITE_FOUNDRY_APP_SECRET || '',
};

/**
 * Validates that all required environment variables are set
 * Call this at app startup to fail fast if configuration is missing
 */
export function validateFoundryConfig(): void {
  const missing: string[] = [];

  if (!foundryConfig.authHost) missing.push('VITE_FOUNDRY_AUTH_HOST');
  if (!foundryConfig.serviceHost) missing.push('VITE_FOUNDRY_SERVICE_HOST');
  if (!foundryConfig.appKey) missing.push('VITE_FOUNDRY_APP_KEY');
  if (!foundryConfig.appSecret) missing.push('VITE_FOUNDRY_APP_SECRET');

  if (missing.length > 0) {
    throw new Error(
      `Missing required Foundry environment variables: ${missing.join(', ')}\n\n` +
      `Please copy .env.example to .env and fill in the required values.`
    );
  }
}
