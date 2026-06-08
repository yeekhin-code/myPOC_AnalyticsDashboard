import { useState } from 'react';
import ChartRenderer from './ChartRenderer';
import { ChartData, DataPoint } from '../types';

interface ManualChartDisplayProps {
  chartData: ChartData;
  showDataTable?: boolean;
}

const ManualChartDisplay: React.FC<ManualChartDisplayProps> = ({ chartData, showDataTable = true }) => {
  const [showTable, setShowTable] = useState(false);
  const { data, endpointName, chartType } = chartData;

  // Don't show table toggle for table chart type
  const shouldShowToggle = showDataTable && chartType !== 'table';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{endpointName}</h3>
        {shouldShowToggle && (
          <button
            onClick={() => setShowTable(!showTable)}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span>{showTable ? 'Hide Data Table' : 'Show Data Table'}</span>
          </button>
        )}
      </div>

      {/* Chart */}
      <div className={showTable && shouldShowToggle ? 'mb-6' : ''}>
        <ChartRenderer chartData={chartData} />
      </div>

      {/* Data Table */}
      {showTable && shouldShowToggle && (
        <div className="mt-6 border-t pt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Data Table</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row: DataPoint, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    {Object.keys(data[0]).map((key) => (
                      <td key={key} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {row[key] !== null && row[key] !== undefined ? String(row[key]) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Showing {data.length} record{data.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default ManualChartDisplay;
