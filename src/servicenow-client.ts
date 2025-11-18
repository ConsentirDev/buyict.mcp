/**
 * ServiceNow API Client for BuyICT
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  BuyICTConfig,
  AuthConfig,
  OpportunitySearchParams,
  OpportunitySearchResult,
  OpportunityDetails,
  ServiceNowPageResponse,
  Marketplace
} from './types.js';

export class ServiceNowClient {
  private config: BuyICTConfig;
  private auth: AuthConfig;
  private client: AxiosInstance;

  constructor(config: BuyICTConfig, auth: AuthConfig = {}) {
    this.config = config;
    this.auth = auth;

    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: config.base_url,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BuyICT-MCP-Server/0.1.0',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    // Add auth headers if available
    this.updateAuthHeaders();

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: AxiosError) => this.handleError(error)
    );
  }

  /**
   * Update authentication headers
   */
  private updateAuthHeaders(): void {
    if (this.auth.userToken) {
      this.client.defaults.headers.common['X-UserToken'] = this.auth.userToken;
    }

    if (this.auth.uxToken) {
      this.client.defaults.headers.common['UX-Token'] = this.auth.uxToken;
    }

    this.client.defaults.headers.common['x-portal'] = this.config.portal_id;

    // Build cookie string
    const cookies: string[] = [];
    if (this.auth.sessionId) cookies.push(`JSESSIONID=${this.auth.sessionId}`);
    if (this.auth.glideUserRoute) cookies.push(`glide_user_route=${this.auth.glideUserRoute}`);
    if (this.auth.glideNodeId) cookies.push(`glide_node_id_for_js=${this.auth.glideNodeId}`);
    if (this.auth.valkSessionId) cookies.push(`VALK_SESSION_ID=${this.auth.valkSessionId}`);

    if (cookies.length > 0) {
      this.client.defaults.headers.common['Cookie'] = cookies.join('; ');
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: AxiosError): Promise<never> {
    if (error.response) {
      const data = error.response.data as any;

      // Check for authentication error
      if (data?.error?.message === 'User Not Authenticated') {
        throw new Error(
          'Authentication required. Please provide valid session credentials. ' +
          'See .env.example for required environment variables.'
        );
      }

      throw new Error(
        `ServiceNow API error: ${data?.error?.message || error.message}`
      );
    } else if (error.request) {
      throw new Error('No response from ServiceNow API. Please check your connection.');
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }

  /**
   * Fetch the opportunities page to get widget structure
   */
  async fetchOpportunitiesPage(): Promise<ServiceNowPageResponse> {
    const response = await this.client.get<ServiceNowPageResponse>(
      '/api/now/sp/page',
      {
        params: {
          id: 'opportunities',
          portal_id: this.config.portal_id,
          time: Date.now(),
          request_uri: '/sp?id=opportunities'
        }
      }
    );

    return response.data;
  }

  /**
   * Search opportunities (placeholder - needs actual endpoint discovery)
   */
  async searchOpportunities(
    params: OpportunitySearchParams
  ): Promise<OpportunitySearchResult> {
    // TODO: Implement actual API call once we discover the correct endpoint
    // For now, this is a placeholder that returns the structure

    console.warn(
      'searchOpportunities is not fully implemented yet. ' +
      'Need to discover the correct API endpoint for fetching opportunity data.'
    );

    // Try fetching the page to get widget data
    const pageData = await this.fetchOpportunitiesPage();

    // Extract widget data
    const opportunitiesWidget = this.findWidget(pageData, 'Opportunities V2');

    if (opportunitiesWidget?.data) {
      const widgetData = opportunitiesWidget.data;

      return {
        items: widgetData.pageItems || [],
        total_count: widgetData.totalItems || 0,
        page: params.page || 1,
        page_size: params.page_size || 15,
        total_pages: Math.ceil((widgetData.totalItems || 0) / (params.page_size || 15))
      };
    }

    return {
      items: [],
      total_count: 0,
      page: 1,
      page_size: 15,
      total_pages: 0
    };
  }

  /**
   * Get opportunity details from a specific table
   */
  async getOpportunityDetails(
    opportunityId: string,
    table: string
  ): Promise<OpportunityDetails | null> {
    try {
      const response = await this.client.get(
        `/api/now/table/${table}/${opportunityId}`
      );

      return response.data.result;
    } catch (error) {
      console.error('Error fetching opportunity details:', error);
      return null;
    }
  }

  /**
   * Get list of marketplaces
   */
  getMarketplaces(): Marketplace[] {
    return this.config.marketplaces;
  }

  /**
   * Helper to find a widget by name in the page response
   */
  private findWidget(pageData: ServiceNowPageResponse, widgetName: string) {
    for (const container of pageData.result.containers || []) {
      for (const row of container.rows || []) {
        for (const column of row.columns || []) {
          for (const widgetInstance of column.widgets || []) {
            if (widgetInstance.widget.name === widgetName) {
              return widgetInstance.widget;
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Update authentication configuration
   */
  updateAuth(auth: AuthConfig): void {
    this.auth = { ...this.auth, ...auth };
    this.updateAuthHeaders();
  }
}
