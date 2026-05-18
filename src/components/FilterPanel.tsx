import React from 'react';
import { TimeRange, FilterConfig, Department } from '../types';

interface FilterPanelProps {
  filters: FilterConfig;
  departments: Department[];
  onFilterChange: (filters: FilterConfig) => void;
}

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
  { value: 'all', label: 'All Time' },
];

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, departments, onFilterChange }) => {
  const handleTimeRangeChange = (timeRange: TimeRange) => {
    onFilterChange({ ...filters, timeRange });
  };

  const handleDepartmentChange = (department: string) => {
    onFilterChange({ ...filters, department });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Filters</h2>

      {/* Time Range Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Time Range</label>
        <div className="flex flex-wrap gap-2">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => handleTimeRangeChange(range.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filters.timeRange === range.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Department Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Department</label>
        <select
          value={filters.department}
          onChange={(e) => handleDepartmentChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="all">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
