import asyncio
from app.services.data_fetcher import get_current_standings, get_top_players


async def main():
    print("Testing get_current_standings...")
    try:
        standings = await get_current_standings(season="2025-26")
        print(f"Standings count: {len(standings)}")
        if len(standings) > 0:
            print(f"First team keys: {standings[0].keys()}")
            print(f"First team name: {standings[0].get('TEAM_NAME')}")
        else:
            print("Standings list is empty.")
    except Exception as e:
        print(f"Error calling get_current_standings: {e}")

    print("\nTesting get_top_players...")
    try:
        players = await get_top_players(season="2025-26")
        print(f"Players count: {len(players)}")
    except Exception as e:
        print(f"Error calling get_top_players: {e}")

if __name__ == "__main__":
    asyncio.run(main())
