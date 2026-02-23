"""Team-related data fetching: standings, details, game logs, rosters, comparisons."""

from typing import Dict, Any, List, Optional
from datetime import datetime

import pandas as pd
from nba_api.stats.endpoints import (
    TeamGameLog,
    CommonTeamRoster,
    leaguedashteamstats,
)
from nba_api.stats.static import teams

from .constants import CUSTOM_HEADERS, DEFAULT_SEASON, EAST_TEAM_IDS, WEST_TEAM_IDS


def get_current_season(game_date: Optional[datetime] = None) -> str:
    """Return the NBA season string (e.g. '2025-26') for a given date."""
    if game_date is None:
        game_date = datetime.now()
    year = game_date.year
    if game_date.month >= 10:
        return f"{year}-{str(year + 1)[-2:]}"
    return f"{year - 1}-{str(year)[-2:]}"


def get_team_conference(team_id: int) -> str:
    """Return 'East' or 'West' for a team ID."""
    return "East" if team_id in EAST_TEAM_IDS else "West"


def get_conference_team_ids(team_id: int) -> List[int]:
    """Return all team IDs that belong to the same conference as *team_id*."""
    return EAST_TEAM_IDS if team_id in EAST_TEAM_IDS else WEST_TEAM_IDS


def get_all_nba_teams() -> List[Dict[str, Any]]:
    """Return a list of all NBA teams with ID, name, and abbreviation."""
    try:
        return teams.get_teams()
    except Exception as e:
        print(f"Error fetching teams: {e}")
        return []


async def get_current_standings(season: str = DEFAULT_SEASON) -> List[Dict[str, Any]]:
    """Fetch current season standings with conference info, sorted by win %."""
    try:
        team_stats = leaguedashteamstats.LeagueDashTeamStats(
            season=season, headers=CUSTOM_HEADERS, timeout=60)
        df = team_stats.get_data_frames()[0]

        df['CONFERENCE'] = df['TEAM_ID'].apply(get_team_conference)
        df['CONF_RANK'] = (
            df.groupby('CONFERENCE')['W_PCT']
            .rank(ascending=False, method='min')
            .astype(int)
        )

        return df.sort_values('W_PCT', ascending=False).to_dict('records')
    except Exception as e:
        print(f"Error fetching standings: {e}")
        return []


async def get_team_details(team_id: int, season: str = DEFAULT_SEASON) -> Dict[str, Any]:
    """
    Fetch detailed statistics and recent game log for a specific team.

    Args:
        team_id: NBA team ID.
        season: Season string (e.g. '2025-26').

    Returns:
        Dict with 'team' summary and 'recent_games' list.
    """
    try:
        team_stats = leaguedashteamstats.LeagueDashTeamStats(
            season=season, headers=CUSTOM_HEADERS, timeout=60)
        df_teams = team_stats.get_data_frames()[0]

        team_row = df_teams[df_teams['TEAM_ID'] == team_id]
        if team_row.empty:
            raise ValueError(f"Team {team_id} not found")

        team = team_row.iloc[0]
        df_games = pd.DataFrame()
        recent_games: List[Dict[str, Any]] = []

        try:
            game_log = TeamGameLog(
                team_id=team_id,
                season=season,
                season_type_all_star="Regular Season",
                headers=CUSTOM_HEADERS,
                timeout=60,
            )
            df_games = game_log.get_data_frames()[0]
            recent_games = _build_recent_games(df_games)
        except Exception as e:
            print(f"Error fetching game log for team {team_id}: {e}")

        # Conference rank
        conf_ids = get_conference_team_ids(team_id)
        conf_teams = (
            df_teams[df_teams['TEAM_ID'].isin(conf_ids)]
            .sort_values('W_PCT', ascending=False)
            .reset_index(drop=True)
        )
        conf_rank = next(
            (i + 1 for i, row in conf_teams.iterrows()
             if row['TEAM_ID'] == team_id),
            0,
        )

        # Last-10 record
        last_10 = df_games.head(10) if not df_games.empty else pd.DataFrame()
        last_10_wins = int((last_10['WL'] == 'W').sum()
                           ) if not last_10.empty else 0
        last_10_losses = len(last_10) - last_10_wins

        # Current streak
        streak = _calculate_streak(df_games)

        # Home / away records
        home_wins, home_losses = _split_record(df_games, 'vs.')
        away_wins, away_losses = _split_record(df_games, '@')

        return {
            'team': {
                'team_id': str(team_id),
                'team_name': team.get('TEAM_NAME', ''),
                'wins': int(team.get('W', 0)),
                'losses': int(team.get('L', 0)),
                'win_pct': float(team.get('W_PCT', 0)),
                'conf_rank': conf_rank,
                'ppg': float(team.get('PTS', 0)),
                'opp_ppg': float(team.get('OPP_PTS', 0)) if 'OPP_PTS' in team.index else 0,
                'fg_pct': float(team.get('FG_PCT', 0)),
                'fg3_pct': float(team.get('FG3_PCT', 0)),
                'ft_pct': float(team.get('FT_PCT', 0)),
                'reb': float(team.get('REB', 0)),
                'ast': float(team.get('AST', 0)),
                'plus_minus': float(team.get('PLUS_MINUS', 0)),
                'last_10': f"{last_10_wins}-{last_10_losses}",
                'streak': streak,
                'home_record': f"{home_wins}-{home_losses}",
                'away_record': f"{away_wins}-{away_losses}",
            },
            'recent_games': recent_games,
        }
    except Exception as e:
        print(f"Error fetching team details for {team_id}: {e}")
        raise


async def fetch_game_data(
    team_id: int, game_date: datetime, games_back: int = 10
) -> Dict[str, Any]:
    """
    Fetch aggregated stats for a team over its most recent *games_back* games.

    Used as model input for game predictions.
    """
    _default = {
        "team_id": team_id,
        "games": [],
        "avg_points": 110.0,
        "avg_points_allowed": 108.0,
        "win_percentage": 0.500,
        "home_win_percentage": 0.550,
        "away_win_percentage": 0.450,
        "last_5_record": "3-2",
        "rest_days": 2,
    }

    try:
        season = get_current_season(game_date)
        game_log = TeamGameLog(
            team_id=team_id,
            season=season,
            season_type_all_star="Regular Season",
            headers=CUSTOM_HEADERS,
            timeout=60,
        )
        df = game_log.get_data_frames()[0]

        if df.empty:
            return {**_default, "avg_points": 0, "avg_points_allowed": 0,
                    "win_percentage": 0, "home_win_percentage": 0,
                    "away_win_percentage": 0, "last_5_record": "0-0", "rest_days": 0}

        recent = df.head(games_back)
        home_games = recent[recent['MATCHUP'].str.contains('vs.')]
        away_games = recent[recent['MATCHUP'].str.contains('@')]

        def _win_pct(subset: pd.DataFrame) -> float:
            return (subset['WL'] == 'W').sum() / len(subset) if len(subset) else 0.0

        last_5 = recent.head(5)
        last_5_wins = int((last_5['WL'] == 'W').sum())

        last_game_date = pd.to_datetime(
            recent.iloc[0]['GAME_DATE']) if len(recent) else None
        rest_days = int(
            (game_date - last_game_date).days) if last_game_date else 0

        return {
            "team_id": team_id,
            "games": recent.to_dict('records'),
            "avg_points": float(recent['PTS'].mean()),
            "avg_points_allowed": float(recent['OPP_PTS'].mean()) if 'OPP_PTS' in recent.columns else 0.0,
            "win_percentage": float(_win_pct(recent)),
            "home_win_percentage": float(_win_pct(home_games)),
            "away_win_percentage": float(_win_pct(away_games)),
            "last_5_record": f"{last_5_wins}-{len(last_5) - last_5_wins}",
            "rest_days": rest_days,
        }

    except Exception as e:
        print(f"Error fetching game data for team {team_id}: {e}")
        return _default


async def fetch_team_roster(team_id: int, season: str = DEFAULT_SEASON) -> List[Dict[str, Any]]:
    """Return the current roster for a team."""
    try:
        roster = CommonTeamRoster(
            team_id=team_id, season=season, headers=CUSTOM_HEADERS, timeout=60)
        df = roster.get_data_frames()[0]
        return df.to_dict('records') if not df.empty else []
    except Exception as e:
        print(f"Error fetching roster for team {team_id}: {e}")
        return []


async def get_team_season_stats(team_id: int) -> List[str]:
    """Return available season strings for a team (last 20 years)."""
    current_year = datetime.now().year
    return [f"{y}-{str(y + 1)[-2:]}" for y in range(current_year - 20, current_year + 1)]


async def compare_teams(team_ids: List[int], season: str = DEFAULT_SEASON) -> Dict[str, Any]:
    """Compare multiple teams' stats for a season, including game-by-game trend."""
    try:
        df_all = leaguedashteamstats.LeagueDashTeamStats(
            season=season, headers=CUSTOM_HEADERS, timeout=60
        ).get_data_frames()[0]

        teams_data = []
        for team_id in team_ids:
            team_row = df_all[df_all['TEAM_ID'] == team_id]
            if team_row.empty:
                continue
            team = team_row.iloc[0]

            try:
                df_games = TeamGameLog(
                    team_id=team_id,
                    season=season,
                    season_type_all_star="Regular Season",
                    headers=CUSTOM_HEADERS,
                    timeout=60,
                ).get_data_frames()[0]
            except Exception:
                df_games = pd.DataFrame()

            stats: Dict[str, Any] = {
                'team_id': team_id,
                'name': team['TEAM_NAME'],
                'season': season,
                'wins': int(team['W']),
                'losses': int(team['L']),
                'win_pct': round(float(team['W_PCT']) * 100, 1),
                'ppg': round(float(team['PTS']), 1),
                'opp_ppg': round(float(team.get('OPP_PTS', 0)), 1) if 'OPP_PTS' in team.index else 0,
                'fg_pct': round(float(team['FG_PCT']) * 100, 1),
                'fg3_pct': round(float(team['FG3_PCT']) * 100, 1),
                'ft_pct': round(float(team['FT_PCT']) * 100, 1),
                'reb': round(float(team['REB']), 1),
                'ast': round(float(team['AST']), 1),
                'stl': round(float(team['STL']), 1),
                'blk': round(float(team['BLK']), 1),
                'tov': round(float(team['TOV']), 1),
                'plus_minus': round(float(team['PLUS_MINUS']), 1),
                'game_data': _build_cumulative_game_data(df_games),
            }
            teams_data.append(stats)

        return {
            'teams': teams_data,
            'comparison_data': _build_comparison_data(
                teams_data, ['ppg', 'fg_pct', 'fg3_pct',
                             'reb', 'ast', 'stl', 'blk'],
                name_key='name',
            ),
            'season': season,
        }
    except Exception as e:
        print(f"Error comparing teams: {e}")
        return {'teams': [], 'comparison_data': [], 'season': season}


async def get_team_historical_comparison(
    team_id: int, seasons: List[str]
) -> Optional[Dict[str, Any]]:
    """Compare a team's statistics across multiple seasons (e.g. 2016 vs 2022 Warriors)."""
    try:
        team_info = teams.find_team_name_by_id(team_id)
        if not team_info:
            return None

        seasons_data = []
        for season in seasons:
            try:
                df = leaguedashteamstats.LeagueDashTeamStats(
                    season=season, headers=CUSTOM_HEADERS, timeout=60
                ).get_data_frames()[0]

                team_row = df[df['TEAM_ID'] == team_id]
                if team_row.empty:
                    continue

                team = team_row.iloc[0]

                try:
                    df_games = TeamGameLog(
                        team_id=team_id,
                        season=season,
                        season_type_all_star="Regular Season",
                        headers=CUSTOM_HEADERS,
                        timeout=60,
                    ).get_data_frames()[0]
                except Exception:
                    df_games = pd.DataFrame()

                # Cumulative win trend (chronological order)
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

                seasons_data.append({
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
                    'game_data': game_data,
                })
            except Exception as e:
                print(
                    f"Error fetching season {season} for team {team_id}: {e}")

        return {
            'team': {
                'id': team_id,
                'name': team_info['full_name'],
                'abbreviation': team_info['abbreviation'],
            },
            'seasons': seasons_data,
            'comparison_data': _build_comparison_data(
                seasons_data,
                ['ppg', 'fg_pct', 'fg3_pct', 'reb', 'ast', 'stl', 'blk'],
                name_key='season',
            ),
        }
    except Exception as e:
        print(f"Error in get_team_historical_comparison for {team_id}: {e}")
        return None


# ─── Private helpers ──────────────────────────────────────────────────────────

def _build_recent_games(df_games: pd.DataFrame) -> List[Dict[str, Any]]:
    """Parse a TeamGameLog DataFrame into a list of display-ready game dicts."""
    games = []
    for _, game in df_games.head(20).iterrows():
        matchup: str = game.get('MATCHUP', '')
        if 'vs.' in matchup:
            opponent = matchup.split('vs.')[-1].strip()
            location = 'vs'
        elif '@' in matchup:
            opponent = matchup.split('@')[-1].strip()
            location = '@'
        else:
            opponent = matchup.split()[-1] if matchup else 'Unknown'
            location = ''

        raw_date = game.get('GAME_DATE', '')
        try:
            formatted_date = datetime.strptime(
                raw_date, '%Y-%m-%d').strftime('%b %d, %Y')
        except Exception:
            formatted_date = raw_date

        team_pts = int(game.get('PTS', 0))
        if 'OPP_PTS' in game and pd.notna(game.get('OPP_PTS')):
            opp_pts = int(game['OPP_PTS'])
        else:
            plus_minus = game.get('PLUS_MINUS', 0)
            opp_pts = team_pts - int(plus_minus) if pd.notna(plus_minus) else 0

        games.append({
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
            'ast': int(game.get('AST', 0)),
        })
    return games


def _calculate_streak(df_games: pd.DataFrame) -> str:
    """Return the current win/loss streak string (e.g. 'W3')."""
    if df_games.empty:
        return ''
    current_result = df_games.iloc[0]['WL']
    count = 1
    for _, game in df_games.iloc[1:].iterrows():
        if game['WL'] == current_result:
            count += 1
        else:
            break
    return f"{current_result}{count}"


def _split_record(df_games: pd.DataFrame, marker: str):
    """Return (wins, losses) for home ('vs.') or away ('@') games."""
    if df_games.empty or 'MATCHUP' not in df_games.columns:
        return 0, 0
    subset = df_games[df_games['MATCHUP'].str.contains(marker)]
    wins = int((subset['WL'] == 'W').sum())
    return wins, len(subset) - wins


def _build_cumulative_game_data(df_games: pd.DataFrame) -> List[Dict[str, Any]]:
    """Build chronological cumulative win/loss trend from a game log DataFrame."""
    data = []
    cum_wins = 0
    cum_losses = 0
    for idx, (_, game) in enumerate(df_games.iloc[::-1].iterrows()):
        if game['WL'] == 'W':
            cum_wins += 1
        else:
            cum_losses += 1
        data.append({
            'game_num': idx + 1,
            'wins': cum_wins,
            'losses': cum_losses,
            'pts': int(game['PTS']),
            'date': game['GAME_DATE'],
        })
    return data


def _build_comparison_data(
    items: List[Dict[str, Any]],
    categories: List[str],
    name_key: str,
) -> List[Dict[str, Any]]:
    """
    Build a radar/bar-chart-friendly comparison list.

    Each element has a 'stat' key plus one key per item (keyed by *name_key*).
    """
    result = []
    for cat in categories:
        point: Dict[str, Any] = {'stat': cat.upper().replace('_PCT', '%')}
        for item in items:
            point[item[name_key]] = item.get(cat, 0)
        result.append(point)
    return result
