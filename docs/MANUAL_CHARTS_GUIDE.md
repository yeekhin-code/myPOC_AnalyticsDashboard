# Manual Charts Configuration Guide

Complete guide for creating and managing manual charts with custom JSON data.

## 🎯 Overview

The Manual Charts feature allows you to create custom visualizations by directly providing JSON data. This is perfect for:
- Testing different chart types with your data
- Visualizing data that doesn't come from an API endpoint
- Creating static dashboards with predefined data
- Prototyping data visualizations

## ✨ Features

### Supported Chart Types

1. **Bar Chart** - Compare categorical data with rectangular bars
2. **Line Chart** - Show trends over time or continuous data
3. **Area Chart** - Display volume and magnitude with filled areas
4. **Pie Chart** - Show proportions (best with 3-6 categories)
5. **Donut Chart** - Pie chart with center hole for better labeling
6. **Bubble Chart** - Three-dimensional data (X, Y, and size)
7. **Combo Chart** - Combines bars and lines in one chart
8. **Table** - Display detailed data in rows and columns

### JSON Structure Support

- **Simple JSON**: Flat object structure
- **Nested JSON**: Up to 2 levels deep with automatic flattening
- **Dot Notation**: Nested fields converted to `parent.child` format

### Data Table Display

All charts (except table type) can toggle between:
- Chart view only
- Chart + Data Table view

## 📝 Usage Instructions

### Step 1: Open Manual Chart Configuration

1. Click on **"Manual Chart Configuration"** panel to expand
2. Click **"View Chart Documentation & Examples"** to see examples for each chart type

### Step 2: Create a New Chart

1. **Chart Name**: Enter a descriptive name (e.g., "Monthly Sales")
2. **Chart Type**: Select from dropdown (bar, line, pie, etc.)
3. **JSON Data**: Paste your JSON data

   **Simple JSON Example:**
   ```json
   [
     { "month": "Jan", "sales": 4000, "expenses": 2400 },
     { "month": "Feb", "sales": 3000, "expenses": 1398 },
     { "month": "Mar", "sales": 2000, "expenses": 9800 }
   ]
   ```

   **Nested JSON Example:**
   ```json
   [
     {
       "period": { "month": "Jan", "quarter": "Q1" },
       "data": { "sales": 4000, "expenses": 2400 }
     },
     {
       "period": { "month": "Feb", "quarter": "Q1" },
       "data": { "sales": 3000, "expenses": 1398 }
     }
   ]
   ```

4. Click **"Add Chart"** to create

### Step 3: Manage Charts

Each chart in the list allows you to:
- **Toggle On/Off**: Check/uncheck to show/hide chart
- **Edit**: Modify name, type, or JSON data
- **Delete**: Remove the chart permanently

### Step 4: View Charts

Charts appear in the **"Manual Charts"** section below the main dashboard:
- Each chart has a **"Show Data Table"** button
- Click to toggle between chart-only and chart+table views
- Table shows all fields from your JSON data

## 🔧 Chart-Specific Guidelines

### Bar Chart
**Best for**: Comparing categories
```json
[
  { "product": "Product A", "sales": 120, "revenue": 2400 },
  { "product": "Product B", "sales": 90, "revenue": 1800 }
]
```
- Multiple numeric fields create grouped bars
- First string field becomes X-axis

### Line Chart
**Best for**: Time series or trends
```json
[
  { "month": "Jan", "sales": 4000, "profit": 1200 },
  { "month": "Feb", "sales": 3000, "profit": 900 }
]
```
- Multiple numeric fields create multiple lines
- Good for showing changes over time

### Area Chart
**Best for**: Volume over time
```json
[
  { "day": "Mon", "users": 240, "sessions": 400 },
  { "day": "Tue", "users": 300, "sessions": 500 }
]
```
- Filled areas show magnitude
- Multiple series stack or overlay

### Pie Chart
**Best for**: Proportions (3-6 slices max)
```json
[
  { "category": "Desktop", "value": 450 },
  { "category": "Mobile", "value": 320 },
  { "category": "Tablet", "value": 180 }
]
```
- First numeric field determines slice size
- First string field becomes label

### Donut Chart
**Best for**: Proportions with better labeling
```json
[
  { "browser": "Chrome", "users": 5400 },
  { "browser": "Firefox", "users": 2100 },
  { "browser": "Safari", "users": 1800 }
]
```
- Same as pie chart but with center hole
- Better for multiple categories

### Bubble Chart
**Best for**: Three dimensions of data
```json
[
  { "product": "A", "price": 100, "quantity": 50, "revenue": 5000 },
  { "product": "B", "price": 150, "quantity": 30, "revenue": 4500 }
]
```
- First numeric = X-axis
- Second numeric = Y-axis
- Third numeric = Bubble size
- First string = Bubble label

### Combo Chart
**Best for**: Comparing different metrics
```json
[
  { "month": "Jan", "sales": 4000, "growth": 12 },
  { "month": "Feb", "sales": 3000, "growth": -8 }
]
```
- All but last numeric field = Bars
- Last numeric field = Line
- Great for value + percentage combinations

### Table
**Best for**: Detailed data display
```json
[
  { "id": 1, "name": "John", "email": "john@example.com", "status": "Active" },
  { "id": 2, "name": "Jane", "email": "jane@example.com", "status": "Active" }
]
```
- Shows all fields in columns
- Good for many fields (6+)

## 🎨 Nested JSON Flattening

Nested structures are automatically flattened:

**Input:**
```json
[
  {
    "user": { "id": 1, "name": "John" },
    "metrics": { "sales": 100, "revenue": 2000 }
  }
]
```

**Flattened to:**
```json
[
  {
    "user.id": 1,
    "user.name": "John",
    "metrics.sales": 100,
    "metrics.revenue": 2000
  }
]
```

**Rules:**
- Maximum 2 levels of nesting
- Dot notation for nested fields
- All objects in array must have consistent structure

## 📊 Data Requirements

### General Rules
1. **JSON Array**: Data must be an array of objects
2. **Consistent Structure**: All objects should have same fields
3. **20 Record Limit**: Only first 20 records displayed
4. **Valid JSON**: Must be properly formatted JSON

### Field Types
- **Numeric**: Used for axes, values, sizes
- **String**: Used for labels, categories, X-axis
- **Boolean/Null**: Displayed in tables, converted to strings in charts

## 💡 Tips and Best Practices

### Data Preparation
1. **Clean Your Data**: Remove null/undefined values where possible
2. **Consistent Naming**: Use clear, descriptive field names
3. **Appropriate Sizes**: Keep datasets under 20 records for performance
4. **Type Consistency**: Ensure same field has same type across all objects

### Chart Selection
1. **Categories (≤10)**: Use bar or pie/donut
2. **Time Series**: Use line or area
3. **Comparisons**: Use combo chart
4. **3D Data**: Use bubble chart
5. **Detailed View**: Use table

### JSON Formatting
1. **Validate First**: Use a JSON validator before pasting
2. **Format Pretty**: Use proper indentation for readability
3. **Remove Comments**: JSON doesn't support comments
4. **Escape Strings**: Use `\"` for quotes inside strings

## 🐛 Troubleshooting

### Chart Not Displaying
**Problem**: Chart appears empty or shows "No data available"

**Solutions**:
1. Check JSON is valid (use [JSONLint](https://jsonlint.com/))
2. Ensure array has at least one object
3. Verify objects have required fields (numeric for charts)
4. Check chart is enabled (checkbox is checked)

### Invalid JSON Error
**Problem**: "Invalid JSON format" alert when adding chart

**Solutions**:
1. Validate JSON syntax
2. Remove trailing commas
3. Use double quotes (not single quotes)
4. Ensure proper bracket/brace matching

### Chart Shows Wrong Data
**Problem**: Chart displays unexpected values

**Solutions**:
1. Check field names match data structure
2. Verify data types (numbers vs strings)
3. For nested JSON, check flattened field names (use dot notation)
4. Toggle data table to see actual field names

### Nested JSON Not Working
**Problem**: Nested data not displaying correctly

**Solutions**:
1. Ensure nesting is maximum 2 levels
2. Check object structure is consistent
3. Use data table view to see flattened structure
4. Try simplifying to flat structure first

## 📚 Examples Library

### Sales Dashboard
```json
[
  { "month": "Jan", "sales": 4000, "target": 3500, "growth": 14 },
  { "month": "Feb", "sales": 3000, "target": 3500, "growth": -14 },
  { "month": "Mar", "sales": 5000, "target": 4000, "growth": 25 }
]
```
**Chart Type**: Combo (bars for sales/target, line for growth)

### User Distribution
```json
[
  { "country": "USA", "users": 12500 },
  { "country": "UK", "users": 8300 },
  { "country": "Germany", "users": 6100 },
  { "country": "France", "users": 5200 }
]
```
**Chart Type**: Donut

### Product Performance
```json
[
  { "product": "A", "price": 100, "sold": 50, "revenue": 5000 },
  { "product": "B", "price": 150, "sold": 30, "revenue": 4500 },
  { "product": "C", "price": 80, "sold": 70, "revenue": 5600 }
]
```
**Chart Type**: Bubble (price vs sold, size = revenue)

### Monthly Trends
```json
[
  { "month": "Jan", "visitors": 2400, "conversions": 240 },
  { "month": "Feb", "visitors": 1398, "conversions": 189 },
  { "month": "Mar", "visitors": 9800, "conversions": 1200 }
]
```
**Chart Type**: Area

## 🔄 Workflow Summary

1. **Click** "Manual Chart Configuration"
2. **Review** help documentation for examples
3. **Prepare** your JSON data
4. **Fill** chart name, type, and JSON
5. **Add** chart to create
6. **Toggle** data table view if needed
7. **Edit** or delete as needed

## ✅ Checklist

Before creating a manual chart:
- [ ] JSON is valid and properly formatted
- [ ] Data is an array of objects
- [ ] All objects have consistent structure
- [ ] Numeric fields exist for chart values
- [ ] String fields exist for labels
- [ ] Nested data is ≤ 2 levels
- [ ] Dataset has ≤ 20 records
- [ ] Chart type matches data structure

---

**Your manual charts are ready to use!** 🎨
