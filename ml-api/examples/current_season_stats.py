from nba_api.stats.endpoints import leaguedashteamstats, leaguedashplayerstats


def get_current_season_stats():
    print("Fetching current season stats (2025-26)...")

    # 1. Team Stats
    print("\n--- Top 10 Teams by Win % ---")
    try:
        # Fetch team stats for the 2025-26 season
        team_stats = leaguedashteamstats.LeagueDashTeamStats(season='2025-26')
        df_teams = team_stats.get_data_frames()[0]

        # Sort by Win Percentage (W_PCT) descending
        top_teams = df_teams.sort_values(by='W_PCT', ascending=False)

        # Display relevant columns
        print(top_teams[['TEAM_NAME', 'W', 'L', 'W_PCT',
              'PTS', 'PLUS_MINUS']].to_string(index=False))
    except Exception as e:
        print(f"Error fetching team stats: {e}")

    # 2. Player Stats
    print("\n--- Top 5 Players by PPG ---")
    try:
        # Fetch player stats for the 2025-26 season (PerGame mode)
        player_stats_per_game = leaguedashplayerstats.LeagueDashPlayerStats(
            season='2025-26', per_mode_detailed='PerGame')
        df_players_per_game = player_stats_per_game.get_data_frames()[0]

        top_scorers = df_players_per_game.sort_values(
            by='PTS', ascending=False).head(5)

        print(top_scorers[['PLAYER_NAME', 'TEAM_ABBREVIATION',
              'PTS', 'AST', 'REB']].to_string(index=False))

    except Exception as e:
        print(f"Error fetching player stats: {e}")


if __name__ == "__main__":
    get_current_season_stats()
