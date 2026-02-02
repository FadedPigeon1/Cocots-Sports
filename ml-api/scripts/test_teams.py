from app.services.data_fetcher import get_all_nba_teams
import asyncio

try:
    teams = get_all_nba_teams()
    print(f"Successfully fetched {len(teams)} teams.")
    if len(teams) > 0:
        print("First team sample:", teams[0])
except Exception as e:
    print(f"Error fetching teams: {e}")
