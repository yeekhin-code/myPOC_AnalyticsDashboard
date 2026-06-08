import { DataPoint } from '../types';

/**
 * Flattens nested JSON up to 2 levels deep
 * Converts nested objects to dot notation
 * Example: { user: { name: "John" } } => { "user.name": "John" }
 */
export const flattenJSON = (data: any[]): DataPoint[] => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  return data.map((item) => {
    const flattened: DataPoint = {};

    const flatten = (obj: any, prefix = '') => {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          const newKey = prefix ? `${prefix}.${key}` : key;

          // Only flatten objects, not arrays
          if (
            value !== null &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            prefix.split('.').length < 2
          ) {
            // Recursively flatten, but only up to 2 levels
            flatten(value, newKey);
          } else {
            // Convert to primitive value
            if (value === null || value === undefined) {
              flattened[newKey] = null;
            } else if (typeof value === 'object') {
              // If it's still an object (array or deeper nesting), stringify it
              flattened[newKey] = JSON.stringify(value);
            } else {
              flattened[newKey] = value;
            }
          }
        }
      }
    };

    flatten(item);
    return flattened;
  });
};

/**
 * Gets all unique keys from flattened data
 */
export const getDataKeys = (data: DataPoint[]): string[] => {
  if (!data || data.length === 0) return [];

  const keysSet = new Set<string>();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => keysSet.add(key));
  });

  return Array.from(keysSet);
};

/**
 * Extracts numeric keys from data
 */
export const getNumericKeys = (data: DataPoint[]): string[] => {
  if (!data || data.length === 0) return [];

  const keys = getDataKeys(data);
  return keys.filter((key) => {
    const value = data[0][key];
    return typeof value === 'number';
  });
};

/**
 * Extracts string keys from data
 */
export const getStringKeys = (data: DataPoint[]): string[] => {
  if (!data || data.length === 0) return [];

  const keys = getDataKeys(data);
  return keys.filter((key) => {
    const value = data[0][key];
    return typeof value === 'string';
  });
};
