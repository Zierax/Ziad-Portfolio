import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, Github, Linkedin, Mail, ExternalLink, FileText, Trophy, MapPin, Award } from "lucide-react";
import { profileData, skills, experience, projects, education, academicResearches, certifications, awards } from "@/data/profile";

const AcademicPortfolio = () => {
    const [activeTab, setActiveTab] = useState<"about" | "research" | "projects" | "achievements">("about");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
        window.scrollTo(0, 0);
    }, []);

    if (!isLoaded) return <div className="min-h-screen bg-white"></div>;

    return (
        <div className="min-h-screen bg-[#f8fafc] w-full text-slate-800 font-sans selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden relative">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_10%,transparent_100%)] opacity-50"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] opacity-20 bg-gradient-to-b from-blue-400 to-transparent blur-3xl mix-blend-multiply"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header / Navigation */}
                <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-sm transition-all duration-300">
                    <div className="container mx-auto px-4 md:px-8 py-3">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-xl border border-blue-100/50 shadow-sm">
                                    <GraduationCap className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <h1 className="text-xl font-serif font-bold text-slate-900 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                                        {profileData.name}
                                    </h1>
                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mt-1">
                                        Academic Portfolio
                                    </p>
                                </div>
                            </div>

                            <nav className="flex flex-wrap justify-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 backdrop-blur-md shadow-inner">
                                {["about", "research", "projects", "achievements"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 capitalize ${activeTab === tab 
                                            ? "bg-white text-blue-700 shadow-sm scale-100" 
                                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 scale-95"
                                        }`}
                                    >
                                        {tab === "about" ? "Profile" : tab === "achievements" ? "Credentials" : tab}
                                    </button>
                                ))}
                            </nav>

                            <Link to="/portfolio" className="group flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest bg-slate-50 hover:bg-blue-50 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-blue-200">
                                Switch Mode
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="container mx-auto px-4 md:px-8 py-12 max-w-5xl flex-grow">

                    {/* Profile Tab */}
                    {activeTab === "about" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="md:col-span-1 space-y-6">
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60 text-center flex flex-col items-center">
                                    <div className="w-48 h-48 mb-6 rounded-full overflow-hidden border-4 border-slate-50 shadow-md">
                                        <img src={profileData.avatar} alt={profileData.name} className="w-full h-full object-cover" />
                                    </div>
                                    <h2 className="text-2xl font-serif font-bold text-slate-900 mb-1">{profileData.name}</h2>
                                    <p className="text-blue-600 font-semibold mb-6 uppercase tracking-wider text-[10px]">{profileData.title}</p>
                                    
                                    <div className="flex justify-center gap-3 mb-8">
                                        {profileData.socials.slice(0, 4).map((social, idx) => (
                                            <a key={idx} href={social.url} target="_blank" className="p-2.5 bg-slate-50 rounded-xl text-slate-500 border border-slate-200/50 hover:bg-blue-600 hover:text-white transition-all">
                                                {social.platform === "GitHub" && <Github size={18} />}
                                                {social.platform === "LinkedIn" && <Linkedin size={18} />}
                                                {(social.platform !== "GitHub" && social.platform !== "LinkedIn") && <ExternalLink size={18} />}
                                            </a>
                                        ))}
                                    </div>

                                    <div className="w-full text-sm text-slate-600 space-y-3 text-left border-t border-slate-100 pt-6">
                                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                                            <MapPin size={16} className="text-blue-500" />
                                            <span className="font-medium text-xs">{profileData.location}</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                                            <GraduationCap size={16} className="text-blue-500" />
                                            <span className="font-medium text-xs truncate">{education.degree}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-8">
                                <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200/60">
                                    <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">Scholarly Biography</h2>
                                    <p className="text-slate-700 leading-relaxed mb-6 font-medium">{profileData.bio}</p>
                                    <div className="p-4 bg-blue-50 rounded-2xl border-l-4 border-blue-500 italic text-slate-600 text-sm">
                                        Independent security researcher and self-directed scholar. Focus on deterministic logic and the Truthimatics framework.
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h3 className="text-xl font-serif font-bold text-slate-800 border-b pb-2">Academic Journey</h3>
                                    <div className="space-y-6">
                                        {experience.map((exp, idx) => (
                                            <div key={idx} className="relative pl-6 border-l border-slate-200">
                                                <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-500"></div>
                                                <h4 className="font-bold text-slate-900">{exp.title}</h4>
                                                <p className="text-blue-600 text-xs font-bold mb-2">{exp.company} | {exp.period}</p>
                                                <p className="text-slate-600 text-sm mb-3">{exp.description}</p>
                                                <ul className="space-y-1">
                                                    {exp.achievements.slice(0, 3).map((ach, i) => (
                                                        <li key={i} className="text-xs text-slate-500 flex items-start gap-2">
                                                            <span className="text-blue-400 mt-1">●</span> {ach}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {/* Research Tab */}
                    {activeTab === "research" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                            <h2 className="text-3xl font-serif font-bold text-slate-900 text-center mb-12">Research & Publications</h2>
                            <div className="grid gap-6">
                                {academicResearches.map((paper, idx) => (
                                    <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                            <h3 className="text-xl font-bold text-slate-900 font-serif leading-tight">{paper.title}</h3>
                                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex-shrink-0 self-start">
                                                {paper.date}
                                            </span>
                                        </div>
                                        {paper.journalOrConference && (
                                            <p className="text-blue-600 text-xs font-bold mb-4">Venue: {paper.journalOrConference}</p>
                                        )}
                                        <p className="text-slate-600 text-sm leading-relaxed mb-6">{paper.description}</p>
                                        <div className="flex flex-wrap gap-3">
                                            {paper.doiLink && (
                                                <a href={paper.doiLink} target="_blank" className="flex items-center gap-2 text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-xl">
                                                    View Source <ExternalLink size={12} />
                                                </a>
                                            )}
                                            {paper.pdfLink && (
                                                <a href={paper.pdfLink} target="_blank" className="flex items-center gap-2 text-xs font-bold bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl">
                                                    Open PDF <FileText size={12} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects Tab */}
                    {activeTab === "projects" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                            <h2 className="text-3xl font-serif font-bold text-slate-900 text-center mb-12">System Implementations</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {projects.filter(p => !p.title.includes("Alpha")).map((project, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col">
                                        <h3 className="text-xl font-bold font-serif text-slate-900 mb-2">{project.title}</h3>
                                        <p className="text-slate-600 text-sm mb-4 flex-grow">{project.description}</p>
                                        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                                            {project.tags.slice(0, 3).map((tag, i) => (
                                                <span key={i} className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Achievements Tab */}
                    {activeTab === "achievements" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 grid md:grid-cols-2 gap-8">
                            <section className="bg-white p-8 rounded-3xl border border-slate-200">
                                <h3 className="text-xl font-serif font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Award size={20} className="text-blue-500" /> Certifications
                                </h3>
                                <div className="space-y-4">
                                    {certifications.map((cert, idx) => (
                                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="font-bold text-slate-800 text-sm">{cert.name}</p>
                                            <p className="text-xs text-slate-500">{cert.issuer} • {cert.date}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                            <section className="bg-white p-8 rounded-3xl border border-slate-200">
                                <h3 className="text-xl font-serif font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Trophy size={20} className="text-amber-500" /> Honors
                                </h3>
                                <div className="space-y-4">
                                    {awards.map((award, idx) => (
                                        <div key={idx} className="p-4 bg-amber-50/30 rounded-2xl border border-amber-100/50">
                                            <p className="font-bold text-slate-800 text-sm">{award.title}</p>
                                            <p className="text-[11px] text-slate-500">{award.description || award.issuer}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                </main>

                <footer className="bg-white border-t border-slate-200 py-8 text-center mt-20">
                    <div className="container mx-auto px-4">
                        <p className="font-serif font-bold text-slate-900">{profileData.name} | Curriculum Vitae</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{new Date().getFullYear()} — Research Intelligence Portfolio</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AcademicPortfolio;
