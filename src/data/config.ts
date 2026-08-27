export type Artist = {
  id: string
  name: string
  tag: string
  role: string
  blurb: string
  spotifyId: string
  accent: string
  glow: string
  reelHue: string
}

export const ARTISTS: Artist[] = [
  {
    id: 'beatmob',
    name: 'THE BEAT MOB',
    tag: 'SELLER BRAND / CATALOG',
    role: 'Production house - composed, mixed, mastered',
    blurb:
      'Commercial catalog streamed worldwide. Every track written, mixed and mastered in-house to -14 LUFS broadcast standard.',
    spotifyId: '0vdYxTeGdiccOPK6h7uiCF',
    accent: '#00ffaa',
    glow: 'rgba(0,255,170,0.35)',
    reelHue: '#00ffaa',
  },
  {
    id: 'b33',
    name: 'bTHIRTYthreezy',
    tag: 'SOLO PROJECT',
    role: 'Artist / producer - self-produced',
    blurb:
      'The masked solo project. Every layer - vocals, beats, mix, master - built end to end in the chain.',
    spotifyId: '3sAF7RfGKiuvyPAvjOm89g',
    accent: '#00d4ff',
    glow: 'rgba(0,212,255,0.35)',
    reelHue: '#00d4ff',
  },
  {
    id: 'greenthumbz',
    name: 'GREEN THUMBZ',
    tag: 'PERSONAL CATALOG',
    role: 'Writer / producer - own music',
    blurb:
      'Home-grown catalog. Produced, engineered and released independently.',
    spotifyId: '7yx6XzC3RAXJCfKdeMLbFw',
    accent: '#9eff00',
    glow: 'rgba(158,255,0,0.30)',
    reelHue: '#9eff00',
  },
  {
    id: 'ceasa',
    name: 'CEASA MATIC',
    tag: 'PRODUCED FOR',
    role: 'Multiple albums - full production',
    blurb:
      'Multiple albums produced, mixed and mastered for the artist. Beat work to final master.',
    spotifyId: '6i98eT9Xobt9fdgxwFaZpC',
    accent: '#ffb000',
    glow: 'rgba(255,176,0,0.30)',
    reelHue: '#ffb000',
  },
]

export type Tool = {
  id: string
  name: string
  sub: string
  url: string
  proof: string
}

export const TOOLS: Tool[] = [
  {
    id: 'coproducer',
    name: 'CO-PRODUCER',
    sub: 'AI / ANALYSIS / ENGINEERING JUDGMENT',
    url: 'https://myaiplug.github.io/coproducer-web/index.html',
    proof: 'EBU R128 LUFS - True Peak - mud-band diagnostics - phase coherence, live in browser',
  },
  {
    id: 'liminal',
    name: 'LIMINAL STEMSPLIT',
    sub: 'NEURAL SOURCE SEPARATION',
    url: 'https://liminal-stemsplit.onrender.com/',
    proof: 'Demucs / MDX-Net / Roformer pipelines with artifact telemetry and 5-stem monitoring',
  },
  {
    id: 'screwai',
    name: 'SCREWAI',
    sub: 'PITCH-LOCKED TIME-STRETCH',
    url: 'https://myaiplug.github.io/ScrewAI-App/',
    proof: 'Chopped-and-screwed DSP - tape-stop simulation - formant-coherent pitch engines',
  },
  {
    id: 'halfscrew',
    name: 'HALFSCREW',
    sub: 'SLOWED + STRAIN PRESETS',
    url: 'https://half-screw3.vercel.app/',
    proof: 'Rubber Band time-stretch with 15 strain presets and WAV export',
  },
  {
    id: 'retune',
    name: 'RETUNE432',
    sub: 'MICROTONAL RETUNING',
    url: 'https://retune-432.vercel.app/',
    proof: '432Hz batch retuning with formant preservation',
  },
  {
    id: 'warper',
    name: 'REALITY WARPER',
    sub: 'PSYCHOACOUSTIC SPACE',
    url: 'https://harmonic-reality-warper.vercel.app/warper.html',
    proof: '3D harmonic warp matrices - spatial psychoacoustics',
  },
  {
    id: 'fantune',
    name: 'FANTUNE',
    sub: 'CONTROLLER SKIN',
    url: 'https://myaiplug.github.io/fantune-skin/',
    proof: 'Lyria MIDI controller skin - hardware-grade interface design',
  },
]

export const STEM_NAMES = ['KICK', 'DRUMS', 'BASS', 'PAD', 'ARP'] as const
