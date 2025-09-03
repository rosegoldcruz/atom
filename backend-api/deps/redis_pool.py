import os
import redis.asyncio as redis
from backend_api.app.config import settings

REDIS_URL = os.getenv("REDIS_URL")
if not REDIS_URL or "@" not in REDIS_URL:
    raise RuntimeError("REDIS_URL must include password, e.g. redis://:password@127.0.0.1:6379/0")

redis_client = redis.from_url(REDIS_URL, decode_responses=True)