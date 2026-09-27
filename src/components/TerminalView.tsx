import { useState, useEffect, useRef } from "react";
import { getTerminalOutput } from "./TerminalCommands";
import { Search, ShieldCheck, Sparkles, TerminalSquare } from "lucide-react";

const TerminalView = () => {
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
  const quickCommands = ["github", "division36", "projects", "research", "mentions", "opsec"];

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
      className="crt-contained relative overflow-hidden rounded-md border border-terminal-green/30 bg-[#020403] font-mono shadow-[0_26px_80px_rgba(0,0,0,0.45)]"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="relative z-10 border-b border-terminal-green/20 bg-[#07100b]">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-2" aria-hidden>
              <span className="led-red h-2.5 w-2.5" />
              <span className="led-amber h-2.5 w-2.5" />
              <span className="led h-2.5 w-2.5" />
            </div>
            <div className="hidden items-center gap-2 border-l border-terminal-green/20 pl-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:flex">
              <ShieldCheck size={13} className="text-terminal-green" />
              passive recon disabled
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-terminal-green">
            <TerminalSquare size={14} />
            Zierax Evidence Console
          </div>
          <div className="hidden w-24 justify-end text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:flex">
            read-only
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto border-t border-terminal-green/10 px-4 py-2 no-scrollbar">
          {quickCommands.map((command) => (
            <button
              key={command}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                executeCommand(command);
              }}
              className="inline-flex h-7 shrink-0 items-center gap-1.5 border border-terminal-green/20 bg-terminal-green/5 px-2.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-terminal-green/60 hover:text-terminal-green"
            >
              <Search size={11} />
              {command}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="relative z-10 h-[620px] overflow-y-auto overflow-x-auto p-4 md:p-6 space-y-3 no-scrollbar scroll-smooth">
        {history.map((entry, idx) => (
          <div key={idx} className="animate-fade-in">
            {entry.command && (
              <div className="mb-1 flex items-center gap-2">
                <span className="font-bold text-terminal-green">zierax@dossier:~$</span>
                <span className="text-foreground font-medium">{entry.command}</span>
              </div>
            )}
            <div className="space-y-1">
              {entry.output.map((line, lineIdx) => {
                const isHeader = line.includes("═══") || line.includes("───") || line.includes("╔");
                const isWarn = line.includes("[!]") || line.includes("[*]");
                const isOk = line.includes("[✓]") || line.includes("[OK]");

                return (
                  <div
                    key={lineIdx}
                    className={`min-h-[1.2rem] whitespace-pre-wrap break-words text-[13px] leading-6 md:text-sm
                      ${isHeader ? "text-terminal-green" : ""}
                      ${isWarn ? "text-terminal-amber" : ""}
                      ${isOk ? "text-terminal-green" : "text-foreground/80"}
                    `}
                  >
                    {line || " "}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Input Line */}
      <form onSubmit={handleSubmit} className="relative z-10 flex items-center gap-3 border-t border-terminal-green/20 bg-[#07100b]/95 p-4">
        <span className="shrink-0 text-sm font-bold text-terminal-green">zierax@dossier:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-foreground font-mono text-sm placeholder:text-muted-foreground/60"
          placeholder="Type help, then drill into github, division36, mentions, opsec..."
          autoFocus
          spellCheck={false}
          autoComplete="off"
          aria-label="Terminal command input"
        />
        <div className="hidden items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground sm:flex">
          <Sparkles size={12} className="text-terminal-amber" />
          proof
        </div>
      </form>
    </div>
  );
};

export default TerminalView;
