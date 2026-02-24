"""Player-related data fetching: details, stats, comparisons, historical seasons."""

from typing import Dict, Any, List, Optional
from datetime import datetime

from nba_api.stats.endpoints import (
    PlayerGameLog,
    commonplayerinfo,
    leaguedashplayerstats,
)
from nba_api.stats.static import players

from .constants import CUSTOM_HEADERS, DEFAULT_SEASON
from .teams_service import get_current_season
from .cache import cache


async def get_top_players(season: str = DEFAULT_SEASON) -> List[Dict[str, Any]]:
    """Return the top 50 players by points per game for the given season."""
    cache_key = f"top_players:{season}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        df = leaguedashplayerstats.LeagueDashPlayerStats(
            season=season, per_mode_detailed='PerGame',
            headers=CUSTOM_HEADERS, timeout=60,
        ).get_data_frames()[0]
        result = df.sort_values('PTS', ascending=False).head(
            50).to_dict('records')
        cache.set(cache_key, result, ttl=600)  # 10 min
        return result
    except Exception as e:
        print(f"Error fetching top players: {e}")
        return []


def find_player_by_name(player_name: str) -> List[Dict[str, Any]]:
    """Search for players by full or partial name."""
    try:
        return players.find_players_by_full_name(player_name)
    except Exception as e:
        print(f"Error finding player '{player_name}': {e}")
        return []


async def fetch_player_stats(
    player_id: int, game_date: datetime, games_back: int = 10
) -> Dict[str, Any]:
    """
    Fetch aggregated stats for a player over their last *games_back* games.

    Used as model input for player-performance predictions.
    """
    _default = {
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
        "avg_turnovers": 2.0,
    }

    try:
        season = get_current_season(game_date)
        df = PlayerGameLog(
            player_id=player_id,
            season=season,
            season_type_all_star="Regular Season",
            headers=CUSTOM_HEADERS,
            timeout=60,
        ).get_data_frames()[0]

        if df.empty:
            return {**_default, "avg_points": 0, "avg_rebounds": 0,
                    "avg_assists": 0, "avg_steals": 0, "avg_blocks": 0,
                    "fg_percentage": 0, "three_pt_percentage": 0,
                    "ft_percentage": 0, "minutes_per_game": 0,
                    "games_played": 0, "avg_fga": 0, "avg_fta": 0,
                    "avg_turnovers": 0}

        recent = df.head(games_back)
        return {
            "player_id": player_id,
            "games": recent.to_dict('records'),
            "avg_points": float(recent['PTS'].mean()),
            "avg_rebounds": float(recent['REB'].mean()),
            "avg_assists": float(recent['AST'].mean()),
            "avg_steals": float(recent['STL'].mean()),
            "avg_blocks": float(recent['BLK'].mean()),
            "fg_percentage": float(recent['FG_PCT'].mean()),
            "three_pt_percentage": float(recent['FG3_PCT'].mean()),
            "ft_percentage": float(recent['FT_PCT'].mean()),
            "minutes_per_game": float(recent['MIN'].mean()),
            "games_played": len(df),
            "avg_fga": float(recent['FGA'].mean()),
            "avg_fta": float(recent['FTA'].mean()),
            "avg_turnovers": float(recent['TOV'].mean()),
        }
    except Exception as e:
        print(f"Error fetching player stats for {player_id}: {e}")
        return _default


async def get_player_details(
    player_id: int, season: str = DEFAULT_SEASON
) -> Optional[Dict[str, Any]]:
    """Fetch bio info, season averages, and recent game log for a player."""
    cache_key = f"player_details:{player_id}:{season}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        df_info = commonplayerinfo.CommonPlayerInfo(
            player_id=player_id, headers=CUSTOM_HEADERS, timeout=60
        ).get_data_frames()[0]

        if df_info.empty:
            return None

        player_info = df_info.iloc[0].to_dict()

        df_logs = PlayerGameLog(
            player_id=player_id, season=season,
            headers=CUSTOM_HEADERS, timeout=60,
        ).get_data_frames()[0]

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
                    'min': str(game['MIN']),
                })

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
                'games_played': len(df_logs),
            }

        result = {
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
                'experience': player_info['SEASON_EXP'],
            },
            'stats': season_stats,
            'recent_games': recent_games,
        }
        cache.set(cache_key, result, ttl=300)  # 5 min
        return result
    except Exception as e:
        print(f"Error fetching player details for {player_id}: {e}")
        return None


async def get_player_season_stats(player_id: int) -> List[str]:
    """Return the list of season strings a player has data for."""
    try:
        df = commonplayerinfo.CommonPlayerInfo(
            player_id=player_id, headers=CUSTOM_HEADERS, timeout=60
        ).get_data_frames()[0]

        if df.empty:
            return []

        from_year = int(df.iloc[0]['FROM_YEAR'])
        to_year = int(df.iloc[0]['TO_YEAR'])
        return [f"{y}-{str(y + 1)[-2:]}" for y in range(from_year, to_year + 1)]
    except Exception as e:
        print(f"Error getting player seasons for {player_id}: {e}")
        return []


async def compare_players(
    player_ids: List[int], season: str = DEFAULT_SEASON
) -> Dict[str, Any]:
    """Compare multiple players' stats for a season, including game-by-game data."""
    ids_key = ",".join(str(i) for i in sorted(player_ids))
    cache_key = f"compare_players:{ids_key}:{season}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        players_data = []

        for player_id in player_ids:
            try:
                df_info = commonplayerinfo.CommonPlayerInfo(
                    player_id=player_id, headers=CUSTOM_HEADERS, timeout=60
                ).get_data_frames()[0]

                if df_info.empty:
                    continue

                player_info = df_info.iloc[0]

                df_logs = PlayerGameLog(
                    player_id=player_id, season=season,
                    headers=CUSTOM_HEADERS, timeout=60,
                ).get_data_frames()[0]

                if df_logs.empty:
                    continue

                stats: Dict[str, Any] = {
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
                    'game_data': [
                        {
                            'game_num': idx + 1,
                            'pts': int(game['PTS']),
                            'reb': int(game['REB']),
                            'ast': int(game['AST']),
                            'date': game['GAME_DATE'],
                        }
                        for idx, (_, game) in enumerate(df_logs.iloc[::-1].iterrows())
                    ],
                }
                players_data.append(stats)
            except Exception as e:
                print(f"Error fetching player {player_id}: {e}")

        stat_categories = ['ppg', 'rpg', 'apg',
                           'spg', 'bpg', 'fg_pct', 'fg3_pct']
        comparison_data = _build_comparison_data(
            players_data, stat_categories, name_key='name')

        result = {'players': players_data,
                  'comparison_data': comparison_data, 'season': season}
        cache.set(cache_key, result, ttl=300)  # 5 min
        return result
    except Exception as e:
        print(f"Error comparing players: {e}")
        return {'players': [], 'comparison_data': [], 'season': season}


async def get_player_historical_comparison(
    player_id: int, seasons: List[str]
) -> Optional[Dict[str, Any]]:
    """Compare a player's stats across multiple seasons."""
    try:
        df_info = commonplayerinfo.CommonPlayerInfo(
            player_id=player_id, headers=CUSTOM_HEADERS, timeout=60
        ).get_data_frames()[0]

        if df_info.empty:
            return None

        player_info = df_info.iloc[0]
        seasons_data = []

        for season in seasons:
            try:
                df_logs = PlayerGameLog(
                    player_id=player_id, season=season,
                    headers=CUSTOM_HEADERS, timeout=60,
                ).get_data_frames()[0]

                if df_logs.empty:
                    continue

                game_data = [
                    {'game_num': idx + 1, 'pts': int(g['PTS']),
                     'reb': int(g['REB']), 'ast': int(g['AST'])}
                    for idx, (_, g) in enumerate(df_logs.iloc[::-1].iterrows())
                ]

                seasons_data.append({
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
                    'game_data': game_data,
                })
            except Exception as e:
                print(
                    f"Error fetching season {season} for player {player_id}: {e}")

        stat_categories = ['ppg', 'rpg', 'apg',
                           'spg', 'bpg', 'fg_pct', 'fg3_pct']
        comparison_data = _build_comparison_data(
            seasons_data, stat_categories, name_key='season')

        return {
            'player': {
                'id': player_id,
                'name': player_info['DISPLAY_FIRST_LAST'],
                'team': player_info['TEAM_NAME'],
                'position': player_info['POSITION'],
            },
            'seasons': seasons_data,
            'comparison_data': comparison_data,
        }
    except Exception as e:
        print(
            f"Error in get_player_historical_comparison for {player_id}: {e}")
        return None


# ─── Private helpers ──────────────────────────────────────────────────────────

def _build_comparison_data(
    items: List[Dict[str, Any]],
    categories: List[str],
    name_key: str,
) -> List[Dict[str, Any]]:
    """Build radar/bar-chart comparison list keyed by *name_key*."""
    result = []
    for cat in categories:
        point: Dict[str, Any] = {'stat': cat.upper().replace('_PCT', '%')}
        for item in items:
            point[item[name_key]] = item.get(cat, 0)
        result.append(point)
    return result
