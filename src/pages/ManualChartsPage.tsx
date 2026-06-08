import FilterPanel from '../components/FilterPanel';
import ManualChartConfig from '../components/ManualChartConfig';
import ManualChartDisplay from '../components/ManualChartDisplay';
import { flattenJSON } from '../utils/jsonFlattener';
import { FilterConfig, Department, ManualChart, ChartData } from '../types';

interface ManualChartsPageProps {
  manualCharts: ManualChart[];
  onManualChartsChange: (charts: ManualChart[]) => void;
  filters: FilterConfig;
  onFilterChange: (filters: FilterConfig) => void;
  departments: Department[];
}

const ManualChartsPage: React.FC<ManualChartsPageProps> = ({
  manualCharts,
  onManualChartsChange,
  filters,
  onFilterChange,
  departments,
}) => {
  // Process manual charts data
  const manualChartData: ChartData[] = manualCharts
    .filter((chart) => chart.enabled)
    .map((chart) => {
      try {
        const rawData = JSON.parse(chart.jsonData);
        const flatData = flattenJSON(Array.isArray(rawData) ? rawData : [rawData]);

        return {
          endpointId: chart.id,
          endpointName: chart.name,
          data: flatData.slice(0, 20), // Limit to 20 records
          chartType: chart.chartType,
        };
      } catch (error) {
        console.error(`Error parsing JSON for chart ${chart.name}:`, error);
        return {
          endpointId: chart.id,
          endpointName: chart.name,
          data: [],
          chartType: chart.chartType,
        };
      }
    });

  return (
    <div>
      {/* Manual Chart Configuration */}
      <ManualChartConfig charts={manualCharts} onChartsChange={onManualChartsChange} />

      {/* Filter Panel */}
      <FilterPanel filters={filters} departments={departments} onFilterChange={onFilterChange} />

      {/* Manual Charts Display */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-gray-800">Your Manual Charts</h2>
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
              {manualChartData.length} chart{manualChartData.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {manualChartData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-purple-400 mb-4"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Manual Charts</h3>
            <p className="text-gray-500">
              Create your first manual chart using the configuration panel above.
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${manualChartData.length === 1 ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'}`}>
            {manualChartData.map((data) => (
              <ManualChartDisplay key={data.endpointId} chartData={data} showDataTable={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualChartsPage;
