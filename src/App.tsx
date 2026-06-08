import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import ManualChartsPage from './pages/ManualChartsPage';
import { FilterConfig, Department, DataEndpoint, ManualChart } from './types';

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
  // Get base path from environment variable (for GitHub Pages)
  const basePath = import.meta.env.VITE_BASE_PATH || '/';

  // Shared state across pages
  const [filters, setFilters] = useState<FilterConfig>({
    timeRange: 'month',
    department: 'all',
  });

  const [endpoints, setEndpoints] = useState<DataEndpoint[]>(INITIAL_ENDPOINTS);
  const [manualCharts, setManualCharts] = useState<ManualChart[]>([]);

  return (
    <BrowserRouter basename={basePath}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Navigation */}
        <Navigation />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  endpoints={endpoints}
                  onEndpointsChange={setEndpoints}
                  filters={filters}
                  onFilterChange={setFilters}
                  departments={DEPARTMENTS}
                />
              }
            />
            <Route
              path="/manual-charts"
              element={
                <ManualChartsPage
                  manualCharts={manualCharts}
                  onManualChartsChange={setManualCharts}
                  filters={filters}
                  onFilterChange={setFilters}
                  departments={DEPARTMENTS}
                />
              }
            />
          </Routes>

          {/* Footer Attribution */}
          <div className="flex justify-center mt-8">
            <p className="text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-md shadow-lg border-l-4 border-purple-light animate-pulse">
              <span className="icon-gradient-purple">✨ Built by Leona - Vibe coding Agent from HCL Software</span>
            </p>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
