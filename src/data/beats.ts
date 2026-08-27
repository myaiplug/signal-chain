const asset = (p: string) => (import.meta.env.BASE_URL || "/") + p;

export interface Beat {
  id: string;
  title: string;
  bpm: number;
  key: string;
  genre: string;
  tags: string[];
  file: string;
  duration: number;
  sizeMB: number;
  waveformPeaks: number[];
  lufs: number;
  truePeak: number;
  dynamicRange: number;
  stemFiles?: {
    drums: string;
    bass: string;
    melody: string;
    vocals?: string;
  };
  license: 'lease' | 'exclusive' | 'unlimited';
  price: {
    single: number;
    bundle5: number;
    bundle10: number;
  };
  description: string;
  producedBy: string;
  releaseDate: string;
}

export const BEATS: Beat[] = [
  {
    id: 'ai-trap-heavy-142',
    title: 'AI Trap Heavy 142',
    bpm: 142,
    key: 'F# Minor',
    genre: 'Trap',
    tags: ['AI-generated', 'Heavy 808s', 'Dark', 'Workout'],
    file: asset('beats/trap-heavy-142-v1.m4a'),
    duration: 138,
    sizeMB: 1.90,
    waveformPeaks: [],
    lufs: -11.2,
    truePeak: -0.8,
    dynamicRange: 8.5,
    license: 'unlimited',
    price: { single: 19.99, bundle5: 69.99, bundle10: 99.99 },
    description: 'AI-crafted trap banger with thunderous 808s, haunting melody, and crisp hi-hats. Generated at 142 BPM for maximum energy. Perfect for dark trap, drill, or high-energy workout playlists.',
    producedBy: 'The Beat Mob AI',
    releaseDate: '2026-06-11',
  },
  {
    id: 'ai-west-coast-96',
    title: 'AI West Coast 96',
    bpm: 96,
    key: 'G Major',
    genre: 'West Coast Hip Hop',
    tags: ['AI-generated', 'G-Funk', 'Smooth', 'Cruising'],
    file: asset('beats/west-coast-96.m4a'),
    duration: 138,
    sizeMB: 2.90,
    waveformPeaks: [],
    lufs: -12.8,
    truePeak: -1.2,
    dynamicRange: 9.2,
    license: 'unlimited',
    price: { single: 19.99, bundle5: 69.99, bundle10: 99.99 },
    description: 'Classic West Coast vibe at 96 BPM. Warm synth leads, deep funk bassline, and swung drums. Built for laid-back storytelling, cruising music, or smooth hook-driven tracks.',
    producedBy: 'The Beat Mob AI',
    releaseDate: '2026-06-13',
  },
  {
    id: 'west-coast-96',
    title: 'West Coast 96 (M4A)',
    bpm: 96,
    key: 'G Major',
    genre: 'West Coast Hip Hop',
    tags: ['G-Funk', 'Smooth', 'Cruising', 'Alternate Mix'],
    file: asset('beats/west-coast-96.m4a'),
    duration: 138,
    sizeMB: 2.90,
    waveformPeaks: [],
    lufs: -13.1,
    truePeak: -1.0,
    dynamicRange: 8.8,
    license: 'unlimited',
    price: { single: 19.99, bundle5: 69.99, bundle10: 99.99 },
    description: 'Alternate compressed mix of the West Coast 96 session. Same vibe, smaller footprint. Great for quick demos or streaming-ready delivery.',
    producedBy: 'The Beat Mob AI',
    releaseDate: '2026-08-24',
  },
  {
    id: 'south-memphis-78-alt',
    title: 'South Memphis 78 (Alt)',
    bpm: 78,
    key: 'D Minor',
    genre: 'Memphis Phonk / Trap',
    tags: ['Phonk', 'Slow', 'Dark', 'Cowbell', 'Alternate'],
    file: asset('beats/south-memphis-78-alt.m4a'),
    duration: 142,
    sizeMB: 2.64,
    waveformPeaks: [],
    lufs: -10.5,
    truePeak: -0.5,
    dynamicRange: 7.8,
    license: 'unlimited',
    price: { single: 19.99, bundle5: 69.99, bundle10: 99.99 },
    description: 'Alternate take on the South Memphis 78 phonk session. Heavier cowbell, deeper 808 saturation, darker atmosphere. Classic Memphis sound at half-time tempo.',
    producedBy: 'The Beat Mob AI',
    releaseDate: '2026-08-24',
  },
  {
    id: 'cross-bang',
    title: 'Cross Bang',
    bpm: 138,
    key: 'A Minor',
    genre: 'Trap / Drill',
    tags: ['Aggressive', 'Drill', 'UK Influence', 'High Energy'],
    file: asset('beats/cross-bang.m4a'),
    duration: 128,
    sizeMB: 1.96,
    waveformPeaks: [],
    lufs: -9.8,
    truePeak: -0.3,
    dynamicRange: 6.5,
    license: 'unlimited',
    price: { single: 19.99, bundle5: 69.99, bundle10: 99.99 },
    description: 'UK drill meets US trap. Sliding 808s, rapid hi-hat triplets, menacing piano stabs. Built for aggressive flows and high-impact drops.',
    producedBy: 'The Beat Mob AI',
    releaseDate: '2026-08-24',
  },
  {
    id: 'detroit-85',
    title: 'Detroit 85',
    bpm: 85,
    key: 'C# Minor',
    genre: 'Detroit Hip Hop / Boom Bap',
    tags: ['Boom Bap', 'Soulful', 'Sample-based Feel', 'Jazz Chords'],
    file: asset('beats/detroit-85.m4a'),
    duration: 132,
    sizeMB: 1.96,
    waveformPeaks: [],
    lufs: -13.5,
    truePeak: -1.5,
    dynamicRange: 10.2,
    license: 'unlimited',
    price: { single: 19.99, bundle5: 69.99, bundle10: 99.99 },
    description: 'Soulful Detroit boom bap at 85 BPM. Dusty drums, jazz chord progressions, warm vinyl texture. Made for conscious lyrics and storytelling.',
    producedBy: 'The Beat Mob AI',
    releaseDate: '2026-08-24',
  },
  {
    id: 'east-coast-98',
    title: 'East Coast 98',
    bpm: 98,
    key: 'Bb Minor',
    genre: 'East Coast Hip Hop / Boom Bap',
    tags: ['Boom Bap', 'Golden Era', 'Piano Loop', 'Hard Drums'],
    file: asset('beats/east-coast-98.m4a'),
    duration: 130,
    sizeMB: 1.92,
    waveformPeaks: [],
    lufs: -12.1,
    truePeak: -0.9,
    dynamicRange: 8.9,
    license: 'unlimited',
    price: { single: 19.99, bundle5: 69.99, bundle10: 99.99 },
    description: 'Classic 90s East Coast boom bap. Piano-driven loop, punchy kick/snare, deep bass. Authentic golden era sound for pure lyricism.',
    producedBy: 'The Beat Mob AI',
    releaseDate: '2026-08-24',
  },
  {
    id: 'heater',
    title: 'Heater',
    bpm: 140,
    key: 'E Minor',
    genre: 'Trap / Club',
    tags: ['Club', 'High Energy', 'Festival', 'Anthem'],
    file: asset('beats/heater.m4a'),
    duration: 135,
    sizeMB: 1.92,
    waveformPeaks: [],
    lufs: -10.2,
    truePeak: -0.6,
    dynamicRange: 7.2,
    license: 'unlimited',
    price: { single: 19.99, bundle5: 69.99, bundle10: 99.99 },
    description: 'Festival-ready trap heater at 140 BPM. Massive drop, euphoric lead, rolling bass. Designed for main stage energy and crowd reaction.',
    producedBy: 'The Beat Mob AI',
    releaseDate: '2026-08-24',
  },
  {
    id: 'modern-hiphop-105',
    title: 'Modern Hip Hop 105',
    bpm: 105,
    key: 'F Minor',
    genre: 'Modern Hip Hop / Trap',
    tags: ['Contemporary', 'Melodic', 'Versatile', 'Radio-ready'],
    file: asset('beats/modern-hiphop-105.m4a'),
    duration: 132,
    sizeMB: 1.89,
    waveformPeaks: [],
    lufs: -12.5,
    truePeak: -1.1,
    dynamicRange: 8.4,
    license: 'unlimited',
    price: { single: 19.99, bundle5: 69.99, bundle10: 99.99 },
    description: 'Contemporary melodic trap at 105 BPM. Emotional chord progression, modern drum programming, space for vocals. Radio-ready structure with intro/hook/verse/bridge.',
    producedBy: 'The Beat Mob AI',
    releaseDate: '2026-08-24',
  },
  {
    id: 'play-4-bahb',
    title: 'Play 4 Bahb',
    bpm: 132,
    key: 'G# Minor',
    genre: 'Trap / Drill',
    tags: ['Drill', 'Sliding 808s', 'Dark', 'UK Style'],
    file: asset('beats/play-4-bahb.m4a'),
    duration: 128,
    sizeMB: 1.92,
    waveformPeaks: [],
    lufs: -10.0,
    truePeak: -0.4,
    dynamicRange: 6.8,
    license: 'unlimited',
    price: { single: 19.99, bundle5: 69.99, bundle10: 99.99 },
    description: 'UK drill influenced trap with signature sliding 808s and syncopated hi-hats. Dark, menacing atmosphere for aggressive delivery.',
    producedBy: 'The Beat Mob AI',
    releaseDate: '2026-08-24',
  },
  {
    id: 'south-atlanta-130-v1',
    title: 'South Atlanta 130 (v1)',
    bpm: 130,
    key: 'A Minor',
    genre: 'Atlanta Trap',
    tags: ['Atlanta', 'Trap', 'Zaytoven Style', 'Bell Melody'],
    file: asset('beats/south-atlanta-130-v1.m4a'),
    duration: 132,
    sizeMB: 1.95,
    waveformPeaks: [],
    lufs: -11.8,
    truePeak: -0.7,
    dynamicRange: 8.1,
    license: 'unlimited',
    price: { single: 19.99, bundle5: 69.99, bundle10: 99.99 },
    description: 'Zaytoven-inspired Atlanta trap at 130 BPM. Sparkling bell melody, rolling hi-hats, deep 808s. Classic South sound for melodic trap flows.',
    producedBy: 'The Beat Mob AI',
    releaseDate: '2026-08-24',
  },
  {
    id: 'south-atlanta-130-v2',
    title: 'South Atlanta 130 (v2)',
    bpm: 130,
    key: 'A Minor',
    genre: 'Atlanta Trap',
    tags: ['Atlanta', 'Trap', 'Alternate Mix', 'Different Drums'],
    file: asset('beats/south-atlanta-130-v2.m4a'),
    duration: 132,
    sizeMB: 1.94,
    waveformPeaks: [],
    lufs: -11.8,
    truePeak: -0.7,
    dynamicRange: 8.1,
    license: 'unlimited',
    price: { single: 19.99, bundle5: 69.99, bundle10: 99.99 },
    description: 'Alternate drum pattern on the South Atlanta 130 session. Same melody, different pocket. Gives you options for different vocal approaches.',
    producedBy: 'The Beat Mob AI',
    releaseDate: '2026-08-24',
  },
  {
    id: 'south-atlanta-130-v3',
    title: 'South Atlanta 130 (v3)',
    bpm: 130,
    key: 'A Minor',
    genre: 'Atlanta Trap',
    tags: ['Atlanta', 'Trap', 'Minimal', 'Space for Vocals'],
    file: asset('beats/south-atlanta-130-v3.m4a'),
    duration: 132,
    sizeMB: 1.95,
    waveformPeaks: [],
    lufs: -12.2,
    truePeak: -1.0,
    dynamicRange: 8.5,
    license: 'unlimited',
    price: { single: 19.99, bundle5: 69.99, bundle10: 99.99 },
    description: 'Stripped-back version with more space for vocals. Minimal drum arrangement, melody takes center stage. Ideal for melodic rappers and singers.',
    producedBy: 'The Beat Mob AI',
    releaseDate: '2026-08-24',
  },
  {
    id: 'south-memphis-78',
    title: 'South Memphis 78',
    bpm: 78,
    key: 'D Minor',
    genre: 'Memphis Phonk / Trap',
    tags: ['Phonk', 'Slow', 'Dark', 'Cowbell', 'Classic'],
    file: asset('beats/south-memphis-78.m4a'),
    duration: 128,
    sizeMB: 1.89,
    waveformPeaks: [],
    lufs: -10.8,
    truePeak: -0.6,
    dynamicRange: 7.5,
    license: 'unlimited',
    price: { single: 19.99, bundle5: 69.99, bundle10: 99.99 },
    description: 'Authentic Memphis phonk at half-time 78 BPM. Distorted cowbell, lo-fi texture, sinking 808s. The sound that defined an underground movement.',
    producedBy: 'The Beat Mob AI',
    releaseDate: '2026-08-24',
  },
  {
    id: 'this-one-slaps',
    title: 'This One Slaps',
    bpm: 136,
    key: 'C Minor',
    genre: 'Trap / Banger',
    tags: ['Banger', 'Hard', 'Simple', 'Effective'],
    file: asset('beats/this-one-slaps.m4a'),
    duration: 130,
    sizeMB: 1.94,
    waveformPeaks: [],
    lufs: -9.5,
    truePeak: -0.2,
    dynamicRange: 6.2,
    license: 'unlimited',
    price: { single: 19.99, bundle5: 69.99, bundle10: 99.99 },
    description: 'Straight-up banger. No frills, just hard-hitting drums and a hypnotic loop. Sometimes simple hits hardest.',
    producedBy: 'The Beat Mob AI',
    releaseDate: '2026-08-24',
  },
  {
    id: 'trap-heavy-142-v1',
    title: 'Trap Heavy 142 (v1)',
    bpm: 142,
    key: 'F# Minor',
    genre: 'Trap',
    tags: ['Heavy', 'Dark', 'Version 1', 'Raw'],
    file: asset('beats/trap-heavy-142-v1.m4a'),
    duration: 128,
    sizeMB: 1.89,
    waveformPeaks: [],
    lufs: -11.0,
    truePeak: -0.8,
    dynamicRange: 7.5,
    license: 'unlimited',
    price: { single: 19.99, bundle5: 69.99, bundle10: 99.99 },
    description: 'First take on the 142 BPM heavy trap session. Raw energy, minimal processing. Captures the initial spark.',
    producedBy: 'The Beat Mob AI',
    releaseDate: '2026-08-24',
  },
  {
    id: 'trap-heavy-142-v3',
    title: 'Trap Heavy 142 (v3)',
    bpm: 142,
    key: 'F# Minor',
    genre: 'Trap',
    tags: ['Heavy', 'Polished', 'Version 3', 'Refined'],
    file: asset('beats/trap-heavy-142-v3.m4a'),
    duration: 130,
    sizeMB: 1.91,
    waveformPeaks: [],
    lufs: -11.5,
    truePeak: -1.0,
    dynamicRange: 7.8,
    license: 'unlimited',
    price: { single: 19.99, bundle5: 69.99, bundle10: 99.99 },
    description: 'Refined version with better mix balance. 808 sits cleaner, hi-hats more defined. Production polish on the same core idea.',
    producedBy: 'The Beat Mob AI',
    releaseDate: '2026-08-24',
  },
  {
    id: 'trap-heavy-142-v5',
    title: 'Trap Heavy 142 (v5)',
    bpm: 142,
    key: 'F# Minor',
    genre: 'Trap',
    tags: ['Heavy', 'Final', 'Version 5', 'Mastered'],
    file: asset('beats/trap-heavy-142-v5.m4a'),
    duration: 132,
    sizeMB: 1.88,
    waveformPeaks: [],
    lufs: -12.0,
    truePeak: -1.1,
    dynamicRange: 8.0,
    license: 'unlimited',
    price: { single: 19.99, bundle5: 69.99, bundle10: 99.99 },
    description: 'Final mastered version of the 142 BPM trap session. Streaming-ready loudness, polished transients, maximum impact.',
    producedBy: 'The Beat Mob AI',
    releaseDate: '2026-08-24',
  },
];

export const BUNDLE_TIERS = [
  {
    id: 'single',
    name: 'Single Beat',
    count: 1,
    price: 0, // per-beat price varies
    savings: 0,
    description: 'Pick any single beat',
    badge: null,
  },
  {
    id: 'bundle5',
    name: '5-Beat Bundle',
    count: 5,
    price: 99.99, // fixed for premium, 69.99 for standard
    savings: 50,
    description: 'Mix & match any 5 beats — save ~$50',
    badge: 'BEST VALUE',
  },
  {
    id: 'bundle10',
    name: '10-Beat Bundle + 3 FREE',
    count: 13,
    price: 149.99, // fixed for premium, 99.99 for standard
    savings: 120,
    description: 'Get 10 beats + 3 FREE — save $120+',
    badge: 'MAX SAVINGS',
  },
];

export function calculateBundlePrice(beatIds: string[], tierId: string): { total: number; savings: number; freeCount: number } {
  const beats = beatIds.map(id => BEATS.find(b => b.id === id)).filter(Boolean) as Beat[];
  if (beats.length === 0) return { total: 0, savings: 0, freeCount: 0 };

  const isPremium = beats.some(b => b.sizeMB > 10); // WAV files are premium

  if (tierId === 'single') {
    const total = beats.reduce((sum, b) => sum + b.price.single, 0);
    return { total, savings: 0, freeCount: 0 };
  }

  if (tierId === 'bundle5') {
    const price = isPremium ? 99.99 : 69.99;
    const individualTotal = beats.slice(0, 5).reduce((sum, b) => sum + b.price.single, 0);
    return { total: price, savings: individualTotal - price, freeCount: 0 };
  }

  if (tierId === 'bundle10') {
    const price = isPremium ? 149.99 : 99.99;
    const individualTotal = beats.slice(0, 10).reduce((sum, b) => sum + b.price.single, 0);
    return { total: price, savings: individualTotal + (3 * beats[0]?.price.single || 0) - price, freeCount: 3 };
  }

  return { total: 0, savings: 0, freeCount: 0 };
}

export function getBeatsByGenre(genre: string): Beat[] {
  return BEATS.filter(b => b.genre.toLowerCase().includes(genre.toLowerCase()));
}

export function getBeatsByBPM(min: number, max: number): Beat[] {
  return BEATS.filter(b => b.bpm >= min && b.bpm <= max);
}

export function searchBeats(query: string): Beat[] {
  const q = query.toLowerCase();
  return BEATS.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.genre.toLowerCase().includes(q) ||
    b.tags.some(t => t.toLowerCase().includes(q)) ||
    b.key.toLowerCase().includes(q)
  );
}