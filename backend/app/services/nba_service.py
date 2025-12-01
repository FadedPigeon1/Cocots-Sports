import httpx
from typing import Dict, Any, List
from datetime import datetime, timedelta
from app.core.config import settings
from app.core.cache import cache_service


class NBAService:
    def __init__(self):
        self.base_url = "https://v1.basketball.api-sports.io"
        self.headers = {
            "x-rapidapi-key": settings.NBA_API_KEY,
            "x-rapidapi-host": "v1.basketball.api-sports.io"
        }

    async def get_team_stats(self, team_id: int, season: str) -> Dict[str, Any]:
        """Fetch team statistics from NBA API"""
        cache_key = f"team_stats:{team_id}:{season}"
        cached = await cache_service.get(cache_key)
        if cached:
            return cached

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/statistics",
                params={"team": team_id, "season": season, "league": "12"},
                headers=self.headers
            )
            data = response.json()

            await cache_service.set(cache_key, data, ttl=3600)
            return data

    async def get_player_stats(self, player_id: int, season: str) -> Dict[str, Any]:
        """Fetch player statistics"""
        cache_key = f"player_stats:{player_id}:{season}"
        cached = await cache_service.get(cache_key)
        if cached:
            return cached

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/players/statistics",
                params={"id": player_id, "season": season},
                headers=self.headers
            )
            data = response.json()

            await cache_service.set(cache_key, data, ttl=3600)
            return data

    async def get_upcoming_games(self, date: str = None) -> List[Dict[str, Any]]:
        """Fetch upcoming games"""
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")

        cache_key = f"games:{date}"
        cached = await cache_service.get(cache_key)
        if cached:
            return cached

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/games",
                params={"date": date, "league": "12", "season": "2024-2025"},
                headers=self.headers
            )
            data = response.json()

            await cache_service.set(cache_key, data, ttl=1800)
            return data.get("response", [])

    async def get_h2h_stats(self, team1_id: int, team2_id: int) -> Dict[str, Any]:
        """Fetch head-to-head statistics"""
        cache_key = f"h2h:{team1_id}:{team2_id}"
        cached = await cache_service.get(cache_key)
        if cached:
            return cached

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/games/h2h",
                params={"h2h": f"{team1_id}-{team2_id}"},
                headers=self.headers
            )
            data = response.json()

            await cache_service.set(cache_key, data, ttl=7200)
            return data


nba_service = NBAService()
