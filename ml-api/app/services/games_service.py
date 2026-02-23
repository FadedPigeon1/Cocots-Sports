"""Game-related data fetching: scheduled games, recent results, live data."""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from nba_api.stats.endpoints import scoreboardv2
from nba_api.stats.static import teams

from .constants import CUSTOM_HEADERS


async def get_scheduled_games(date: Optional[datetime] = None) -> List[Dict[str, Any]]:
    """
    Fetch scheduled NBA games for a specific date.

    Args:
        date: Date to fetch games for (default: today).

    Returns:
        List of scheduled games with team info.
    """
    if date is None:
        date = datetime.now()

    date_str = date.strftime('%m/%d/%Y')
    games_list = []

    try:
        scoreboard = scoreboardv2.ScoreboardV2(
            game_date=date_str, headers=CUSTOM_HEADERS, timeout=60)
        games_df = scoreboard.get_data_frames()[0]

        for _, game in games_df.iterrows():
            try:
                home_id = game['HOME_TEAM_ID']
                away_id = game['VISITOR_TEAM_ID']

                home_info = teams.find_team_name_by_id(home_id)
                away_info = teams.find_team_name_by_id(away_id)

                home_name = home_info['full_name'] if isinstance(
                    home_info, dict) else str(home_info)
                away_name = away_info['full_name'] if isinstance(
                    away_info, dict) else str(away_info)

                games_list.append({
                    'game_id': game['GAME_ID'],
                    'date': date.isoformat(),
                    'status_text': game['GAME_STATUS_TEXT'],
                    'home_team': {
                        'id': int(home_id),
                        'name': home_name,
                        'abbreviation': home_info['abbreviation'] if isinstance(home_info, dict) else '',
                    },
                    'away_team': {
                        'id': int(away_id),
                        'name': away_name,
                        'abbreviation': away_info['abbreviation'] if isinstance(away_info, dict) else '',
                    },
                })
            except Exception as e:
                print(f"Error processing game {game.get('GAME_ID')}: {e}")

    except Exception as e:
        print(f"Error in get_scheduled_games: {e}")

    return games_list


async def get_recent_games(days_back: int = 3) -> List[Dict[str, Any]]:
    """
    Fetch NBA game results from the last N days.

    Args:
        days_back: Number of days to look back.

    Returns:
        List of completed game results with team scores.
    """
    games_list = []

    for i in range(days_back):
        game_date = datetime.now() - timedelta(days=i)
        date_str = game_date.strftime('%m/%d/%Y')

        try:
            scoreboard = scoreboardv2.ScoreboardV2(
                game_date=date_str, headers=CUSTOM_HEADERS, timeout=60)
            games_df = scoreboard.get_data_frames()[0]
            line_score_df = scoreboard.get_data_frames()[1]

            for _, game in games_df.iterrows():
                game_id = game['GAME_ID']
                game_scores = line_score_df[line_score_df['GAME_ID'] == game_id]

                if len(game_scores) == 2:
                    home_team = game_scores.iloc[1]
                    away_team = game_scores.iloc[0]

                    games_list.append({
                        'date': game_date.strftime('%b %d, %Y'),
                        'home_team': {
                            'name': home_team['TEAM_NAME'],
                            'id': str(home_team['TEAM_ID']),
                            'score': int(home_team['PTS']),
                        },
                        'away_team': {
                            'name': away_team['TEAM_NAME'],
                            'id': str(away_team['TEAM_ID']),
                            'score': int(away_team['PTS']),
                        },
                        'status': 'Final',
                    })
        except Exception as e:
            print(f"Error fetching games for {date_str}: {e}")

    return games_list


async def fetch_live_game_data(game_id: str) -> Dict[str, Any]:
    """
    Placeholder for live game data (BoxScoreTraditionalV2 / ScoreboardV2).

    Args:
        game_id: NBA game ID.

    Returns:
        Current game state (not yet implemented).
    """
    return {
        'game_id': game_id,
        'status': 'placeholder',
        'message': 'Live game data endpoint to be implemented',
    }
