#!/usr/bin/env bash

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_usage() {
  echo -e "${BLUE}Fayeed Auto Care - One Click Deploy${NC}"
  echo ""
  echo "Usage:"
  echo "  bash scripts/one-click-deploy.sh netlify"
  echo "  bash scripts/one-click-deploy.sh vps"
  echo ""
  echo "Modes:"
  echo "  netlify   Builds and deploys using Netlify CLI (interactive login/link)."
  echo "  vps       Deploys via Docker Compose on a server (runs ./deploy.sh deploy)."
  echo ""
  echo "Notes:"
  echo "  - Create a .env file first (copy .env.example -> .env)."
  echo "  - For Netlify, you can also deploy by just connecting your Git repo in Netlify (netlify.toml is already configured)."
}

MODE=${1:-}

if [ -z "$MODE" ]; then
  print_usage
  exit 1
fi

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    echo -e "${YELLOW}⚠️  .env not found. Creating one from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please open .env and fill in your real values, then re-run this command.${NC}"
    exit 1
  fi

  echo -e "${RED}❌ .env file not found and .env.example is missing.${NC}"
  echo -e "${RED}   Create a .env file with your environment variables and try again.${NC}"
  exit 1
fi

case "$MODE" in
  netlify)
    echo -e "${GREEN}✅ Starting Netlify deployment...${NC}"
    bash ./deploy-to-netlify.sh
    ;;

  vps|docker)
    echo -e "${GREEN}✅ Starting VPS/Docker deployment...${NC}"
    bash ./deploy.sh deploy
    ;;

  *)
    echo -e "${RED}❌ Unknown mode: $MODE${NC}"
    echo ""
    print_usage
    exit 1
    ;;
esac
