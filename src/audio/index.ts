export type SoundName =
  | 'click'
  | 'open'
  | 'battle'
  | 'attack'
  | 'skill'
  | 'defend'
  | 'hit'
  | 'discover'
  | 'levelup'
  | 'victory'
  | 'defeat'
  | 'unlock'
  | 'rest'
  | 'error'

const MUTE_KEY = 'zhongshenggate-audio-muted-v1'

interface ToneSpec {
  freq: number
  type?: OscillatorType
  start?: number
  dur: number
  peak: number
  attack?: number
  glideTo?: number
}

interface NoiseSpec {
  start?: number
  dur: number
  peak: number
  freq?: number
  type?: BiquadFilterType
  q?: number
}

/**
 * 程序化合成音效管理器（Web Audio API）。
 * - 懒初始化：首次用户交互才创建 AudioContext，满足浏览器自动播放策略。
 * - 静音开关持久化到 localStorage。
 * - 无 Web Audio 支持的环境静默降级，不影响游戏运行。
 */
class AudioManager {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private bgmGain: GainNode | null = null
  private bgmTimer: ReturnType<typeof setInterval> | null = null
  private padIndex = 0
  private _muted = false

  constructor() {
    try {
      this._muted = localStorage.getItem(MUTE_KEY) === '1'
    } catch {
      // 忽略存储不可用
    }
  }

  get muted(): boolean {
    return this._muted
  }

  private get supported(): boolean {
    return typeof window !== 'undefined' && 'AudioContext' in window
  }

  private ensure(): AudioContext | null {
    if (this._muted || !this.supported) return null
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.9
      this.master.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    this.startBgm()
    return this.ctx
  }

  play(name: SoundName) {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    switch (name) {
      case 'click':
        this.tone({ freq: 1050, type: 'sine', dur: 0.07, peak: 0.07 })
        break
      case 'open':
        this.tone({ freq: 620, type: 'sine', dur: 0.09, peak: 0.06 })
        this.tone({ freq: 880, type: 'sine', start: 0.06, dur: 0.12, peak: 0.05 })
        break
      case 'battle':
        this.tone({ freq: 180, type: 'square', dur: 0.18, peak: 0.14, glideTo: 120 })
        this.tone({ freq: 260, type: 'triangle', start: 0.12, dur: 0.2, peak: 0.1, glideTo: 180 })
        this.noise({ dur: 0.15, peak: 0.08, freq: 900, type: 'highpass' })
        break
      case 'attack':
        this.tone({ freq: 320, type: 'square', dur: 0.18, peak: 0.24, glideTo: 70 })
        this.noise({ dur: 0.1, peak: 0.12, freq: 1200, type: 'highpass' })
        break
      case 'skill':
        this.tone({ freq: 520, type: 'sawtooth', dur: 0.32, peak: 0.2, glideTo: 80 })
        this.noise({ dur: 0.18, peak: 0.14, freq: 700, type: 'bandpass', q: 0.8 })
        this.tone({ freq: 660, type: 'sine', start: 0.04, dur: 0.18, peak: 0.1 })
        this.tone({ freq: 990, type: 'sine', start: 0.08, dur: 0.2, peak: 0.08 })
        break
      case 'defend':
        this.tone({ freq: 110, type: 'sine', dur: 0.26, peak: 0.2 })
        this.noise({ dur: 0.2, peak: 0.12, freq: 400 })
        break
      case 'hit':
        this.tone({ freq: 200, type: 'square', dur: 0.24, peak: 0.24, glideTo: 85 })
        this.noise({ dur: 0.12, peak: 0.1, freq: 600 })
        break
      case 'discover':
        this.tone({ freq: 660, type: 'sine', dur: 0.09, peak: 0.1 })
        this.tone({ freq: 990, type: 'sine', start: 0.07, dur: 0.16, peak: 0.1 })
        break
      case 'levelup':
        for (const [i, f] of [523.25, 659.25, 783.99, 1046.5].entries()) {
          this.tone({ freq: f, type: 'sine', start: i * 0.07, dur: 0.18, peak: 0.12 })
        }
        this.tone({ freq: 1567.98, type: 'sine', start: 0.28, dur: 0.3, peak: 0.06 })
        break
      case 'victory':
        for (const f of [523.25, 659.25, 783.99]) {
          this.tone({ freq: f, type: 'triangle', dur: 0.4, peak: 0.1 })
        }
        for (const [i, f] of [523.25, 659.25, 783.99, 1046.5].entries()) {
          this.tone({ freq: f, type: 'sine', start: 0.35 + i * 0.12, dur: 0.16, peak: 0.09 })
        }
        break
      case 'defeat':
        this.tone({ freq: 392, type: 'sine', dur: 0.3, peak: 0.1 })
        this.tone({ freq: 370, type: 'sine', start: 0.26, dur: 0.45, peak: 0.09 })
        this.tone({ freq: 98, type: 'square', start: 0.05, dur: 0.6, peak: 0.05 })
        break
      case 'unlock':
        for (const [i, f] of [659.25, 783.99, 1046.5].entries()) {
          this.tone({ freq: f, type: 'sine', start: i * 0.09, dur: 0.16, peak: 0.1 })
        }
        break
      case 'rest':
        this.tone({ freq: 220, type: 'sine', dur: 0.6, peak: 0.07, attack: 0.12 })
        this.tone({ freq: 329.63, type: 'sine', start: 0.2, dur: 0.7, peak: 0.05, attack: 0.2 })
        break
      case 'error':
        this.tone({ freq: 130, type: 'square', dur: 0.14, peak: 0.13 })
        this.tone({ freq: 98, type: 'square', start: 0.12, dur: 0.18, peak: 0.11 })
        break
    }
  }

  toggleMuted(): boolean {
    this._muted = !this._muted
    try {
      localStorage.setItem(MUTE_KEY, this._muted ? '1' : '0')
    } catch {
      // 忽略存储不可用
    }
    if (this._muted) {
      if (this.master && this.ctx) {
        this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05)
      }
      this.stopBgm()
    } else {
      this.ensure()
      if (this.master && this.ctx) {
        this.master.gain.setTargetAtTime(0.9, this.ctx.currentTime, 0.05)
      }
    }
    return this._muted
  }

  private tone(spec: ToneSpec) {
    if (!this.ctx || !this.master) return
    const ctx = this.ctx
    const t = ctx.currentTime + 0.002 + (spec.start ?? 0)
    const osc = ctx.createOscillator()
    osc.type = spec.type ?? 'sine'
    osc.frequency.setValueAtTime(spec.freq, t)
    if (spec.glideTo !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, spec.glideTo), t + spec.dur)
    }
    const g = ctx.createGain()
    const attack = spec.attack ?? 0.005
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(spec.peak, t + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, t + spec.dur)
    osc.connect(g).connect(this.master)
    osc.start(t)
    osc.stop(t + spec.dur + 0.05)
  }

  private noise(spec: NoiseSpec) {
    if (!this.ctx || !this.master) return
    const ctx = this.ctx
    const t = ctx.currentTime + 0.002 + (spec.start ?? 0)
    const len = Math.max(1, Math.floor(ctx.sampleRate * spec.dur))
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    src.buffer = buf
    const filter = ctx.createBiquadFilter()
    filter.type = spec.type ?? 'lowpass'
    filter.frequency.value = spec.freq ?? 1000
    if (spec.q) filter.Q.value = spec.q
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(spec.peak, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + spec.dur)
    src.connect(filter).connect(g).connect(this.master)
    src.start(t)
    src.stop(t + spec.dur + 0.05)
  }

  private startBgm() {
    if (this.bgmTimer || !this.ctx || !this.master) return
    const ctx = this.ctx
    const bgm = ctx.createGain()
    bgm.gain.value = 0
    bgm.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 3)
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 600
    bgm.connect(lp).connect(this.master)
    this.bgmGain = bgm

    const chord = () => this.schedulePadChord(ctx, bgm)
    chord()
    this.bgmTimer = setInterval(chord, 8000)
  }

  private schedulePadChord(ctx: AudioContext, bgm: GainNode) {
    const chords: number[][] = [
      [261.63, 392, 523.25, 659.25],
      [196, 293.66, 392, 493.88],
      [220, 329.63, 440, 523.25],
      [174.61, 261.63, 349.23, 440],
    ]
    const notes = chords[this.padIndex % chords.length]
    this.padIndex += 1
    const t = ctx.currentTime + 0.05
    for (const f of notes) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = f
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.024, t + 2.5)
      g.gain.linearRampToValueAtTime(0, t + 8)
      osc.connect(g).connect(bgm)
      osc.start(t)
      osc.stop(t + 8.2)
    }
  }

  private stopBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer)
      this.bgmTimer = null
    }
    const bgm = this.bgmGain
    this.bgmGain = null
    if (bgm && this.ctx) {
      bgm.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1)
      setTimeout(() => {
        try {
          bgm.disconnect()
        } catch {
          // 忽略
        }
      }, 800)
    }
  }
}

export const audio = new AudioManager()
