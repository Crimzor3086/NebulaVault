#!/bin/bash

echo "🚀 Testing NebulaVault 0G Storage Integration"
echo "=============================================="

# Start the agent in background
echo "📦 Starting Storage Agent..."
cd packages/agent
go run cmd/agent/main.go --config configs/config.yaml &
AGENT_PID=$!

# Wait for agent to start
echo "⏳ Waiting for agent to start..."
sleep 5

# Test agent health
echo "🔍 Testing agent health..."
curl -s http://localhost:8080/health | jq .

# Create a test file
echo "📄 Creating test file..."
echo "Hello from NebulaVault! This is a test file for 0G Storage integration." > /tmp/test_file.txt

# Upload file to 0G Storage
echo "⬆️  Uploading file to 0G Storage..."
UPLOAD_RESPONSE=$(curl -s -X POST \
  -F "file=@/tmp/test_file.txt" \
  -F "metadata={\"name\":\"test_file.txt\",\"description\":\"Test file for 0G Storage\"}" \
  http://localhost:8080/api/v1/files/upload)

echo "📤 Upload Response:"
echo $UPLOAD_RESPONSE | jq .

# Extract hash from response
HASH=$(echo $UPLOAD_RESPONSE | jq -r '.data.merkle_root')
echo "🔑 File Hash: $HASH"

if [ "$HASH" != "null" ] && [ "$HASH" != "" ]; then
    # Download file from 0G Storage
    echo "⬇️  Downloading file from 0G Storage..."
    DOWNLOAD_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/v1/files/download/$HASH")
    
    echo "📥 Download Response:"
    echo $DOWNLOAD_RESPONSE | jq .
    
    # Get proof from 0G Storage
    echo "🔐 Getting proof from 0G Storage..."
    PROOF_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/v1/files/proof/$HASH")
    
    echo "🛡️  Proof Response:"
    echo $PROOF_RESPONSE | jq .
    
    echo "✅ 0G Storage integration test completed successfully!"
else
    echo "❌ Upload failed - no hash returned"
fi

# Cleanup
echo "🧹 Cleaning up..."
rm -f /tmp/test_file.txt
kill $AGENT_PID 2>/dev/null

echo "🎉 Test completed!"
