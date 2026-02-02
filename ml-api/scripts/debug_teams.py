import asyncio
from app.services.data_fetcher import get_current_standings, get_team_details, NBA_TEAM_IDS
from nba_api.stats.static import teams


async def main():
    print(f"Total NBA Team IDs: {len(NBA_TEAM_IDS)}")
    print(f"Sample IDs: {NBA_TEAM_IDS[:5]}")

    print("\n--- STANDINGS PREVIEW ---")
    standings = await get_current_standings()
    print(f"Total entries in standings: {len(standings)}")
    if standings:
        print(f"Keys available: {standings[0].keys()}")
        print("First 3 teams:")
        for team in standings[:3]:
            # Try TEAM_NAME instead of TeamName
            name = team.get('TEAM_NAME') or team.get('TeamName')
            pts = team.get('PTS')
            print(
                f"{name} (ID: {team['TEAM_ID']}) - W: {team['W']} L: {team['L']} - PTS: {pts}")

    print("\n--- TEAM DETAILS (Orlando Magic - 1610612753) ---")
    try:
        details = await get_team_details(1610612753)
        print(f"Keys available: {details.keys()}")
        if 'team' in details:
            t = details['team']
            print(f"Name: {t.get('team_name')}")
            print(f"Record: {t.get('wins')}-{t.get('losses')}")
        else:
            print("No 'team' key found.")
    except Exception as e:
        print(f"Error fetching details: {e}")

if __name__ == "__main__":
    asyncio.run(main())
