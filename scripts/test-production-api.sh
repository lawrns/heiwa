#!/bin/bash

# Test Production API Script
# Tests the WordPress surf-camps API endpoint on Netlify production

echo "🧪 Testing Heiwa House Production API on Netlify"
echo "================================================"

API_KEY="heiwa_wp_test_key_2024_secure_deployment"
BASE_URL="https://heiwahouse.netlify.app"

echo ""
echo "1️⃣ Testing Debug Endpoint..."
echo "curl -H \"X-Heiwa-API-Key: $API_KEY\" $BASE_URL/api/debug/surf-camps"
echo ""

DEBUG_RESPONSE=$(curl -s -H "X-Heiwa-API-Key: $API_KEY" "$BASE_URL/api/debug/surf-camps")
echo "$DEBUG_RESPONSE" | jq '.' 2>/dev/null || echo "$DEBUG_RESPONSE"

echo ""
echo "2️⃣ Testing WordPress Surf Camps API..."
echo "curl -H \"X-Heiwa-API-Key: $API_KEY\" $BASE_URL/api/wordpress/surf-camps"
echo ""

API_RESPONSE=$(curl -s -H "X-Heiwa-API-Key: $API_KEY" "$BASE_URL/api/wordpress/surf-camps")
echo "$API_RESPONSE" | jq '.' 2>/dev/null || echo "$API_RESPONSE"

echo ""
echo "3️⃣ Analysis..."

# Check if debug response indicates success
if echo "$DEBUG_RESPONSE" | grep -q '"SUPABASE_SERVICE_ROLE_KEY":true'; then
    echo "✅ SUPABASE_SERVICE_ROLE_KEY is configured"
else
    echo "❌ SUPABASE_SERVICE_ROLE_KEY is missing"
fi

if echo "$DEBUG_RESPONSE" | grep -q '"WORDPRESS_API_KEY":true'; then
    echo "✅ WORDPRESS_API_KEY is configured"
else
    echo "❌ WORDPRESS_API_KEY is missing"
fi

if echo "$DEBUG_RESPONSE" | grep -q '"canCreate":true'; then
    echo "✅ Supabase client can be created"
else
    echo "❌ Supabase client creation failed"
fi

if echo "$API_RESPONSE" | grep -q '"success":true'; then
    echo "✅ WordPress API is working correctly"
    SURF_CAMPS_COUNT=$(echo "$API_RESPONSE" | jq '.data.total_count' 2>/dev/null || echo "unknown")
    echo "📊 Surf camps returned: $SURF_CAMPS_COUNT"
else
    echo "❌ WordPress API is failing"
fi

echo ""
echo "🎯 Next Steps:"
if echo "$DEBUG_RESPONSE" | grep -q '"SUPABASE_SERVICE_ROLE_KEY":false'; then
    echo "1. Add SUPABASE_SERVICE_ROLE_KEY to Netlify environment variables"
fi
if echo "$DEBUG_RESPONSE" | grep -q '"WORDPRESS_API_KEY":false'; then
    echo "2. Add WORDPRESS_API_KEY to Netlify environment variables"
fi
if echo "$API_RESPONSE" | grep -q '"success":false'; then
    echo "3. Redeploy site after adding environment variables"
    echo "4. Run this script again to verify"
fi

echo ""
echo "📖 See NETLIFY_DEPLOYMENT.md for detailed instructions"
