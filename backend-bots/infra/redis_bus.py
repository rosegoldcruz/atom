#!/usr/bin/env python3
"""
Redis Pub/Sub Bus for ATOM backend.
"""

import os
import json
import logging
import redis
from config.secure_config import SecureConfig
from backend_bots.atom_core.redis_pool import get_redis as _pooled_redis

logger = logging.getLogger("infra.redis_bus")
logging.basicConfig(level=logging.INFO)

_cfg = SecureConfig()
REDIS_URL = _cfg.require("REDIS_URL")

def _redis():
    # Use pooled Redis connection
    return _pooled_redis()

class Bus:
    def __init__(self):
        self.r = _redis()

    def publish(self, channel: str, msg: dict):
        try:
            self.r.publish(channel, json.dumps(msg))
            logger.debug(f"[bus] published on {channel}: {msg}")
        except Exception as e:
            logger.error(f"Redis publish error on {channel}: {e}")

    def subscribe(self, channel: str, handler):
        try:
            ps = self.r.pubsub(ignore_subscribe_messages=True)
            ps.subscribe(channel)
            logger.info(f"[bus] Subscribed to {channel}")
            for m in ps.listen():
                if m and m.get("type") == "message":
                    try:
                        data = json.loads(m["data"])
                        handler(data)
                    except Exception as e:
                        logger.error(f"[bus:{channel}] handler error: {e}")
        except Exception as e:
            logger.error(f"Redis subscribe error on {channel}: {e}")
