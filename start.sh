#!/bin/bash
set -e

# Build and start the API server in background on port 8080
cd /home/runner/workspace/freestuff-app/api-server
PORT=8080 NODE_ENV=development pnpm run build
PORT=8080 NODE_ENV=development pnpm run start &
API_PID=$!

# Start the Vite frontend on port 5000
cd /home/runner/workspace/freestuff-app/freestuff
PORT=5000 BASE_PATH=/ NODE_ENV=development pnpm run dev &
FRONTEND_PID=$!

# Wait for both
wait $API_PID $FRONTEND_PID
