export interface Artist {
  id: string
  name: string
  tag: string
  role: string
  blurb: string
  /** verified Spotify artist id (open.spotify.com/artist/<id>) */
  spotifyId: string
  accent: string
  glow: string
  reelLabel: string
}

export const ARTISTS: Artist[] = [
  {
    id: "beatmob",
    name: "THE BEAT MOB",
    tag: "THE CATALOG",
    role: "Producer · Engineer · Label",
    blurb:
      "Commercial catalog composed, mixed and mastered in-house. Streamed worldwide since 2014.",
    spotifyId: "7FjwZtVHl908JjCV9QRxvz",
    accent: "#00ffaa",
    glow: "rgba(0,255,170,0.35)",
    reelLabel: "TBM-001",
  },
  {
    id: "b33",
    name: "bTHIRTYthreezy",
    tag: "THE SOLO PROJECT",
    role: "Artist · Producer · AI Vocalist",
    blurb:
      "The solo transmission. Human-in-the-loop AI vocals, surgical cleanup, analog-style mastering.",
    spotifyId: "3sAF7RfGKiuvyPAvjOm89g",
    accent: "#00d4ff",
    glow: "rgba(0,212,255,0.35)",
    reelLabel: "B33-033",
  },
  {
    id: "greenthumbz",
    name: "GREEN THUMBZ",
    tag: "THE GROW",
    role: "Artist · Full Production",
    blurb:
      "Self-produced project. Every stem grown in-house: composition, mix, master, release.",
    spotifyId: "7yx6XzC3RAXJCfKdeMLbFw",
    accent: "#9eff00",
    glow: "rgba(158,255,0,0.3)",
    reelLabel: "GTZ-420",
  },
  {
    id: "ceasa",
    name: "CEASA MATIC",
    tag: "THE ARTIST DEVELOPMENT",
    role: "Produced · Multiple Albums",
    blurb:
      "Multiple full albums produced, mixed and mastered end-to-end. Artist development, done properly.",
    spotifyId: "6i98eT9Xobt9fdgxwFaZpC",
    accent: "#ffb000",
    glow: "rgba(255,176,0,0.3)",
    reelLabel: "CMC-007",
  },
]

export const STORE_URL = "https://beat-mob-store-ruby.vercel.app/"

export const TOOL_LINKS = {
  store: STORE_URL,
  github: "https://github.com/myaiplug",
  email: "thebeatmobmedia@gmail.com",
}
