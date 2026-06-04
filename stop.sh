#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# IT Asset Inventory Management System - Stop Script
# Stops all running servers (Backend, Frontend, and PostgreSQL)
# ═══════════════════════════════════════════════════════════════════════════

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Stopping All Servers${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""

# Kill processes on port 5000 (Backend)
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}Stopping Backend Server (port 5000)...${NC}"
    kill $(lsof -t -i:5000) 2>/dev/null || true
    echo -e "${GREEN}✅ Backend server stopped${NC}"
else
    echo -e "${YELLOW}⚠️  No process running on port 5000${NC}"
fi

echo ""

# Kill processes on port 5173 (Frontend)
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}Stopping Frontend Server (port 5173)...${NC}"
    kill $(lsof -t -i:5173) 2>/dev/null || true
    echo -e "${GREEN}✅ Frontend server stopped${NC}"
else
    echo -e "${YELLOW}⚠️  No process running on port 5173${NC}"
fi

echo ""

# Stop PostgreSQL (optional)
if pgrep -x "postgres" > /dev/null; then
    echo -e "${YELLOW}PostgreSQL is running${NC}"
    echo -e "${YELLOW}To stop PostgreSQL, run: ${BLUE}sudo service postgresql stop${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL is not running${NC}"
fi

echo ""
echo -e "${GREEN}✅ All servers have been stopped${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
