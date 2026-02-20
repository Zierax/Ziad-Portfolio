import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, Github, Linkedin, Mail, ExternalLink, Calendar, MapPin, Award, FileText, Trophy } from "lucide-react";
import { profileData, skills, experience, projects, education, academicResearches, certifications, awards } from "@/data/profile";

const AcademicPortfolio = () => {
    const [activeTab, setActiveTab] = useState<"about" | "research" | "projects" | "achievements">("about");

    return (
        <div className="min-h-screen bg-[#f8fafc] w-full text-slate-800 font-sans selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden relative">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_10%,transparent_100%)] opacity-50"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] opacity-20 bg-gradient-to-b from-blue-400 to-transparent blur-3xl mix-blend-multiply"></div>
            </div>

            <div className="relative z-10">
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

                            <nav className="flex gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 backdrop-blur-md shadow-inner">
                                <button
                                    onClick={() => setActiveTab("about")}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === "about" ? "bg-white text-blue-700 shadow-[0_2px_10px_rgba(0,0,0,0.06)] scale-100" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 scale-95"
                                        }`}
                                >
                                    Profile
                                </button>
                                <button
                                    onClick={() => setActiveTab("research")}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === "research" ? "bg-white text-blue-700 shadow-[0_2px_10px_rgba(0,0,0,0.06)] scale-100" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 scale-95"
                                        }`}
                                >
                                    Research
                                </button>
                                <button
                                    onClick={() => setActiveTab("projects")}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === "projects" ? "bg-white text-blue-700 shadow-[0_2px_10px_rgba(0,0,0,0.06)] scale-100" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 scale-95"
                                        }`}
                                >
                                    Projects
                                </button>
                                <button
                                    onClick={() => setActiveTab("achievements")}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === "achievements" ? "bg-white text-blue-700 shadow-[0_2px_10px_rgba(0,0,0,0.06)] scale-100" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 scale-95"
                                        }`}
                                >
                                    Credentials
                                </button>
                            </nav>

                            <Link to="/" className="group flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest bg-slate-50 hover:bg-blue-50 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-blue-200">
                                Switch Mode
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="container mx-auto px-4 md:px-8 py-12 max-w-5xl">

                    {/* About / Profile Tab */}
                    {activeTab === "about" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
                            {/* Sidebar / Bio Card */}
                            <div className="md:col-span-1 space-y-6">
                                <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 text-center relative overflow-hidden group hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>

                                    <div className="relative w-48 h-48 mx-auto mb-8 rounded-full p-2 bg-gradient-to-tr from-blue-100 via-slate-50 to-purple-100 shadow-lg">
                                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-inner bg-white">
                                            <img
                                                src={profileData.avatar}
                                                alt={profileData.name}
                                                className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                            />
                                        </div>
                                        <div className="absolute inset-0 rounded-full border border-blue-200/50 animate-spin-slow pointer-events-none mix-blend-overlay"></div>
                                    </div>
                                    <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">{profileData.name}</h2>
                                    <p className="text-blue-600 font-semibold mb-6 uppercase tracking-wider text-xs">{profileData.title}</p>

                                    <div className="flex justify-center gap-3 mb-8">
                                        {profileData.socials.map((social, idx) => (
                                            <a
                                                key={idx}
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2.5 bg-slate-50 rounded-xl text-slate-500 border border-slate-200/50 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                                                title={social.platform}
                                            >
                                                {social.platform === "GitHub" && <Github size={18} />}
                                                {social.platform === "LinkedIn" && <Linkedin size={18} />}
                                                {social.platform === "HackerOne" && <span className="font-bold text-xs px-1">H1</span>}
                                                {social.platform === "X (Twitter)" && <span className="font-bold text-xs px-1">X</span>}
                                                {social.platform === "Medium" && <BookOpen size={18} />}
                                            </a>
                                        ))}
                                        <a href={`mailto:${profileData.email}`} className="p-2.5 bg-slate-50 rounded-xl text-slate-500 border border-slate-200/50 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                                            <Mail size={18} />
                                        </a>
                                    </div>

                                    <div className="text-sm text-slate-600 space-y-3 text-left border-t border-slate-100 pt-6">
                                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <MapPin size={16} className="text-blue-500" />
                                            <span className="font-medium">{profileData.location}</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <GraduationCap size={16} className="text-blue-500" />
                                            <span className="font-medium">{education.degree}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Skills Simplified */}
                                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200/60">
                                    <h3 className="font-serif font-bold text-lg mb-5 flex items-center gap-2 text-slate-800">
                                        <Award size={18} className="text-blue-600" />
                                        Core Competencies
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {[...skills.cybersecurity, ...skills.programming].slice(0, 10).map((skill, i) => (
                                            <span key={i} className="bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-100 hover:bg-blue-100 hover:scale-105 transition-all cursor-default">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Main Bio Content */}
                            <div className="md:col-span-2 space-y-8">
                                <section className="bg-white/80 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:bg-blue-50 transition-colors duration-1000"></div>
                                    <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6 relative">Professional Biography</h2>
                                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium relative">
                                        <p className="text-[1.1rem] mb-6 text-slate-800 leading-relaxed">{profileData.bio}</p>
                                        <p className="border-l-4 border-blue-500 pl-6 space-y-2 py-2 italic text-slate-500 bg-gradient-to-r from-blue-50/50 to-transparent">
                                            Specializing in offensive security, I combine deep technical knowledge of web and blockchain technologies
                                            with a research-driven approach to vulnerability assessment. My work focuses on identifying critical flaws
                                            in complex systems, contributing to open-source security tools, and advancing the field of automated vulnerability detection.
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-px bg-slate-200 flex-1"></div>
                                        <h3 className="text-xl font-serif font-bold text-slate-800">Experience</h3>
                                        <div className="h-px bg-slate-200 flex-1"></div>
                                    </div>

                                    <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                        {experience.map((exp, idx) => (
                                            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 group-hover:bg-blue-500 text-blue-500 group-hover:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-300 z-10">
                                                    <div className="w-2 h-2 bg-current rounded-full" />
                                                </div>
                                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] group-hover:shadow-[0_4px_25px_rgb(0,0,255,0.05)] transition-shadow my-4">
                                                    <div className="flex flex-col mb-2">
                                                        <h4 className="text-lg font-bold text-slate-900 font-serif leading-tight">{exp.title}</h4>
                                                        <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold mt-1">
                                                            <span className="text-blue-600">{exp.company}</span>
                                                            <span>•</span>
                                                            <span>{exp.period}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">{exp.description}</p>
                                                    <ul className="space-y-2 mt-4">
                                                        {exp.achievements.map((ach, i) => (
                                                            <li key={i} className="flex gap-2 items-start text-sm text-slate-600 font-medium">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                                                <span>{ach}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {/* Research Tab */}
                    {activeTab === "research" && (
                        <div className="max-w-4xl mx-auto animate-fade-in space-y-12">
                            <div className="text-center mb-16 relative">
                                <div className="inline-block relative">
                                    <h2 className="text-4xl font-serif font-bold text-slate-900 mb-6 relative z-10">Academic Research & Publications</h2>
                                    <div className="absolute -bottom-2 md:-bottom-4 left-1/2 -translate-x-1/2 w-24 h-2 bg-blue-500/20 rounded-full z-0 blur-sm"></div>
                                    <div className="absolute -bottom-2 md:-bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-full z-0"></div>
                                </div>
                                <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed mt-6 font-medium">
                                    Research exploring the intersection of AI safety, decentralized finance security, and automated vulnerability discovery models.
                                </p>
                            </div>

                            {academicResearches.length === 0 ? (
                                <div className="bg-white/80 backdrop-blur p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 text-center">
                                    <BookOpen size={48} className="text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-serif text-slate-900 font-medium mb-2">Research Repository</h3>
                                    <p className="text-slate-500">
                                        Research publications and academic papers will be indexed here shortly.
                                        <br />
                                        Current focus areas: LLM Injection vectors, Smart Contract Reentrancy patterns.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {academicResearches.map((paper, idx) => (
                                        <div key={idx} className="group bg-white p-8 md:p-10 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] border border-slate-200/50 hover:border-blue-100 transition-all duration-500 transform hover:-translate-y-1 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-[100px]"></div>

                                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4 relative z-10">
                                                <h3 className="text-2xl font-bold text-slate-900 font-serif leading-tight group-hover:text-blue-900 transition-colors">
                                                    {paper.title}
                                                </h3>
                                                <span className="text-sm font-bold text-blue-700 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 whitespace-nowrap shadow-sm">
                                                    {paper.date}
                                                </span>
                                            </div>
                                            {paper.journalOrConference && (
                                                <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 font-medium text-xs rounded-lg mb-6 shadow-inner border border-slate-200">
                                                    Published in: <span className="font-bold text-slate-700">{paper.journalOrConference}</span>
                                                </div>
                                            )}
                                            <p className="text-slate-600 leading-relaxed mb-8 font-medium text-[1.05rem]">
                                                {paper.abstract || paper.description}
                                            </p>
                                            <div className="flex flex-wrap gap-3">
                                                {paper.link && (
                                                    <a href={paper.link} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                                                        Read Publication <ExternalLink size={14} />
                                                    </a>
                                                )}
                                                {paper.pdfLink && (
                                                    <a href={paper.pdfLink} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl bg-white border-2 border-slate-200 hover:border-blue-600 text-slate-700 hover:text-blue-600 text-sm font-bold flex items-center gap-2 transition-all hover:bg-blue-50 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                                                        PDF Access <FileText size={14} />
                                                    </a>
                                                )}
                                                {paper.doiLink && (
                                                    <a href={paper.doiLink} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-bold flex items-center gap-2 transition-all shadow-sm">
                                                        DOI <ExternalLink size={14} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Also show Writeups as "Industry Publications" */}
                            <div className="mt-16">
                                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-8 border-b border-slate-200 pb-2">Technical Disclosures</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Importing writeups from profile */}
                                    {/* Note: In a real implementation we'd map over writeups array here as well */}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Projects Tab */}
                    {activeTab === "projects" && (
                        <div className="animate-fade-in max-w-5xl mx-auto">
                            <div className="text-center mb-16 relative">
                                <div className="inline-block relative">
                                    <h2 className="text-4xl font-serif font-bold text-slate-900 mb-6 relative z-10">Technical Portfolio</h2>
                                    <div className="absolute -bottom-2 md:-bottom-4 left-1/2 -translate-x-1/2 w-24 h-2 bg-blue-500/20 rounded-full z-0 blur-sm"></div>
                                    <div className="absolute -bottom-2 md:-bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-full z-0"></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {projects.map((project, idx) => (
                                    <div key={idx} className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200/50 hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] hover:border-blue-200/50 transition-all duration-500 group relative overflow-hidden flex flex-col h-full">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <h3 className="text-2xl font-bold font-serif text-slate-900 group-hover:text-blue-700 transition-colors">
                                                {project.title}
                                            </h3>
                                            <div className="flex gap-2 shrink-0 ml-4">
                                                {project.github && (
                                                    <a href={project.github} target="_blank" className="p-2 -mr-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                                                        <Github size={22} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-slate-600 mb-8 text-[1.05rem] leading-relaxed font-medium flex-grow">
                                            {project.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mt-auto relative z-10">
                                            {project.tags.slice(0, 5).map((tag, tIdx) => (
                                                <span key={tIdx} className="text-[11px] uppercase tracking-wider px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-bold border border-slate-200/50">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Achievements / Credentials Tab */}
                    {activeTab === "achievements" && (
                        <div className="max-w-4xl mx-auto animate-fade-in space-y-16">
                            <section className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60">
                                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-10 flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                        <Award size={28} />
                                    </div>
                                    Certifications
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {certifications.map((cert, idx) => (
                                        <div key={idx} className="group bg-white p-6 rounded-2xl border border-slate-200/80 flex items-start gap-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
                                            <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-4 rounded-full text-blue-600 border border-blue-100/50 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                                <Award size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{cert.name}</h3>
                                                <p className="font-medium text-slate-500 text-sm flex items-center gap-2">
                                                    <span className="text-slate-700">{cert.issuer}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span>{cert.date}</span>
                                                </p>
                                                {(cert as any).note && <p className="text-xs font-semibold text-blue-600 mt-2 bg-blue-50 inline-block px-2 py-1 rounded-md">Note: {(cert as any).note}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60">
                                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-10 flex items-center gap-4">
                                    <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
                                        <Trophy size={28} />
                                    </div>
                                    Honors & Awards
                                </h2>
                                <div className="space-y-6">
                                    {awards.map((award, idx) => (
                                        <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                                            <h3 className="font-bold text-slate-900 text-xl font-serif mb-2">{award.title}</h3>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm font-bold mb-4 border border-amber-100/50">
                                                <span>{award.issuer}</span>
                                                <span className="w-1 h-1 rounded-full bg-amber-300"></span>
                                                <span>{award.date}</span>
                                            </div>
                                            <p className="text-slate-600 font-medium leading-relaxed">{award.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                </main>

                <footer className="relative mt-20 pt-12 pb-8 overflow-hidden z-10 text-center">
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-lg border-t border-slate-200/60 -z-10"></div>
                    <div className="container mx-auto px-4">
                        <p className="font-serif font-bold text-slate-900 text-lg mb-1">{profileData.name}</p>
                        <p className="text-sm font-medium text-slate-500 mb-4">Research & Development Portfolio</p>
                        <div className="w-16 h-1 bg-blue-500/20 rounded-full mx-auto mb-4"></div>
                        <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400">© {new Date().getFullYear()} All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AcademicPortfolio;
