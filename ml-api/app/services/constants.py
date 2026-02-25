"""Shared constants for the ml-api services layer."""

DEFAULT_SEASON = "2025-26"

# Required by stats.nba.com to avoid request blocking / timeouts
CUSTOM_HEADERS = {
    'Host': 'stats.nba.com',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
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

EAST_TEAM_IDS = [
    1610612737, 1610612738, 1610612751, 1610612766, 1610612741,
    1610612739, 1610612765, 1610612754, 1610612748, 1610612749,
    1610612752, 1610612753, 1610612755, 1610612761, 1610612764,
]

WEST_TEAM_IDS = [
    1610612742, 1610612743, 1610612744, 1610612745, 1610612746,
    1610612747, 1610612763, 1610612750, 1610612740, 1610612760,
    1610612756, 1610612757, 1610612758, 1610612759, 1610612762,
]
