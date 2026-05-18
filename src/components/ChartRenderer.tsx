import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { ChartData, DataPoint } from '../types';

interface ChartRendererProps {
  chartData: ChartData;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const ChartRenderer: React.FC<ChartRendererProps> = ({ chartData }) => {
  const { data, chartType, endpointName } = chartData;

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{endpointName}</h3>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Determine keys for visualization
  const keys = Object.keys(data[0]);
  const numericKeys = keys.filter((key) => typeof data[0][key] === 'number');
  const stringKeys = keys.filter((key) => typeof data[0][key] === 'string');

  const xKey = stringKeys[0] || keys[0];
  const yKey = numericKeys[0] || keys[1];

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={xKey} stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
              />
              <Legend />
              {numericKeys.map((key, index) => (
                <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={xKey} stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
              />
              <Legend />
              {numericKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={xKey} stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
              />
              <Legend />
              {numericKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  fill={COLORS[index % COLORS.length]}
                  stroke={COLORS[index % COLORS.length]}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={data}
                dataKey={yKey}
                nameKey={xKey}
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'bubble':
        // Use first 3 numeric fields as x, y, z (bubble size) and 4th key for label
        const bubbleXKey = numericKeys[0] || keys[0];
        const bubbleYKey = numericKeys[1] || keys[1];
        const bubbleZKey = numericKeys[2] || keys[2];
        // Use string field for label, or numeric field if no string available
        const bubbleLabelKey = stringKeys[0] || numericKeys[3] || keys[3] || keys[0];

        // Custom label content renderer
        const customLabel = (props: any) => {
          const { x, y, value, index } = props;
          const labelValue = data[index]?.[bubbleLabelKey];

          if (!labelValue) return null;

          return (
            <text
              x={x}
              y={y}
              fill="#1f2937"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fontWeight="600"
            >
              {String(labelValue)}
            </text>
          );
        };

        return (
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                type="number"
                dataKey={bubbleXKey}
                name={bubbleXKey}
                stroke="#6b7280"
              />
              <YAxis
                type="number"
                dataKey={bubbleYKey}
                name={bubbleYKey}
                stroke="#6b7280"
              />
              <ZAxis
                type="number"
                dataKey={bubbleZKey}
                range={[60, 400]}
                name={bubbleZKey}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
              />
              <Legend />
              <Scatter
                name={endpointName}
                data={data}
                fill="#3B82F6"
              >
                <LabelList
                  dataKey={bubbleLabelKey}
                  position="center"
                  content={customLabel}
                />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {keys.map((key) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    {keys.map((key) => (
                      <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {String(row[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return <p className="text-gray-500">Unknown chart type</p>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{endpointName}</h3>
      {renderChart()}
    </div>
  );
};

export default ChartRenderer;
