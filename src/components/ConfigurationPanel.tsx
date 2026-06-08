import React, { useState } from 'react';
import { DataEndpoint, Department } from '../types';

interface ConfigurationPanelProps {
  endpoints: DataEndpoint[];
  departments: Department[];
  onEndpointsChange: (endpoints: DataEndpoint[]) => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ endpoints, departments, onEndpointsChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState({ name: '', url: '', department: 'all' });

  const handleAddEndpoint = () => {
    if (newEndpoint.name && newEndpoint.url) {
      const endpoint: DataEndpoint = {
        id: `endpoint-${Date.now()}`,
        name: newEndpoint.name,
        url: newEndpoint.url,
        enabled: true,
        department: newEndpoint.department,
      };
      onEndpointsChange([...endpoints, endpoint]);
      setNewEndpoint({ name: '', url: '', department: 'all' });
    }
  };

  const handleToggleEndpoint = (id: string) => {
    onEndpointsChange(
      endpoints.map((ep) => (ep.id === id ? { ...ep, enabled: !ep.enabled } : ep))
    );
  };

  const handleDeleteEndpoint = (id: string) => {
    onEndpointsChange(endpoints.filter((ep) => ep.id !== id));
  };

  const handleDepartmentChange = (id: string, department: string) => {
    onEndpointsChange(
      endpoints.map((ep) => (ep.id === id ? { ...ep, department } : ep))
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-xl font-bold text-gray-800">Data Source Configuration</h2>
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
          {/* Add New Endpoint */}
          <div className="mt-4 mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Add New Data Endpoint</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <input
                type="text"
                placeholder="Endpoint Name"
                value={newEndpoint.name}
                onChange={(e) => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="JSON Endpoint URL"
                value={newEndpoint.url}
                onChange={(e) => setNewEndpoint({ ...newEndpoint, url: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newEndpoint.department}
                onChange={(e) => setNewEndpoint({ ...newEndpoint, department: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddEndpoint}
              className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Add Endpoint
            </button>
          </div>

          {/* Existing Endpoints */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Active Data Endpoints</h3>
            {endpoints.length === 0 ? (
              <p className="text-gray-500 text-sm">No endpoints configured. Add one above to get started.</p>
            ) : (
              <div className="space-y-2">
                {endpoints.map((endpoint) => (
                  <div
                    key={endpoint.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={endpoint.enabled}
                          onChange={() => handleToggleEndpoint(endpoint.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{endpoint.name}</p>
                          <p className="text-xs text-gray-500 truncate">{endpoint.url}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteEndpoint(endpoint.id)}
                        className="ml-3 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="ml-7">
                      <select
                        value={endpoint.department}
                        onChange={(e) => handleDepartmentChange(endpoint.id, e.target.value)}
                        className="w-full max-w-xs px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Only the top 20 records will be retrieved from each endpoint. The dashboard
              automatically determines the best visualization based on data structure.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationPanel;
