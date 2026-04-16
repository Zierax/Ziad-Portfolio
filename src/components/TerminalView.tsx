import { useState, useEffect, useRef } from "react";
import { getTerminalOutput } from "./TerminalCommands";

interface TerminalViewProps {
  projects: any[];
}

const TerminalView = ({ projects }: TerminalViewProps) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Array<{ command: string; output: string[] }>>([
    {
      command: "",
      output: getTerminalOutput("banner"),
    },
    {
      command: "",
      output: ["Type 'help' to see available commands", ""],
    },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const executeCommand = (cmd: string) => {
    const output = getTerminalOutput(cmd);
    
    if (cmd.trim().toLowerCase() === "clear" || cmd.trim().toLowerCase() === "cls") {
      setHistory([]);
      setInput("");
      return;
    }

    setHistory((prev) => [...prev, { command: cmd, output }]);
    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      executeCommand(input);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div 
      className="bg-black/95 rounded-lg border-2 border-terminal-green/30 shadow-[0_0_50px_rgba(0,255,65,0.05)] overflow-hidden flex flex-col h-[700px] font-mono group"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Title Bar */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 px-4 py-2 border-b border-terminal-green/20 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
           Axiom_Secure_Kernel_v3.01
        </div>
        <div className="w-10"></div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 no-scrollbar scroll-smooth">
        {history.map((entry, idx) => (
          <div key={idx} className="animate-in fade-in slide-in-from-left-2 duration-300">
            {entry.command && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-terminal-green/90 font-bold">root@ziad-salah:~$</span>
                <span className="text-white/90 font-medium">{entry.command}</span>
              </div>
            )}
            <div className="space-y-1">
              {entry.output.map((line, lineIdx) => {
                // Better formatting for different kinds of lines
                const isHeader = line.includes("═══") || line.includes("───");
                const isWarning = line.includes("[!]") || line.includes("[*]");
                const isSuccess = line.includes("[✓]") || line.includes("🏆");
                
                return (
                  <div 
                    key={lineIdx} 
                    className={`whitespace-pre-wrap break-words min-h-[1.2rem] transition-colors
                      ${isHeader ? "text-terminal-blue/80 font-bold" : ""}
                      ${isWarning ? "text-terminal-amber/90" : ""}
                      ${isSuccess ? "text-terminal-green font-bold" : "text-terminal-green/70"}
                    `}
                  >
                    {line || "\u00A0"}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Input Line */}
      <form onSubmit={handleSubmit} className="p-4 bg-zinc-950/50 border-t border-terminal-green/10 flex items-center gap-3">
        <span className="text-terminal-green font-bold shrink-0">root@ziad-salah:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder:text-zinc-800"
          placeholder="Execute system command or type 'help'..."
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
        <div className="text-[10px] text-terminal-green/40 font-bold animate-pulse uppercase tracking-tighter">
          [System_Ready]
        </div>
      </form>
    </div>
  );
};

export default TerminalView;
