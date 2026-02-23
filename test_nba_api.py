from nba_api.stats.endpoints import leaguedashteamstats
import time

CUSTOM_HEADERS = {
    'Host': 'stats.nba.com',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Origin': 'https://www.nba.com',
    'Referer': 'https://www.nba.com/',
    'Connection': 'keep-alive',
}

try:
    print("Fetching without headers...")
    stats = leaguedashteamstats.LeagueDashTeamStats(season="2024-25", timeout=10)
    print("Success!")
except Exception as e:
    print(f"Failed: {e}")

time.sleep(2)

try:
    print("Fetching with headers...")
    stats = leaguedashteamstats.LeagueDashTeamStats(season="2024-25", headers=CUSTOM_HEADERS, timeout=10)
    print("Success!")
except Exception as e:
    print(f"Failed: {e}")
