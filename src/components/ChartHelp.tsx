import { useState } from 'react';
import { ChartType } from '../types';

interface ChartHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChartExample {
  simple: string;
  nested: string;
  description: string;
}

const chartExamples: Record<ChartType, ChartExample> = {
  bar: {
    description: 'Bar charts display categorical data with rectangular bars. Best for comparing values across categories.',
    simple: `[
  { "category": "Product A", "sales": 120, "revenue": 2400 },
  { "category": "Product B", "sales": 90, "revenue": 1800 },
  { "category": "Product C", "sales": 150, "revenue": 3000 }
]`,
    nested: `[
  {
    "product": { "name": "Product A", "category": "Electronics" },
    "metrics": { "sales": 120, "revenue": 2400 }
  },
  {
    "product": { "name": "Product B", "category": "Electronics" },
    "metrics": { "sales": 90, "revenue": 1800 }
  }
]`,
  },
  line: {
    description: 'Line charts show trends over time or continuous data. Perfect for time-series analysis.',
    simple: `[
  { "month": "Jan", "sales": 4000, "expenses": 2400 },
  { "month": "Feb", "sales": 3000, "expenses": 1398 },
  { "month": "Mar", "sales": 2000, "expenses": 9800 },
  { "month": "Apr", "sales": 2780, "expenses": 3908 }
]`,
    nested: `[
  {
    "date": { "month": "Jan", "year": 2024 },
    "data": { "sales": 4000, "expenses": 2400 }
  },
  {
    "date": { "month": "Feb", "year": 2024 },
    "data": { "sales": 3000, "expenses": 1398 }
  }
]`,
  },
  area: {
    description: 'Area charts are similar to line charts but with filled areas. Great for showing volume and magnitude over time.',
    simple: `[
  { "day": "Mon", "users": 240, "sessions": 400 },
  { "day": "Tue", "users": 300, "sessions": 500 },
  { "day": "Wed", "users": 450, "sessions": 700 },
  { "day": "Thu", "users": 380, "sessions": 600 }
]`,
    nested: `[
  {
    "period": { "day": "Mon", "week": 1 },
    "analytics": { "users": 240, "sessions": 400 }
  },
  {
    "period": { "day": "Tue", "week": 1 },
    "analytics": { "users": 300, "sessions": 500 }
  }
]`,
  },
  pie: {
    description: 'Pie charts show proportions of a whole. Best for displaying percentage distribution (use 3-6 categories max).',
    simple: `[
  { "category": "Desktop", "value": 450 },
  { "category": "Mobile", "value": 320 },
  { "category": "Tablet", "value": 180 }
]`,
    nested: `[
  {
    "device": { "name": "Desktop", "type": "Computer" },
    "stats": { "value": 450, "percentage": 47 }
  },
  {
    "device": { "name": "Mobile", "type": "Phone" },
    "stats": { "value": 320, "percentage": 33 }
  }
]`,
  },
  donut: {
    description: 'Donut charts are pie charts with a hole in the center. Better for displaying multiple series and labels.',
    simple: `[
  { "category": "Chrome", "users": 5400 },
  { "category": "Firefox", "users": 2100 },
  { "category": "Safari", "users": 1800 },
  { "category": "Edge", "users": 900 }
]`,
    nested: `[
  {
    "browser": { "name": "Chrome", "version": "120" },
    "usage": { "users": 5400, "sessions": 12000 }
  },
  {
    "browser": { "name": "Firefox", "version": "121" },
    "usage": { "users": 2100, "sessions": 5500 }
  }
]`,
  },
  bubble: {
    description: 'Bubble charts display three dimensions of data. X and Y position, plus bubble size for the third dimension.',
    simple: `[
  { "product": "A", "price": 100, "quantity": 50, "revenue": 5000 },
  { "product": "B", "price": 150, "quantity": 30, "revenue": 4500 },
  { "product": "C", "price": 80, "quantity": 70, "revenue": 5600 }
]`,
    nested: `[
  {
    "item": { "name": "Product A", "category": "Electronics" },
    "metrics": { "price": 100, "quantity": 50, "revenue": 5000 }
  },
  {
    "item": { "name": "Product B", "category": "Electronics" },
    "metrics": { "price": 150, "quantity": 30, "revenue": 4500 }
  }
]`,
  },
  combo: {
    description: 'Combo charts combine bars and lines. Use different chart types for different data series in the same chart.',
    simple: `[
  { "month": "Jan", "sales": 4000, "growth": 12 },
  { "month": "Feb", "sales": 3000, "growth": -8 },
  { "month": "Mar", "sales": 5000, "growth": 20 },
  { "month": "Apr", "sales": 4500, "growth": 5 }
]`,
    nested: `[
  {
    "period": { "month": "Jan", "quarter": "Q1" },
    "data": { "sales": 4000, "growth": 12, "target": 3800 }
  },
  {
    "period": { "month": "Feb", "quarter": "Q1" },
    "data": { "sales": 3000, "growth": -8, "target": 3500 }
  }
]`,
  },
  table: {
    description: 'Table view displays data in rows and columns. Best for detailed data with many fields.',
    simple: `[
  { "id": 1, "name": "John Doe", "email": "john@example.com", "status": "Active" },
  { "id": 2, "name": "Jane Smith", "email": "jane@example.com", "status": "Active" },
  { "id": 3, "name": "Bob Johnson", "email": "bob@example.com", "status": "Inactive" }
]`,
    nested: `[
  {
    "user": { "id": 1, "name": "John Doe" },
    "contact": { "email": "john@example.com", "phone": "555-0100" }
  },
  {
    "user": { "id": 2, "name": "Jane Smith" },
    "contact": { "email": "jane@example.com", "phone": "555-0200" }
  }
]`,
  },
};

const ChartHelp: React.FC<ChartHelpProps> = ({ isOpen, onClose }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('bar');
  const [showNested, setShowNested] = useState(false);

  if (!isOpen) return null;

  const example = chartExamples[selectedChart];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Chart Type Documentation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Chart Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Chart Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.keys(chartExamples).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedChart(type as ChartType)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                    selectedChart === type
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <h3 className="font-semibold text-blue-900 mb-2 capitalize">{selectedChart} Chart</h3>
            <p className="text-blue-800 text-sm">{example.description}</p>
          </div>

          {/* JSON Structure Toggle */}
          <div className="mb-4 flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">JSON Structure:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setShowNested(false)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  !showNested
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => setShowNested(true)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  showNested
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Nested (2 levels)
              </button>
            </div>
          </div>

          {/* JSON Example */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">
                {showNested ? 'Nested JSON Example' : 'Simple JSON Example'}
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(showNested ? example.nested : example.simple);
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Copy
              </button>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
              {showNested ? example.nested : example.simple}
            </pre>
          </div>

          {/* Usage Notes */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">Usage Notes:</h4>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Nested JSON can be up to 2 levels deep</li>
              <li>The system will automatically flatten nested structures</li>
              <li>For nested data, use dot notation: <code className="bg-yellow-100 px-1 rounded">object.property</code></li>
              <li>Ensure all objects in the array have consistent structure</li>
              <li>Maximum 20 data points will be displayed</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartHelp;
