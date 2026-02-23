import re

with open('ml-api/app/services/data_fetcher.py', 'r') as f:
    content = f.read()

# Add imports and constants at the top
imports_to_add = """import pandas as pd
import time

# Custom headers required by stats.nba.com to avoid request blocking/timeouts
CUSTOM_HEADERS = {
    'Host': 'stats.nba.com',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Referer': 'https://www.nba.com/',
    'Origin': 'https://www.nba.com',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache',
}

def get_current_season(game_date=None):
    if game_date is None:
        from datetime import datetime
        game_date = datetime.now()
    current_year = game_date.year
    return f"{current_year}-{str(current_year + 1)[-2:]}" if game_date.month >= 10 else f"{current_year - 1}-{str(current_year)[-2:]}"
"""

content = content.replace('import pandas as pd', imports_to_add, 1)

# Replace season calculation
season_calc_pattern = r'current_year = game_date\.year\n\s*season = f"\{current_year\}-\{str\(current_year \+ 1\)\[-2:\]\}" if game_date\.month >= 10 else f"\{current_year - 1\}-\{str\(current_year\)\[-2:\]\}"'
content = re.sub(season_calc_pattern,
                 'season = get_current_season(game_date)', content)

# Add headers and timeout to nba_api calls
endpoints = [
    'ScoreboardV2',
    'LeagueDashTeamStats',
    'LeagueDashPlayerStats',
    'TeamGameLog',
    'PlayerGameLog',
    'CommonTeamRoster',
    'CommonPlayerInfo'
]

for endpoint in endpoints:
    # Find calls like Endpoint(param=value) and add headers=CUSTOM_HEADERS, timeout=60
    # We need to be careful about multiline calls
    pattern = r'(' + endpoint + r'\s*\([^)]+)\)'

    def replacer(match):
        inner = match.group(1)
        if 'headers=' in inner:
            return match.group(0)
        if inner.endswith('('):
            return inner + 'headers=CUSTOM_HEADERS, timeout=60)'
        else:
            return inner + ', headers=CUSTOM_HEADERS, timeout=60)'

    content = re.sub(pattern, replacer, content)

with open('ml-api/app/services/data_fetcher.py', 'w') as f:
    f.write(content)

print("Refactoring complete.")
