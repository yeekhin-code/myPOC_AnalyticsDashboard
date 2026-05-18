import { DataPoint, ChartType, ChartData, DataEndpoint } from '../types';

/**
 * Fetches data from a JSON endpoint and returns top 20 records
 */
export const fetchEndpointData = async (url: string): Promise<DataPoint[]> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const data = await response.json();

    // Ensure data is an array
    const dataArray = Array.isArray(data) ? data : [data];

    // Return only top 20 records
    return dataArray.slice(0, 20);
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return [];
  }
};

/**
 * Analyzes data structure and determines the best chart type
 */
export const detectChartType = (data: DataPoint[]): ChartType => {
  if (!data || data.length === 0) {
    return 'table';
  }

  const firstItem = data[0];
  const keys = Object.keys(firstItem);

  // Count numeric and string fields
  const numericFields = keys.filter((key) => typeof firstItem[key] === 'number');
  const stringFields = keys.filter((key) => typeof firstItem[key] === 'string');

  // If many fields or complex data, use table
  if (keys.length > 6) {
    return 'table';
  }

  // If has 3 or more numeric fields (x, y, z/size), use bubble chart
  if (numericFields.length >= 3) {
    return 'bubble';
  }

  // If only 1-3 data points and has numeric values, use pie chart
  if (data.length <= 3 && numericFields.length > 0) {
    return 'pie';
  }

  // If has time-based field (date, month, year, etc.), use line or area chart
  const hasTimeField = stringFields.some((key) =>
    /date|time|month|year|day|week|quarter/i.test(key)
  );

  if (hasTimeField && numericFields.length > 0) {
    // Use area for single numeric field, line for multiple
    return numericFields.length === 1 ? 'area' : 'line';
  }

  // If has categories and numeric values, use bar chart
  if (stringFields.length > 0 && numericFields.length > 0) {
    return 'bar';
  }

  // Default to table for complex or unknown structures
  return 'table';
};

/**
 * Fetches data from all enabled endpoints and prepares chart data
 */
export const fetchAllEndpointsData = async (
  endpoints: DataEndpoint[]
): Promise<ChartData[]> => {
  const enabledEndpoints = endpoints.filter((ep) => ep.enabled);

  const results = await Promise.all(
    enabledEndpoints.map(async (endpoint) => {
      const data = await fetchEndpointData(endpoint.url);
      const chartType = detectChartType(data);

      return {
        endpointId: endpoint.id,
        endpointName: endpoint.name,
        data,
        chartType,
      };
    })
  );

  return results;
};
