#!/bin/bash

# ATOM Placeholder Validation Script
# Ensures no hardcoded placeholders remain in the system

set -euo pipefail

echo "🔍 ATOM Placeholder Security Validation"
echo "======================================"

errors=0
warnings=0

# Function to check for patterns
check_pattern() {
    local pattern="$1"
    local description="$2"
    local files="$3"
    
    echo ""
    echo "🔎 Checking for: $description"
    
    if grep -r "$pattern" $files 2>/dev/null; then
        echo "❌ Found placeholder pattern: $pattern"
        ((errors++))
    else
        echo "✅ No $description found"
    fi
}

# Check for common placeholder patterns
check_pattern "your_.*_here" "generic placeholders" "bootstrap_ubuntu_22.04.sh deployment_guide.md"
check_pattern "REPLACE_WITH_YOUR" "replacement placeholders" "bootstrap_ubuntu_22.04.sh"
check_pattern "your_bot_token_here" "bot token placeholders" "."
check_pattern "your_redis_password_here" "Redis password placeholders" "bootstrap_ubuntu_22.04.sh"
check_pattern "your_clerk_secret_key_here" "Clerk secret placeholders" "bootstrap_ubuntu_22.04.sh"
check_pattern "your_contract_address_here" "contract address placeholders" "bootstrap_ubuntu_22.04.sh"

# Check for .env.production file
echo ""
echo "🔎 Checking for production secrets file"
if [ -f ".env.production" ]; then
    echo "❌ .env.production file still exists in project!"
    echo "   This file should be moved outside version control"
    ((errors++))
else
    echo "✅ No .env.production file found in project"
fi

# Check bootstrap script for interactive configuration
echo ""
echo "🔎 Checking bootstrap script security features"
if grep -q "read_secret" bootstrap_ubuntu_22.04.sh; then
    echo "✅ Interactive secure input functions found"
else
    echo "❌ Interactive input functions missing"
    ((errors++))
fi

if grep -q "openssl rand -base64" bootstrap_ubuntu_22.04.sh; then
    echo "✅ Secure random generation found"
else
    echo "❌ Secure random generation missing"
    ((errors++))
fi

# Summary
echo ""
echo "📊 Validation Summary:"
echo "====================="
echo "Errors: $errors"
echo "Warnings: $warnings"

if [ $errors -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS: No hardcoded placeholders found!"
    echo "✅ System is secure and ready for production deployment"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Run: ./bootstrap_ubuntu_22.04.sh"
    echo "2. Follow interactive prompts for secure configuration"
    echo "3. Deploy ATOM application code"
    echo "4. Start services and monitor"
    exit 0
else
    echo ""
    echo "❌ FAILED: Found $errors security issues"
    echo "🚨 Fix all placeholder issues before deployment"
    exit 1
fi