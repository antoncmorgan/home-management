#!/bin/bash
# Run both server and client in headless/dev mode

# Accept root directory as input parameter, default to current directory if not provided
ROOT_DIR="${1:-$(pwd)}"

# Start server with nohup
echo "Starting server with nohup in $ROOT_DIR/server..."
nohup bash -c "cd $ROOT_DIR/server && npm run dev" > $ROOT_DIR/server.log 2>&1 &
SERVER_PID=$!

# Start client with nohup
echo "Starting client with nohup in $ROOT_DIR/client..."
nohup bash -c "cd $ROOT_DIR/client && npm run dev" > $ROOT_DIR/client.log 2>&1 &
CLIENT_PID=$!

echo "Server and client started in background. Logs: $ROOT_DIR/server.log, $ROOT_DIR/client.log"
