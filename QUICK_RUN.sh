#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================="
echo "IT Asset Inventory Management System"
echo "Quick Start Script"
echo "==========================================${NC}\n"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"
echo -e "${GREEN}✅ npm $(npm -v)${NC}\n"

# Check .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
fi

echo -e "${BLUE}=========================================="
echo "SETUP INSTRUCTIONS"
echo "==========================================${NC}\n"

echo -e "${YELLOW}🔧 BACKEND (Terminal 1):${NC}"
echo "   cd /home/sadhika/Documents/Assest-Management"
echo "   npm install"
echo "   npm run db:setup"
echo "   npm run dev"
echo ""

echo -e "${YELLOW}🎨 FRONTEND (Terminal 2):${NC}"
echo "   cd /home/sadhika/Documents/Assest-Management/client"
echo "   npm install"
echo "   npm run dev"
echo ""

echo -e "${BLUE}=========================================="
echo "ACCESS THE APP"
echo "==========================================${NC}\n"

echo -e "${GREEN}Frontend:${NC} http://localhost:5173"
echo -e "${GREEN}Backend:${NC}  http://localhost:5000"
echo ""

echo -e "${BLUE}=========================================="
echo "LOGIN CREDENTIALS"
echo "==========================================${NC}\n"

echo "Admin (Full Access):"
echo "  Email: admin@company.com"
echo "  Password: password123"
echo ""
echo "Staff (Limited Access):"
echo "  Email: john.doe@company.com"
echo "  Password: password123"
echo ""
echo "Viewer (Read-Only):"
echo "  Email: viewer@company.com"
echo "  Password: password123"
echo ""

echo -e "${GREEN}👉 Open 2 terminals and follow the setup instructions above${NC}\n"
