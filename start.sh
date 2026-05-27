#!/bin/bash

# Build and start the API server on port 8080
cd /home/runner/workspace/freestuff-app/api-server
PORT=8080 NODE_ENV=development pnpm run build
PORT=8080 NODE_ENV=development pnpm run start &
API_PID=$!

# Start the Expo mobile app in web mode on port 5000
cd /home/runner/workspace/freestuff-mobile
export EXPO_PUBLIC_API_URL="https://${REPLIT_DEV_DOMAIN}"
export CI=1
npx expo start --port 5000 &
EXPO_PID=$!

wait $API_PID $EXPO_PID
