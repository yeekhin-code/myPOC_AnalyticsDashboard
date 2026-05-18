export type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all';

export interface Department {
  id: string;
  name: string;
}

export interface DataEndpoint {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}

export interface FilterConfig {
  timeRange: TimeRange;
  department: string; // 'all' or department id
}

export interface DataPoint {
  [key: string]: string | number | boolean | null | undefined;
}

export interface ChartData {
  endpointId: string;
  endpointName: string;
  data: DataPoint[];
  chartType: ChartType;
}

export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'table';

export interface ChartConfig {
  type: ChartType;
  xAxisKey?: string;
  yAxisKey?: string;
  dataKey?: string;
  nameKey?: string;
}
