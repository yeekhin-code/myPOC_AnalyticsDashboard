// src/services/foundry/identity/FoundryAccountsClient.ts
import { foundryConfig } from '../../../config/foundry.config';

/**
 * Foundry Accounts Authentication Client
 *
 * This is the default authentication mechanism for Foundry applications.
 * Uses the standard Foundry Accounts service at /authService/accounts/*
 *
 * CRITICAL ENDPOINTS (all must include /authService/ prefix):
 * - Login: /authService/accounts/login
 * - Logout: /authService/accounts/logout
 * - Profile: /authService/accounts/profile
 *
 * CRITICAL: Uses form-urlencoded (NOT JSON) for requests
 */

export interface AccountsLoginRequest {
  userid: string;
  password: string;
}

export interface AccountsLoginResponse {
  claims_token: {
    value: string;
    exp: number;
  };
  opstatus: number;
  httpStatusCode: number;
}

export class FoundryAccountsClient {
  private baseURL: string;

  constructor() {
    // Use VITE_FOUNDRY_AUTH_HOST for consistency with custom identity services
    // For Foundry Accounts: authHost typically doesn't include "/authService/accounts"
    this.baseURL = `https://${foundryConfig.authHost}`;
  }

  /**
   * Login using Foundry Accounts
   * CRITICAL: Endpoint must be /authService/accounts/login (NOT /accounts/login)
   * CRITICAL: Use form-urlencoded, NOT JSON
   *
   * Cloud example URL: https://100000012.auth.sit-hclvoltmx.net/authService/accounts/login
   * On-premise example URL: https://my-company-foundry.net/authService/accounts/login
   */
  async login(credentials: AccountsLoginRequest): Promise<AccountsLoginResponse> {
    // CRITICAL: Use form-urlencoded, NOT JSON
    const formData = new URLSearchParams();
    formData.append('userid', credentials.userid);
    formData.append('password', credentials.password);

    const response = await fetch(`${this.baseURL}/authService/accounts/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Voltmx-App-Key': foundryConfig.appKey,
        'X-Voltmx-App-Secret': foundryConfig.appSecret,
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Login failed (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  /**
   * Logout from Foundry Accounts
   * CRITICAL: Endpoint must be /authService/accounts/logout (NOT /accounts/logout)
   */
  async logout(claimsToken: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/authService/accounts/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Voltmx-App-Key': foundryConfig.appKey,
        'X-Voltmx-App-Secret': foundryConfig.appSecret,
        'X-Voltmx-Authorization': claimsToken,
      },
    });

    if (!response.ok) {
      console.warn('Logout failed, but clearing local session');
    }
  }
}
