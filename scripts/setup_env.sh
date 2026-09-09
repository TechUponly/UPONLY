#!/bin/bash
# Setup script for UPONLY environment

set -e

echo "🚀 Setting up UPONLY Business Automation & AI Agent Platform..."

PROJECT_DIR="/Users/shamrai/Desktop/UPONLY"
cd "$PROJECT_DIR"

if [ ! -d ".venv" ]; then
    echo "📦 Creating Python virtual environment (.venv)..."
    python3 -m venv .venv
fi

echo "⚡ Upgrading pip and installing requirements..."
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env configuration from example..."
    cp config/.env.example .env
fi

echo "✅ Environment setup complete! Activate with: source .venv/bin/activate"
