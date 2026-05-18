#!/bin/bash

# Set the base path for this app
export VITE_BASE_PATH=/app-$APP_HASH/

echo "Starting services for app: $APP_HASH"

# Kill existing service processes by port
echo "Checking for existing service processes..."

# Read service ports from config and kill any processes using those ports
jq -r '.services[] | "\(.name) \(.port)"' services-config.json | \
while read name port; do
  if lsof -ti:$port > /dev/null 2>&1; then
    echo "Found existing process on port $port ($name service), killing..."
    kill $(lsof -ti:$port) 2>/dev/null || true
    sleep 1
  fi
done

echo "All existing service processes stopped."

# Create logs directory if it doesn't exist
mkdir -p logs

# Start all backend services from config with nohup and unique PORT variables
jq -r '.services[] | "\(.name) \(.port) services/\(.name)/server.ts"' services-config.json | \
while read name port path; do
  # Convert service name to uppercase for env var (e.g., database -> DATABASE_PORT)
  env_var_name="$(echo "$name" | tr '[:lower:]' '[:upper:]')_PORT"

  # Install dependencies for this service if needed
  service_dir="services/$name"
  if [ -f "$service_dir/package.json" ]; then
    # Check if npm install is needed
    need_install=false

    # Install if node_modules doesn't exist
    if [ ! -d "$service_dir/node_modules" ]; then
      need_install=true
      echo "node_modules not found for $name service, installing dependencies..."
    # Install if package.json is newer than package-lock.json
    elif [ ! -f "$service_dir/package-lock.json" ] || [ "$service_dir/package.json" -nt "$service_dir/package-lock.json" ]; then
      need_install=true
      echo "package.json has changed for $name service, updating dependencies..."
    fi

    if [ "$need_install" = true ]; then
      (cd "$service_dir" && npm install > /dev/null 2>&1)
    fi
  fi

  echo "Starting $name service on port $port (using $env_var_name)..."
  nohup env $env_var_name=$port tsx "$path" > "logs/$name.log" 2>&1 &
  echo "  PID: $! (log: logs/$name.log)"
done

# Wait a moment for services to start
sleep 2

echo "Backend services started. Check logs/ directory for output."
echo ""
echo "To start the frontend, run: npm run dev"
echo "Frontend will be available at: http://localhost:5173${VITE_BASE_PATH}"
