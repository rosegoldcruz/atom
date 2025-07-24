#!/usr/bin/env python3
"""
🧪 ATOM Backend Endpoint Tester
Test all API endpoints to ensure they work correctly
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_endpoint(method, endpoint, data=None, expected_status=200):
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, timeout=10)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, timeout=10)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, timeout=10)
        elif method.upper() == "DELETE":
            response = requests.delete(url, timeout=10)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
        
        if response.status_code == expected_status:
            print(f"✅ {method} {endpoint} - Status: {response.status_code}")
            return True
        else:
            print(f"❌ {method} {endpoint} - Status: {response.status_code} (expected {expected_status})")
            print(f"   Response: {response.text[:200]}...")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ {method} {endpoint} - Error: {e}")
        return False

def main():
    print("🧪 ATOM Backend Endpoint Testing")
    print("=" * 50)
    
    # Check if backend is running
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        print(f"🚀 Backend is running! Status: {response.status_code}")
        print(f"📊 Response: {response.json()}")
        print("=" * 50)
    except:
        print("❌ Backend is not running! Please start it first with: python start.py")
        return
    
    # Test all endpoints
    tests = [
        # Health and System
        ("GET", "/", None, 200),
        ("GET", "/health", None, 200),
        ("GET", "/system/status", None, 200),
        
        # Statistics
        ("GET", "/stats/overview", None, 200),
        ("GET", "/stats/daily", None, 200),
        ("GET", "/stats/daily?days=7", None, 200),
        ("GET", "/stats/tokens", None, 200),
        ("GET", "/stats/networks", None, 200),
        ("GET", "/stats/chart/profit", None, 200),
        ("GET", "/stats/chart/profit?period=24h", None, 200),
        ("GET", "/stats/chart/volume", None, 200),
        ("GET", "/stats/performance", None, 200),
        
        # Agents
        ("GET", "/agents", None, 200),
        ("GET", "/agents/available", None, 200),
        ("POST", "/agents/atom/start", None, 200),
        ("POST", "/agents/atom/stop", None, 200),
        ("GET", "/agents/atom/performance", None, 200),
        ("POST", "/agents/atom/configure", {"risk_level": "medium"}, 200),
        
        # Arbitrage
        ("GET", "/arbitrage/opportunities", None, 200),
        ("GET", "/arbitrage/opportunities?network=ethereum", None, 200),
        ("GET", "/arbitrage/opportunities?min_profit=0.1", None, 200),
        ("POST", "/arbitrage", {"assetPair": "ETH/USDC", "network": "ethereum"}, 200),
        ("GET", "/arbitrage/stats", None, 200),
        
        # Flash Loans
        ("GET", "/flash-loan/providers", None, 200),
        ("POST", "/flash-loan/simulate", {"asset": "ETH", "amount": "1.0", "network": "ethereum"}, 200),
        ("POST", "/flash-loan", {"asset": "ETH", "amount": "1.0", "network": "ethereum"}, 200),
        
        # Trades
        ("GET", "/trades/history", None, 200),
        ("GET", "/trades/history?limit=10", None, 200),
        ("GET", "/trades/history?status=success", None, 200),
        ("GET", "/trades/stats", None, 200),
        ("GET", "/trades/recent", None, 200),
        ("GET", "/trades/pairs/popular", None, 200),
        ("POST", "/trades/simulate", {"pair": "ETH/USDC", "amount": 1.0}, 200),
        
        # Tokens
        ("GET", "/tokens/pairs", None, 200),
        ("GET", "/tokens/supported", None, 200),
        ("GET", "/tokens/prices", None, 200),
        ("GET", "/tokens/search?query=ETH", None, 200),
        ("POST", "/tokens/add-pair", {"tokenA": "ETH", "tokenB": "USDC", "network": "ethereum"}, 200),
        
        # Bot Deployment
        ("POST", "/deploy-bot", {"network": "ethereum"}, 200),
    ]
    
    passed = 0
    failed = 0
    
    for method, endpoint, data, expected_status in tests:
        if test_endpoint(method, endpoint, data, expected_status):
            passed += 1
        else:
            failed += 1
        time.sleep(0.1)  # Small delay between requests
    
    print("=" * 50)
    print(f"🧪 Test Results:")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📊 Success Rate: {(passed / (passed + failed)) * 100:.1f}%")
    
    if failed == 0:
        print("🎉 ALL TESTS PASSED! Backend is working perfectly!")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main()
