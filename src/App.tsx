import React, { useState, useEffect } from 'react';
import FilterPanel from './components/FilterPanel';
import ConfigurationPanel from './components/ConfigurationPanel';
import ChartRenderer from './components/ChartRenderer';
import { fetchAllEndpointsData } from './utils/dataFetcher';
import { FilterConfig, Department, DataEndpoint, ChartData } from './types';

// Sample departments
const DEPARTMENTS: Department[] = [
  { id: 'sales', name: 'Sales' },
  { id: 'engineering', name: 'Engineering' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'hr', name: 'Human Resources' },
  { id: 'finance', name: 'Finance' },
];

// Sample initial endpoints (can be removed by user)
const INITIAL_ENDPOINTS: DataEndpoint[] = [
  {
    id: 'sample-1',
    name: 'Sales Performance',
    url: 'https://jsonplaceholder.typicode.com/users',
    enabled: true,
    department: 'all',
  },
];

function App() {
  const [filters, setFilters] = useState<FilterConfig>({
    timeRange: 'month',
    department: 'all',
  });

  const [endpoints, setEndpoints] = useState<DataEndpoint[]>(INITIAL_ENDPOINTS);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data when endpoints or filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchAllEndpointsData(endpoints);
      setChartData(data);
      setLoading(false);
    };

    if (endpoints.some((ep) => ep.enabled)) {
      loadData();
    } else {
      setChartData([]);
    }
  }, [endpoints, filters]);

  // Filter chart data based on selected department
  const filteredChartData = chartData.filter((chart) => {
    const endpoint = endpoints.find((ep) => ep.id === chart.endpointId);
    if (!endpoint) return false;

    // If filter is "all", show charts from all departments
    if (filters.department === 'all') return true;

    // If endpoint department is "all", show it in all department filters
    if (endpoint.department === 'all') return true;

    // Otherwise, only show if department matches
    return endpoint.department === filters.department;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Real-time data visualization and reporting
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Configuration Panel */}
        <ConfigurationPanel endpoints={endpoints} departments={DEPARTMENTS} onEndpointsChange={setEndpoints} />

        {/* Filter Panel */}
        <FilterPanel filters={filters} departments={DEPARTMENTS} onFilterChange={setFilters} />

        {/* Dashboard Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Dashboard Overview</h2>
            {loading && (
              <div className="flex items-center space-x-2 text-blue-600">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-sm font-medium">Loading data...</span>
              </div>
            )}
          </div>

          {filteredChartData.length === 0 && !loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-500">
                {chartData.length === 0
                  ? 'Configure data endpoints above to start visualizing your analytics.'
                  : 'No charts match the selected department filter.'}
              </p>
            </div>
          ) : (
            <div className={`grid gap-6 ${filteredChartData.length === 1 ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'}`}>
              {filteredChartData.map((data) => (
                <ChartRenderer key={data.endpointId} chartData={data} />
              ))}
            </div>
          )}
        </div>

        {/* Footer Attribution */}
        <div className="flex justify-center mt-8">
          <p className="text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-md shadow-lg border-l-4 border-purple-light animate-pulse">
            <span className="icon-gradient-purple">✨ Built by Leona - Vibe coding Agent from HCL Software</span>
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
