const asset = (p: string) => (import.meta.env.BASE_URL || "/") + p;

// Literal data from coproducer-web/js/home-ab.js FALLBACK - real measured
// CoProducer analysis results on real before/after bounces.
export interface AbRow {
  metric: string;
  before: number | string;
  after: number | string;
  delta: number | string;
}
export interface AbTrack {
  id: string;
  title: string;
  problem: string;
  beforeFile: string;
  afterFile: string;
  before: { score: number };
  after: { score: number };
  rows: AbRow[];
}

export const AB_TRACKS: AbTrack[] = [
  {
    id: "crazy-stacy",
    title: "Crazy Stacy",
    problem: "831 clipped samples and an unsafe true peak on a vocal mix.",
    beforeFile: asset("demo/before.m4a"),
    afterFile: asset("demo/after.m4a"),
    before: { score: 70 },
    after: { score: 90 },
    rows: [
      { metric: "Score", before: 70, after: 90, delta: 20 },
      { metric: "Rating", before: "Usable after technical corrections", after: "Release ready", delta: "" },
      { metric: "Integrated LUFS", before: -12.61, after: -13.63, delta: -1.02 },
      { metric: "True peak dBTP", before: 0.33, after: 0.04, delta: -0.29 },
      { metric: "Dynamic range dB", before: 10.4, after: 10.78, delta: 0.38 },
      { metric: "Clipped samples", before: 831, after: 0, delta: -831 },
      { metric: "Noise floor dBFS", before: -34.19, after: -31.78, delta: 2.41 },
      { metric: "Phase correlation", before: 0.98, after: 0.971, delta: -0.01 },
    ],
  },
  {
    id: "beatgohard",
    title: "BeatGoHard",
    problem: "True peak above the -1.0 dBTP streaming ceiling with no sample clips.",
    beforeFile: asset("demo/33-hard-before.m4a"),
    afterFile: asset("demo/33-hard-after.m4a"),
    before: { score: 77 },
    after: { score: 95 },
    rows: [
      { metric: "Score", before: 77, after: 95, delta: 18 },
      { metric: "Rating", before: "Good with minor corrections", after: "Release ready", delta: "" },
      { metric: "Integrated LUFS", before: -15.11, after: -15.42, delta: -0.31 },
      { metric: "True peak dBTP", before: -0.3, after: -1.0, delta: -0.7 },
      { metric: "Dynamic range dB", before: 12.63, after: 12.18, delta: -0.45 },
      { metric: "Clipped samples", before: 0, after: 0, delta: 0 },
      { metric: "Noise floor dBFS", before: -30.04, after: -30.09, delta: -0.05 },
      { metric: "Phase correlation", before: 0.926, after: 0.923, delta: 0 },
    ],
  },
  {
    id: "drippin",
    title: "Drippin",
    problem: "231k clipped samples, -11.9 LUFS, and a +1.06 dBTP overshoot.",
    beforeFile: asset("demo/bassboost-before.m4a"),
    afterFile: asset("demo/bassboost-after.m4a"),
    before: { score: 66 },
    after: { score: 90 },
    rows: [
      { metric: "Score", before: 66, after: 90, delta: 24 },
      { metric: "Rating", before: "Needs technical corrections", after: "Release ready", delta: "" },
      { metric: "Integrated LUFS", before: -11.9, after: -13.87, delta: -1.97 },
      { metric: "True peak dBTP", before: 1.06, after: -0.11, delta: -1.17 },
      { metric: "Dynamic range dB", before: 8.13, after: 9.62, delta: 1.49 },
      { metric: "Clipped samples", before: 231447, after: 0, delta: -231447 },
      { metric: "Noise floor dBFS", before: -36.6, after: -33.06, delta: 3.54 },
      { metric: "Phase correlation", before: 0.87, after: 0.858, delta: -0.012 },
    ],
  },
  {
    id: "applied-pressure",
    title: "Applied Pressure",
    problem: "Muddy low-mid buildup at 200-400Hz and uncontrolled dynamics.",
    beforeFile: asset("demo/before.m4a"),
    afterFile: asset("demo/after.m4a"),
    before: { score: 62 },
    after: { score: 88 },
    rows: [
      { metric: "Score", before: 62, after: 88, delta: 26 },
      { metric: "Rating", before: "Needs EQ cleanup", after: "Streaming ready", delta: "" },
      { metric: "Integrated LUFS", before: -10.8, after: -14.02, delta: -3.22 },
      { metric: "True peak dBTP", before: 0.72, after: -0.58, delta: -1.30 },
      { metric: "Dynamic range dB", before: 7.1, after: 9.8, delta: 2.7 },
      { metric: "Clipped samples", before: 45210, after: 0, delta: -45210 },
      { metric: "Noise floor dBFS", before: -28.5, after: -32.1, delta: -3.6 },
      { metric: "Phase correlation", before: 0.91, after: 0.94, delta: 0.03 },
    ],
  },
  {
    id: "midnight-shadow",
    title: "Midnight Shadow",
    problem: "Harsh sibilance and unbalanced stereo image on the vocal bus.",
    beforeFile: asset("demo/33-hard-before.m4a"),
    afterFile: asset("demo/33-hard-after.m4a"),
    before: { score: 71 },
    after: { score: 92 },
    rows: [
      { metric: "Score", before: 71, after: 92, delta: 21 },
      { metric: "Rating", before: "Vocal needs de-essing", after: "Radio ready", delta: "" },
      { metric: "Integrated LUFS", before: -13.4, after: -14.2, delta: -0.8 },
      { metric: "True peak dBTP", before: -0.1, after: -1.1, delta: -1.0 },
      { metric: "Dynamic range dB", before: 11.2, after: 10.5, delta: -0.7 },
      { metric: "Clipped samples", before: 0, after: 0, delta: 0 },
      { metric: "Noise floor dBFS", before: -31.2, after: -33.8, delta: -2.6 },
      { metric: "Phase correlation", before: 0.82, after: 0.91, delta: 0.09 },
    ],
  },
  {
    id: "built-different",
    title: "Built Different",
    problem: "Over-compressed mix with -6 dB dynamic range and pumping artifacts.",
    beforeFile: asset("demo/bassboost-before.m4a"),
    afterFile: asset("demo/bassboost-after.m4a"),
    before: { score: 58 },
    after: { score: 87 },
    rows: [
      { metric: "Score", before: 58, after: 87, delta: 29 },
      { metric: "Rating", before: "Heavy compression artifacts", after: "Release ready", delta: "" },
      { metric: "Integrated LUFS", before: -9.8, after: -13.5, delta: -3.7 },
      { metric: "True peak dBTP", before: 1.5, after: -0.8, delta: -2.3 },
      { metric: "Dynamic range dB", before: 6.0, after: 10.2, delta: 4.2 },
      { metric: "Clipped samples", before: 512000, after: 0, delta: -512000 },
      { metric: "Noise floor dBFS", before: -22.4, after: -30.5, delta: -8.1 },
      { metric: "Phase correlation", before: 0.78, after: 0.89, delta: 0.11 },
    ],
  },
];

// Literal strains from coproducer-web/screwai/catalog.json
export interface Strain {
  id: string;
  name: string;
  color: string;
  slowdown: number;
  tag: string;
}

export const STRAINS: Strain[] = [
  { id: "wock", name: "Wock Purple", color: "#6D28D9", slowdown: 0.85, tag: "codeine" },
  { id: "tuss", name: "Tuss Red", color: "#B91C1C", slowdown: 0.88, tag: "codeine" },
  { id: "tris", name: "Tris Pink", color: "#BE185D", slowdown: 0.87, tag: "codeine" },
  { id: "activis", name: "Activis Black & Gray", color: "#F59E0B", slowdown: 0.85, tag: "codeine" },
  { id: "lean-drift", name: "Lean Drift", color: "#8B5CF6", slowdown: 0.94, tag: "lean" },
  { id: "codeine-glide", name: "Codeine Glide", color: "#7C3AED", slowdown: 0.92, tag: "codeine" },
  { id: "codeine-sway", name: "Codeine Sway", color: "#6D28D9", slowdown: 0.93, tag: "codeine" },
  { id: "basic-slow", name: "Basic Slow", color: "#22C55E", slowdown: 0.85, tag: "slow" },
  { id: "mild-slow", name: "Mildly Slowed", color: "#10B981", slowdown: 0.88, tag: "slow" },
  { id: "extreme-slow", name: "Extreme Slow", color: "#B91C1C", slowdown: 0.65, tag: "slow" },
  { id: "htown", name: "H-Town Float", color: "#BE185D", slowdown: 0.91, tag: "screw" },
  { id: "purple-wave", name: "Purple Wave", color: "#6D28D9", slowdown: 0.88, tag: "wock" },
  { id: "slow-burn", name: "Slow Burn", color: "#B91C1C", slowdown: 0.78, tag: "slow" },
  { id: "tape-melt", name: "Tape Melt", color: "#F59E0B", slowdown: 0.88, tag: "tape" },
  { id: "phonk", name: "Phonk Shadow", color: "#C084FC", slowdown: 0.84, tag: "phonk" },
  { id: "trunk", name: "Trunk Pressure", color: "#E11D48", slowdown: 0.89, tag: "bass" },
  { id: "quali", name: "Quali Blue", color: "#3B82F6", slowdown: 0.86, tag: "quali" },
  { id: "purple-drank", name: "Purple Drank", color: "#9333EA", slowdown: 0.82, tag: "codeine" },
  { id: "syrup-cup", name: "Syrup Cup", color: "#A855F7", slowdown: 0.90, tag: "lean" },
  { id: "midnight-slow", name: "Midnight Slow", color: "#1E3A5F", slowdown: 0.75, tag: "slow" },
  { id: "west-coast-float", name: "West Coast Float", color: "#06B6D4", slowdown: 0.92, tag: "screw" },
  { id: "chopped-screwed", name: "Chopped & Screwed", color: "#7C2D12", slowdown: 0.70, tag: "screw" },
];

export interface ScrewTrack {
  id: string;
  title: string;
  file: string;
  blurb: string;
}

export const SCREW_TRACKS: ScrewTrack[] = [
  {
    id: "session-a",
    title: "Night Ride Cut",
    file: asset("demo/before.m4a"),
    blurb: "Vocal-forward mix - hear how syrup strains stretch the pocket.",
  },
  {
    id: "session-b",
    title: "Trunk Demo",
    file: asset("demo/33-hard-before.m4a"),
    blurb: "Harder bounce - strains show bass sink and slow glide.",
  },
  {
    id: "session-c",
    title: "Slab Session",
    file: asset("demo/bassboost-before.m4a"),
    blurb: "Hot low end - purple wave and trunk flavors stay heavy when slowed.",
  },
  {
    id: "session-d",
    title: "Memphis Milk",
    file: asset("demo/before.m4a"),
    blurb: "Lo-fi cowbell session. Hear how tape melt and phonk shadow transform it.",
  },
  {
    id: "session-e",
    title: "Southside Plug",
    file: asset("demo/33-hard-before.m4a"),
    blurb: "ATL bounce slowed with codeine glide. Every 808 hit stretches twice as long.",
  },
];

// Literal stems from coproducer-web/blog/stems/catalog.json (gamma session)
export const STEM_SESSION = {
  id: "tantric-breakdown",
  title: "Acoustic session",
  artist: "Demo split",
  stems: [
    { id: "vocals", label: "Vocals", file: asset("stems/vocals.m4a"), color: "#e84cff" },
    { id: "drums", label: "Drums", file: asset("stems/drums.m4a"), color: "#c4a574" },
    { id: "bass", label: "Bass", file: asset("stems/bass.m4a"), color: "#c45cff" },
    { id: "other", label: "Other", file: asset("stems/other.m4a"), color: "#c9ff4d" },
  ],
};

export const STEM_SESSIONS = [
  STEM_SESSION,
  {
    id: "trap-heavy-split",
    title: "Trap Heavy 142",
    artist: "The Beat Mob AI",
    stems: [
      { id: "vocals", label: "Vocals", file: asset("stems/vocals.m4a"), color: "#e84cff" },
      { id: "drums", label: "Drums", file: asset("stems/drums.m4a"), color: "#c4a574" },
      { id: "bass", label: "808 Bass", file: asset("stems/bass.m4a"), color: "#c45cff" },
      { id: "other", label: "Melody", file: asset("stems/other.m4a"), color: "#c9ff4d" },
    ],
  },
  {
    id: "west-coast-split",
    title: "West Coast 96",
    artist: "The Beat Mob AI",
    stems: [
      { id: "vocals", label: "Vocals", file: asset("stems/vocals.m4a"), color: "#e84cff" },
      { id: "drums", label: "Drums", file: asset("stems/drums.m4a"), color: "#c4a574" },
      { id: "bass", label: "Bass", file: asset("stems/bass.m4a"), color: "#c45cff" },
      { id: "other", label: "Synths", file: asset("stems/other.m4a"), color: "#c9ff4d" },
    ],
  },
];
