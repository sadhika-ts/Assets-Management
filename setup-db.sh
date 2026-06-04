#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# PostgreSQL Setup Script
# Creates database and sets up user credentials
# ═══════════════════════════════════════════════════════════════════════════

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   PostgreSQL Database Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    echo -e "${YELLOW}To install on Ubuntu:${NC}"
    echo -e "${BLUE}sudo apt-get update && sudo apt-get install -y postgresql postgresql-contrib${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL found${NC}"
echo ""

# Check if service is running
if ! pgrep -x "postgres" > /dev/null 2>&1; then
    echo -e "${YELLOW}Starting PostgreSQL service...${NC}"
    sudo service postgresql start || sudo systemctl start postgresql
    sleep 2
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"
echo ""

# Create database and user
echo -e "${YELLOW}Setting up database and user...${NC}"

sudo -u postgres psql << EOF
-- Create user if not exists
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'postgres') THEN
    CREATE USER postgres WITH PASSWORD 'postgres';
  END IF;
END \$\$;

-- Alter user to be a superuser
ALTER USER postgres WITH SUPERUSER CREATEDB CREATEROLE;

-- Create database if not exists
SELECT 'CREATE DATABASE asset_inventory_db' WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'asset_inventory_db'
) \G

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE asset_inventory_db TO postgres;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database setup complete${NC}"
else
    echo -e "${RED}❌ Database setup failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ PostgreSQL is ready!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Database Details:${NC}"
echo -e "  Database: ${BLUE}asset_inventory_db${NC}"
echo -e "  User: ${BLUE}postgres${NC}"
echo -e "  Password: ${BLUE}postgres${NC}"
echo -e "  Host: ${BLUE}localhost${NC}"
echo -e "  Port: ${BLUE}5432${NC}"
echo ""
echo -e "${YELLOW}Now run:${NC}"
echo -e "  ${BLUE}./run.sh${NC}"
echo ""
