import { useNavigate } from "react-router-dom";
import { Terminal, Lightbulb, Hexagon, Beaker, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const Landing = () => {
    const navigate = useNavigate();
    const [hoveredSide, setHoveredSide] = useState<"hacker" | "scientific" | null>(null);
    const [scrambledText, setScrambledText] = useState("HACKER_MODE");

    // Simple text scramble effect for the hacker side on hover
    useEffect(() => {
        if (hoveredSide === "hacker") {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
            let iteration = 0;
            const interval = setInterval(() => {
                setScrambledText(prev =>
                    prev.split("").map((letter, index) => {
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
        <div className="flex flex-col md:flex-row min-h-screen w-full overflow-hidden font-sans bg-black">
            {/* Hacker Mode Side */}
            <div
                className={`flex-1 relative cursor-pointer border-b md:border-b-0 md:border-r border-terminal-green/10 transition-all duration-700 ease-out overflow-hidden group
                    ${hoveredSide === "scientific" ? "grayscale opacity-20 blur-sm scale-95" : ""}
                    ${hoveredSide === "hacker" ? "flex-[1.2] shadow-[0_0_100px_rgba(0,255,65,0.15)_inset]" : "flex-1"}
                `}
                onMouseEnter={() => setHoveredSide("hacker")}
                onMouseLeave={() => setHoveredSide(null)}
                onClick={() => navigate("/boot")}
            >
                <div className="absolute inset-0 bg-[#050505] z-0">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] opacity-80 pointer-events-none"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(0,255,65,0.08)_0%,_transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                </div>

                <div className="relative z-20 flex flex-col items-center justify-center h-full p-8 text-center transition-transform duration-700 group-hover:-translate-y-4">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-terminal-green/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative p-5 rounded-2xl border border-terminal-green/30 bg-black/80 backdrop-blur-sm shadow-[0_0_30px_rgba(0,255,65,0.1)] group-hover:shadow-[0_0_50px_rgba(0,255,65,0.3)] group-hover:border-terminal-green/50 transition-all duration-500">
                            <Terminal size={56} className="text-terminal-green drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]" strokeWidth={1.5} />
                        </div>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-cyber font-bold text-terminal-green mb-6 tracking-widest drop-shadow-[0_0_15px_rgba(0,255,65,0.5)]">
                        {scrambledText}
                    </h2>

                    <div className="font-mono text-terminal-green/60 max-w-md mb-10 text-sm md:text-base space-y-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <p className="flex items-center justify-center gap-2"><ChevronRight size={14} /><span>Initialize offensive protocols</span></p>
                        <p className="flex items-center justify-center gap-2"><ChevronRight size={14} /><span>Access CLI environment</span></p>
                        <p className="flex items-center justify-center gap-2"><ChevronRight size={14} /><span>Exploits & vulnerabilities</span></p>
                    </div>

                    <button className="relative px-10 py-4 overflow-hidden rounded-sm group/btn border border-terminal-green/50 bg-terminal-green/5 hover:bg-terminal-green/10 transition-colors">
                        <div className="absolute inset-0 w-0 bg-terminal-green transition-all duration-[250ms] ease-out group-hover/btn:w-full"></div>
                        <span className="relative uppercase font-cyber tracking-[0.2em] text-sm font-bold text-terminal-green group-hover/btn:text-black transition-colors duration-300">
                            Execute
                        </span>
                    </button>
                </div>
            </div>

            {/* Scientific Mode Side */}
            <div
                className={`flex-1 relative cursor-pointer transition-all duration-700 ease-out overflow-hidden group
                    ${hoveredSide === "hacker" ? "opacity-20 blur-sm scale-95" : ""}
                    ${hoveredSide === "scientific" ? "flex-[1.2]" : "flex-1"}
                `}
                onMouseEnter={() => setHoveredSide("scientific")}
                onMouseLeave={() => setHoveredSide(null)}
                onClick={() => navigate("/academic")}
            >
                {/* Modern light gradient background */}
                <div className="absolute inset-0 bg-[#f8fafc] z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-purple-50/30"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>
                    {/* Animated organic shape */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                </div>

                <div className="relative z-20 flex flex-col items-center justify-center h-full p-8 text-center transition-transform duration-700 group-hover:-translate-y-4">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] group-hover:border-blue-100 transition-all duration-500">
                            <div className="absolute -top-2 -right-2 bg-blue-50 text-blue-600 p-1.5 rounded-lg border border-blue-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                                <Beaker size={14} />
                            </div>
                            <Lightbulb size={56} className="text-slate-800" strokeWidth={1.5} />
                        </div>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-6 tracking-tight">
                        Research &<br />Academic
                    </h2>

                    <div className="font-sans text-slate-500 max-w-md mb-10 text-sm md:text-base leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                        <p>Explore scholarly publications, academic credentials, and refined professional achievements in a clean, comprehensive format.</p>
                    </div>

                    <button className="relative px-10 py-4 overflow-hidden rounded-full group/btn bg-slate-900 hover:bg-blue-600 transition-all duration-500 shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.2)] hover:-translate-y-1">
                        <span className="relative flex items-center gap-2 font-sans font-medium text-white tracking-wide">
                            View Portfolio
                            <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </div>
            </div>

            {/* Center Divider/Orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none md:flex hidden flex-col items-center justify-center">
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-full"></div>
                    <div className="absolute inset-0 border border-white/20 rounded-full animate-spin-slow"></div>
                    <Hexagon size={20} className="text-white/50" />
                </div>
            </div>
        </div>
    );
};

export default Landing;
