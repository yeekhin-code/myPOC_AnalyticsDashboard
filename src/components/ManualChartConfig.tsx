import { useState } from 'react';
import { ManualChart, ChartType } from '../types';
import ChartHelp from './ChartHelp';

interface ManualChartConfigProps {
  charts: ManualChart[];
  onChartsChange: (charts: ManualChart[]) => void;
}

const ManualChartConfig: React.FC<ManualChartConfigProps> = ({ charts, onChartsChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [newChart, setNewChart] = useState({
    name: '',
    chartType: 'bar' as ChartType,
    jsonData: '',
  });
  const [editingChart, setEditingChart] = useState<string | null>(null);

  const chartTypes: ChartType[] = ['bar', 'line', 'area', 'pie', 'donut', 'bubble', 'combo', 'table'];

  const handleAddChart = () => {
    if (newChart.name && newChart.jsonData) {
      try {
        // Validate JSON
        JSON.parse(newChart.jsonData);

        const chart: ManualChart = {
          id: `manual-${Date.now()}`,
          name: newChart.name,
          chartType: newChart.chartType,
          jsonData: newChart.jsonData,
          enabled: true,
          createdAt: new Date().toISOString(),
        };
        onChartsChange([...charts, chart]);
        setNewChart({ name: '', chartType: 'bar', jsonData: '' });
      } catch (error) {
        alert('Invalid JSON format. Please check your JSON structure.');
      }
    }
  };

  const handleToggleChart = (id: string) => {
    onChartsChange(
      charts.map((chart) => (chart.id === id ? { ...chart, enabled: !chart.enabled } : chart))
    );
  };

  const handleDeleteChart = (id: string) => {
    onChartsChange(charts.filter((chart) => chart.id !== id));
  };

  const handleUpdateChart = (id: string, updatedData: Partial<ManualChart>) => {
    onChartsChange(
      charts.map((chart) => (chart.id === id ? { ...chart, ...updatedData } : chart))
    );
    setEditingChart(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-gray-800">Manual Chart Configuration</h2>
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
              Custom Charts
            </span>
          </div>
          <svg
            className={`w-6 h-6 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="px-6 pb-6 border-t border-gray-200">
            {/* Help Button */}
            <div className="mt-4 mb-4">
              <button
                onClick={() => setShowHelp(true)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>View Chart Documentation & Examples</span>
              </button>
            </div>

            {/* Add New Chart */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Create New Chart</h3>

              <div className="space-y-3">
                {/* Chart Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Chart Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Monthly Sales Report"
                    value={newChart.name}
                    onChange={(e) => setNewChart({ ...newChart, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Chart Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Chart Type</label>
                  <select
                    value={newChart.chartType}
                    onChange={(e) => setNewChart({ ...newChart, chartType: e.target.value as ChartType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    {chartTypes.map((type) => (
                      <option key={type} value={type} className="capitalize">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* JSON Data */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    JSON Data (Simple or Nested - up to 2 levels)
                  </label>
                  <textarea
                    placeholder='[{"category": "A", "value": 100}, {"category": "B", "value": 200}]'
                    value={newChart.jsonData}
                    onChange={(e) => setNewChart({ ...newChart, jsonData: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-mono"
                    rows={6}
                  />
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAddChart}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium text-sm"
                >
                  Add Chart
                </button>
              </div>
            </div>

            {/* Existing Charts */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Manual Charts</h3>
              {charts.length === 0 ? (
                <p className="text-gray-500 text-sm">No manual charts created yet. Add one above to get started.</p>
              ) : (
                <div className="space-y-3">
                  {charts.map((chart) => (
                    <div
                      key={chart.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                    >
                      {editingChart === chart.id ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={chart.name}
                            onChange={(e) => handleUpdateChart(chart.id, { name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium"
                          />
                          <select
                            value={chart.chartType}
                            onChange={(e) =>
                              handleUpdateChart(chart.id, { chartType: e.target.value as ChartType })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            {chartTypes.map((type) => (
                              <option key={type} value={type} className="capitalize">
                                {type}
                              </option>
                            ))}
                          </select>
                          <textarea
                            value={chart.jsonData}
                            onChange={(e) => handleUpdateChart(chart.id, { jsonData: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                            rows={4}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingChart(null)}
                              className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingChart(null)}
                              className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <input
                              type="checkbox"
                              checked={chart.enabled}
                              onChange={() => handleToggleChart(chart.id)}
                              className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="text-sm font-medium text-gray-900">{chart.name}</p>
                                <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded capitalize">
                                  {chart.chartType}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                Created: {new Date(chart.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-3">
                            <button
                              onClick={() => setEditingChart(chart.id)}
                              className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteChart(chart.id)}
                              className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ChartHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
};

export default ManualChartConfig;
