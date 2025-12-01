import redis.asyncio as redis
from typing import Optional
import json
from app.core.config import settings


class CacheService:
    def __init__(self):
        self.redis: Optional[redis.Redis] = None

    async def connect(self):
        self.redis = await redis.from_url(settings.REDIS_URL, decode_responses=True)

    async def disconnect(self):
        if self.redis:
            await self.redis.close()

    async def get(self, key: str) -> Optional[dict]:
        if not self.redis:
            return None
        data = await self.redis.get(key)
        return json.loads(data) if data else None

    async def set(self, key: str, value: dict, ttl: int = 3600):
        if not self.redis:
            return
        await self.redis.setex(key, ttl, json.dumps(value))

    async def delete(self, key: str):
        if not self.redis:
            return
        await self.redis.delete(key)


cache_service = CacheService()
