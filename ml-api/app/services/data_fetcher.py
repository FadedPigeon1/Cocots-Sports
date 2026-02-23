"""
Backward-compatible re-export shim.

All business logic has been split into focused modules:
  - app.services.games_service   -> scheduled games, recent results, live data
  - app.services.teams_service   -> standings, team details, game data, comparisons
  - app.services.players_service -> player details, stats, comparisons
  - app.services.constants       -> CUSTOM_HEADERS, season IDs, DEFAULT_SEASON

Existing imports from this module continue to work unchanged.
"""

# Games
from app.services.games_service import (  # noqa: F401
    get_scheduled_games,
    get_recent_games,
    fetch_live_game_data,
)

# Teams
from app.services.teams_service import (  # noqa: F401
    get_current_season,
    get_team_conference,
    get_conference_team_ids,
    get_all_nba_teams,
    get_current_standings,
    get_team_details,
    fetch_game_data,
    fetch_team_roster,
    get_team_season_stats,
    compare_teams,
    get_team_historical_comparison,
)

# Players
from app.services.players_service import (  # noqa: F401
    get_top_players,
    find_player_by_name,
    fetch_player_stats,
    get_player_details,
    get_player_season_stats,
    compare_players,
    get_player_historical_comparison,
)

# Constants (re-exported for any code that imports them from here)
from app.services.constants import (  # noqa: F401
    CUSTOM_HEADERS,
    DEFAULT_SEASON,
    EAST_TEAM_IDS,
    WEST_TEAM_IDS,
)
