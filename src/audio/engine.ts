// THE SITE SOUNDTRACK - a real trimmed beat with the producer tag,
// routed through a Web Audio graph so the meters, screw dial, warp
// and tape-stop all manipulate the REAL audio element.

const BASE = import.meta.env.BASE_URL || "/";
const AMBIENT_TRACK = `${BASE}vault/07-applied-pressure.mp3`;

class AmbientEngine {
  audio: HTMLAudioElement | null = null
  ctx: AudioContext | null = null
  private tapeFilter: BiquadFilterNode | null = null
  private master: GainNode | null = null
  private analyser: AnalyserNode | null = null
  private analyserL: AnalyserNode | null = null
  private analyserR: AnalyserNode | null = null

  pitchFactor = 1
  private targetPitch = 1
  private pitchRaf: number | null = null

  private timeData = new Float32Array(2048)
  private freqData = new Uint8Array(1024)
  private timeDataL = new Float32Array(2048)
  private timeDataR = new Float32Array(2048)

  get playing() {
    return !!this.audio && !this.audio.paused && !this.audio.ended
  }

  init() {
    if (this.audio) return
    const audio = new Audio(AMBIENT_TRACK)
    audio.loop = true
    audio.volume = 0.55
    audio.preload = "auto"
    audio.crossOrigin = "anonymous"
    this.audio = audio

    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    this.ctx = ctx

    const src = ctx.createMediaElementSource(audio)
    this.tapeFilter = ctx.createBiquadFilter()
    this.tapeFilter.type = "lowpass"
    this.tapeFilter.frequency.value = 18000

    this.master = ctx.createGain()
    this.master.gain.value = 1

    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 2048

    const splitter = ctx.createChannelSplitter(2)
    this.analyserL = ctx.createAnalyser()
    this.analyserR = ctx.createAnalyser()
    this.analyserL.fftSize = 2048
    this.analyserR.fftSize = 2048

    src.connect(this.tapeFilter)
    this.tapeFilter.connect(this.master)
    this.master.connect(this.analyser)
    this.master.connect(splitter)
    splitter.connect(this.analyserL, 0)
    splitter.connect(this.analyserR, 1)
    this.analyser.connect(ctx.destination)
  }

  async start() {
    this.init()
    await this.ctx!.resume()
    try {
      await this.audio!.play()
    } catch {
      /* autoplay blocked - muted entry handles this */
    }
  }

  pause() {
    this.audio?.pause()
  }

  setVolume(v: number) {
    if (this.audio) this.audio.volume = Math.max(0, Math.min(1, v))
  }

  // screw dial / retune / halfspeed. <1 = slower+deeper turntable feel
  setPitchImmediate(f: number) {
    this.pitchFactor = Math.min(2.5, Math.max(0.09, f))
    this.targetPitch = this.pitchFactor
    if (this.audio) this.audio.playbackRate = this.pitchFactor
  }

  glidePitch(f: number, t = 0.12) {
    this.targetPitch = Math.min(2.5, Math.max(0.09, f))
    const from = this.pitchFactor
    const start = performance.now()
    if (this.pitchRaf) cancelAnimationFrame(this.pitchRaf)
    const tick = () => {
      const k = Math.min(1, (performance.now() - start) / (t * 1000))
      const e = 1 - Math.pow(1 - k, 3)
      this.pitchFactor = from + (this.targetPitch - from) * e
      if (this.audio) this.audio.playbackRate = this.pitchFactor
      if (k < 1) this.pitchRaf = requestAnimationFrame(tick)
    }
    this.pitchRaf = requestAnimationFrame(tick)
  }

  // THE TAPE STOP - the whole world winds down
  tapeStop() {
    const from = this.pitchFactor
    const start = performance.now()
    if (this.pitchRaf) cancelAnimationFrame(this.pitchRaf)
    const dur = 1700
    const tick = () => {
      const k = Math.min(1, (performance.now() - start) / dur)
      const e = k * k
      this.pitchFactor = from + (0.09 - from) * e
      if (this.audio) this.audio.playbackRate = this.pitchFactor
      if (this.ctx) {
        this.tapeFilter!.frequency.setTargetAtTime(400 + 400 * (1 - k), this.ctx.currentTime, 0.05)
        this.master!.gain.setTargetAtTime(1 * (1 - k * 0.55), this.ctx.currentTime, 0.08)
      }
      if (k < 1) this.pitchRaf = requestAnimationFrame(tick)
    }
    this.pitchRaf = requestAnimationFrame(tick)
  }

  powerBackUp() {
    const from = this.pitchFactor
    const start = performance.now()
    const dur = 1300
    if (this.pitchRaf) cancelAnimationFrame(this.pitchRaf)
    const tick = () => {
      const k = Math.min(1, (performance.now() - start) / dur)
      const e = 1 - Math.pow(1 - k, 2)
      this.pitchFactor = from + (1 - from) * e
      if (this.audio) this.audio.playbackRate = this.pitchFactor
      if (this.ctx) {
        this.tapeFilter!.frequency.setTargetAtTime(18000, this.ctx.currentTime, 0.1)
        this.master!.gain.setTargetAtTime(1, this.ctx.currentTime, 0.1)
      }
      if (k < 1) this.pitchRaf = requestAnimationFrame(tick)
    }
    this.pitchRaf = requestAnimationFrame(tick)
  }

  setWarp(on: boolean) {
    if (!this.ctx) return
    const now = this.ctx.currentTime
    if (on) {
      this.tapeFilter!.frequency.cancelScheduledValues(now)
      this.tapeFilter!.frequency.setValueAtTime(18000, now)
      for (let i = 0; i < 24; i++) {
        const t = now + i * 0.25
        this.tapeFilter!.frequency.linearRampToValueAtTime(18000 - 9000 * Math.abs(Math.sin(i * 0.9)), t + 0.125)
        this.tapeFilter!.frequency.linearRampToValueAtTime(18000, t + 0.25)
      }
    } else {
      this.tapeFilter!.frequency.cancelScheduledValues(now)
      this.tapeFilter!.frequency.setTargetAtTime(18000, now, 0.1)
    }
  }

  // ---------- metering ----------
  getLufs(): number {
    if (!this.ctx || !this.analyser) return -60
    this.analyser.getFloatTimeDomainData(this.timeData)
    let sum = 0
    for (let i = 0; i < this.timeData.length; i++) sum += this.timeData[i] * this.timeData[i]
    const rms = Math.sqrt(sum / this.timeData.length)
    if (rms < 1e-6) return -60
    return Math.max(-60, Math.min(0, 20 * Math.log10(rms) - 0.691 + 3))
  }

  getPeak(): number {
    if (!this.ctx || !this.analyser) return -60
    this.analyser.getFloatTimeDomainData(this.timeData)
    let peak = 0
    for (let i = 0; i < this.timeData.length; i++) peak = Math.max(peak, Math.abs(this.timeData[i]))
    if (peak < 1e-6) return -60
    return Math.max(-60, Math.min(6, 20 * Math.log10(peak)))
  }

  getCorrelation(): number {
    if (!this.ctx || !this.analyserL || !this.analyserR) return 1
    this.analyserL.getFloatTimeDomainData(this.timeDataL)
    this.analyserR.getFloatTimeDomainData(this.timeDataR)
    let lr = 0, ll = 0, rr = 0
    for (let i = 0; i < this.timeDataL.length; i++) {
      lr += this.timeDataL[i] * this.timeDataR[i]
      ll += this.timeDataL[i] * this.timeDataL[i]
      rr += this.timeDataR[i] * this.timeDataR[i]
    }
    const denom = Math.sqrt(ll * rr)
    return denom < 1e-9 ? 1 : lr / denom
  }

  getSpectrum(): Uint8Array {
    if (!this.ctx || !this.analyser) return this.freqData
    this.analyser.getByteFrequencyData(this.freqData)
    return this.freqData
  }

  getWaveform(): Float32Array {
    if (!this.ctx || !this.analyser) return this.timeData
    this.analyser.getFloatTimeDomainData(this.timeData)
    return this.timeData
  }
}

export const engine = new AmbientEngine()
