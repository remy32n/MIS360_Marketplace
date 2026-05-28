#!/bin/bash

# Build and start the API server on port 8080
cd /home/runner/workspace/freestuff-app/api-server
PORT=8080 NODE_ENV=development pnpm run build
PORT=8080 NODE_ENV=development pnpm run start &
API_PID=$!

# Start the Expo mobile app in web mode on port 3000 (internal)
cd /home/runner/workspace/freestuff-mobile
export EXPO_PUBLIC_API_URL=""
export CI=1
export EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK=1
npx expo start --web --port 3000 --clear &
EXPO_PID=$!

# Start the reverse proxy on port 5000 (public-facing)
# /api/* → port 8080 (Express)  |  /* → port 3000 (Expo)
node /home/runner/workspace/proxy.js &
PROXY_PID=$!

wait $API_PID $EXPO_PID $PROXY_PID
