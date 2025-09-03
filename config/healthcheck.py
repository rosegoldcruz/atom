#!/usr/bin/env python3
"""
Health check script for Docker containers
"""

import os
import sys
import asyncio
import redis
import httpx
from web3 import Web3

def check_redis():
    """Check Redis connection"""
    try:
        redis_url = os.getenv('REDIS_URL', 'redis://redis:6379/0')
        r = redis.from_url(redis_url)
        r.ping()
        return True
    except:
        return False

def check_web3():
    """Check Web3 RPC connection"""
    try:
        rpc_url = os.getenv('POLYGON_RPC_URL', 'https://polygon-rpc.com')
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        w3.eth.block_number
        return True
    except:
        return False

async def check_http_endpoint():
    """Check HTTP endpoint for monitoring service"""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get('http://localhost:8080/health')
        return response.status_code == 200
    except Exception:
        return False

def main():
    bot_type = os.getenv('BOT_TYPE', 'unknown')

    async def _run():
        # Basic checks for all bots
        if not check_redis():
            print("Redis health check failed")
            sys.exit(1)

        if not check_web3():
            print("Web3 RPC health check failed")
            sys.exit(1)

        # Specific checks based on bot type
        if bot_type == 'monitoring':
            if not await check_http_endpoint():
                print("HTTP endpoint health check failed")
                sys.exit(1)

        print(f"Health check passed for {bot_type}")
        sys.exit(0)

    asyncio.run(_run())

if __name__ == "__main__":
    main()
