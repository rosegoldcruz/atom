#!/bin/bash

# ATOM Platform Setup Script
# This script sets up the ATOM arbitrage platform for development or production

set -e

echo "🚀 Setting up ATOM Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Create necessary directories
print_status "Creating project directories..."
mkdir -p backend/logs
mkdir -p frontend/public
mkdir -p shared

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating environment file..."
    cp .env.example .env
    print_warning "Please edit .env file with your configuration before starting the platform"
fi

# Install dependencies
print_status "Installing dependencies..."

# Root dependencies
npm install

# Backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install
cd ..

# Frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Build shared types
print_status "Building shared types..."
cd shared
npx tsc event-schema.ts --declaration --outDir ../backend/src/types
cd ..

# Set up Docker services
print_status "Setting up Docker services..."
docker-compose up -d redis postgres

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Initialize database (if using Prisma)
if [ -f "backend/prisma/schema.prisma" ]; then
    print_status "Setting up database..."
    cd backend
    npx prisma generate
    npx prisma db push
    cd ..
fi

# Build the backend
print_status "Building backend..."
cd backend
npm run build
cd ..

# Build the frontend
print_status "Building frontend..."
cd frontend
npm run build
cd ..

# Create startup scripts
print_status "Creating startup scripts..."

cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting ATOM Platform in development mode..."
docker-compose up -d redis postgres
sleep 5
npm run dev
EOF

cat > start-prod.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting ATOM Platform in production mode..."
docker-compose up -d
sleep 10
echo "✅ ATOM Platform is running!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:3001"
EOF

chmod +x start-dev.sh start-prod.sh

# Create a simple health check script
cat > health-check.sh << 'EOF'
#!/bin/bash
echo "🔍 Checking ATOM Platform health..."

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    print_status "Docker services are running"
else
    print_error "Docker services are not running"
fi

# Check if backend is responding
if curl -s http://localhost:3001/health > /dev/null; then
    print_status "Backend is responding"
else
    print_error "Backend is not responding"
fi

# Check if frontend is responding
if curl -s http://localhost:3000 > /dev/null; then
    print_status "Frontend is responding"
else
    print_error "Frontend is not responding"
fi
EOF

chmod +x health-check.sh

# Print final instructions
echo ""
echo "🎉 ATOM Platform setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. For development: ./start-dev.sh"
echo "3. For production: ./start-prod.sh"
echo "4. Check health: ./health-check.sh"
echo ""
echo "🔗 Access points:"
echo "• Frontend: http://localhost:3000"
echo "• Backend API: http://localhost:3001"
echo "• WebSocket: ws://localhost:3001"
echo ""
echo "📚 Documentation:"
echo "• README.md for detailed information"
echo "• API docs: http://localhost:3001/api-docs (when running)"
echo ""
echo "🛠️ Development commands:"
echo "• npm run dev (start both frontend and backend)"
echo "• npm run backend:dev (backend only)"
echo "• npm run frontend:dev (frontend only)"
echo ""
print_status "Setup complete! You can now start the ATOM platform."