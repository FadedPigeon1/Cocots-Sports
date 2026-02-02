from nba_api.stats.endpoints import scoreboardv2
from datetime import datetime, timedelta
import pandas as pd


def get_upcoming_games():
    # Get tomorrow's date
    tomorrow = datetime.now() + timedelta(days=1)
    date_str = tomorrow.strftime('%m/%d/%Y')

    print(f"Fetching games for: {date_str}")

    try:
        scoreboard = scoreboardv2.ScoreboardV2(game_date=date_str)
        games_df = scoreboard.get_data_frames()[0]

        if not games_df.empty:
            print("Columns:", games_df.columns.tolist())
            print(games_df[['GAME_DATE_EST', 'GAME_ID',
                  'HOME_TEAM_ID', 'VISITOR_TEAM_ID']].head())
            return True
        else:
            print("No games found.")
            return False

    except Exception as e:
        print(f"Error: {e}")
        return False


if __name__ == "__main__":
    get_upcoming_games()
