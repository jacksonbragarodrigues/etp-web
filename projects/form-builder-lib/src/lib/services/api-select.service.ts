import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { SelectOption } from '../models/form-builder.models';

export interface ApiSelectConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: { [key: string]: string };
  token?: string;
  labelField?: string;
  valueField?: string;
  requestBody?: any;
  cache?: boolean;
  cacheTimeout?: number; // in minutes
}

export interface ApiSelectCache {
  data: SelectOption[];
  timestamp: number;
  config: string; // serialized config for comparison
}

@Injectable({
  providedIn: 'root'
})
export class ApiSelectService {
  private cache = new Map<string, ApiSelectCache>();
  private loadingStates = new Map<string, BehaviorSubject<boolean>>();

  constructor(private http: HttpClient) {}

  /**
   * Fetch options from external API
   */
  fetchOptions(config: ApiSelectConfig): Observable<SelectOption[]> {
    if (!config.url || !config.url.trim()) {
      return throwError(() => new Error('URL da API é obrigatória'));
    }

    const cacheKey = this.generateCacheKey(config);

    // Check if data is loading
    if (this.loadingStates.has(cacheKey)) {
      const loadingState = this.loadingStates.get(cacheKey)!;
      if (loadingState.value) {
        // Return the loading observable
        return new Observable(subscriber => {
          const subscription = loadingState.subscribe(isLoading => {
            if (!isLoading) {
              // Loading finished, get data from cache
              const cached = this.getFromCache(cacheKey, config);
              if (cached) {
                subscriber.next(cached);
                subscriber.complete();
              } else {
                subscriber.error(new Error('Falha ao carregar dados da API'));
              }
            }
          });

          return () => subscription.unsubscribe();
        });
      }
    }

    // Check cache first
    if (config.cache !== false) {
      const cached = this.getFromCache(cacheKey, config);
      if (cached) {
        return of(cached);
      }
    }

    // Set loading state
    const loadingState = new BehaviorSubject<boolean>(true);
    this.loadingStates.set(cacheKey, loadingState);

    return this.makeApiCall(config).pipe(
      map(response => this.transformResponse(response, config)),
      tap(options => {
        // Cache the result
        if (config.cache !== false) {
          this.setCache(cacheKey, options, config);
        }
        // Clear loading state
        loadingState.next(false);
        this.loadingStates.delete(cacheKey);
      }),
      catchError(error => {
        // Clear loading state on error
        loadingState.next(false);
        this.loadingStates.delete(cacheKey);
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Check if options are currently being loaded
   */
  isLoading(config: ApiSelectConfig): boolean {
    const cacheKey = this.generateCacheKey(config);
    const loadingState = this.loadingStates.get(cacheKey);
    return loadingState ? loadingState.value : false;
  }

  /**
   * Clear cache for specific config or all cache
   */
  clearCache(config?: ApiSelectConfig): void {
    if (config) {
      const cacheKey = this.generateCacheKey(config);
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache size for debugging
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  private makeApiCall(config: ApiSelectConfig): Observable<any> {
    const headers = this.buildHeaders(config);
    const method = config.method || 'GET';
    const url = config.url.trim();

    switch (method.toUpperCase()) {
      case 'GET':
        return this.http.get(url, { headers });
      case 'POST':
        return this.http.post(url, config.requestBody || {}, { headers });
      case 'PUT':
        return this.http.put(url, config.requestBody || {}, { headers });
      case 'DELETE':
        return this.http.delete(url, { headers });
      default:
        return throwError(() => new Error(`Método HTTP não suportado: ${method}`));
    }
  }

  private buildHeaders(config: ApiSelectConfig): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    // Add custom headers
    if (config.headers) {
      Object.keys(config.headers).forEach(key => {
        headers = headers.set(key, config.headers![key]);
      });
    }

    // Add JWT token
    if (config.token && config.token.trim()) {
      headers = headers.set('Authorization', `Bearer ${config.token.trim()}`);
    }

    return headers;
  }

  private transformResponse(response: any, config: ApiSelectConfig): SelectOption[] {
    if (!response) {
      return [];
    }

    // Handle different response formats
    let dataArray: any[];

    if (Array.isArray(response)) {
      dataArray = response;
    } else if (response.data && Array.isArray(response.data)) {
      dataArray = response.data;
    } else if (response.items && Array.isArray(response.items)) {
      dataArray = response.items;
    } else if (response.results && Array.isArray(response.results)) {
      dataArray = response.results;
    } else {
      console.warn('Formato de resposta da API não reconhecido:', response);
      return [];
    }

    const labelField = config.labelField || 'name';
    const valueField = config.valueField || 'id';

    return dataArray.map((item, index) => {
      let label: string;
      let value: any;

      if (typeof item === 'object' && item !== null) {
        // Extract label
        label = this.getNestedProperty(item, labelField) || 
                this.getNestedProperty(item, 'label') || 
                this.getNestedProperty(item, 'name') || 
                this.getNestedProperty(item, 'title') || 
                `Item ${index + 1}`;

        // Extract value
        value = this.getNestedProperty(item, valueField) || 
                this.getNestedProperty(item, 'value') || 
                this.getNestedProperty(item, 'id') || 
                index;
      } else {
        // Handle primitive values
        label = String(item);
        value = item;
      }

      return {
        label: String(label),
        value: value,
        selected: false,
        originalData: item // Store the original API response item
      };
    });
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  private generateCacheKey(config: ApiSelectConfig): string {
    const keyData = {
      url: config.url,
      method: config.method || 'GET',
      headers: config.headers || {},
      token: config.token || '',
      labelField: config.labelField || 'name',
      valueField: config.valueField || 'id',
      requestBody: config.requestBody || {}
    };

    return btoa(JSON.stringify(keyData));
  }

  private getFromCache(cacheKey: string, config: ApiSelectConfig): SelectOption[] | null {
    const cached = this.cache.get(cacheKey);
    
    if (!cached) {
      return null;
    }

    const now = Date.now();
    const cacheTimeout = (config.cacheTimeout || 30) * 60 * 1000; // Convert minutes to milliseconds
    
    if (now - cached.timestamp > cacheTimeout) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  private setCache(cacheKey: string, data: SelectOption[], config: ApiSelectConfig): void {
    const configStr = JSON.stringify(config);
    this.cache.set(cacheKey, {
      data: [...data], // Deep copy to prevent mutations
      timestamp: Date.now(),
      config: configStr
    });
  }

  private handleError(error: any): Error {
    let message = 'Erro ao carregar dados da API';

    if (error.status) {
      switch (error.status) {
        case 401:
          message = 'Token de autenticação inválido ou expirado';
          break;
        case 403:
          message = 'Acesso negado ao endpoint da API';
          break;
        case 404:
          message = 'Endpoint da API não encontrado';
          break;
        case 500:
          message = 'Erro interno do servidor da API';
          break;
        case 0:
          message = 'Erro de conectividade - verifique a URL e as configurações de CORS';
          break;
        default:
          message = `Erro HTTP ${error.status}: ${error.statusText || 'Erro desconhecido'}`;
      }
    } else if (error.message) {
      message = error.message;
    }

    console.error('API Select Error:', error);
    return new Error(message);
  }
}
