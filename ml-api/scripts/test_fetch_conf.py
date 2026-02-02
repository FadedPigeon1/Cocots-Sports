from app.services.data_fetcher import get_current_standings
import asyncio
import sys
import os

# Add the current directory to sys.path to ensure 'app' can be imported
sys.path.append(os.getcwd())


async def main():
    print("Testing get_current_standings...")
    try:
        standings = await get_current_standings(season="2025-26")
        print(f"Standings count: {len(standings)}")
        if len(standings) > 0:
            first_team = standings[0]
            print(f"First team keys: {list(first_team.keys())}")
            print(f"First team CONFERENCE: {first_team.get('CONFERENCE')}")
            print(f"First team CONF_RANK: {first_team.get('CONF_RANK')}")
            print(f"First team W_PCT: {first_team.get('W_PCT')}")
        else:
            print("Standings list is empty.")
    except Exception as e:
        print(f"Error calling get_current_standings: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
