#!/bin/bash

# SQUIDL Aptos Deployment Script
# This script deploys the stealth payment contracts to Aptos

set -e

echo "🦑 SQUIDL Aptos - Deployment Script"
echo "===================================="

# Check if Aptos CLI is installed
if ! command -v aptos &> /dev/null; then
    echo "❌ Aptos CLI is not installed"
    echo "Install it from: https://aptos.dev/tools/aptos-cli/"
    exit 1
fi

# Set your module address (replace with your address)
MODULE_ADDRESS=${MODULE_ADDRESS:-"0xYOUR_ADDRESS"}

echo "📦 Building Move modules..."
aptos move compile --named-addresses squidl_aptos=$MODULE_ADDRESS

echo "🧪 Running tests..."
aptos move test --named-addresses squidl_aptos=$MODULE_ADDRESS

echo "🚀 Publishing to testnet..."
aptos move publish \
    --named-addresses squidl_aptos=$MODULE_ADDRESS \
    --profile testnet \
    --assume-yes

echo "✅ Deployment complete!"
echo "Module address: $MODULE_ADDRESS"




