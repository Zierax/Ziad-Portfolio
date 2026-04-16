import React, { useEffect, useState, memo, useRef, useCallback } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, X, Music, Terminal 
} from 'lucide-react';

// ==========================================
// ⚙️ SYSTEM CONSTANTS
// ==========================================

type Mood = 'idle' | 'coding' | 'watching' | 'dancing' | 'dragged';

interface Position { x: number; y: number; }

const PLAYLIST = [
  { id: 1, name: "God Alert", artist: "Creator", file: "/src/music/God Alert.mp3" },
  { id: 2, name: "Creator's Move", artist: "Ziad", file: "/src/music/The Creator´s move.mp3" },
  { id: 3, name: "Fallen Cathedral", artist: "System", file: "/src/music/The Fallen Cathedral.mp3" },
  { id: 4, name: "The Holy Theft", artist: "Rogue", file: "/src/music/The Holy Theft.mp3" },
  { id: 5, name: "Whiplash", artist: "Vibes", file: "/src/music/Whiplash.mp3" },
];

const LOGS = ["AWAITING_INPUT", "SYSTEM_ONLINE", "ZYO_CORE_ACTIVE", "VIBE_CHECK_PASSED", "SEC_AUDIT_COMPLETE"];

// ==========================================
// 🧰 UTILITY HOOKS
// ==========================================

const useMousePosition = () => {
  const [mousePos, setMousePos] = useState<Position>({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  return mousePos;
};

// ==========================================
// 🎨 MAIN ZYO COMPONENT
// ==========================================

const ZyoAssistant: React.FC = memo(() => {
  const [position, setPosition] = useState<Position>({ x: window.innerWidth - 120, y: window.innerHeight - 150 });
  const [targetPos, setTargetPos] = useState<Position>({ x: window.innerWidth - 120, y: window.innerHeight - 150 });
  const [mood, setMood] = useState<Mood>('idle');
  const [isBlinking, setIsBlinking] = useState(false);
  const [statusText, setStatusText] = useState(LOGS[0]);
  
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });

  const [showPlayer, setShowPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const mousePos = useMousePosition();

  // ----------------------------------------
  // 🧠 BEHAVIOR ENGINE
  // ----------------------------------------

  useEffect(() => {
    const handleResize = () => setTargetPos({ x: window.innerWidth - 120, y: window.innerHeight - 150 });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDragging) return;
    let frame: number;
    const update = () => {
      setPosition(prev => ({
        x: prev.x + (targetPos.x - prev.x) * 0.08,
        y: prev.y + (targetPos.y - prev.y) * 0.08
      }));
      frame = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(frame);
  }, [targetPos, isDragging]);

  useEffect(() => {
    const loop = () => {
      if (isDragging) return;
      if (isPlaying) {
        setMood('dancing');
        setStatusText("SYNCING_BEATS");
        return;
      }

      const rand = Math.random();
      if (rand < 0.3) {
        setMood('coding');
        setStatusText("INJECTING_PAYLOAD");
      } else if (rand < 0.6) {
        setMood('watching');
        setStatusText("SNIFFING_PACKETS");
      } else {
        setMood('idle');
        setStatusText(LOGS[Math.floor(Math.random() * LOGS.length)]);
      }
    };
    const timer = setInterval(loop, 4000);
    return () => clearInterval(timer);
  }, [isPlaying, isDragging]);

  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      setTimeout(blink, 3000 + Math.random() * 5000);
    };
    const timer = setTimeout(blink, 1000);
    return () => clearTimeout(timer);
  }, []);

  // ----------------------------------------
  // 🖱️ INTERACTIONS
  // ----------------------------------------

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setMood('dragged');
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;
    setPosition({ x: newX, y: newY });
    setTargetPos({ x: newX, y: newY });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setMood('idle');
  }, []);

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

  // ----------------------------------------
  // 🎵 AUDIO ENGINE
  // ----------------------------------------

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateProgress = () => setProgress((audio.currentTime / audio.duration) * 100 || 0);
    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(console.error);
    setIsPlaying(!isPlaying);
  };

  const changeTrack = (dir: 1 | -1) => {
    let next = (currentTrackIdx + dir + PLAYLIST.length) % PLAYLIST.length;
    setCurrentTrackIdx(next);
    setProgress(0);
    if (isPlaying) setTimeout(() => audioRef.current?.play(), 50);
  };

  // ----------------------------------------
  // 👁️ SENSOR TRACKING
  // ----------------------------------------

  const getPupils = () => {
    if (isBlinking) return { lx: -10, ly: -3, rx: 10, ry: -3 };
    const dx = mousePos.x - (position.x + 55);
    const dy = mousePos.y - (position.y + 45);
    const angle = Math.atan2(dy, dx);
    const dist = Math.min(2.5, Math.sqrt(dx*dx + dy*dy) / 80);
    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist;
    return { lx: -10 + px, ly: -3 + py, rx: 10 + px, ry: -3 + py };
  };
  const pupils = getPupils();

  // ==========================================
  // 🎨 RENDER
  // ==========================================

  return (
    <>
      <audio ref={audioRef} src={PLAYLIST[currentTrackIdx].file} onEnded={() => changeTrack(1)} />

      <div
        className="fixed z-[9999] select-none"
        style={{ left: `${position.x}px`, top: `${position.y}px`, touchAction: 'none' }}
      >
        <div className="relative flex flex-col items-center group">
          
          {/* Status Label */}
          <div className={`
            absolute -top-10 px-3 py-1 rounded-md bg-black/80 text-cyan-400 
            text-[10px] font-mono border border-cyan-500/30 backdrop-blur-md
            transition-all duration-300 ${mood !== 'idle' ? 'opacity-100' : 'opacity-0'}
          `}>
            [{statusText}]
          </div>

          <button 
            onClick={() => setShowPlayer(!showPlayer)}
            className="absolute -right-12 top-4 p-2 rounded-full bg-zinc-900 border border-zinc-700 text-white opacity-0 group-hover:opacity-100 transition-all"
          >
            <Music size={16} />
          </button>

          {/* Player UI */}
          <div className={`
            absolute top-full mt-4 w-64 p-4 rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl transition-all
            ${showPlayer ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}
          `}>
            <div className="flex justify-between items-center mb-3">
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{PLAYLIST[currentTrackIdx].name}</p>
                <p className="text-[10px] text-zinc-500">{PLAYLIST[currentTrackIdx].artist}</p>
              </div>
              <X size={14} className="text-zinc-500 cursor-pointer" onClick={() => setShowPlayer(false)} />
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={() => changeTrack(-1)}><SkipBack size={16} className="text-white"/></button>
              <button onClick={togglePlay} className="p-2 bg-white rounded-full text-black">
                {isPlaying ? <Pause size={16} fill="black"/> : <Play size={16} fill="black"/>}
              </button>
              <button onClick={() => changeTrack(1)}><SkipForward size={16} className="text-white"/></button>
              <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          {/* 🤖 THE ROBOT ASSISTANT */}
          <div onMouseDown={handleMouseDown} className="cursor-grab active:cursor-grabbing">
            <svg width="110" height="130" viewBox="0 0 110 130" className="animate-zyo-float">
              
              {/* 1. FIBER DREADS (Silhouette Cables) */}
              <g stroke="#18181b" strokeWidth="4" fill="none" strokeLinecap="round">
                <path d="M 40 30 Q 30 20 20 50" />
                <path d="M 45 25 Q 40 10 35 45" />
                <path d="M 65 25 Q 70 10 75 45" />
                <path d="M 70 30 Q 80 20 90 50" />
                {/* Glow Tips */}
                <circle cx="20" cy="50" r="1.5" fill="#06b6d4" className="animate-pulse" />
                <circle cx="90" cy="50" r="1.5" fill="#06b6d4" className="animate-pulse" />
              </g>

              {/* 2. CHASSIS */}
              <g transform="translate(25, 60)">
                <path d="M 10 0 L 50 0 L 55 35 L 5 35 Z" fill="#27272a" stroke="#C5A059" strokeWidth="1" />
                <rect x="15" y="10" width="30" height="15" rx="2" fill="#18181b" />
                <path d="M 20 12 L 40 12" stroke="#06b6d4" strokeWidth="0.5" opacity="0.5" />
              </g>

              {/* 3. HEAD UNIT */}
              <g transform="translate(55, 40)" className={mood === 'dancing' ? 'animate-zyo-head' : ''}>
                {/* Main Case */}
                <rect x="-28" y="-25" width="56" height="50" rx="12" fill="#18181b" stroke="#C5A059" strokeWidth="1.5" />
                
                {/* Optical Sensors (The Glasses look) */}
                <g stroke="#C5A059" strokeWidth="1.5" fill="none">
                  <circle cx="-12" cy="-3" r="10" />
                  <circle cx="12" cy="-3" r="10" />
                  <path d="M -2 -3 L 2 -3" />
                </g>

                {/* Eyes Logic */}
                {isBlinking ? (
                   <g stroke="#06b6d4" strokeWidth="2">
                     <line x1="-18" y1="-3" x2="-6" y2="-3" />
                     <line x1="6" y1="-3" x2="18" y2="-3" />
                   </g>
                ) : (
                  <g>
                    <circle cx={pupils.lx} cy={pupils.ly} r="4" fill="#06b6d4" opacity="0.8" />
                    <circle cx={pupils.rx} cy={pupils.ry} r="4" fill="#06b6d4" opacity="0.8" />
                    <circle cx={pupils.lx} cy={pupils.ly} r="1.5" fill="white" />
                    <circle cx={pupils.rx} cy={pupils.ry} r="1.5" fill="white" />
                  </g>
                )}

                {/* LED Mouth */}
                <g transform="translate(0, 15)">
                  {mood === 'coding' ? (
                    <rect x="-10" y="0" width="20" height="2" fill="#06b6d4" className="animate-pulse" />
                  ) : (
                    <path d="M -8 0 Q 0 4 8 0" stroke="#06b6d4" fill="none" strokeWidth="1.5" />
                  )}
                </g>
              </g>

              {/* 4. ARMS */}
              <g stroke="#18181b" strokeWidth="6" strokeLinecap="round">
                <path d="M 25 75 L 10 100" />
                <path d="M 85 75 L 100 100" />
              </g>

            </svg>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes zyo-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes zyo-head {
          0%, 100% { transform: translate(55px, 40px) rotate(0deg); }
          50% { transform: translate(55px, 40px) rotate(5deg); }
        }
        .animate-zyo-float { animation: zyo-float 3s ease-in-out infinite; }
        .animate-zyo-head { animation: zyo-head 0.5s ease-in-out infinite; }
      `}</style>
    </>
  );
});

ZyoAssistant.displayName = 'ZyoAssistant';
export default ZyoAssistant;