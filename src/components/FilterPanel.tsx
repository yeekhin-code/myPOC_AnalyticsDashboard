import React, { useState } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);

  const handleTimeRangeChange = (timeRange: TimeRange) => {
    onFilterChange({ ...filters, timeRange });
  };

  const handleDepartmentChange = (department: string) => {
    onFilterChange({ ...filters, department });
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-xl font-bold text-gray-800">Filters</h2>
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
          {/* Time Range Filter */}
          <div className="mb-6 mt-4">
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
      )}
    </div>
  );
};

export default FilterPanel;
