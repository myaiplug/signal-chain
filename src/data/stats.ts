// STREAMING PROOF - edit these to match your latest numbers.
// Rough counts across platforms; the counter rounds and animates anyway.
export const STREAM_STATS = {
  spotify: {
    label: "SPOTIFY",
    plays: 340_000, // White Gary Payton ~300K + Struggle ~30K + catalog
    note: "THE BEAT MOB · bTHIRTYthreezy · GREEN THUMBZ",
  },
  apple: {
    label: "APPLE MUSIC",
    plays: 100_000, // Ceasa Matic catalog
    note: "CEASA MATIC · ALBUM CATALOG",
  },
  youtube: {
    label: "YOUTUBE",
    plays: 60_000, // Ceasa Matic videos + Beat Mob channel
    note: "CEASA MATIC VISUALS · THE BEAT MOB",
  },
};

export const TOTAL_PLAYS = Object.values(STREAM_STATS).reduce((a, s) => a + s.plays, 0);
