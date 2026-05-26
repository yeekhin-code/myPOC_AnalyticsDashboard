# Analytics Dashboard

A modern, interactive analytics and reporting dashboard built with Vite, React, and Tailwind CSS. Features dynamic data visualization with automatic chart type detection, configurable external JSON endpoints, and comprehensive filtering capabilities.

## Features

- **Configurable Data Sources**: Add and manage external JSON endpoints directly from the dashboard
- **Automatic Chart Detection**: Intelligently determines the best visualization (bar, line, area, pie, or table) based on data structure
- **Time Range Filters**: Week, Month, Quarter, Year, and All Time views
- **Department Filters**: Filter analytics by specific departments or view all
- **Top 20 Records**: Automatically retrieves only the top 20 records from each endpoint
- **Real-time Updates**: Dynamic data fetching and visualization
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Interactive Charts**: Built with Recharts for rich, interactive visualizations

## Project Structure

```
/home/node/txai-projects/project/
├── src/
│   ├── components/
│   │   ├── ChartRenderer.tsx       # Chart visualization with auto-detection
│   │   ├── FilterPanel.tsx         # Time range and department filters
│   │   └── ConfigurationPanel.tsx  # Endpoint configuration interface
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces and types
│   ├── utils/
│   │   └── dataFetcher.ts          # Data fetching and chart type detection
│   ├── App.tsx                     # Main application component
│   ├── main.tsx                    # Application entry point
│   └── index.css                   # Tailwind CSS styles
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

Start the Vite development server:

```bash
mkdir -p /home/node/txai-projects/project/.logs && npm run dev -- --host 0.0.0.0 > /home/node/txai-projects/project/.logs/server.log 2>&1
```

The application will be available at `http://localhost:5173`

### Production Build

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Technology Stack

- **Vite** - Fast build tool and dev server with HMR
- **React 18** - UI library with functional components and hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Composable charting library for React
- **PostCSS & Autoprefixer** - CSS processing

## High Level Design

### Architecture

The application follows a component-based architecture with clear separation of concerns:

1. **Data Layer** (`utils/dataFetcher.ts`):
   - Fetches data from external JSON endpoints
   - Limits results to top 20 records per endpoint
   - Automatically detects optimal chart type based on data structure

2. **Component Layer**:
   - `ConfigurationPanel`: Manages data source endpoints (add, enable/disable, delete)
   - `FilterPanel`: Controls time range and department filters
   - `ChartRenderer`: Renders visualizations based on detected chart type

3. **State Management**:
   - React hooks (`useState`, `useEffect`) for local state
   - Real-time data fetching triggered by endpoint or filter changes

### Chart Detection Algorithm

The dashboard analyzes data structure to automatically select the best visualization:

- **Table**: Complex data (6+ fields) or unknown structures
- **Pie Chart**: 1-3 data points with numeric values
- **Line/Area Chart**: Time-series data (detects date/time fields)
- **Bar Chart**: Categorical data with numeric values

## Usage Instructions

### Adding Data Endpoints

1. Click on "Data Source Configuration" to expand the panel
2. Enter an endpoint name and JSON URL
3. Click "Add Endpoint" to save
4. Toggle endpoints on/off using the checkboxes
5. Delete unwanted endpoints using the "Delete" button

### Applying Filters

- **Time Range**: Select Week, Month, Quarter, Year, or All Time
- **Department**: Choose a specific department or "All Departments"

### Sample Endpoints

The dashboard comes pre-configured with a sample endpoint. You can add your own JSON endpoints that return arrays of objects. Examples:

- `https://jsonplaceholder.typicode.com/users`
- `https://jsonplaceholder.typicode.com/posts`
- `https://api.github.com/users`

### Data Requirements

- Endpoints must return valid JSON
- Data should be an array of objects
- Only the first 20 records will be processed
- Objects should have consistent field structures

## Troubleshooting

### Charts not displaying
- Verify the endpoint URL is valid and returns JSON
- Check browser console for CORS or network errors
- Ensure the endpoint is enabled in the configuration panel

### Data not updating
- Refresh the page to clear any cached data
- Verify network connectivity to external endpoints
- Check that filters are not excluding all data

### CORS Issues
- External APIs must have CORS enabled
- Consider using CORS-enabled endpoints or proxy services
- Some public APIs may have rate limits

## Environment Variables

This project uses Vite's environment variable system:

- `VITE_BASE_PATH` - Base path for deployment (default: `/`)

## Deployment

### GitHub Pages

This application is configured for automatic deployment to GitHub Pages using GitHub Actions.

**Quick Start:**
1. Create a new GitHub repository
2. Push your code: `git push origin main`
3. Enable GitHub Pages in repository settings (Actions source)
4. Your site will be live at: `https://username.github.io/repo-name/`

**Detailed Instructions:**
See [GitHub Deployment Guide](docs/GITHUB_DEPLOYMENT.md) for complete step-by-step instructions.

**Deployment Features:**
- ✅ Automatic deployment on push to main branch
- ✅ GitHub Actions workflow included
- ✅ Environment-based base path configuration
- ✅ Build optimization and sourcemaps
- ✅ Custom domain support (optional)

## Additional Documentation

- [GitHub Deployment Guide](docs/GITHUB_DEPLOYMENT.md) - Complete guide for hosting on GitHub Pages
- [Architecture Guide](docs/ARCHITECTURE.md) - System architecture (if available)

## License

MIT License - Built by Leona, HCL Software's Vibe Coding Agent
