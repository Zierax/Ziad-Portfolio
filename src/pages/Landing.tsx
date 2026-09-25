import { useNavigate } from "react-router-dom";
import { Terminal, Lightbulb, Beaker, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { profileData } from "@/data/profile";

const Landing = () => {
    const navigate = useNavigate();
    const [hoveredSide, setHoveredSide] = useState<"hacker" | "scientific" | null>(null);
    const [scrambledText, setScrambledText] = useState("HACKER_MODE");

    // Text scramble for the hacker side on hover — kept, it's craft.
    useEffect(() => {
        if (hoveredSide === "hacker") {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
            let iteration = 0;
            const interval = setInterval(() => {
                setScrambledText(() =>
                    "HACKER_MODE".split("").map((letter, index) => {
                        if (index < iteration) return "HACKER_MODE"[index];
                        return chars[Math.floor(Math.random() * chars.length)];
                    }).join("")
                );
                if (iteration >= "HACKER_MODE".length) clearInterval(interval);
                iteration += 1 / 3;
            }, 30);
            return () => clearInterval(interval);
        } else {
            setScrambledText("HACKER_MODE");
        }
    }, [hoveredSide]);

    return (
        <div className="flex flex-col min-h-screen w-full bg-black font-sans">
            <h1 className="sr-only">Ziad Salah (Zierax) — Security Researcher &amp; Deterministic Systems</h1>
            {/* Identity bar — who this is, before any choice is demanded */}
            <header className="z-30 flex items-center justify-between gap-4 border-b border-terminal-green/15 bg-black/90 px-5 md:px-8 h-14 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className="led h-2 w-2 shrink-0 animate-pulse" aria-hidden />
                    <p className="truncate font-mono text-xs tracking-widest text-terminal-green">
                        {profileData.name.toUpperCase()} <span className="text-muted-foreground">— SECURITY RESEARCH DOSSIER</span>
                    </p>
                </div>
                <p className="hidden md:block font-mono text-[11px] tracking-widest text-muted-foreground shrink-0">
                    TWO DOORS · ONE OPERATOR
                </p>
            </header>

            <div className="flex flex-col md:flex-row flex-1 w-full overflow-hidden">
                {/* Hacker Mode Side */}
                <div
                    className={`flex-1 relative cursor-pointer border-b md:border-b-0 md:border-r border-terminal-green/15 transition-all duration-500 ease-out overflow-hidden group
                        ${hoveredSide === "hacker" ? "md:flex-[1.15]" : "flex-1"}
                    `}
                    onMouseEnter={() => setHoveredSide("hacker")}
                    onMouseLeave={() => setHoveredSide(null)}
                    onClick={() => navigate("/boot")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && navigate("/boot")}
                    aria-label="Enter hacker mode"
                >
                    <div className="absolute inset-0 bg-[#060907] z-0">
                        <div className={`absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_45%,_rgba(52,211,153,0.09)_0%,_transparent_60%)] transition-opacity duration-700 ${hoveredSide === "hacker" ? "opacity-100" : "opacity-60"}`}></div>
                    </div>

                    <div className="relative z-20 flex flex-col items-center justify-center h-full min-h-[42vh] md:min-h-0 p-8 text-center transition-transform duration-500 group-hover:-translate-y-1.5">
                        <div className="relative mb-8">
                            <div className="relative p-5 rounded-2xl border border-terminal-green/30 bg-black/80 transition-colors duration-500 group-hover:border-terminal-green/60">
                                <Terminal size={52} className="text-terminal-green" strokeWidth={1.5} />
                            </div>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-cyber font-bold text-terminal-green mb-6 tracking-widest">
                            {scrambledText}
                        </h2>

                        <div className="font-mono text-terminal-green/70 max-w-md mb-10 text-sm md:text-base space-y-2">
                            <p className="flex items-center justify-center gap-2"><ChevronRight size={14} /><span>Disclosures, exploit chains, engines</span></p>
                            <p className="flex items-center justify-center gap-2"><ChevronRight size={14} /><span>Interactive terminal · CTF challenge</span></p>
                        </div>

                        <span className="px-10 py-4 rounded-sm border border-terminal-green/50 bg-terminal-green/5 font-cyber uppercase tracking-[0.2em] text-sm font-bold text-terminal-green transition-colors duration-300 group-hover:bg-terminal-green group-hover:text-black">
                            Execute
                        </span>
                    </div>
                </div>

                {/* Scientific Mode Side */}
                <div
                    className={`flex-1 relative cursor-pointer transition-all duration-500 ease-out overflow-hidden group bg-[#f8fafc]
                        ${hoveredSide === "scientific" ? "md:flex-[1.15]" : "flex-1"}
                    `}
                    onMouseEnter={() => setHoveredSide("scientific")}
                    onMouseLeave={() => setHoveredSide(null)}
                    onClick={() => navigate("/academic")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && navigate("/academic")}
                    aria-label="Enter academic mode"
                >
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e7edf3_1px,transparent_1px),linear-gradient(to_bottom,#e7edf3_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-60"></div>
                    </div>

                    <div className="relative z-20 flex flex-col items-center justify-center h-full min-h-[42vh] md:min-h-0 p-8 text-center transition-transform duration-500 group-hover:-translate-y-1.5">
                        <div className="relative mb-8">
                            <div className="relative p-5 rounded-2xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all duration-500 group-hover:shadow-[0_20px_44px_rgb(0,0,0,0.09)] group-hover:border-slate-300">
                                <div className="absolute -top-2 -right-2 bg-white text-slate-500 p-1.5 rounded-lg border border-slate-200 shadow-sm">
                                    <Beaker size={14} />
                                </div>
                                <Lightbulb size={52} className="text-slate-800" strokeWidth={1.5} />
                            </div>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-6 tracking-tight">
                            Research &<br />Academic
                        </h2>

                        <div className="font-sans text-slate-500 max-w-md mb-10 text-sm md:text-base leading-relaxed">
                            <p>IEEE-accepted papers, credentials and systems — in a calm reading surface.</p>
                        </div>

                        <span className="px-10 py-4 rounded-full bg-slate-900 font-sans font-medium text-white tracking-wide transition-all duration-500 group-hover:bg-slate-700 inline-flex items-center gap-2">
                            View Portfolio
                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </div>
                </div>
            </div>

            {/* Proof footer — static, verifiable, no marquee */}
            <footer className="z-30 shrink-0 border-t border-terminal-green/15 bg-black/90 px-5 md:px-8 py-3 flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-1 font-mono text-[11px] tracking-widest text-muted-foreground text-center">
                <span><span className="text-terminal-green">#9 EGYPT</span> · TOP 90 WORLDWIDE — HACKERONE VDP</span>
                <span><span className="text-terminal-amber">IEEE AIITA ’26</span> — PTRR ACCEPTED</span>
                <span className="hidden lg:inline">12+ VULNS / 48H · 7 CRITICAL</span>
            </footer>
        </div>
    );
};

export default Landing;
