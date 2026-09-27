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

const LOGS = ["SYSTEM_ONLINE", "ZYO_CORE_ACTIVE", "DOSSIER_INDEXED", "READY"];

const BOT_W = 110;
const BOT_H = 130;
const CLICK_DRAG_THRESHOLD_PX = 6;
const SPEECH_HIDE_MS = 6500;
const BLOCKED_NOTICE_MS = 10000;
const DISMISS_KEY = "zyo-dismissed";

type ProfileModule = typeof import("@/data/profile");

const vw = () => (typeof window === "undefined" ? 1280 : window.innerWidth);
const vh = () => (typeof window === "undefined" ? 800 : window.innerHeight);

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Real dossier facts only — built from the generated snapshot, never hardcoded. */
function buildFacts(profile: ProfileModule | null): string[] {
  const facts: string[] = [
    "TIP — type 'github' in the terminal for live repo stats",
    "TIP — type 'projects' to browse ranked work, 'method' for the formula",
    "TIP — a 12-puzzle CTF lives at /challenge",
  ];
  if (!profile) return facts;
  const {
    flagshipRepos, signalRepos, recentRepos, externalMentions,
    division36Systems, githubSignal, academicResearches, displayName, updatedLabel,
  } = profile;
  facts.push(
    `${githubSignal.combinedOwnedRepoStars} owned repo stars across ${githubSignal.publicRepos + githubSignal.division36PublicRepos} public repos`,
    `${academicResearches.length} research records with versioned Zenodo DOIs`
  );
  const grafana = flagshipRepos.find((r) => r.key === "Zierax/Grafana-Final-Scanner");
  if (grafana) {
    facts.unshift(
      `${displayName(grafana)}: ${grafana.stars} stars, ${grafana.forks} forks — most-adopted tool here`
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
        `Z-Jail is cited by ${outlets.slice(0, 3).join(", ")}${outlets.length > 3 ? ` +${outlets.length - 3} more` : ""}`
      );
    }
  }
  const topSignal = signalRepos[0];
  if (topSignal) {
    facts.push(`${displayName(topSignal)} leads the signal stream at ${topSignal.stars} stars`);
  }
  const freshest = recentRepos[0];
  if (freshest) {
    facts.push(`${displayName(freshest)} updated ${updatedLabel(freshest.updatedAt)} — freshest activity`);
  }
  if (externalMentions.length > 0) {
    facts.push(`${externalMentions.length} third-party citations tracked — see 'mentions' in the terminal`);
  }
  if (division36Systems.length > 0) {
    facts.push(`Division-36 runs ${division36Systems.slice(0, 3).map((s) => s.name).join(" · ")} as public benchmarks`);
  }
  const newestPaper = academicResearches[0];
  if (newestPaper && newestPaper.status) {
    facts.push(`Research record: ${newestPaper.title.slice(0, 60)}… — ${newestPaper.status}`);
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

  const [speech, setSpeech] = useState<string | null>(null);
  const speechTimer = useRef<number | null>(null);
  const factIdx = useRef(0);
  const profileRef = useRef<ProfileModule | null>(null);

  // Refs mutated by the rAF loop — never state.
  const botRef = useRef<HTMLDivElement>(null);
  const pupilGroupRef = useRef<SVGGElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const mobileBtnRef = useRef<HTMLButtonElement>(null);
  const posRef = useRef<Position>({ x: vw() - 120, y: vh() - 150 });
  const targetRef = useRef<Position>({ x: vw() - 120, y: vh() - 150 });
  const mouseRef = useRef<Position>({ x: vw() / 2, y: vh() / 2 });
  const lastMoveRef = useRef<number>(Date.now());
  const [bounceKey, setBounceKey] = useState(0);
  const draggingRef = useRef(false);
  const mountedRef = useRef(true);
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
      // Pupils follow the cursor, clamped to a 2.5px radius.
      if (pupilGroupRef.current && !reducedMotion.current) {
        const dx = mouseRef.current.x - (posRef.current.x + 55);
        const dy = mouseRef.current.y - (posRef.current.y + 45);
        const angle = Math.atan2(dy, dx);
        const dist = Math.min(2.5, Math.sqrt(dx * dx + dy * dy) / 80);
        pupilGroupRef.current.setAttribute(
          "transform",
          `translate(${(Math.cos(angle) * dist).toFixed(2)},${(Math.sin(angle) * dist).toFixed(2)})`
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
        const dy = mouseRef.current.y - (posRef.current.y + 45);
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
    let facts: string[];
    try {
      facts = buildFacts(profileRef.current);
    } catch {
      facts = ["TIP — type 'help' in the terminal to start exploring"];
    }
    setSpeech(facts[factIdx.current % facts.length]);
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

  if (dismissed) return null;

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

      {/* Compact music access below lg (pet stays desktop-only) */}
      <button
        ref={mobileBtnRef}
        onClick={openPlayer}
        aria-label="Open music player"
        title="Music player"
        className="fixed bottom-4 right-4 z-[9999] rounded-full border border-terminal-green/40 bg-card p-3 text-terminal-green shadow-2xl transition-colors hover:border-terminal-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-terminal-green lg:hidden"
      >
        <Music size={18} />
      </button>
      {showPlayer && (
        <div className="fixed bottom-16 right-4 z-[9999] lg:hidden">
          <PlayerPanel {...panelProps} onClose={closePlayerMobile} />
        </div>
      )}

      <div
        ref={botRef}
        className="fixed left-0 top-0 z-[9999] hidden select-none lg:block"
        style={{ touchAction: 'none' }}
      >
        <div className="relative flex flex-col items-center group">

          {/* Status Label (decorative — hidden from assistive tech, and out
              of the way while the speech bubble is up) */}
          <div
            aria-hidden="true"
            className={`
            absolute -top-10 px-3 py-1 rounded-md bg-black/85 text-terminal-green
            text-[10px] font-mono tracking-widest border border-terminal-green/30
            transition-all duration-300 motion-reduce:transition-none ${mood !== 'idle' && !speech ? 'opacity-100' : 'opacity-0'}
          `}>
            [{statusText}]
          </div>

          {/* Speech bubble — announced politely when a fact lands */}
          <div
            role="status"
            onMouseEnter={holdSpeech}
            onMouseLeave={releaseSpeech}
            className={`
            absolute -top-10 left-1/2 -translate-x-1/2 -translate-y-full w-60 p-3 pr-8 rounded-lg
            bg-card border border-terminal-green/40 shadow-2xl transition-all motion-reduce:transition-none
            ${speech ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}
          `}>
            <p className="text-xs font-mono leading-5 text-foreground">{speech}</p>
            {speech && (
              <button
                onClick={() => {
                  if (speechTimer.current !== null) window.clearTimeout(speechTimer.current);
                  setSpeech(null);
                }}
                aria-label="Dismiss fact"
                className="absolute right-1.5 top-1.5 rounded-full p-1.5 text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-terminal-green"
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
            className="absolute -right-12 top-4 rounded-full border border-border bg-card p-2 text-muted-foreground opacity-0 transition-all hover:border-terminal-green/50 hover:text-terminal-green group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-terminal-green"
          >
            <Music size={16} />
          </button>

          <button
            onClick={dismiss}
            aria-label="Hide Zyo assistant"
            title="Hide assistant"
            className="absolute -left-10 top-4 rounded-full border border-border bg-card p-1.5 text-muted-foreground opacity-0 transition-all hover:border-terminal-red/60 hover:text-terminal-red group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-terminal-green"
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

          {/* 🤖 THE ROBOT ASSISTANT */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="cursor-grab active:cursor-grabbing transition-transform duration-200 group-hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terminal-green"
            role="button"
            tabIndex={0}
            aria-label="Zyo assistant. Press Enter for a dossier fact, M for music."
            onKeyDown={handleKeyDown}
          >
            {mood === 'sleeping' && (
              <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-4 flex flex-col items-center">
                <span className="font-mono text-sm font-bold text-terminal-green animate-zyo-zzz">z</span>
                <span className="font-mono text-[10px] font-bold text-terminal-green/70 animate-zyo-zzz" style={{ animationDelay: "0.6s" }}>z</span>
                <span className="font-mono text-[8px] font-bold text-terminal-green/50 animate-zyo-zzz" style={{ animationDelay: "1.2s" }}>z</span>
              </div>
            )}
            <div key={bounceKey} className={bounceKey > 0 && !reducedMotion.current ? "animate-zyo-boing" : undefined}>
            <svg width="110" height="130" viewBox="0 0 110 130" aria-hidden="true" className={reducedMotion.current ? undefined : "animate-zyo-float"}>

              {/* 1. FIBER DREADS */}
              <g stroke="hsl(var(--border))" strokeWidth="4" fill="none" strokeLinecap="round" >
                <path d="M 40 30 Q 30 20 20 50" />
                <path d="M 45 25 Q 40 10 35 45" />
                <path d="M 65 25 Q 70 10 75 45" />
                <path d="M 70 30 Q 80 20 90 50" />
                {/* Status tips */}
                <circle cx="20" cy="50" r="1.5" fill="hsl(var(--terminal-green))" className={reducedMotion.current ? undefined : "animate-pulse"} />
                <circle cx="90" cy="50" r="1.5" fill="hsl(var(--terminal-green))" className={reducedMotion.current ? undefined : "animate-pulse"} />
              </g>

              {/* 2. CHASSIS */}
              <g transform="translate(25, 60)" aria-hidden="true">
                <path d="M 10 0 L 50 0 L 55 35 L 5 35 Z" fill="hsl(var(--card))" stroke="hsl(var(--terminal-green) / 0.4)" strokeWidth="1" />
                <rect x="15" y="10" width="30" height="15" rx="2" fill="hsl(var(--background))" />
                <path d="M 20 12 L 40 12" stroke="hsl(var(--terminal-green))" strokeWidth="0.5" opacity="0.6" />
                {/* Core light */}
                <circle cx="30" cy="29" r="3.5" fill="hsl(var(--terminal-green))" opacity="0.85" className={reducedMotion.current ? undefined : "animate-pulse"} />
                <circle cx="30" cy="29" r="1.5" fill="#eafff0" />
              </g>

              {/* 2b. THRUSTER GLOW */}
              <ellipse cx="55" cy="101" rx="9" ry="2.5" fill="hsl(var(--terminal-green))" opacity="0.3" className={reducedMotion.current ? undefined : "animate-zyo-thrust"} aria-hidden="true" />

              {/* 3. HEAD UNIT */}
              <g transform="translate(55, 40)" className={mood === 'dancing' && !reducedMotion.current ? 'animate-zyo-head' : ''} aria-hidden="true">
                {/* Antenna */}
                <line x1="0" y1="-25" x2="0" y2="-34" stroke="hsl(var(--terminal-green) / 0.6)" strokeWidth="2" strokeLinecap="round" />
                <circle cx="0" cy="-36" r="2" fill="hsl(var(--terminal-green))" className={reducedMotion.current ? undefined : "animate-pulse"} />
                {/* Ear fins */}
                <path d="M -28 -6 L -37 1 L -28 7 Z" fill="hsl(var(--card))" stroke="hsl(var(--terminal-green) / 0.4)" strokeWidth="1" />
                <path d="M 28 -6 L 37 1 L 28 7 Z" fill="hsl(var(--card))" stroke="hsl(var(--terminal-green) / 0.4)" strokeWidth="1" />
                {/* Main Case */}
                <rect x="-28" y="-25" width="56" height="50" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--terminal-green) / 0.4)" strokeWidth="1.5" />

                {/* Optical Sensors */}
                <g stroke="hsl(var(--terminal-green) / 0.55)" strokeWidth="1.5" fill="none">
                  <circle cx="-12" cy="-3" r="10" />
                  <circle cx="12" cy="-3" r="10" />
                  <path d="M -2 -3 L 2 -3" />
                </g>

                {/* Eyes Logic — closed while blinking or dreaming */}
                {isBlinking || mood === 'sleeping' ? (
                   <g stroke="hsl(var(--terminal-green))" strokeWidth="2">
                     <line x1="-18" y1="-3" x2="-6" y2="-3" />
                     <line x1="6" y1="-3" x2="18" y2="-3" />
                   </g>
                ) : (
                  <g ref={pupilGroupRef} transform="translate(0,0)">
                    <circle cx={-10} cy={-3} r="4" fill="hsl(var(--terminal-green))" opacity="0.9" />
                    <circle cx={10} cy={-3} r="4" fill="hsl(var(--terminal-green))" opacity="0.9" />
                    <circle cx={-10} cy={-3} r="1.5" fill="#eafff0" />
                    <circle cx={10} cy={-3} r="1.5" fill="#eafff0" />
                  </g>
                )}
              </g>

              {/* 4. ARMS + HANDS */}
              <g stroke="hsl(var(--border))" strokeWidth="6" strokeLinecap="round" aria-hidden="true">
                <path d="M 25 75 L 10 100" />
                <path d="M 85 75 L 100 100" />
              </g>
              <g aria-hidden="true">
                <circle cx="10" cy="101" r="3.5" fill="hsl(var(--background))" stroke="hsl(var(--terminal-green) / 0.5)" strokeWidth="1.5" />
                <circle cx="100" cy="101" r="3.5" fill="hsl(var(--background))" stroke="hsl(var(--terminal-green) / 0.5)" strokeWidth="1.5" />
              </g>

            </svg>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes zyo-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes zyo-boing {
          0% { transform: scale(1, 1); }
          30% { transform: scale(1.12, 0.88); }
          55% { transform: scale(0.94, 1.06); }
          100% { transform: scale(1, 1); }
        }
        @keyframes zyo-zzz {
          0% { transform: translateY(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(-14px); opacity: 0; }
        }
        @keyframes zyo-thrust {
          0%, 100% { opacity: 0.22; }
          50% { opacity: 0.45; }
        }
        @keyframes zyo-head {
          0%, 100% { transform: translate(55px, 40px) rotate(0deg); }
          50% { transform: translate(55px, 40px) rotate(5deg); }
        }
        .animate-zyo-float { animation: zyo-float 3s ease-in-out infinite; }
        .animate-zyo-head { animation: zyo-head 0.5s ease-in-out infinite; }
        .animate-zyo-boing { animation: zyo-boing 0.5s ease-out; }
        .animate-zyo-zzz { animation: zyo-zzz 2.2s ease-out infinite; }
        .animate-zyo-thrust { animation: zyo-thrust 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-zyo-float, .animate-zyo-head, .animate-zyo-boing, .animate-zyo-zzz, .animate-zyo-thrust { animation: none; }
        }
      `}</style>
    </>
  );
};

ZyoAssistant.displayName = 'ZyoAssistant';
export default ZyoAssistant;