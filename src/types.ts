/**
 * Type definitions for BuyICT MCP Server
 */

export interface Marketplace {
  code: string;
  name: string;
  table: string;
  is_module: boolean;
}

export interface BuyICTConfig {
  portal_id: string;
  base_url: string;
  widget_ids: {
    opportunities: string;
    opportunities_filter?: string;
  };
  marketplaces: Marketplace[];
}

export interface AuthConfig {
  sessionId?: string;
  userToken?: string;
  uxToken?: string;
  glideUserRoute?: string;
  glideNodeId?: string;
  valkSessionId?: string;
}

export interface OpportunitySearchParams {
  keyword?: string;
  marketplace?: string;
  page_size?: number;
  page?: number;
  filters?: Record<string, any>;
}

export interface OpportunityItem {
  sys_id: string;
  number: string;
  title: string;
  short_description?: string;
  state?: string;
  marketplace?: string;
  table?: string;
  close_date?: string;
  open_date?: string;
}

export interface OpportunitySearchResult {
  items: OpportunityItem[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface OpportunityDetails extends OpportunityItem {
  description?: string;
  requirements?: string;
  contact_name?: string;
  contact_email?: string;
  [key: string]: any;
}

export interface ServiceNowPageResponse {
  result: {
    $$uiNotification: any[];
    metatags: any[];
    theme: any;
    user: any;
    page: any;
    containers: Container[];
  };
}

export interface Container {
  sys_id: string;
  rows: Row[];
}

export interface Row {
  sys_id: string;
  columns: Column[];
}

export interface Column {
  sys_id: string;
  widgets: WidgetInstance[];
}

export interface WidgetInstance {
  sys_id: string;
  widget: Widget;
  instance_id: string;
}

export interface Widget {
  sys_id: string;
  name: string;
  template: string;
  data: any;
  client_script?: string;
}

export interface FilterOptions {
  [key: string]: FilterOption[];
}

export interface FilterOption {
  label: string;
  value: string;
  selected?: boolean;
}
