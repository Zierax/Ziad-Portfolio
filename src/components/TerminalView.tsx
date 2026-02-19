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
      className="glass-panel rounded-lg p-6 min-h-[600px] font-mono text-sm overflow-auto"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="mb-4 space-y-2">
        {history.map((entry, idx) => (
          <div key={idx}>
            {entry.command && (
              <div className="flex gap-2">
                <span className="terminal-text">root@ziad-salah:~$</span>
                <span className="text-primary/90">{entry.command}</span>
              </div>
            )}
            {entry.output.map((line, lineIdx) => (
              <div key={lineIdx} className="text-primary/80 whitespace-pre-wrap break-words">
                {line || "\u00A0"}
              </div>
            ))}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <span className="terminal-text">root@ziad-salah:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-primary/90 font-mono"
          placeholder="Type a command..."
          autoFocus
        />
      </form>
    </div>
  );
};

export default TerminalView;
