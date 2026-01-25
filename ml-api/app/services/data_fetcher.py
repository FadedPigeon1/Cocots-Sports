from typing import Dict, Any, List
from datetime import datetime, timedelta
from nba_api.stats.endpoints import TeamGameLog, PlayerGameLog, CommonTeamRoster, leaguedashteamstats, leaguedashplayerstats, scoreboardv2, commonplayerinfo
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


def get_team_conference(team_id: int) -> str:
    """Get conference for a team ID"""
    east_ids = [1610612737, 1610612738, 1610612751, 1610612766, 1610612741,
                1610612739, 1610612765, 1610612754, 1610612748, 1610612749,
                1610612752, 1610612753, 1610612755, 1610612761, 1610612764]
    return "East" if team_id in east_ids else "West"


async def get_current_standings(season: str = "2025-26") -> List[Dict[str, Any]]:
    """
    Fetch current season standings with conference info
    """
    try:
        team_stats = leaguedashteamstats.LeagueDashTeamStats(season=season)
        df_teams = team_stats.get_data_frames()[0]

        # Add conference column
        df_teams['CONFERENCE'] = df_teams['TEAM_ID'].apply(get_team_conference)

        # Calculate conference rank
        df_teams['CONF_RANK'] = df_teams.groupby('CONFERENCE')['W_PCT'].rank(
            ascending=False, method='min').astype(int)

        # Sort by win percentage
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


async def get_team_details(team_id: int, season: str = "2025-26") -> Dict[str, Any]:
    """
    Fetch detailed statistics for a specific team

    Args:
        team_id: NBA team ID
        season: Season string (e.g., "2025-26")

    Returns:
        Dictionary with team details and recent game logs
    """
    try:
        # Get team stats
        team_stats = leaguedashteamstats.LeagueDashTeamStats(season=season)
        df_teams = team_stats.get_data_frames()[0]

        # Find the specific team
        team_row = df_teams[df_teams['TEAM_ID'] == team_id]

        if team_row.empty:
            raise ValueError(f"Team {team_id} not found")

        team = team_row.iloc[0]

        # Get game log for recent games
        try:
            game_log = TeamGameLog(
                team_id=team_id,
                season=season,
                season_type_all_star="Regular Season"
            )
            df_games = game_log.get_data_frames()[0]

            # Process recent games with accurate data
            recent_games = []
            for _, game in df_games.head(20).iterrows():
                # Parse matchup to get opponent and home/away status
                matchup = game.get('MATCHUP', '')
                if 'vs.' in matchup:
                    # Home game - opponent is after "vs."
                    opponent = matchup.split('vs.')[-1].strip()
                    location = 'vs'
                elif '@' in matchup:
                    # Away game - opponent is after "@"
                    opponent = matchup.split('@')[-1].strip()
                    location = '@'
                else:
                    opponent = matchup.split()[-1] if matchup else 'Unknown'
                    location = ''

                # Format the date properly
                game_date = game.get('GAME_DATE', '')
                try:
                    # Convert from YYYY-MM-DD to readable format
                    if game_date:
                        date_obj = datetime.strptime(game_date, '%Y-%m-%d')
                        formatted_date = date_obj.strftime('%b %d, %Y')
                    else:
                        formatted_date = game_date
                except Exception:
                    formatted_date = game_date

                # Get team and opponent points
                team_pts = int(game.get('PTS', 0))

                # Try to get opponent points from available fields
                # The game result format should be "W 120-115" or "L 100-105"
                wl = game.get('WL', '')

                # Parse from the game columns - look for opponent score
                # Some versions have it in different columns
                if 'OPP_PTS' in game and pd.notna(game.get('OPP_PTS')):
                    opp_pts = int(game.get('OPP_PTS'))
                else:
                    # Calculate from plus_minus: opponent_score = team_score - plus_minus
                    plus_minus = game.get('PLUS_MINUS', 0)
                    if pd.notna(plus_minus):
                        opp_pts = team_pts - int(plus_minus)
                    else:
                        opp_pts = 0

                recent_games.append({
                    'date': formatted_date,
                    'opponent': opponent,
                    'location': location,
                    'matchup': matchup,
                    'result': game.get('WL', ''),
                    'pts': team_pts,
                    'opp_pts': opp_pts,
                    'fg_pct': float(game.get('FG_PCT', 0)),
                    'fg3_pct': float(game.get('FG3_PCT', 0)),
                    'reb': int(game.get('REB', 0)),
                    'ast': int(game.get('AST', 0))
                })
        except Exception as e:
            print(f"Error fetching game log: {e}")
            recent_games = []

        # Determine conference rank
        conf_teams = df_teams[df_teams['TEAM_ID'].isin(
            get_conference_team_ids(team_id)
        )].sort_values('W_PCT', ascending=False).reset_index(drop=True)

        # Find the rank by position in sorted conference teams
        conf_rank = 0
        for idx, row in conf_teams.iterrows():
            if row['TEAM_ID'] == team_id:
                conf_rank = idx + 1
                break

        # Calculate last 10 record
        last_10_games = df_games.head(
            10) if not df_games.empty else pd.DataFrame()
        last_10_wins = (last_10_games['WL'] == 'W').sum(
        ) if not last_10_games.empty else 0
        last_10_losses = len(last_10_games) - \
            last_10_wins if not last_10_games.empty else 0

        # Calculate streak
        streak = ""
        if not df_games.empty:
            current_result = df_games.iloc[0]['WL']
            streak_count = 1
            for _, game in df_games.iloc[1:].iterrows():
                if game['WL'] == current_result:
                    streak_count += 1
                else:
                    break
            streak = f"{current_result}{streak_count}"

        # Calculate home/away records
        home_games = df_games[df_games['MATCHUP'].str.contains(
            'vs.') if 'MATCHUP' in df_games.columns else False]
        away_games = df_games[df_games['MATCHUP'].str.contains(
            '@') if 'MATCHUP' in df_games.columns else False]

        home_wins = (home_games['WL'] == 'W').sum(
        ) if not home_games.empty else 0
        home_losses = len(home_games) - \
            home_wins if not home_games.empty else 0
        away_wins = (away_games['WL'] == 'W').sum(
        ) if not away_games.empty else 0
        away_losses = len(away_games) - \
            away_wins if not away_games.empty else 0

        return {
            'team': {
                'team_id': str(team_id),
                'team_name': team.get('TEAM_NAME', ''),
                'wins': int(team.get('W', 0)),
                'losses': int(team.get('L', 0)),
                'win_pct': float(team.get('W_PCT', 0)),
                'conf_rank': int(conf_rank),
                'ppg': float(team.get('PTS', 0)),
                'opp_ppg': float(team.get('OPP_PTS', 0)) if 'OPP_PTS' in team else 0,
                'fg_pct': float(team.get('FG_PCT', 0)),
                'fg3_pct': float(team.get('FG3_PCT', 0)),
                'ft_pct': float(team.get('FT_PCT', 0)),
                'reb': float(team.get('REB', 0)),
                'ast': float(team.get('AST', 0)),
                'plus_minus': float(team.get('PLUS_MINUS', 0)),
                'last_10': f"{last_10_wins}-{last_10_losses}",
                'streak': streak,
                'home_record': f"{home_wins}-{home_losses}",
                'away_record': f"{away_wins}-{away_losses}"
            },
            'recent_games': recent_games
        }
    except Exception as e:
        print(f"Error fetching team details: {e}")
        raise


def get_conference_team_ids(team_id: int) -> List[int]:
    """Get all team IDs for the same conference"""
    east_ids = [1610612737, 1610612738, 1610612751, 1610612766, 1610612741,
                1610612739, 1610612765, 1610612754, 1610612748, 1610612749,
                1610612752, 1610612753, 1610612755, 1610612761, 1610612764]

    west_ids = [1610612742, 1610612743, 1610612744, 1610612745, 1610612746,
                1610612747, 1610612763, 1610612750, 1610612740, 1610612760,
                1610612756, 1610612757, 1610612758, 1610612759, 1610612762]

    return east_ids if team_id in east_ids else west_ids


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


async def get_player_details(player_id: int, season: str = "2025-26") -> Dict[str, Any]:
    """
    Fetch detailed statistics for a specific player
    """
    try:
        # Get common player info
        info = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
        df_info = info.get_data_frames()[0]

        if df_info.empty:
            return None

        player_info = df_info.iloc[0].to_dict()

        # Get game logs
        gamelog = PlayerGameLog(player_id=player_id, season=season)
        df_logs = gamelog.get_data_frames()[0]

        # Process recent games
        recent_games = []
        if not df_logs.empty:
            for _, game in df_logs.head(10).iterrows():
                recent_games.append({
                    'game_id': game['Game_ID'],
                    'date': game['GAME_DATE'],
                    'matchup': game['MATCHUP'],
                    'wl': game['WL'],
                    'pts': int(game['PTS']),
                    'reb': int(game['REB']),
                    'ast': int(game['AST']),
                    'stl': int(game['STL']),
                    'blk': int(game['BLK']),
                    'fg_pct': float(game['FG_PCT']),
                    'fg3_pct': float(game['FG3_PCT']),
                    'ft_pct': float(game['FT_PCT']),
                    'min': str(game['MIN'])
                })

        # Calculate season averages from logs if not available elsewhere easily
        season_stats = {}
        if not df_logs.empty:
            season_stats = {
                'ppg': float(df_logs['PTS'].mean()),
                'rpg': float(df_logs['REB'].mean()),
                'apg': float(df_logs['AST'].mean()),
                'spg': float(df_logs['STL'].mean()),
                'bpg': float(df_logs['BLK'].mean()),
                'fg_pct': float(df_logs['FG_PCT'].mean()),
                'fg3_pct': float(df_logs['FG3_PCT'].mean()),
                'ft_pct': float(df_logs['FT_PCT'].mean()),
                'games_played': len(df_logs)
            }

        return {
            'info': {
                'id': int(player_info['PERSON_ID']),
                'name': player_info['DISPLAY_FIRST_LAST'],
                'team': player_info['TEAM_NAME'],
                'team_id': int(player_info['TEAM_ID']),
                'position': player_info['POSITION'],
                'height': player_info['HEIGHT'],
                'weight': player_info['WEIGHT'],
                'jersey': player_info['JERSEY'],
                'country': player_info['COUNTRY'],
                'draft_year': player_info['DRAFT_YEAR'],
                'experience': player_info['SEASON_EXP']
            },
            'stats': season_stats,
            'recent_games': recent_games
        }
    except Exception as e:
        print(f"Error fetching player details: {e}")
        return None


async def get_player_season_stats(player_id: int) -> List[str]:
    """
    Get list of available seasons for a player
    """
    try:
        info = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
        df_info = info.get_data_frames()[0]

        if df_info.empty:
            return []

        from_year = int(df_info.iloc[0]['FROM_YEAR'])
        to_year = int(df_info.iloc[0]['TO_YEAR'])

        seasons = []
        for year in range(from_year, to_year + 1):
            seasons.append(f"{year}-{str(year + 1)[-2:]}")

        return seasons
    except Exception as e:
        print(f"Error getting player seasons: {e}")
        return []


async def get_team_season_stats(team_id: int) -> List[str]:
    """
    Get list of available seasons for a team (last 20 years for NBA teams)
    """
    try:
        current_year = datetime.now().year
        seasons = []
        # NBA teams have data going back many years, return last 20
        for year in range(current_year - 20, current_year + 1):
            seasons.append(f"{year}-{str(year + 1)[-2:]}")
        return seasons
    except Exception as e:
        print(f"Error getting team seasons: {e}")
        return []


async def compare_players(player_ids: List[int], season: str = "2025-26") -> Dict[str, Any]:
    """
    Compare multiple players' statistics for a given season
    """
    try:
        players_data = []

        for player_id in player_ids:
            try:
                # Get player info
                info = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
                df_info = info.get_data_frames()[0]

                if df_info.empty:
                    continue

                player_info = df_info.iloc[0]

                # Get player game logs for the season
                gamelog = PlayerGameLog(player_id=player_id, season=season)
                df_logs = gamelog.get_data_frames()[0]

                if df_logs.empty:
                    continue

                # Calculate averages
                stats = {
                    'player_id': player_id,
                    'name': player_info['DISPLAY_FIRST_LAST'],
                    'team': player_info['TEAM_NAME'],
                    'team_id': int(player_info['TEAM_ID']),
                    'position': player_info['POSITION'],
                    'season': season,
                    'games_played': len(df_logs),
                    'ppg': round(float(df_logs['PTS'].mean()), 1),
                    'rpg': round(float(df_logs['REB'].mean()), 1),
                    'apg': round(float(df_logs['AST'].mean()), 1),
                    'spg': round(float(df_logs['STL'].mean()), 1),
                    'bpg': round(float(df_logs['BLK'].mean()), 1),
                    'fg_pct': round(float(df_logs['FG_PCT'].mean()) * 100, 1),
                    'fg3_pct': round(float(df_logs['FG3_PCT'].mean()) * 100, 1),
                    'ft_pct': round(float(df_logs['FT_PCT'].mean()) * 100, 1),
                    'mpg': round(float(df_logs['MIN'].mean()), 1),
                    'tov': round(float(df_logs['TOV'].mean()), 1),
                    'fga': round(float(df_logs['FGA'].mean()), 1),
                    'fta': round(float(df_logs['FTA'].mean()), 1),
                }

                # Calculate game-by-game data for charts
                game_data = []
                for idx, (_, game) in enumerate(df_logs.iloc[::-1].iterrows()):
                    game_data.append({
                        'game_num': idx + 1,
                        'pts': int(game['PTS']),
                        'reb': int(game['REB']),
                        'ast': int(game['AST']),
                        'date': game['GAME_DATE']
                    })

                stats['game_data'] = game_data
                players_data.append(stats)

            except Exception as e:
                print(f"Error fetching player {player_id}: {e}")
                continue

        # Create comparison stats for radar chart
        stat_categories = ['ppg', 'rpg', 'apg',
                           'spg', 'bpg', 'fg_pct', 'fg3_pct']
        comparison_data = []

        for category in stat_categories:
            data_point = {'stat': category.upper().replace('_PCT', '%')}
            for player in players_data:
                data_point[player['name']] = player.get(category, 0)
            comparison_data.append(data_point)

        return {
            'players': players_data,
            'comparison_data': comparison_data,
            'season': season
        }
    except Exception as e:
        print(f"Error comparing players: {e}")
        return {'players': [], 'comparison_data': [], 'season': season}


async def compare_teams(team_ids: List[int], season: str = "2025-26") -> Dict[str, Any]:
    """
    Compare multiple teams' statistics for a given season
    """
    try:
        # Get league-wide team stats
        team_stats = leaguedashteamstats.LeagueDashTeamStats(season=season)
        df_all_teams = team_stats.get_data_frames()[0]

        teams_data = []

        for team_id in team_ids:
            try:
                team_row = df_all_teams[df_all_teams['TEAM_ID'] == team_id]

                if team_row.empty:
                    continue

                team = team_row.iloc[0]

                # Get game log for trend data
                game_log = TeamGameLog(
                    team_id=team_id,
                    season=season,
                    season_type_all_star="Regular Season"
                )
                df_games = game_log.get_data_frames()[0]

                # Calculate stats
                stats = {
                    'team_id': team_id,
                    'name': team['TEAM_NAME'],
                    'season': season,
                    'wins': int(team['W']),
                    'losses': int(team['L']),
                    'win_pct': round(float(team['W_PCT']) * 100, 1),
                    'ppg': round(float(team['PTS']), 1),
                    'opp_ppg': round(float(team.get('OPP_PTS', 0)), 1) if 'OPP_PTS' in team else 0,
                    'fg_pct': round(float(team['FG_PCT']) * 100, 1),
                    'fg3_pct': round(float(team['FG3_PCT']) * 100, 1),
                    'ft_pct': round(float(team['FT_PCT']) * 100, 1),
                    'reb': round(float(team['REB']), 1),
                    'ast': round(float(team['AST']), 1),
                    'stl': round(float(team['STL']), 1),
                    'blk': round(float(team['BLK']), 1),
                    'tov': round(float(team['TOV']), 1),
                    'plus_minus': round(float(team['PLUS_MINUS']), 1),
                }

                # Calculate game-by-game win trend
                game_data = []
                cumulative_wins = 0
                cumulative_losses = 0

                for idx, (_, game) in enumerate(df_games.iloc[::-1].iterrows()):
                    if game['WL'] == 'W':
                        cumulative_wins += 1
                    else:
                        cumulative_losses += 1

                    game_data.append({
                        'game_num': idx + 1,
                        'wins': cumulative_wins,
                        'losses': cumulative_losses,
                        'pts': int(game['PTS']),
                        'date': game['GAME_DATE']
                    })

                stats['game_data'] = game_data
                teams_data.append(stats)

            except Exception as e:
                print(f"Error fetching team {team_id}: {e}")
                continue

        # Create comparison data for radar chart
        stat_categories = ['ppg', 'fg_pct',
                           'fg3_pct', 'reb', 'ast', 'stl', 'blk']
        comparison_data = []

        for category in stat_categories:
            data_point = {'stat': category.upper().replace('_PCT', '%')}
            for team in teams_data:
                data_point[team['name']] = team.get(category, 0)
            comparison_data.append(data_point)

        return {
            'teams': teams_data,
            'comparison_data': comparison_data,
            'season': season
        }
    except Exception as e:
        print(f"Error comparing teams: {e}")
        return {'teams': [], 'comparison_data': [], 'season': season}


async def get_player_historical_comparison(player_id: int, seasons: List[str]) -> Dict[str, Any]:
    """
    Get a player's statistics across multiple seasons for self-comparison
    """
    try:
        # Get player info
        info = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
        df_info = info.get_data_frames()[0]

        if df_info.empty:
            return None

        player_info = df_info.iloc[0]

        seasons_data = []

        for season in seasons:
            try:
                gamelog = PlayerGameLog(player_id=player_id, season=season)
                df_logs = gamelog.get_data_frames()[0]

                if df_logs.empty:
                    continue

                stats = {
                    'season': season,
                    'games_played': len(df_logs),
                    'ppg': round(float(df_logs['PTS'].mean()), 1),
                    'rpg': round(float(df_logs['REB'].mean()), 1),
                    'apg': round(float(df_logs['AST'].mean()), 1),
                    'spg': round(float(df_logs['STL'].mean()), 1),
                    'bpg': round(float(df_logs['BLK'].mean()), 1),
                    'fg_pct': round(float(df_logs['FG_PCT'].mean()) * 100, 1),
                    'fg3_pct': round(float(df_logs['FG3_PCT'].mean()) * 100, 1),
                    'ft_pct': round(float(df_logs['FT_PCT'].mean()) * 100, 1),
                    'mpg': round(float(df_logs['MIN'].mean()), 1),
                }

                # Game by game data for the season
                game_data = []
                for idx, (_, game) in enumerate(df_logs.iloc[::-1].iterrows()):
                    game_data.append({
                        'game_num': idx + 1,
                        'pts': int(game['PTS']),
                        'reb': int(game['REB']),
                        'ast': int(game['AST']),
                    })

                stats['game_data'] = game_data
                seasons_data.append(stats)

            except Exception as e:
                print(
                    f"Error fetching season {season} for player {player_id}: {e}")
                continue

        # Create comparison data for bar/radar chart
        stat_categories = ['ppg', 'rpg', 'apg',
                           'spg', 'bpg', 'fg_pct', 'fg3_pct']
        comparison_data = []

        for category in stat_categories:
            data_point = {'stat': category.upper().replace('_PCT', '%')}
            for season_stats in seasons_data:
                data_point[season_stats['season']
                           ] = season_stats.get(category, 0)
            comparison_data.append(data_point)

        return {
            'player': {
                'id': player_id,
                'name': player_info['DISPLAY_FIRST_LAST'],
                'team': player_info['TEAM_NAME'],
                'position': player_info['POSITION']
            },
            'seasons': seasons_data,
            'comparison_data': comparison_data
        }
    except Exception as e:
        print(f"Error getting player historical comparison: {e}")
        return None


async def get_team_historical_comparison(team_id: int, seasons: List[str]) -> Dict[str, Any]:
    """
    Get a team's statistics across multiple seasons for self-comparison
    (e.g., 2016 Warriors vs 2022 Warriors)
    """
    try:
        # Get team info
        team_info = teams.find_team_by_id(team_id)
        if not team_info:
            return None

        seasons_data = []

        for season in seasons:
            try:
                # Get team stats for the season
                team_stats = leaguedashteamstats.LeagueDashTeamStats(
                    season=season)
                df_teams = team_stats.get_data_frames()[0]

                team_row = df_teams[df_teams['TEAM_ID'] == team_id]

                if team_row.empty:
                    continue

                team = team_row.iloc[0]

                # Get game log for trend data
                game_log = TeamGameLog(
                    team_id=team_id,
                    season=season,
                    season_type_all_star="Regular Season"
                )
                df_games = game_log.get_data_frames()[0]

                stats = {
                    'season': season,
                    'wins': int(team['W']),
                    'losses': int(team['L']),
                    'win_pct': round(float(team['W_PCT']) * 100, 1),
                    'ppg': round(float(team['PTS']), 1),
                    'fg_pct': round(float(team['FG_PCT']) * 100, 1),
                    'fg3_pct': round(float(team['FG3_PCT']) * 100, 1),
                    'ft_pct': round(float(team['FT_PCT']) * 100, 1),
                    'reb': round(float(team['REB']), 1),
                    'ast': round(float(team['AST']), 1),
                    'stl': round(float(team['STL']), 1),
                    'blk': round(float(team['BLK']), 1),
                    'tov': round(float(team['TOV']), 1),
                }

                # Calculate cumulative win trend
                game_data = []
                cumulative_wins = 0

                for idx, (_, game) in enumerate(df_games.iloc[::-1].iterrows()):
                    if game['WL'] == 'W':
                        cumulative_wins += 1

                    game_data.append({
                        'game_num': idx + 1,
                        'wins': cumulative_wins,
                        'pts': int(game['PTS']),
                    })

                stats['game_data'] = game_data
                seasons_data.append(stats)

            except Exception as e:
                print(
                    f"Error fetching season {season} for team {team_id}: {e}")
                continue

        # Create comparison data
        stat_categories = ['ppg', 'fg_pct',
                           'fg3_pct', 'reb', 'ast', 'stl', 'blk']
        comparison_data = []

        for category in stat_categories:
            data_point = {'stat': category.upper().replace('_PCT', '%')}
            for season_stats in seasons_data:
                data_point[season_stats['season']
                           ] = season_stats.get(category, 0)
            comparison_data.append(data_point)

        return {
            'team': {
                'id': team_id,
                'name': team_info['full_name'],
                'abbreviation': team_info['abbreviation']
            },
            'seasons': seasons_data,
            'comparison_data': comparison_data
        }
    except Exception as e:
        print(f"Error getting team historical comparison: {e}")
        return None
