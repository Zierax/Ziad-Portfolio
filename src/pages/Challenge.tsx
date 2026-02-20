import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Info, Lock, Unlock, Terminal, Trophy } from "lucide-react";
import { toast } from "sonner";

type PuzzleType = "cipher" | "logic" | "binary" | "hash";

interface Puzzle {
  id: PuzzleType;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  hint: string;
  getAnswer: (deviceInfo: any) => string;
  getEncrypted: (deviceInfo: any) => string;
}

const Challenge = () => {
  const [consentGiven, setConsentGiven] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleType>("cipher");
  const [userAnswer, setUserAnswer] = useState("");
  const [solvedPuzzles, setSolvedPuzzles] = useState<Set<PuzzleType>>(new Set());
  const [attempts, setAttempts] = useState(0);

  const puzzles: Record<PuzzleType, Puzzle> = {
    cipher: {
      id: "cipher",
      title: "Screen Cipher Challenge",
      description: "Decode the Caesar cipher using your screen width as the key",
      difficulty: "Easy",
      hint: "Your screen width modulo 26 is the shift value (add to decode)",
      getAnswer: (info) => "WELCOME TO THE HACKER CHALLENGE",
      getEncrypted: (info) => {
        const text = "WELCOME TO THE HACKER CHALLENGE";
        if (!info) return text;
        let shift = info.screenWidth % 26;
        shift = (26 - shift) % 26; // reverse shift for "encoding" so that adding it back decodes
        return text.split('').map(c => {
          if (c === ' ') return ' ';
          const code = c.charCodeAt(0);
          return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        }).join('');
      },
    },
    logic: {
      id: "logic",
      title: "Port Scanner Logic",
      description: "Calculate the missing port number in the sequence",
      difficulty: "Medium",
      hint: "The pattern follows: (2^n * 10) + your CPU cores",
      getAnswer: (info) => String(160 + (info?.hardwareConcurrency || 4)),
      getEncrypted: (info) => {
        const cores = info?.hardwareConcurrency || 4;
        return `Sequence: ${20 + cores}, ${40 + cores}, ${80 + cores}, ???`;
      },
    },
    binary: {
      id: "binary",
      title: "Binary Decoder",
      description: "Convert the binary message to text",
      difficulty: "Medium",
      hint: "8 bits per character, ASCII encoding",
      getAnswer: () => "HACKED",
      getEncrypted: () => "01001000 01000001 01000011 01001011 01000101 01000100",
    },
    hash: {
      id: "hash",
      title: "System Role Identification",
      description: "What is your primary professional title shown in the terminal?",
      difficulty: "Hard",
      hint: `Your clearance level or primary role. Begins with P.`,
      getAnswer: (info) => "PENTESTER",
      getEncrypted: () => `Role_Hash: 0x${Math.random().toString(16).substring(2, 10)}`,
    },
  };

  const collectDeviceInfo = () => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
      deviceMemory: (navigator as any).deviceMemory || 4,
    };

    setDeviceInfo(info);
    setConsentGiven(true);
    toast.success("Device info collected. Starting challenge...");
  };

  const checkAnswer = () => {
    const puzzle = puzzles[currentPuzzle];
    const correctAnswer = puzzle.getAnswer(deviceInfo);

    if (userAnswer.toUpperCase().trim() === correctAnswer.toUpperCase()) {
      setSolvedPuzzles((prev) => new Set(prev).add(currentPuzzle));
      toast.success(`🎉 Correct! Puzzle "${puzzle.title}" solved!`);
      setUserAnswer("");
      setAttempts(0);
    } else {
      setAttempts((prev) => prev + 1);
      if (attempts >= 2) {
        toast.error(`Incorrect. Hint: ${puzzle.hint}`);
      } else {
        toast.error("Incorrect answer. Try again!");
      }
    }
  };

  const allPuzzlesSolved = solvedPuzzles.size === Object.keys(puzzles).length;
  const currentPuzzleData = puzzles[currentPuzzle];

  return (
    <div className="min-h-screen bg-background crt-screen text-foreground font-mono">
      <header className="glass-panel border-b border-terminal-green/20 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link to="/portfolio" className="text-terminal-green hover:text-terminal-green/80 flex items-center gap-2 transition-colors">
              <span>←</span> BACK_TO_ROOT
            </Link>
            <div className="flex items-center gap-3">
              <Shield className="text-terminal-red animate-pulse" size={24} />
              <h1 className="text-xl md:text-2xl font-cyber text-terminal-amber tracking-widest">
                CHALLENGE_MODE
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {!consentGiven && (
            <div className="glass-panel rounded-xl p-8 space-y-6 animate-fade-in border border-terminal-red/30 shadow-[0_0_30px_rgba(255,0,0,0.1)]">
              <div className="flex items-start gap-4">
                <Info className="text-terminal-red flex-shrink-0 mt-1" size={28} />
                <div>
                  <h2 className="text-3xl font-bold font-cyber text-terminal-red mb-4 glitch-container" data-text="SECURITY NOTICE">
                    <span className="glitch-layer text-terminal-red">SECURITY NOTICE</span>
                    SECURITY NOTICE
                  </h2>
                  <p className="text-muted-foreground mb-4 leading-relaxed text-lg">
                    This hacker challenge requires reading basic device information from your browser
                    for puzzle generation. All data is processed{" "}
                    <span className="text-terminal-amber font-semibold">
                      client-side only
                    </span>{" "}
                    and is never stored or transmitted to any server.
                  </p>

                  <div className="bg-black/40 rounded-lg p-6 mb-6 border border-terminal-green/20">
                    <p className="font-semibold mb-3 text-terminal-green text-lg">
                      [DATA_COLLECTION_MANIFEST]
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-primary/70">
                      <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-terminal-green" />
                        <span>Browser User Agent string</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-terminal-green" />
                        <span>Platform Architecture</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-terminal-green" />
                        <span>Display Resolution</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-terminal-green" />
                        <span>System Local Time</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-terminal-green" />
                        <span>Thread Concurrency</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={collectDeviceInfo}
                      className="px-8 py-4 rounded bg-terminal-green/10 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-black transition-all font-bold flex items-center justify-center gap-3 text-lg hover:shadow-[0_0_20px_rgba(0,255,65,0.4)]"
                    >
                      <Unlock size={20} />
                      INITIATE_HANDSHAKE
                    </button>
                    <Link
                      to="/portfolio"
                      className="px-8 py-4 rounded border border-white/10 text-muted-foreground hover:bg-white/5 transition-colors font-semibold text-center text-lg flex items-center justify-center gap-2"
                    >
                      TERMINATE_CONN
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {consentGiven && deviceInfo && !allPuzzlesSolved && (
            <>
              {/* Device Profile */}
              <div className="glass-panel rounded-xl p-6 md:p-8 border border-terminal-green/20">
                <h2 className="text-2xl font-bold font-cyber text-terminal-green mb-6 flex items-center gap-2">
                  <Lock className="text-terminal-green" size={24} />
                  SYSTEM_RECONNAISSANCE
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-sm">
                  <div className="bg-black/30 p-4 rounded border border-white/5">
                    <div className="text-xs text-muted-foreground mb-1">PLATFORM</div>
                    <div className="text-neon-blue">{deviceInfo.platform}</div>
                  </div>
                  <div className="bg-black/30 p-4 rounded border border-white/5">
                    <div className="text-xs text-muted-foreground mb-1">DISPLAY</div>
                    <div className="text-neon-purple">{deviceInfo.screenWidth}x{deviceInfo.screenHeight}</div>
                  </div>
                  <div className="bg-black/30 p-4 rounded border border-white/5">
                    <div className="text-xs text-muted-foreground mb-1">CPU THREADS</div>
                    <div className="text-neon-pink">{deviceInfo.hardwareConcurrency} CORES</div>
                  </div>
                </div>
              </div>

              {/* Puzzle Selection */}
              <div className="glass-panel rounded-xl p-6 md:p-8 border border-terminal-amber/20">
                <h2 className="text-2xl font-bold font-cyber text-terminal-amber mb-6">SELECT_VECTOR</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.values(puzzles).map((puzzle) => (
                    <button
                      key={puzzle.id}
                      onClick={() => {
                        setCurrentPuzzle(puzzle.id);
                        setUserAnswer("");
                        setAttempts(0);
                      }}
                      className={`p-4 rounded text-left transition-all border ${currentPuzzle === puzzle.id
                        ? "bg-terminal-green/5 border-terminal-green"
                        : "bg-black/20 border-white/5 hover:border-white/20"
                        } ${solvedPuzzles.has(puzzle.id)
                          ? "opacity-50 grayscale"
                          : ""
                        }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-terminal-green font-bold text-sm">
                          {puzzle.title}
                        </h3>
                        {solvedPuzzles.has(puzzle.id) && (
                          <span className="text-terminal-green">✓</span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] uppercase px-2 py-0.5 rounded ${puzzle.difficulty === "Easy"
                          ? "bg-green-500/20 text-green-500"
                          : puzzle.difficulty === "Medium"
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-red-500/20 text-red-500"
                          }`}
                      >
                        {puzzle.difficulty}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Puzzle */}
              {!solvedPuzzles.has(currentPuzzle) && (
                <div className="glass-panel rounded-xl p-6 md:p-8 border border-neon-blue/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-3xl font-bold font-cyber text-neon-blue">
                      {currentPuzzleData.title}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded text-sm font-semibold border ${currentPuzzleData.difficulty === "Easy"
                        ? "border-green-500/50 text-green-500"
                        : currentPuzzleData.difficulty === "Medium"
                          ? "border-yellow-500/50 text-yellow-500"
                          : "border-red-500/50 text-red-500"
                        }`}
                    >
                      {currentPuzzleData.difficulty}
                    </span>
                  </div>

                  <p className="text-muted-foreground mb-8 text-lg">
                    {currentPuzzleData.description}
                  </p>

                  <div className="bg-black/50 rounded-lg p-8 mb-8 border border-neon-blue/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-neon-blue animate-scanline opacity-50"></div>
                    <p className="font-mono text-xl text-neon-blue text-center tracking-widest break-all">
                      {currentPuzzleData.getEncrypted(deviceInfo)}
                    </p>
                  </div>

                  {attempts >= 2 && (
                    <div className="text-sm text-yellow-500 mb-6 animate-fade-in flex items-center gap-2 bg-yellow-500/10 p-4 rounded border border-yellow-500/20">
                      <Info size={18} />
                      <span><span className="font-bold">HINT_DECRYPTED:</span> {currentPuzzleData.hint}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                      placeholder="ENTER_DECRYPTION_KEY..."
                      className="w-full bg-black/40 border-2 border-white/10 rounded px-4 py-4 text-foreground outline-none focus:border-neon-blue focus:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all font-mono text-lg placeholder:text-muted-foreground/50"
                    />
                    <button
                      onClick={checkAnswer}
                      disabled={!userAnswer.trim()}
                      className="w-full py-4 rounded bg-neon-blue/10 border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black transition-all font-bold tracking-wider disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                    >
                      EXECUTE_PAYLOAD
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {allPuzzlesSolved && (
            <div className="glass-panel rounded-xl p-12 text-center animate-fade-in border border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
              <Trophy className="text-yellow-500 mx-auto mb-8 animate-bounce" size={80} />
              <h2 className="text-4xl md:text-5xl font-bold font-cyber text-yellow-500 mb-6">
                SYSTEM_PWNED
              </h2>
              <p className="text-muted-foreground text-xl mb-12 max-w-2xl mx-auto">
                Congratulations, elite hacker. You have successfully bypassed all security layers.
              </p>

              <div className="inline-block px-12 py-8 rounded-lg border-2 border-yellow-500 bg-yellow-500/5 mb-12 relative overflow-hidden group">
                <div className="absolute inset-0 bg-yellow-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <p className="font-cyber font-bold text-3xl mb-3 text-yellow-500 relative z-10">
                  ROOT_ACCESS_GRANTED
                </p>
                <div className="text-sm font-mono text-yellow-500/80 relative z-10">
                  FLAG: CTF{'{'}WH0_4M_I?{'}'}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/portfolio"
                  className="px-8 py-4 rounded border border-terminal-green/50 text-terminal-green hover:bg-terminal-green hover:text-black transition-colors font-bold uppercase tracking-wider"
                >
                  RETURN_HOME
                </Link>
                <button
                  onClick={() => {
                    setSolvedPuzzles(new Set());
                    setCurrentPuzzle("cipher");
                    setUserAnswer("");
                    setAttempts(0);
                    toast.success("System rebooted!");
                  }}
                  className="px-8 py-4 rounded border border-white/10 text-muted-foreground hover:bg-white/10 transition-colors font-bold uppercase tracking-wider"
                >
                  REBOOT_SYSTEM
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 mt-12 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground font-mono">
            [SECURE_LOGS_ENABLED] Traffic monitored for training purposes.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Challenge;
