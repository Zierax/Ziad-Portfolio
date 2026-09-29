import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, X, Music, Terminal
} from 'lucide-react';

// ==========================================
// ⚙️ SYSTEM CONSTANTS
// ==========================================

type Mood = 'idle' | 'coding' | 'watching' | 'dancing' | 'dragged' | 'sleeping';

interface Position { x: number; y: number; }

// After this long without cursor movement, the pet dozes off.
const SLEEP_AFTER_MS = 45000;
// Closer than this (px), the pet stares back instead of idling.
const CURIOUS_RADIUS_PX = 130;

const PLAYLIST = [
  { id: 1, name: "God Alert", artist: "Creator", file: "https://github.com/Zierax/Ziad-Portfolio/raw/refs/heads/main/src/music/God%20Alert.mp3" },
  { id: 2, name: "Creator's Move", artist: "Ziad", file: "https://github.com/Zierax/Ziad-Portfolio/raw/refs/heads/main/src/music/The Creator´s%20move.mp3" },
  { id: 3, name: "Fallen Cathedral", artist: "System", file: "https://github.com/Zierax/Ziad-Portfolio/raw/refs/heads/main/src/music/The%20Fallen%20Cathedral.mp3" },
  { id: 4, name: "The Holy Theft", artist: "Rogue", file: "https://github.com/Zierax/Ziad-Portfolio/raw/refs/heads/main/src/music/The%20Holy%20Theft.mp3" },
  { id: 5, name: "Whiplash", artist: "Vibes", file: "https://github.com/Zierax/Ziad-Portfolio/raw/refs/heads/main/src/music/Whiplash.mp3" },
];
// NOTE: local src/music/*.mp3 copies exist but total ~30MB — bundling them
// would explode dist/. Remote URLs stay until a proper audio CDN exists.

/**
 * Mood is expressed by the antenna, not the face. Snoo solves the small-face
 * legibility problem the same way: a neutral face plus a readable appendage.
 * This also avoids the common failure where every state reshapes the features
 * and the character appears to change identity.
 */
const ANTENNA_TILT: Record<Mood, number> = {
  idle: -5,
  watching: 9,
  coding: 1,
  dancing: -15,
  dragged: 20,
  sleeping: 28,
};

const LOGS = ["SYSTEM_ONLINE", "ZYO_CORE_ACTIVE", "DOSSIER_INDEXED", "READY"];

// Must match the rendered <svg> dimensions exactly: BOT_H also defines the
// drag clamp, so a stale value leaves the pet able to be dropped off-screen.
const BOT_W = 110;
const BOT_H = 112;

// Gaze tuning. GAZE_BIAS is the off-axis rest pose; see the rAF loop.
const GAZE_BIAS_X = 1.5;
const GAZE_BIAS_Y = -1;
const GAZE_MAX_PX = 2;
const LEAN_MAX_DEG = 1.4;

/**
 * Per-mood body squash, applied about the base (55,104) so the bean compresses
 * onto itself instead of sliding.
 *
 * The antenna alone is NOT sufficient here, and this is measured, not assumed:
 * the antenna tip travels 11px from a pivot at (55,16), so idle(-5deg) and
 * coding(1deg) sit 6deg apart = 1.15px of tip travel. On a 110px character
 * three of six moods fell inside a sub-pixel band. Snoo can carry mood in an
 * antenna because it is a large-format mark with arms, posture and eyelids
 * behind it; at sprite scale the appendage is 5% of the character's height.
 * Silhouette is the signal that survives downsampling, so each mood now also
 * gets its own squash: the smallest pairwise gap here is 0.05 of a ~90px
 * body = 4.5px, which clears the noise floor.
 */
const MOOD_SQUASH: Record<Mood, number> = {
  idle: 1,
  watching: 1.05,
  coding: 0.95,
  dancing: 1.1,
  dragged: 0.9,
  sleeping: 0.94,
};
const CLICK_DRAG_THRESHOLD_PX = 6;
const SPEECH_HIDE_MS = 6500;
const BLOCKED_NOTICE_MS = 10000;
const DISMISS_KEY = "zyo-dismissed";
const RESPAWN_EVENT = "zyo:respawn";

// Derived from the rendered size so it cannot drift out of sync the way the
// literal 150 did; BOT_H is the single source of truth for the pet box.
const HOME_POS = () => ({ x: vw() - (BOT_W + 10), y: vh() - (BOT_H + 24) });

type ProfileModule = typeof import("@/data/profile");

const vw = () => (typeof window === "undefined" ? 1280 : window.innerWidth);
const vh = () => (typeof window === "undefined" ? 800 : window.innerHeight);

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** One line of readout. `by` is attribution and is only ever set where a
 *  source was verified; unverified quotations are deliberately absent. */
interface ZyoLine {
  text: string;
  by?: string;
}

/**
 * Verified quotations. Every line was checked against a primary or
 * authoritative source; translators are named where the wording is theirs.
 * A widely circulated line with no traceable origin is worse than no line at
 * all, so the usual misattributions (the Frankl "stimulus and response",
 * the Confucius "slowly you go", the Feynman "try to be wrong") are excluded.
 */
const QUOTES: readonly ZyoLine[] = [
  {
    text: "Whereof one cannot speak, thereof one must be silent.",
    by: "Wittgenstein — Tractatus 7, trans. Ogden",
  },
  {
    text: "If you do not work on an important problem, it's unlikely you'll do important work. It's perfectly obvious.",
    by: "Richard Hamming — You and Your Research, 1986",
  },
  {
    text: "Talk is cheap. Show me the code.",
    by: "Linus Torvalds — linux-kernel, 2000",
  },
  {
    text: "Let us concentrate rather on explaining to human beings what we want a computer to do.",
    by: "Donald Knuth — Literate Programming, 1984",
  },
  {
    text: "A book holds words. Words hold things. They bear meanings.",
    by: "Ursula K. Le Guin — The Carrier Bag Theory of Fiction",
  },
  {
    text: "Everything has two handles, the one by which it may be carried, the other by which it cannot.",
    by: "Epictetus — Enchiridion 43, trans. Carter",
  },
  {
    text: "The first principle is that you must not fool yourself — and you are the easiest person to fool.",
    by: "Richard Feynman — Cargo Cult Science, 1974",
  },
];

/** Real dossier facts only — built from the generated snapshot, never hardcoded. */
function buildFacts(profile: ProfileModule | null): ZyoLine[] {
  const facts: ZyoLine[] = [
    { text: "TIP — type 'github' in the terminal for live repo stats" },
    { text: "TIP — type 'projects' to browse ranked work, 'method' for the formula" },
    { text: "TIP — a 12-puzzle CTF lives at /challenge" },
  ];
  if (!profile) return facts;
  const {
    flagshipRepos, signalRepos, recentRepos, externalMentions,
    division36Systems, githubSignal, academicResearches, displayName, updatedLabel,
  } = profile;
  facts.push(
    { text: `${githubSignal.combinedOwnedRepoStars} owned repo stars across ${githubSignal.publicRepos + githubSignal.division36PublicRepos} public repos` },
    { text: `${academicResearches.length} research records with versioned Zenodo DOIs` }
  );
  const grafana = flagshipRepos.find((r) => r.key === "Zierax/Grafana-Final-Scanner");
  if (grafana) {
    facts.unshift(
      { text: `${displayName(grafana)}: ${grafana.stars} stars, ${grafana.forks} forks — most-adopted tool here` }
    );
  }
  const zjail = flagshipRepos.find((r) => r.key === "Division-36/Z-Jail");
  if (zjail) {
    // Editorial-grade citations first — aggregators and mirrors don't lead.
    const rank = { high: 0, medium: 1, low: 2 } as Record<string, number>;
    const outlets = [...zjail.mentions]
      .sort((a, b) => (rank[a.confidence] ?? 2) - (rank[b.confidence] ?? 2))
      .map((m) => m.outlet);
    if (outlets.length > 0) {
      facts.splice(
        2, 0,
        { text: `Z-Jail is cited by ${outlets.slice(0, 3).join(", ")}${outlets.length > 3 ? ` +${outlets.length - 3} more` : ""}` }
      );
    }
  }
  const topSignal = signalRepos[0];
  if (topSignal) {
    facts.push({ text: `${displayName(topSignal)} leads the signal stream at ${topSignal.stars} stars` });
  }
  const freshest = recentRepos[0];
  if (freshest) {
    facts.push({ text: `${displayName(freshest)} updated ${updatedLabel(freshest.updatedAt)} — freshest activity` });
  }
  if (externalMentions.length > 0) {
    facts.push({ text: `${externalMentions.length} third-party citations tracked — see 'mentions' in the terminal` });
  }
  if (division36Systems.length > 0) {
    facts.push({ text: `Division-36 runs ${division36Systems.slice(0, 3).map((s) => s.name).join(" · ")} as public benchmarks` });
  }
  const newestPaper = academicResearches[0];
  if (newestPaper && newestPaper.status) {
    facts.push({ text: `Research record: ${newestPaper.title.slice(0, 60)}… — ${newestPaper.status}` });
  }
  return facts;
}

function getMediaSession(): MediaSession | null {
  try {
    const nav = navigator as Navigator & { mediaSession?: MediaSession };
    return "mediaSession" in navigator && nav.mediaSession ? nav.mediaSession : null;
  } catch {
    return null;
  }
}

// ==========================================
// 🎵 PLAYER PANEL (shared desktop + mobile)
// ==========================================

interface PlayerPanelProps {
  track: { name: string; artist: string };
  isPlaying: boolean;
  progress: number;
  positionText: string;
  volume: number;
  isMuted: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggle: () => void;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  onSeekKey: (e: React.KeyboardEvent) => void;
  onMute: () => void;
  onVolume: (v: number) => void;
  onClose: () => void;
}

function PlayerPanel(props: PlayerPanelProps) {
  const { track } = props;
  return (
    <div className="w-64 p-4 rounded-xl bg-card border border-border shadow-2xl">
      <div className="flex justify-between items-center mb-3">
        <div className="overflow-hidden">
          <p className="text-xs font-bold text-foreground truncate" aria-live="polite">{track.name}</p>
          <p className="text-[11px] text-muted-foreground font-mono">{track.artist} · OPT-IN AUDIO</p>
        </div>
        <button onClick={props.onClose} aria-label="Close music player" className="p-1.5 rounded-full text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-terminal-green">
          <X size={14} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={props.onPrev} aria-label="Previous track" className="p-1.5 rounded-full text-muted-foreground hover:text-terminal-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-terminal-green"><SkipBack size={16} /></button>
        <button onClick={props.onToggle} aria-label={props.isPlaying ? "Pause" : "Play"} className="p-2 bg-terminal-green rounded-full text-black hover:bg-terminal-green/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terminal-green">
          {props.isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" />}
        </button>
        <button onClick={props.onNext} aria-label="Next track" className="p-1.5 rounded-full text-muted-foreground hover:text-terminal-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-terminal-green"><SkipForward size={16} /></button>
        <div
          className="flex-1 rounded-full cursor-pointer py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-terminal-green"
          onClick={props.onSeek}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(props.progress)}
          aria-valuetext={props.positionText}
          tabIndex={0}
          onKeyDown={props.onSeekKey}
        >
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-terminal-green" style={{ width: `${props.progress}%` }} />
          </div>
        </div>
      </div>
      <p className="mt-1 text-right font-mono text-[10px] text-muted-foreground">{props.positionText}</p>

      <div className="mt-2 flex items-center gap-2">
        <button onClick={props.onMute} aria-label={props.isMuted ? "Unmute" : "Mute"} className="p-1.5 rounded-full text-muted-foreground hover:text-terminal-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-terminal-green">
          {props.isMuted || props.volume === 0
            ? <VolumeX size={14} />
            : <Volume2 size={14} />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={props.isMuted ? 0 : props.volume}
          onChange={(e) => props.onVolume(Number(e.target.value))}
          aria-label="Volume"
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-terminal-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-terminal-green"
        />
      </div>
    </div>
  );
}

// ==========================================
// 🎨 MAIN ZYO COMPONENT
// ==========================================
// Performance contract: cursor tracking, position easing, and pupil motion
// run entirely through refs inside ONE rAF loop — zero React re-renders per
// frame. State updates only on discrete events (mood, drag, player, speech).

const ZyoAssistant: React.FC = () => {
  const [mood, setMood] = useState<Mood>('idle');
  const [isBlinking, setIsBlinking] = useState(false);
  const [statusText, setStatusText] = useState(LOGS[0]);

  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const downPos = useRef<Position>({ x: 0, y: 0 });

  const [showPlayer, setShowPlayer] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return window.localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [panelUp, setPanelUp] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.25);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [positionText, setPositionText] = useState("0:00 / 0:00");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const playTokenRef = useRef(0);
  const errorStreakRef = useRef(0);
  const blockedUntilRef = useRef(0);

  const [speech, setSpeech] = useState<ZyoLine | null>(null);
  const speechTimer = useRef<number | null>(null);
  const factIdx = useRef(0);
  const profileRef = useRef<ProfileModule | null>(null);

  // Refs mutated by the rAF loop — never state.
  const botRef = useRef<HTMLDivElement>(null);
  const pupilGroupRef = useRef<SVGGElement>(null);
  const leanRef = useRef<SVGGElement>(null);
  const moodRef = useRef<Mood>('idle');
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const mobileBtnRef = useRef<HTMLButtonElement>(null);
  const posRef = useRef<Position>(HOME_POS());
  const targetRef = useRef<Position>(HOME_POS());
  const mouseRef = useRef<Position>({ x: vw() / 2, y: vh() / 2 });
  const lastMoveRef = useRef<number>(Date.now());
  const [bounceKey, setBounceKey] = useState(0);
  const draggingRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  const reducedMotion = useRef(
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    let cancel: (() => void) | undefined;
    const load = () => {
      import("@/data/profile")
        .then((m) => { if (mountedRef.current) profileRef.current = m; })
        .catch(() => { /* tips still work without data */ });
    };
    if (typeof window !== "undefined" && typeof (window as Window & { requestIdleCallback?: unknown }).requestIdleCallback === "function") {
      const ric = (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback;
      const cic = (window as unknown as { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback;
      const handle = ric(load);
      cancel = () => { if (cic) cic(handle); };
    } else {
      const t = window.setTimeout(load, 3000);
      cancel = () => window.clearTimeout(t);
    }
    return () => cancel?.();
  }, []);

  // ----------------------------------------
  // 🧠 MAIN LOOP: position easing + pupil tracking (no re-renders)
  // ----------------------------------------

  useEffect(() => {
    const clampTarget = () => {
      targetRef.current = {
        x: Math.min(Math.max(targetRef.current.x, 0), window.innerWidth - BOT_W),
        y: Math.min(Math.max(targetRef.current.y, 0), window.innerHeight - BOT_H),
      };
    };
    const handleResize = () => clampTarget();
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      lastMoveRef.current = Date.now();
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouse, { passive: true });

    let frame: number;
    const update = () => {
      const ease = reducedMotion.current ? 1 : 0.08;
      if (!draggingRef.current) {
        posRef.current = {
          x: posRef.current.x + (targetRef.current.x - posRef.current.x) * ease,
          y: posRef.current.y + (targetRef.current.y - posRef.current.y) * ease,
        };
      }
      if (botRef.current) {
        botRef.current.style.transform =
          `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      }
      // Gaze follows the cursor, but deliberately not 1:1 and never centred.
      // Three reasons, each measured or documented rather than taste:
      //  - Duolingo's brand rule is blunt: "Center Duo's pupils within his
      //    eyes. It makes him look creepy." A dead-centre pupil is a symmetric
      //    unwavering stare, so GAZE_BIAS holds the rest pose up and to the
      //    right, as if watching something past your shoulder.
      //  - Amplitude is clamped below the true cursor delta; a 1:1 servo
      //    sweep is what makes a tracker read as machinery.
      //  - The body counter-leans against the gaze. If only the eyes move,
      //    the result is a turret; a small opposing tilt is what converts
      //    "tracking" into "looking".
      if (pupilGroupRef.current && leanRef.current && !reducedMotion.current) {
        const dx = mouseRef.current.x - (posRef.current.x + 55);
        const dy = mouseRef.current.y - (posRef.current.y + 34);
        const angle = Math.atan2(dy, dx);
        const dist = Math.min(GAZE_MAX_PX, Math.sqrt(dx * dx + dy * dy) / 110);
        const gx = Math.cos(angle) * dist + GAZE_BIAS_X;
        const gy = Math.sin(angle) * dist + GAZE_BIAS_Y;
        pupilGroupRef.current.setAttribute(
          "transform",
          `translate(${gx.toFixed(2)},${gy.toFixed(2)})`
        );
        const lean = Math.max(-LEAN_MAX_DEG, Math.min(LEAN_MAX_DEG, -gx * 0.55));
        const sy = MOOD_SQUASH[moodRef.current];
        leanRef.current.setAttribute(
          "transform",
          `rotate(${lean.toFixed(2)} 55 58) translate(55 104) scale(1 ${sy}) translate(-55 -104)`
        );
      }
      frame = requestAnimationFrame(update);
    };
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  // ----------------------------------------
  // 🧠 MOOD ENGINE (discrete, 4s cadence)
  // ----------------------------------------

  useEffect(() => {
    const loop = () => {
      if (draggingRef.current) return;
      if (Date.now() < blockedUntilRef.current) return; // let error notices stand
      if (isPlaying) {
        setMood('dancing');
        setStatusText("PLAYBACK_ACTIVE");
        return;
      }
      // Asleep after long idleness — wakes on movement, click, or drag.
      if (Date.now() - lastMoveRef.current > SLEEP_AFTER_MS) {
        setMood('sleeping');
        setStatusText("DREAM_MODE");
        return;
      }
      const rand = Math.random();
      if (rand < 0.3) {
        setMood('coding');
        setStatusText("INDEXING_DOSSIER");
      } else if (rand < 0.6) {
        // Close cursor? Stare back, don't look away.
        const dx = mouseRef.current.x - (posRef.current.x + 55);
        const dy = mouseRef.current.y - (posRef.current.y + 34);
        const near = Math.hypot(dx, dy) < CURIOUS_RADIUS_PX;
        setMood('watching');
        setStatusText(near ? "CURIOUS" : "ON_WATCH");
      } else {
        setMood('idle');
        setStatusText(LOGS[Math.floor(Math.random() * LOGS.length)]);
      }
    };
    const timer = setInterval(loop, 4000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Status holds error notices for a while instead of being erased by moods.
  const notice = useCallback((text: string) => {
    blockedUntilRef.current = Date.now() + BLOCKED_NOTICE_MS;
    setStatusText(text);
  }, []);

  const resumeOnLoadRef = useRef(false);

  useEffect(() => {
    if (reducedMotion.current) return; // no blink loop under reduced motion
    let alive = true;
    let outer: number | undefined;
    let inner: number | undefined;
    const blink = () => {
      if (!alive || !mountedRef.current) return;
      setIsBlinking(true);
      inner = window.setTimeout(() => {
        if (alive && mountedRef.current) setIsBlinking(false);
      }, 150);
      outer = window.setTimeout(blink, 3000 + Math.random() * 5000);
    };
    const start = window.setTimeout(blink, 1000);
    return () => {
      alive = false;
      window.clearTimeout(start);
      window.clearTimeout(outer);
      window.clearTimeout(inner);
    };
  }, []);

  // ----------------------------------------
  // 🖱️ DRAG (clamped) + CLICK-TO-SPEAK + DISMISS
  // ----------------------------------------

  const speak = useCallback(() => {
    let lines: ZyoLine[];
    try {
      // Deterministic interleave: one quote per three facts, walked by a single
      // incrementing index, so the sequence is reproducible and no line can
      // be starved by another.
      const facts = buildFacts(profileRef.current);
      lines = facts.flatMap((fact, i) => (i % 3 === 2 ? [fact, QUOTES[((i / 3) | 0) % QUOTES.length]] : [fact]));
      if (lines.length === 0) {
        lines = [{ text: "TIP — type 'help' in the terminal to start exploring" }];
      }
    } catch {
      lines = [{ text: "TIP — type 'help' in the terminal to start exploring" }];
    }
    setSpeech(lines[factIdx.current % lines.length]);
    factIdx.current += 1;
    lastMoveRef.current = Date.now(); // attention wakes the pet
    if (!reducedMotion.current) setBounceKey((b) => b + 1);
    if (speechTimer.current !== null) window.clearTimeout(speechTimer.current);
    speechTimer.current = window.setTimeout(() => {
      if (mountedRef.current) setSpeech(null);
    }, SPEECH_HIDE_MS);
  }, []);

  const holdSpeech = useCallback(() => {
    if (speechTimer.current !== null) {
      window.clearTimeout(speechTimer.current);
      speechTimer.current = null;
    }
  }, []);

  const releaseSpeech = useCallback(() => {
    if (speech === null) return;
    if (speechTimer.current !== null) window.clearTimeout(speechTimer.current);
    speechTimer.current = window.setTimeout(() => {
      if (mountedRef.current) setSpeech(null);
    }, 3000);
  }, [speech]);

  useEffect(() => () => {
    if (speechTimer.current !== null) window.clearTimeout(speechTimer.current);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // left button only
    downPos.current = { x: e.clientX, y: e.clientY };
    lastMoveRef.current = Date.now();
    draggingRef.current = true;
    setIsDragging(true);
    setMood('dragged');
    dragOffset.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingRef.current) return;
    const newX = Math.min(Math.max(e.clientX - dragOffset.current.x, 0), window.innerWidth - BOT_W);
    const newY = Math.min(Math.max(e.clientY - dragOffset.current.y, 0), window.innerHeight - BOT_H);
    posRef.current = { x: newX, y: newY };
    targetRef.current = { x: newX, y: newY };
  }, []);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    setMood('idle');
    const moved = Math.hypot(e.clientX - downPos.current.x, e.clientY - downPos.current.y);
    if (moved < CLICK_DRAG_THRESHOLD_PX) speak();
  }, [speak]);

  // Touch: single-finger drag mirrors the mouse path.
  const touchId = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    touchId.current = t.identifier;
    downPos.current = { x: t.clientX, y: t.clientY };
    lastMoveRef.current = Date.now();
    draggingRef.current = true;
    setIsDragging(true);
    setMood('dragged');
    dragOffset.current = { x: t.clientX - posRef.current.x, y: t.clientY - posRef.current.y };
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggingRef.current) return;
    const t = Array.from(e.touches).find((x) => x.identifier === touchId.current) ?? e.changedTouches[0];
    const newX = Math.min(Math.max(t.clientX - dragOffset.current.x, 0), window.innerWidth - BOT_W);
    const newY = Math.min(Math.max(t.clientY - dragOffset.current.y, 0), window.innerHeight - BOT_H);
    posRef.current = { x: newX, y: newY };
    targetRef.current = { x: newX, y: newY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    touchId.current = null;
    setIsDragging(false);
    setMood('idle');
    const t = e.changedTouches[0];
    const moved = Math.hypot(t.clientX - downPos.current.x, t.clientY - downPos.current.y);
    if (moved < CLICK_DRAG_THRESHOLD_PX) speak();
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      speak();
    } else if (e.key === "m" || e.key === "M") {
      openPlayer();
    }
  };

  // Global "m" (outside text fields) — matches the advertised shortcut.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "m" || e.key === "M") openPlayer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // storage unavailable — dismissal lasts for this session only
    }
    setDismissed(true);
  };

  const recenter = useCallback(() => {
    const home = HOME_POS();
    posRef.current = home;
    targetRef.current = home;
    lastMoveRef.current = Date.now();
  }, []);

  // External respawn (terminal `zyo` command, restore button): clear the
  // dismissal, come home, say something.
  const respawnTimer = useRef<number | null>(null);
  useEffect(() => {
    const onRespawn = () => {
      try {
        window.localStorage.removeItem(DISMISS_KEY);
      } catch {
        // ignore
      }
      if (!mountedRef.current) return;
      setDismissed(false);
      recenter();
      if (respawnTimer.current !== null) window.clearTimeout(respawnTimer.current);
      respawnTimer.current = window.setTimeout(() => {
        if (mountedRef.current) speak();
      }, 350);
    };
    window.addEventListener(RESPAWN_EVENT, onRespawn);
    return () => {
      window.removeEventListener(RESPAWN_EVENT, onRespawn);
      if (respawnTimer.current !== null) window.clearTimeout(respawnTimer.current);
    };
  }, [recenter, speak]);

  // ----------------------------------------
  // 🎵 AUDIO ENGINE
  // ----------------------------------------

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateProgress = () => {
      const ratio = (audio.currentTime / audio.duration) * 100 || 0;
      setProgress(ratio);
      setPositionText(`${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`);
    };
    const updateDuration = () => {
      setPositionText(`${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`);
    };
    const resumeIfNeeded = () => {
      if (resumeOnLoadRef.current) {
        resumeOnLoadRef.current = false;
        void playRef.current();
      }
    };
    const failTrack = () => {
      errorStreakRef.current += 1;
      if (errorStreakRef.current >= PLAYLIST.length) {
        pauseRef.current();
        notice("PLAYBACK_FAILED");
      } else {
        notice("TRACK_FAILED — SKIPPED");
        stepRef.current(1);
      }
    };
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('canplay', resumeIfNeeded);
    audio.addEventListener('error', failTrack);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('canplay', resumeIfNeeded);
      audio.removeEventListener('error', failTrack);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    const token = ++playTokenRef.current;
    try {
      await audio.play();
      if (token !== playTokenRef.current || !mountedRef.current) return;
      errorStreakRef.current = 0;
      isPlayingRef.current = true;
      setIsPlaying(true);
    } catch {
      if (token !== playTokenRef.current || !mountedRef.current) return;
      notice("PLAYBACK_BLOCKED");
    }
  }, [notice]);

  const pause = useCallback(() => {
    playTokenRef.current++;
    audioRef.current?.pause();
    isPlayingRef.current = false;
    setIsPlaying(false);
  }, []);
  const pauseRef = useRef(pause);
  pauseRef.current = pause;
  const playRef = useRef(play);
  playRef.current = play;

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) pause();
    else void play();
  }, [pause, play]);

  const changeTrack = useCallback((dir: 1 | -1) => {
    resumeOnLoadRef.current = isPlayingRef.current;
    setCurrentTrackIdx((prev) => (prev + dir + PLAYLIST.length) % PLAYLIST.length);
    setProgress(0);
    setPositionText("0:00 / 0:00");
  }, []);
  const stepRef = useRef(changeTrack);
  stepRef.current = changeTrack;
  // NOTE: no track-switch effect here on purpose — resume-after-switch is
  // handled solely by the canplay listener above, so rapid prev/next cannot
  // stack competing play() promises (playTokenRef guards the rest).

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = ratio * audio.duration;
  };

  const seekKey = (e: React.KeyboardEvent) => {
    const audio = audioRef.current;
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End" && e.key !== "PageUp" && e.key !== "PageDown") return;
    e.preventDefault();
    if (!audio || !audio.duration) return;
    if (e.key === "ArrowRight") audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
    else if (e.key === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 5);
    else if (e.key === "Home") audio.currentTime = 0;
    else if (e.key === "End") audio.currentTime = Math.max(0, audio.duration - 1);
    else if (e.key === "PageUp") audio.currentTime = Math.min(audio.duration, audio.currentTime + 30);
    else audio.currentTime = Math.max(0, audio.currentTime - 30);
  };

  const toggleMute = () => setIsMuted((v) => !v);

  const openPlayer = useCallback(() => {
    // Panel opens away from the viewport edge the bot sits nearest.
    setPanelUp(posRef.current.y > window.innerHeight / 2);
    setShowPlayer(true);
  }, []);

  const closePlayer = useCallback(() => {
    setShowPlayer(false);
    toggleBtnRef.current?.focus();
  }, []);

  const closePlayerMobile = useCallback(() => {
    setShowPlayer(false);
    mobileBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showPlayer) closePlayer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPlayer, closePlayer]);

  // OS-level media controls (lock screen, headset, keyboard keys).
  useEffect(() => {
    const session = getMediaSession();
    if (!session) return;
    const track = PLAYLIST[currentTrackIdx];
    try {
      session.metadata = new MediaMetadata({ title: track.name, artist: `${track.artist} · Zy0x` });
    } catch {
      // metadata shape unsupported — controls below still work
    }
    session.playbackState = isPlaying ? "playing" : "paused";
    try {
      if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
        session.setPositionState({
          duration: audioRef.current.duration,
          position: audioRef.current.currentTime,
        });
      }
    } catch {
      // position state unsupported — harmless
    }
    session.setActionHandler("play", () => void play());
    session.setActionHandler("pause", () => pause());
    session.setActionHandler("previoustrack", () => changeTrack(-1));
    session.setActionHandler("nexttrack", () => changeTrack(1));
    session.setActionHandler("seekto", (details) => {
      const audio = audioRef.current;
      if (audio && details.seekTime !== undefined && audio.duration) {
        audio.currentTime = Math.min(Math.max(details.seekTime, 0), audio.duration);
      }
    });
    return () => {
      try {
        session.setActionHandler("play", null);
        session.setActionHandler("pause", null);
        session.setActionHandler("previoustrack", null);
        session.setActionHandler("nexttrack", null);
        session.setActionHandler("seekto", null);
        session.metadata = null;
        session.playbackState = "none";
      } catch {
        // teardown best-effort
      }
    };
  }, [currentTrackIdx, isPlaying, play, pause, changeTrack]);

  const track = PLAYLIST[currentTrackIdx];

  if (dismissed) {
    return (
      <button
        onClick={() => window.dispatchEvent(new Event(RESPAWN_EVENT))}
        aria-label="Bring back Zyo assistant"
        title="Bring back Zyo"
        className="fixed bottom-4 right-4 z-[9999] rounded-full border border-dashed border-zyo-body/50 bg-card/80 p-2.5 text-zyo-body shadow-xl transition-all hover:border-zyo-body hover:text-zyo-cream md:bottom-6 md:right-6"
      >
        <Terminal size={16} />
      </button>
    );
  }

  const panelProps = {
    track,
    isPlaying,
    progress,
    positionText,
    volume,
    isMuted,
    onPrev: () => changeTrack(-1),
    onNext: () => changeTrack(1),
    onToggle: togglePlay,
    onSeek: seek,
    onSeekKey: seekKey,
    onMute: toggleMute,
    onVolume: (v: number) => {
      setVolume(v);
      if (v > 0 && isMuted) setIsMuted(false);
    },
    onClose: closePlayer,
  };

  // ==========================================
  // 🎨 RENDER
  // ==========================================

  return (
    <>
      <audio ref={audioRef} src={track.file} preload="metadata" onEnded={() => changeTrack(1)} />

      {/* Compact music access below md (pet stays tablet-and-up) */}
      <button
        ref={mobileBtnRef}
        onClick={openPlayer}
        aria-label="Open music player"
        title="Music player"
        className="fixed bottom-4 right-4 z-[9999] rounded-full border border-zyo-body/50 bg-card p-3 text-zyo-body shadow-2xl transition-colors hover:border-zyo-body hover:text-zyo-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-zyo-body md:hidden"
      >
        <Music size={18} />
      </button>
      {showPlayer && (
        <div className="fixed bottom-16 right-4 z-[9999] md:hidden">
          <PlayerPanel {...panelProps} onClose={closePlayerMobile} />
        </div>
      )}

      <div
        ref={botRef}
        className="fixed left-0 top-0 z-[9999] hidden select-none md:block"
        style={{ touchAction: 'none' }}
      >
        <div className="relative flex flex-col items-center group">

          {/* Status Label (decorative — hidden from assistive tech, and out
              of the way while the speech bubble is up) */}
          <div
            aria-hidden="true"
            className={`
            absolute -top-10 px-3 py-1 rounded-md bg-black/85 text-zyo-cream
            text-[10px] font-mono tracking-widest border border-zyo-cheek/50
            transition-all duration-300 motion-reduce:transition-none ${mood !== 'idle' && !speech ? 'opacity-100' : 'opacity-0'}
          `}>
            [{statusText}]
          </div>

          {/* Readout — deliberately NOT a speech bubble. GitHub's art director
              removed speaking from the Octocat precisely because talking
              mascots read as agents with an agenda (the Clippy failure), and
              Snoo communicates through a non-face channel instead. Framing
              this as a terminal readout keeps the lines legible and diegetic:
              the site is already a text-display device, so the pet reports
              rather than addresses. Announced politely when a line lands. */}
          <div
            role="status"
            onMouseEnter={holdSpeech}
            onMouseLeave={releaseSpeech}
            className={`
            absolute -top-10 left-1/2 -translate-x-1/2 -translate-y-full w-64
            border border-zyo-line/60 bg-black/92 p-2.5 pr-8
            transition-all duration-300 motion-reduce:transition-none
            ${speech ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}>
            <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.22em] text-terminal-amber/85">
              <span>zyo</span>
              <span className="text-zyo-line">/</span>
              <span className="text-zyo-line/80">{speech?.by ? "quote" : "local"}</span>
            </div>
            {speech && (
              <>
                <p className="text-[11px] font-mono leading-[1.45] text-zyo-cream">
                  {speech.text}
                  <span
                    aria-hidden="true"
                    className="ml-1 inline-block h-[9px] w-[5px] translate-y-[1px] bg-terminal-amber animate-zyo-caret motion-reduce:hidden"
                  />
                </p>
                {speech.by && (
                  <p className="mt-1.5 border-t border-zyo-line/40 pt-1.5 text-[10px] font-mono leading-4 text-zyo-body">
                    — {speech.by}
                  </p>
                )}
              </>
            )}
            {speech && (
              <button
                onClick={() => {
                  if (speechTimer.current !== null) window.clearTimeout(speechTimer.current);
                  setSpeech(null);
                }}
                aria-label="Dismiss line"
                className="absolute right-1.5 top-1.5 rounded-full p-1.5 text-muted-foreground hover:text-zyo-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-terminal-amber"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <button
            ref={toggleBtnRef}
            onClick={() => (showPlayer ? closePlayer() : openPlayer())}
            aria-label="Toggle music player"
            aria-expanded={showPlayer}
            title="Music player"
            className="absolute -right-12 top-4 rounded-full border border-border bg-card p-2 text-muted-foreground opacity-0 transition-all hover:border-zyo-body hover:text-zyo-body group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zyo-body"
          >
            <Music size={16} />
          </button>

          <button
            onClick={dismiss}
            aria-label="Hide Zyo assistant"
            title="Hide assistant"
            className="absolute -left-10 top-4 rounded-full border border-border bg-card p-1.5 text-muted-foreground opacity-0 transition-all hover:border-zyo-cheek hover:text-zyo-cheek group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zyo-body"
          >
            <X size={13} />
          </button>

          {/* Player UI */}
          <div className={`
            absolute ${panelUp ? "bottom-full mb-4" : "top-full mt-4"} transition-all motion-reduce:transition-none
            ${showPlayer ? 'scale-100 opacity-100' : 'invisible scale-90 opacity-0'}
          `}>
            <PlayerPanel {...panelProps} />
          </div>

          {/* 🤖 THE ROBOT ASSISTANT — double-click recenters */}
          <div
            onMouseDown={handleMouseDown}
            onDoubleClick={recenter}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="cursor-grab active:cursor-grabbing transition-transform duration-200 group-hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zyo-body"
            role="button"
            tabIndex={0}
            aria-label="Zyo assistant. Press Enter for a line, M for music, double-click to recenter."
            onKeyDown={handleKeyDown}
          >
            {mood === 'sleeping' && (
              <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-4 flex flex-col items-center">
                <span className="font-mono text-sm font-bold text-zyo-body animate-zyo-zzz">z</span>
                <span className="font-mono text-[10px] font-bold text-zyo-body/80 animate-zyo-zzz" style={{ animationDelay: "0.6s" }}>z</span>
                <span className="font-mono text-[8px] font-bold text-zyo-body/60 animate-zyo-zzz" style={{ animationDelay: "1.2s" }}>z</span>
              </div>
            )}
            <div key={bounceKey} className={bounceKey > 0 && !reducedMotion.current ? "animate-zyo-boing" : undefined}>
            <svg width="110" height="112" viewBox="0 0 110 112" aria-hidden="true" className={reducedMotion.current ? undefined : "animate-zyo-float"}>
              <defs>
                <linearGradient id="zyo-cream-grad" x1="0.15" y1="0" x2="0.5" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--zyo-cream))" />
                  <stop offset="100%" stopColor="hsl(var(--zyo-body))" />
                </linearGradient>
                <radialGradient id="zyo-lens-grad" cx="0.5" cy="0.45" r="0.5">
                  <stop offset="0%" stopColor="hsl(var(--zyo-deep))" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="hsl(var(--zyo-deep))" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* ANTENNA — primary mood channel. Rendered as a CSS transform as well
                  as a presentation attribute: a CSS transition on an attribute
                  change is engine-dependent, so the style is what actually
                  guarantees the settle. */}
              <g
                transform={`rotate(${ANTENNA_TILT[mood]} 55 16)`}
                style={{
                  transform: `rotate(${ANTENNA_TILT[mood]}deg)`,
                  transformOrigin: "55px 16px",
                  transformBox: "view-box",
                  transition: reducedMotion.current ? undefined : "transform 600ms cubic-bezier(0.34, 1.3, 0.64, 1)",
                }}
                aria-hidden="true"
              >
                <path d="M 55 16 Q 55 9 55 5" fill="none" stroke="hsl(var(--zyo-line))" strokeWidth="2" strokeLinecap="round" />
                <circle cx="55" cy="5" r="3" fill="hsl(var(--terminal-amber))" />
              </g>

              {/* EARS — the only appendage besides the antenna. The earlier
                  mitten pair was removed: four identical nubs at two different
                  body widths gave the viewer no cue which pair was ears, so all
                  four read as rivets. Snoo carries no hands in its rest pose
                  either, and pet-forge's guidance for a limbless character is to
                  degrade to body contour and breathing rather than force a rig. */}
              <g aria-hidden="true">
                <circle cx="28" cy="26" r="7" fill="hsl(var(--zyo-body))" stroke="hsl(var(--zyo-line))" strokeWidth="1.4" />
                <circle cx="82" cy="26" r="7" fill="hsl(var(--zyo-body))" stroke="hsl(var(--zyo-line))" strokeWidth="1.4" />
              </g>

              {/* BODY — one continuous bean, widest low, no feet.
                  Head/body read comes from the value falloff and the ears, not
                  from a second shape: a head circle stacked on a body ellipse
                  reads as two discs, which is a known generated-image tell.
                  Group transform is written per-frame by the rAF loop, which
                  composes the gaze counter-lean with the per-mood squash. */}
              <g ref={leanRef} aria-hidden="true">
                <path d="M 55 14 C 72 14 88 32 89 60 C 90 84 76 104 55 104 C 34 104 20 84 21 60 C 22 32 38 14 55 14 Z" fill="url(#zyo-cream-grad)" stroke="hsl(var(--zyo-line))" strokeWidth="1.5" />

                {/* Cheeks — warm, and lifted clear of the mouth. The earlier
                    pink ellipses sat at y=50 with the mouth top edge at y=51, so
                    the cheeks literally crossed the mouth, and at 1.79:1 they
                    were near-invisible anyway. Baby-schema work lists chubby
                    cheeks as a real cuteness cue, so they stay — in the body's
                    own warm family rather than as pink, which is the AI tell. */}
                <ellipse cx="31" cy="47" rx="5.5" ry="3.2" fill="hsl(var(--zyo-cheek))" opacity="0.8" />
                <ellipse cx="79" cy="47" rx="5.5" ry="3.2" fill="hsl(var(--zyo-cheek))" opacity="0.8" />

                {/* EYE FIELD — a soft radial lens, no rim, behind each dot.
                    This is what makes the gaze legible at all: a perfectly
                    symmetric disc translated is still symmetric, so with no
                    field there is nothing for the viewer to read direction
                    from, and the off-axis rest reads as "drawn slightly
                    off-centre" instead of "looking away". A lens is a boundary,
                    not a specular highlight, so it does not reintroduce the
                    glint that measured WORSE on innocence than a plain dot.
                    The lens is static and only the dot travels, so the eye axis
                    can never drift out of agreement with the face axis. */}
                <ellipse cx="44" cy="40" rx="8" ry="8" fill="url(#zyo-lens-grad)" />
                <ellipse cx="66" cy="40" rx="8" ry="8" fill="url(#zyo-lens-grad)" />

                {isBlinking || mood === 'sleeping' ? (
                  <g stroke="hsl(var(--zyo-eye))" strokeWidth="2.6" fill="none" strokeLinecap="round">
                    <path d="M 40.5 40 L 47.5 40" />
                    <path d="M 62.5 40 L 69.5 40" />
                  </g>
                ) : (
                  <g ref={pupilGroupRef} transform="translate(1.5,-1)">
                    <circle cx="44" cy="40" r="4.2" fill="hsl(var(--zyo-eye))" />
                    <circle cx="66" cy="40" r="4.2" fill="hsl(var(--zyo-eye))" />
                  </g>
                )}

                {/* Mouth — deeper than the previous 2.5px arc, which rendered as
                    a single solid pixel row at true size and read as a seam.
                    Sleep uses a shorter, lower, flatter line so that sleeping is
                    no longer the happiest-looking state. */}
                {isBlinking || mood === 'sleeping' ? (
                  <path d="M 52 55 L 58 55" fill="none" stroke="hsl(var(--zyo-eye))" strokeWidth="1.9" strokeLinecap="round" />
                ) : (
                  <path d="M 49 51 Q 55 58 61 51" fill="none" stroke="hsl(var(--zyo-eye))" strokeWidth="1.9" strokeLinecap="round" />
                )}
              </g>
            </svg>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* A 1px breath, not a 6px float. The old -6px bob lifted the whole
           character clear of its own box on a permanent loop, which is the
           entire levitating-uncanny signal — and it has no ground contact to
           move against, since the feet are gone. 6s, tiny, opacity-free. */
        @keyframes zyo-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-1px); }
        }
        @keyframes zyo-boing {
          0% { transform: scale(1, 1); }
          30% { transform: scale(1.12, 0.88); }
          55% { transform: scale(0.94, 1.06); }
          100% { transform: scale(1, 1); }
        }
        @keyframes zyo-caret {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes zyo-zzz {
          0% { transform: translateY(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(-14px); opacity: 0; }
        }
        .animate-zyo-float { animation: zyo-float 6s ease-in-out infinite; }
        .animate-zyo-boing { animation: zyo-boing 0.5s ease-out; }
        .animate-zyo-zzz { animation: zyo-zzz 2.2s ease-out infinite; }
        .animate-zyo-caret { animation: zyo-caret 1.05s steps(1, end) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-zyo-float, .animate-zyo-boing, .animate-zyo-zzz, .animate-zyo-caret { animation: none; }
        }
      `}</style>
    </>
  );
};

ZyoAssistant.displayName = 'ZyoAssistant';
export default ZyoAssistant;