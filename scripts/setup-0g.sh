#!/bin/bash

# NebularVault 0G Storage Setup Script
# This script helps you set up NebularVault with the real 0G Storage network

set -e

echo "🚀 NebularVault 0G Storage Setup"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Go is installed
check_go() {
    if ! command -v go &> /dev/null; then
        print_error "Go is not installed. Please install Go 1.22 or later."
        echo "Visit: https://golang.org/doc/install"
        exit 1
    fi
    
    GO_VERSION=$(go version | awk '{print $3}' | sed 's/go//')
    print_status "Go $GO_VERSION is installed"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or later."
        echo "Visit: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_status "Node.js $NODE_VERSION is installed"
}

# Install 0G Storage client
install_0g_client() {
    print_info "Installing 0G Storage client..."
    
    cd packages/agent
    go mod tidy
    go get github.com/0glabs/0g-storage-client@latest
    
    print_status "0G Storage client installed successfully"
    cd ../..
}

# Setup environment variables
setup_environment() {
    print_info "Setting up environment variables..."
    
    if [ ! -f "infra/docker/.env" ]; then
        cp infra/docker/env.example infra/docker/.env
        print_status "Created .env file from template"
    else
        print_warning ".env file already exists"
    fi
    
    echo ""
    print_warning "IMPORTANT: You need to configure the following in infra/docker/.env:"
    echo "  - PRIVATE_KEY: Your 0G Storage private key"
    echo "  - INDEXER_ENDPOINT: 0G Storage indexer endpoint"
    echo "  - TRANSFER_ENDPOINT: 0G Storage transfer endpoint"
    echo "  - CORE_ENDPOINT: 0G Storage core endpoint"
    echo ""
    print_info "Visit https://0g.ai/ to get your credentials"
}

# Build Docker images
build_docker() {
    print_info "Building Docker images..."
    
    cd infra/docker
    docker-compose build
    
    print_status "Docker images built successfully"
    cd ../..
}

# Run tests
run_tests() {
    print_info "Running tests..."
    
    # Backend tests
    cd packages/backend
    npm test -- --passWithNoTests
    print_status "Backend tests passed"
    cd ../..
    
    # Agent tests
    cd packages/agent
    go test ./... -v
    print_status "Agent tests passed"
    cd ../..
}

# Main setup function
main() {
    echo "Checking prerequisites..."
    check_go
    check_node
    echo ""
    
    echo "Installing dependencies..."
    install_0g_client
    echo ""
    
    echo "Setting up environment..."
    setup_environment
    echo ""
    
    echo "Building Docker images..."
    build_docker
    echo ""
    
    echo "Running tests..."
    run_tests
    echo ""
    
    print_status "Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Configure your 0G Storage credentials in infra/docker/.env"
    echo "2. Start the services: cd infra/docker && docker-compose up -d"
    echo "3. Access the web UI at: http://localhost:3000"
    echo "4. Access the backend API at: http://localhost:4000"
    echo "5. Access the storage agent at: http://localhost:8080"
    echo ""
    print_info "For more information, see the README.md file"
}

# Run main function
main "$@"
