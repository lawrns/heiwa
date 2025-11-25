#!/bin/bash

# Netlify Post-Deploy Hook
# Automatically runs production verification tests after successful deployment
# This script is called by Netlify after a successful build and deploy

set -euo pipefail

echo "=========================================="
echo "Netlify Post-Deploy Verification"
echo "=========================================="
echo "Deployment URL: ${DEPLOY_PRIME_URL:-$URL}"
echo "Timestamp: $(date)"
echo "=========================================="
echo ""

# Determine production URL
PRODUCTION_URL="${DEPLOY_PRIME_URL:-${URL:-https://heiwahauz.netlify.app}}"

# Run production verification tests
if [ -f "scripts/production-verification-test.js" ]; then
    echo "Running production verification tests..."
    node scripts/production-verification-test.js "${PRODUCTION_URL}" || {
        echo ""
        echo "⚠️  WARNING: Some verification tests failed."
        echo "Please review the diagnostic report in test-results-production/"
        echo ""
        # Don't fail the deployment, just warn
        exit 0
    }
else
    echo "⚠️  Production verification test script not found."
    echo "Skipping automated verification."
fi

echo ""
echo "✅ Post-deploy verification complete!"
echo ""

