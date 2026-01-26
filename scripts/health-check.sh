#!/bin/bash

# Production Health Check Script
# Monitors critical endpoints and reports status

BASE_URL="${1:-https://heiwahauz.netlify.app}"
ADMIN_COOKIE="admin_auth=heiwa_admin_2024"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🏥 Health Check for $BASE_URL"
echo "================================"
echo ""

HEALTHY=true

check_endpoint() {
    local name=$1
    local url=$2
    local headers=$3
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 $headers "$url" 2>/dev/null)
    
    if [ "$response" == "200" ] || [ "$response" == "307" ]; then
        echo -e "${GREEN}✅${NC} $name"
        return 0
    else
        echo -e "${RED}❌${NC} $name (HTTP $response)"
        HEALTHY=false
        return 1
    fi
}

check_performance() {
    local name=$1
    local url=$2
    local max_time=${3:-2.0}
    
    time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "$url" 2>/dev/null)
    
    if [ -z "$time" ]; then
        echo -e "${RED}❌${NC} $name (timeout)"
        HEALTHY=false
        return 1
    fi
    
    if (( $(echo "$time < $max_time" | bc -l 2>/dev/null || echo "0") )); then
        echo -e "${GREEN}✅${NC} $name (${time}s)"
        return 0
    else
        echo -e "${YELLOW}⚠️${NC} $name (${time}s - slow)"
        return 1
    fi
}

echo "📊 Critical Endpoints:"
check_endpoint "Homepage" "$BASE_URL/"
check_endpoint "Rooms API" "$BASE_URL/api/rooms"
check_endpoint "Surf Camps API" "$BASE_URL/api/surf-camps"
check_endpoint "Add-ons API" "$BASE_URL/api/add-ons"
check_endpoint "Availability API" "$BASE_URL/api/availability"
echo ""

echo "🔒 Admin Endpoints:"
check_endpoint "Admin Dashboard" "$BASE_URL/admin" "-H 'Cookie: $ADMIN_COOKIE'"
check_endpoint "Admin Homepage CMS" "$BASE_URL/api/admin/homepage" "-H 'Cookie: $ADMIN_COOKIE'"
echo ""

echo "⚡ Performance:"
check_performance "Homepage Load" "$BASE_URL/" 1.0
check_performance "Rooms API" "$BASE_URL/api/rooms" 1.5
check_performance "Surf Camps API" "$BASE_URL/api/surf-camps" 1.5
echo ""

if [ "$HEALTHY" = true ]; then
    echo -e "${GREEN}✅ All systems operational${NC}"
    exit 0
else
    echo -e "${RED}❌ Some issues detected${NC}"
    exit 1
fi


