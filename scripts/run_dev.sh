#!/bin/bash
# Run both server and client in headless/dev mode

# Start server with nohup
echo "Starting server with nohup..."
nohup bash -c "cd server && npm run dev" > server.log 2>&1 &
SERVER_PID=$!

# Start client with nohup
echo "Starting client with nohup..."
nohup bash -c "cd client && npm run dev" > client.log 2>&1 &
CLIENT_PID=$!

echo "Server and client started in background. Logs: server.log, client.log"
