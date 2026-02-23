// NBA Teams Data - shared across components
export const EASTERN_CONFERENCE = [
  { name: "Atlanta Hawks", id: "1610612737", abbr: "ATL" },
  { name: "Boston Celtics", id: "1610612738", abbr: "BOS" },
  { name: "Brooklyn Nets", id: "1610612751", abbr: "BKN" },
  { name: "Charlotte Hornets", id: "1610612766", abbr: "CHA" },
  { name: "Chicago Bulls", id: "1610612741", abbr: "CHI" },
  { name: "Cleveland Cavaliers", id: "1610612739", abbr: "CLE" },
  { name: "Detroit Pistons", id: "1610612765", abbr: "DET" },
  { name: "Indiana Pacers", id: "1610612754", abbr: "IND" },
  { name: "Miami Heat", id: "1610612748", abbr: "MIA" },
  { name: "Milwaukee Bucks", id: "1610612749", abbr: "MIL" },
  { name: "New York Knicks", id: "1610612752", abbr: "NYK" },
  { name: "Orlando Magic", id: "1610612753", abbr: "ORL" },
  { name: "Philadelphia 76ers", id: "1610612755", abbr: "PHI" },
  { name: "Toronto Raptors", id: "1610612761", abbr: "TOR" },
  { name: "Washington Wizards", id: "1610612764", abbr: "WAS" },
];

export const WESTERN_CONFERENCE = [
  { name: "Dallas Mavericks", id: "1610612742", abbr: "DAL" },
  { name: "Denver Nuggets", id: "1610612743", abbr: "DEN" },
  { name: "Golden State Warriors", id: "1610612744", abbr: "GSW" },
  { name: "Houston Rockets", id: "1610612745", abbr: "HOU" },
  { name: "LA Clippers", id: "1610612746", abbr: "LAC" },
  { name: "LA Lakers", id: "1610612747", abbr: "LAL" },
  { name: "Memphis Grizzlies", id: "1610612763", abbr: "MEM" },
  { name: "Minnesota Timberwolves", id: "1610612750", abbr: "MIN" },
  { name: "New Orleans Pelicans", id: "1610612740", abbr: "NOP" },
  { name: "Oklahoma City Thunder", id: "1610612760", abbr: "OKC" },
  { name: "Phoenix Suns", id: "1610612756", abbr: "PHX" },
  { name: "Portland Trail Blazers", id: "1610612757", abbr: "POR" },
  { name: "Sacramento Kings", id: "1610612758", abbr: "SAC" },
  { name: "San Antonio Spurs", id: "1610612759", abbr: "SAS" },
  { name: "Utah Jazz", id: "1610612762", abbr: "UTA" },
];

export const ALL_TEAMS = [...EASTERN_CONFERENCE, ...WESTERN_CONFERENCE];

// Colors for different items in charts
export const CHART_COLORS = [
  "#39FF14",
  "#3b82f6",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
];

// Available seasons for comparisons
export const AVAILABLE_SEASONS = [
  "2015-16",
  "2016-17",
  "2017-18",
  "2018-19",
  "2019-20",
  "2020-21",
  "2021-22",
  "2022-23",
  "2023-24",
  "2024-25",
  "2025-26",
];

// Helper to get team logo URL
export const getTeamLogo = (teamId: string | number) => {
  return `https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`;
};

// Helper to get team logo by name (for TeamTracker)
export const getTeamLogoByName = (teamName: string) => {
  const team = ALL_TEAMS.find(
    (t) => t.name === teamName || t.name.includes(teamName),
  );
  if (team) {
    return `https://cdn.nba.com/logos/nba/${team.id}/global/L/logo.svg`;
  }
  return "https://cdn.nba.com/logos/nba/1610612765/global/L/logo.svg";
};

// Shared tooltip style for Recharts
export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--foreground)",
};

export const DARK_TOOLTIP_STYLE = {
  backgroundColor: "#18181b",
  borderColor: "#27272a",
  borderRadius: "8px",
  color: "#fafafa",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
};
