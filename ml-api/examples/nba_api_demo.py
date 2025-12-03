"""
Example script showing how to use nba_api integration

This demonstrates fetching real NBA data for your prediction system.
"""

import asyncio
from datetime import datetime
from app.services.data_fetcher import (
    fetch_game_data,
    fetch_player_stats,
    get_all_nba_teams,
    find_player_by_name,
    fetch_team_roster
)


async def main():
    print("=" * 60)
    print("NBA API Integration Examples")
    print("=" * 60)

    # 1. Get all NBA teams
    print("\n1. Fetching all NBA teams...")
    teams = get_all_nba_teams()
    print(f"Found {len(teams)} teams")
    print("First 3 teams:", teams[:3])

    # 2. Find a player by name
    print("\n2. Searching for LeBron James...")
    lebron = find_player_by_name("LeBron James")
    if lebron:
        print(f"Found: {lebron[0]}")

    # 3. Get team game data (Lakers = team_id 1610612747)
    print("\n3. Fetching Lakers recent games...")
    lakers_data = await fetch_game_data(
        team_id=1610612747,
        game_date=datetime.now(),
        games_back=5
    )
    print(f"Lakers averaging {lakers_data['avg_points']:.1f} points")
    print(f"Win percentage: {lakers_data['win_percentage']:.3f}")
    print(f"Last 5 record: {lakers_data['last_5_record']}")

    # 4. Get player stats (LeBron's player_id from search)
    if lebron:
        print(f"\n4. Fetching LeBron's stats...")
        lebron_stats = await fetch_player_stats(
            player_id=lebron[0]['id'],
            game_date=datetime.now(),
            games_back=10
        )
        print(f"PPG: {lebron_stats['avg_points']:.1f}")
        print(f"RPG: {lebron_stats['avg_rebounds']:.1f}")
        print(f"APG: {lebron_stats['avg_assists']:.1f}")
        print(f"Games played: {lebron_stats['games_played']}")

    # 5. Get team roster
    print("\n5. Fetching Lakers roster...")
    roster = await fetch_team_roster(team_id=1610612747)
    if roster:
        print(f"Roster size: {len(roster)} players")
        print(f"First 3 players: {[p['PLAYER'] for p in roster[:3]]}")

    print("\n" + "=" * 60)
    print("All examples completed successfully!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
