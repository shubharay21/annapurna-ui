import Cookies from 'js-cookie';
import { getSessionZoneId, getSessionDistrict } from './zones';

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private getBaseUrl(): string {
    return '/api';
  }

  private getHeaders(): HeadersInit {
    const zoneId = getSessionZoneId();
    const district = getSessionDistrict();
    return {
      'Content-Type': 'application/json',
      ...(zoneId ? { 'X-Zone-Id': zoneId } : {}),
      ...(district ? { 'X-District': district } : {}),
    };
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach(cb => cb(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  private async handle401(path: string, method: string, data?: unknown): Promise<Response> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      try {
        const refreshRes = await fetch(`${this.getBaseUrl()}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!refreshRes.ok) throw new Error("Refresh failed");
        
        // Middleware handles HttpOnly cookies automatically, we just wait for success
        this.isRefreshing = false;
        this.onRefreshed('refreshed'); // Token is opaque to client
      } catch {
        this.isRefreshing = false;
        this.onRefreshed('');
        this.logoutLocal();
        throw new Error("Session expired. Please log in again.");
      }
    }

    const newToken = await new Promise<string>(resolve => {
      this.addRefreshSubscriber(resolve);
    });

    if (!newToken) throw new Error("Session expired. Please log in again.");

    return fetch(`${this.getBaseUrl()}${path}`, {
      method,
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async get<T>(path: string): Promise<T> {
    let res = await fetch(`${this.getBaseUrl()}${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (res.status === 401) {
      res = await this.handle401(path, 'GET');
    }

    if (!res.ok) {
      if (res.status === 204) return null as T;
      throw await this.handleError(res);
    }
    return res.json();
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    let res = await fetch(`${this.getBaseUrl()}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (res.status === 401) {
      res = await this.handle401(path, 'POST', data);
    }

    if (!res.ok) {
      throw await this.handleError(res);
    }
    return res.json();
  }

  async logout() {
    try {
      await fetch(`${this.getBaseUrl()}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } catch {}
    this.logoutLocal();
  }

  private logoutLocal() {
    Cookies.remove('annapurna_zone_id');
    Cookies.remove('annapurna_zone_name');
    Cookies.remove('annapurna_zone_env_key');
    Cookies.remove('annapurna_district');
    window.location.href = '/';
  }

  private async handleError(res: Response) {
    try {
      const errorData = await res.json();
      if (errorData.errors) {
        return new Error(`Validation Error: ${JSON.stringify(errorData.errors)}`);
      }
      return new Error(errorData.message || `API Error: ${res.status}`);
    } catch {
      return new Error(`API Error: ${res.status}`);
    }
  }
}

export const api = new ApiClient();

export interface CaptchaResponse {
  captchaId: string;
  svgContent: string;
}

export interface VerifyOtpResponse {
  token: string;
  refreshToken: string;
  applicationId: string | null;
  message: string;
}
