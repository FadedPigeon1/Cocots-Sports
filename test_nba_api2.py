from nba_api.stats.endpoints import leaguedashteamstats
import time

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

try:
    print("Fetching with new headers...")
    stats = leaguedashteamstats.LeagueDashTeamStats(season="2024-25", headers=CUSTOM_HEADERS, timeout=10)
    print("Success!")
    print(stats.get_data_frames()[0].head(1))
except Exception as e:
    print(f"Failed: {e}")
