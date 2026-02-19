import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { profileData } from "@/data/profile";

const bootSequence = [
  { text: "INITIALIZING KERNEL...", delay: 50 },
  { text: "LOADING SECURITY MODULES...", delay: 100 },
  { text: "[OK] CPU 0: INTEL CORE RECEIVED INTERRUPT", delay: 50 },
  { text: "[OK] MOUNTING CRYPTO FILESYSTEM", delay: 150 },
  { text: `LOADING USER PROFILE: ${profileData.name.toUpperCase()}`, delay: 200 },
  { text: "ESTABLISHING SECURE CONNECTION...", delay: 200 },
  { text: "BYPASSING FIREWALLS...", delay: 300 },
  { text: "INJECTING PAYLOAD...", delay: 250 },
  { text: "[SUCCESS] ROOT ACCESS GRANTED", delay: 300, className: "text-terminal-red font-bold" },
  { text: "SYSTEM READY", delay: 400 },
  { text: "WELCOME TO THE MAINFRAME", delay: 500, className: "text-neon-blue font-bold text-lg" },
];

const Boot = () => {
  const [lines, setLines] = useState<{ text: string; className?: string }[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const displayNextLine = () => {
      if (currentIndex < bootSequence.length) {
        const currentLine = bootSequence[currentIndex];
        setLines((prev) => [...prev, { text: currentLine.text, className: currentLine.className }]);
        const nextDelay = currentLine.delay;
        currentIndex++;

        if (currentIndex < bootSequence.length) {
          timeoutId = setTimeout(displayNextLine, nextDelay);
        } else {
          timeoutId = setTimeout(() => setIsComplete(true), nextDelay);
        }
      }
    };

    timeoutId = setTimeout(displayNextLine, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const handleEnter = () => {
    navigate("/portfolio");
  };

  return (
    <div className="min-h-screen bg-background crt-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-4xl relative z-10">
        <div className="glass-panel rounded-lg p-8 space-y-1 h-[80vh] overflow-y-auto no-scrollbar font-mono text-sm md:text-base border border-terminal-green/20 shadow-[0_0_50px_-12px_rgba(0,255,65,0.3)]">
          <div className="mb-4 text-xs text-muted-foreground border-b border-white/10 pb-2">
            BIOS DATE: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()} VER 4.0.2
          </div>

          {lines.map((line, index) => (
            <div
              key={index}
              className={`boot-line break-words ${line.className || "text-terminal-green"}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className="opacity-50 mr-2">[{new Date().toISOString().split('T')[1].slice(0, 8)}]</span>
              <span className="mr-2">{">"}</span>
              {line.text}
            </div>
          ))}

          {!isComplete && (
            <div className="text-terminal-green animate-pulse">
              <span className="mr-2">{">"}</span>_
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {isComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20 animate-fade-in">
            <div className="flex flex-col gap-6 text-center">
              <h1 className="text-4xl font-cyber text-neon-green glitch-container" data-text="ACCESS GRANTED">
                <span className="glitch-layer text-neon-green">ACCESS GRANTED</span>
                ACCESS GRANTED
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleEnter}
                  className="px-8 py-3 bg-terminal-green/10 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-black transition-all duration-300 font-cyber rounded uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,255,65,0.6)]"
                >
                  Enter System
                </button>
                <button
                  onClick={() => navigate("/challenge")}
                  className="px-8 py-3 bg-terminal-red/10 border border-terminal-red text-terminal-red hover:bg-terminal-red hover:text-black transition-all duration-300 font-cyber rounded uppercase tracking-wider hover:shadow-[0_0_20px_rgba(255,0,0,0.6)]"
                >
                  Initiate Hack
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Boot;
