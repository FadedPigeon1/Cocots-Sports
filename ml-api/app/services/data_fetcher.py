from typing import Dict, Any, List
from datetime import datetime, timedelta
from nba_api.stats.endpoints import TeamGameLog, PlayerGameLog, CommonTeamRoster, leaguedashteamstats, leaguedashplayerstats, scoreboardv2
from nba_api.stats.static import teams, players
import pandas as pd


async def get_recent_games(days_back: int = 3) -> List[Dict[str, Any]]:
    """
    Fetch recent NBA games from the last N days

    Args:
        days_back: Number of days to look back for games

    Returns:
        List of game results with scores and team information
    """
    games_list = []

    try:
        # Get games from the last few days
        for i in range(days_back):
            game_date = datetime.now() - timedelta(days=i)
            date_str = game_date.strftime('%m/%d/%Y')

            try:
                scoreboard = scoreboardv2.ScoreboardV2(game_date=date_str)
                games_df = scoreboard.get_data_frames()[0]
                line_score_df = scoreboard.get_data_frames()[1]

                if not games_df.empty:
                    # Process each game
                    for _, game in games_df.iterrows():
                        game_id = game['GAME_ID']

                        # Get team scores from line_score
                        game_scores = line_score_df[line_score_df['GAME_ID'] == game_id]

                        if len(game_scores) == 2:
                            home_team = game_scores.iloc[1]
                            away_team = game_scores.iloc[0]

                            games_list.append({
                                'date': game_date.strftime('%b %d, %Y'),
                                'home_team': {
                                    'name': home_team['TEAM_NAME'],
                                    'id': str(home_team['TEAM_ID']),
                                    'score': int(home_team['PTS'])
                                },
                                'away_team': {
                                    'name': away_team['TEAM_NAME'],
                                    'id': str(away_team['TEAM_ID']),
                                    'score': int(away_team['PTS'])
                                },
                                'status': 'Final'
                            })
            except Exception as e:
                print(f"Error fetching games for {date_str}: {e}")
                continue

        return games_list
    except Exception as e:
        print(f"Error in get_recent_games: {e}")
        return []


async def get_current_standings(season: str = "2025-26") -> List[Dict[str, Any]]:
    """
    Fetch current season standings
    """
    try:
        team_stats = leaguedashteamstats.LeagueDashTeamStats(season=season)
        df_teams = team_stats.get_data_frames()[0]
        top_teams = df_teams.sort_values(by='W_PCT', ascending=False)
        return top_teams.to_dict('records')
    except Exception as e:
        print(f"Error fetching standings: {e}")
        return []


async def get_top_players(season: str = "2025-26") -> List[Dict[str, Any]]:
    """
    Fetch top players for the current season
    """
    try:
        player_stats = leaguedashplayerstats.LeagueDashPlayerStats(
            season=season, per_mode_detailed='PerGame')
        df_players = player_stats.get_data_frames()[0]
        top_players = df_players.sort_values(
            by='PTS', ascending=False).head(50)
        return top_players.to_dict('records')
    except Exception as e:
        print(f"Error fetching top players: {e}")
        return []


async def fetch_game_data(team_id: int, game_date: datetime, games_back: int = 10) -> Dict[str, Any]:
    """
    Fetch historical game data for a team using nba_api

    Args:
        team_id: NBA team ID
        game_date: Date of the upcoming game
        games_back: Number of previous games to fetch

    Returns:
        Dictionary containing team statistics and recent performance
    """
    try:
        # Get current season
        current_year = game_date.year
        season = f"{current_year}-{str(current_year + 1)[-2:]}" if game_date.month >= 10 else f"{current_year - 1}-{str(current_year)[-2:]}"

        # Fetch team game log
        gamelog = TeamGameLog(
            team_id=team_id,
            season=season,
            season_type_all_star="Regular Season"
        )

        df = gamelog.get_data_frames()[0]

        if df.empty:
            # Return default values if no data
            return {
                "team_id": team_id,
                "games": [],
                "avg_points": 0,
                "avg_points_allowed": 0,
                "win_percentage": 0,
                "home_win_percentage": 0,
                "away_win_percentage": 0,
                "last_5_record": "0-0",
                "rest_days": 0
            }

        # Get recent games (last N games)
        recent_games = df.head(games_back)

        # Calculate statistics
        avg_points = recent_games['PTS'].mean()
        avg_points_allowed = recent_games['OPP_PTS'].mean(
        ) if 'OPP_PTS' in recent_games.columns else 0

        # Calculate win percentage
        wins = (recent_games['WL'] == 'W').sum()
        win_percentage = wins / \
            len(recent_games) if len(recent_games) > 0 else 0

        # Home/Away splits
        home_games = recent_games[recent_games['MATCHUP'].str.contains('vs.')]
        away_games = recent_games[recent_games['MATCHUP'].str.contains('@')]

        home_wins = (home_games['WL'] == 'W').sum() if len(
            home_games) > 0 else 0
        away_wins = (away_games['WL'] == 'W').sum() if len(
            away_games) > 0 else 0

        home_win_pct = home_wins / \
            len(home_games) if len(home_games) > 0 else 0
        away_win_pct = away_wins / \
            len(away_games) if len(away_games) > 0 else 0

        # Last 5 games record
        last_5 = recent_games.head(5)
        last_5_wins = (last_5['WL'] == 'W').sum()
        last_5_record = f"{last_5_wins}-{len(last_5) - last_5_wins}"

        # Calculate rest days (days since last game)
        if len(recent_games) > 0:
            last_game_date = pd.to_datetime(recent_games.iloc[0]['GAME_DATE'])
            rest_days = (game_date - last_game_date).days
        else:
            rest_days = 0

        return {
            "team_id": team_id,
            "games": recent_games.to_dict('records'),
            "avg_points": float(avg_points),
            "avg_points_allowed": float(avg_points_allowed),
            "win_percentage": float(win_percentage),
            "home_win_percentage": float(home_win_pct),
            "away_win_percentage": float(away_win_pct),
            "last_5_record": last_5_record,
            "rest_days": int(rest_days)
        }

    except Exception as e:
        print(f"Error fetching game data: {e}")
        # Return default values on error
        return {
            "team_id": team_id,
            "games": [],
            "avg_points": 110.0,
            "avg_points_allowed": 108.0,
            "win_percentage": 0.500,
            "home_win_percentage": 0.550,
            "away_win_percentage": 0.450,
            "last_5_record": "3-2",
            "rest_days": 2
        }


async def fetch_player_stats(player_id: int, game_date: datetime, games_back: int = 10) -> Dict[str, Any]:
    """
    Fetch historical player statistics using nba_api

    Args:
        player_id: NBA player ID
        game_date: Date of the upcoming game
        games_back: Number of previous games to fetch

    Returns:
        Dictionary containing player statistics and trends
    """
    try:
        # Get current season
        current_year = game_date.year
        season = f"{current_year}-{str(current_year + 1)[-2:]}" if game_date.month >= 10 else f"{current_year - 1}-{str(current_year)[-2:]}"

        # Fetch player game log
        gamelog = PlayerGameLog(
            player_id=player_id,
            season=season,
            season_type_all_star="Regular Season"
        )

        df = gamelog.get_data_frames()[0]

        if df.empty:
            return {
                "player_id": player_id,
                "games": [],
                "avg_points": 0,
                "avg_rebounds": 0,
                "avg_assists": 0,
                "avg_steals": 0,
                "avg_blocks": 0,
                "fg_percentage": 0,
                "three_pt_percentage": 0,
                "ft_percentage": 0,
                "minutes_per_game": 0,
                "games_played": 0,
                "avg_fga": 0,
                "avg_fta": 0,
                "avg_turnovers": 0
            }

        # Get recent games
        recent_games = df.head(games_back)

        # Calculate averages
        avg_points = recent_games['PTS'].mean()
        avg_rebounds = recent_games['REB'].mean()
        avg_assists = recent_games['AST'].mean()
        avg_steals = recent_games['STL'].mean()
        avg_blocks = recent_games['BLK'].mean()
        avg_minutes = recent_games['MIN'].mean()

        # Calculate shooting percentages
        fg_pct = recent_games['FG_PCT'].mean()
        fg3_pct = recent_games['FG3_PCT'].mean()
        ft_pct = recent_games['FT_PCT'].mean()

        # Additional stats for calculations
        avg_fga = recent_games['FGA'].mean()
        avg_fta = recent_games['FTA'].mean()
        avg_tov = recent_games['TOV'].mean()

        return {
            "player_id": player_id,
            "games": recent_games.to_dict('records'),
            "avg_points": float(avg_points),
            "avg_rebounds": float(avg_rebounds),
            "avg_assists": float(avg_assists),
            "avg_steals": float(avg_steals),
            "avg_blocks": float(avg_blocks),
            "fg_percentage": float(fg_pct),
            "three_pt_percentage": float(fg3_pct),
            "ft_percentage": float(ft_pct),
            "minutes_per_game": float(avg_minutes),
            "games_played": len(df),
            "avg_fga": float(avg_fga),
            "avg_fta": float(avg_fta),
            "avg_turnovers": float(avg_tov)
        }

    except Exception as e:
        print(f"Error fetching player stats: {e}")
        # Return default values
        return {
            "player_id": player_id,
            "games": [],
            "avg_points": 20.0,
            "avg_rebounds": 5.0,
            "avg_assists": 4.0,
            "avg_steals": 1.0,
            "avg_blocks": 0.5,
            "fg_percentage": 0.450,
            "three_pt_percentage": 0.350,
            "ft_percentage": 0.800,
            "minutes_per_game": 30.0,
            "games_played": 0,
            "avg_fga": 15.0,
            "avg_fta": 4.0,
            "avg_turnovers": 2.0
        }


async def fetch_team_roster(team_id: int) -> List[Dict[str, Any]]:
    """
    Fetch current roster for a team using nba_api

    Args:
        team_id: NBA team ID

    Returns:
        List of players on the team
    """
    try:
        roster = CommonTeamRoster(team_id=team_id, season="2025-26")
        df = roster.get_data_frames()[0]

        if df.empty:
            return []

        return df.to_dict('records')
    except Exception as e:
        print(f"Error fetching team roster: {e}")
        return []


async def fetch_live_game_data(game_id: str) -> Dict[str, Any]:
    """
    Fetch live game data for real-time predictions

    Args:
        game_id: NBA game ID

    Returns:
        Current game state and statistics
    """
    try:
        # Note: Live data requires different endpoints
        # This is a placeholder for future implementation
        # You can use BoxScoreTraditionalV2 or ScoreboardV2
        return {
            "game_id": game_id,
            "status": "placeholder",
            "message": "Live game data endpoint to be implemented"
        }
    except Exception as e:
        print(f"Error fetching live game data: {e}")
        return {}


def get_all_nba_teams() -> List[Dict[str, Any]]:
    """
    Get list of all NBA teams

    Returns:
        List of all NBA teams with their IDs and info
    """
    try:
        all_teams = teams.get_teams()
        return all_teams
    except Exception as e:
        print(f"Error fetching teams: {e}")
        return []


def find_player_by_name(player_name: str) -> List[Dict[str, Any]]:
    """
    Search for players by name

    Args:
        player_name: Player's full or partial name

    Returns:
        List of matching players
    """
    try:
        all_players = players.find_players_by_full_name(player_name)
        return all_players
    except Exception as e:
        print(f"Error finding player: {e}")
        return []
