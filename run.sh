#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# IT Asset Inventory Management System - Auto Run Script
# Starts Backend Stub (port 5000) and Frontend (port 5173) with Mock API
# ═══════════════════════════════════════════════════════════════════════════

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   IT Asset Inventory Management System - Auto Run${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${YELLOW}📁 Working Directory:${NC} $SCRIPT_DIR"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 1: Install Dependencies
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}[1/3] Installing Backend Dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm install --legacy-peer-deps
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Backend dependencies already installed${NC}"
fi
echo ""

echo -e "${BLUE}[2/3] Installing Frontend Dependencies...${NC}"
if [ ! -d "client/node_modules" ]; then
    cd client
    npm install --legacy-peer-deps
    cd ..
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 2: Create logs directory
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}[3/3] Creating logs directory...${NC}"
mkdir -p ./logs
echo -e "${GREEN}✅ Logs directory ready${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 3: Kill existing processes
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Starting Servers...${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Checking for existing processes...${NC}"
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Found process on port 5000, stopping it...${NC}"
    kill $(lsof -t -i:5000) 2>/dev/null || true
    sleep 1
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Found process on port 5173, stopping it...${NC}"
    kill $(lsof -t -i:5173) 2>/dev/null || true
    sleep 1
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 4: Start Backend
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${GREEN}🚀 Starting Backend Server on http://localhost:5000${NC}"
npm start > ./logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}   PID: $BACKEND_PID${NC}"
sleep 2

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Backend failed to start. Check logs/backend.log${NC}"
    tail -20 ./logs/backend.log
    exit 1
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 5: Start Frontend
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${GREEN}🚀 Starting Frontend Server on http://localhost:5173${NC}"
cd client
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}   PID: $FRONTEND_PID${NC}"
cd ..
sleep 3

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Frontend failed to start. Check logs/frontend.log${NC}"
    tail -20 ./logs/frontend.log
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 6: Display Status
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ All Servers Started Successfully!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}📱 Frontend:${NC}"
echo -e "   🌐 URL: ${BLUE}http://localhost:5173${NC}"
echo -e "   PID: $FRONTEND_PID"
echo ""

echo -e "${YELLOW}🔧 Backend (Stub):${NC}"
echo -e "   🌐 URL: ${BLUE}http://localhost:5000/api/health${NC}"
echo -e "   PID: $BACKEND_PID"
echo ""

echo -e "${YELLOW}📊 Mock API:${NC}"
echo -e "   ✅ Enabled (Frontend Only - No Database)"
echo ""

echo -e "${YELLOW}📝 Logs:${NC}"
echo -e "   Backend:  ./logs/backend.log"
echo -e "   Frontend: ./logs/frontend.log"
echo ""

echo -e "${YELLOW}⚙️  To Stop:${NC}"
echo -e "   Press ${BLUE}Ctrl+C${NC} in this terminal"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"

# Keep the script running
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo -e "\n${YELLOW}Shutting down servers...${NC}"; exit 0' SIGINT

echo ""
echo -e "${GREEN}✨ Application is ready! Open http://localhost:5173 in your browser.${NC}"
echo ""

# Wait for both processes
wait
