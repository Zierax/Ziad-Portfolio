import { useState } from "react";
import { Link } from "react-router-dom";
import { Terminal, Grid3x3, FileText, Github, Linkedin, Mail, MapPin, Award, Briefcase, ExternalLink, Cpu, Globe, Shield } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import TerminalView from "@/components/TerminalView";
import { profileData, projects, experience, skills, certifications, awards, education } from "@/data/profile";

type ViewMode = "terminal" | "grid" | "minimal";

const Portfolio = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("terminal");

  return (
    <div className="min-h-screen bg-background crt-screen text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-terminal-green/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-terminal-red animate-pulse"></div>
              <h1 className="text-xl md:text-2xl font-cyber text-terminal-green tracking-widest glitch-container" data-text={profileData.name.toUpperCase()}>
                <span className="glitch-layer">{profileData.name.toUpperCase()}</span>
                {profileData.name.toUpperCase()}
              </h1>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("terminal")}
                className={`px-4 py-2 rounded font-mono text-sm transition-all duration-300 border ${viewMode === "terminal"
                    ? "bg-terminal-green/10 border-terminal-green text-terminal-green"
                    : "border-transparent text-muted-foreground hover:text-terminal-green hover:border-terminal-green/50"
                  }`}
              >
                <Terminal size={16} className="inline mr-2" />
                TERM
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded font-mono text-sm transition-all duration-300 border ${viewMode === "grid"
                    ? "bg-neon-blue/10 border-neon-blue text-neon-blue"
                    : "border-transparent text-muted-foreground hover:text-neon-blue hover:border-neon-blue/50"
                  }`}
              >
                <Grid3x3 size={16} className="inline mr-2" />
                GUI
              </button>
              <button
                onClick={() => setViewMode("minimal")}
                className={`px-4 py-2 rounded font-mono text-sm transition-all duration-300 border ${viewMode === "minimal"
                    ? "bg-neon-purple/10 border-neon-purple text-neon-purple"
                    : "border-transparent text-muted-foreground hover:text-neon-purple hover:border-neon-purple/50"
                  }`}
              >
                <FileText size={16} className="inline mr-2" />
                DOC
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-12">
        {viewMode === "terminal" && <TerminalView projects={projects} />}

        {viewMode === "grid" && (
          <div className="space-y-16 animate-fade-in">
            {/* Identity Module */}
            <section className="glass-panel rounded-lg p-8 border border-terminal-green/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-terminal-green/5 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:bg-terminal-green/10"></div>

              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-terminal-green p-1 relative">
                    <div className="absolute inset-0 border-2 border-transparent border-t-terminal-green border-r-terminal-green rounded-full animate-spin-slow"></div>
                    <img
                      src={profileData.avatar}
                      alt={profileData.name}
                      className="w-full h-full rounded-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-background border border-terminal-green px-3 py-1 rounded-full text-xs font-mono text-terminal-green">
                    STATUS: ONLINE
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <Shield size={18} className="text-terminal-green" />
                    <span className="font-mono text-terminal-green text-sm tracking-wider">SECURITY_CLEARANCE: L5</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold font-cyber text-foreground mb-4">{profileData.name}</h2>
                  <p className="text-xl text-terminal-amber font-mono mb-6 flex items-center justify-center md:justify-start gap-2">
                    <span>{">"}</span>
                    {profileData.title}
                    <span className="animate-blink">_</span>
                  </p>
                  <p className="text-muted-foreground max-w-2xl text-lg mb-8 leading-relaxed">
                    {profileData.bio}
                  </p>

                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    {profileData.socials.map((social, idx) => (
                      <a
                        key={idx}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded bg-secondary/20 hover:bg-secondary/40 border border-secondary/50 transition-all font-mono text-sm"
                      >
                        {social.platform === "GitHub" && <Github size={16} />}
                        {social.platform === "LinkedIn" && <Linkedin size={16} />}
                        {social.platform === "X (Twitter)" && <span>𝕏</span>}
                        <span>{social.platform}</span>
                        <ExternalLink size={12} className="opacity-50" />
                      </a>
                    ))}
                    <a href={`mailto:${profileData.email}`} className="flex items-center gap-2 px-4 py-2 rounded bg-terminal-green/10 hover:bg-terminal-green/20 border border-terminal-green/50 text-terminal-green transition-all font-mono text-sm">
                      <Mail size={16} />
                      CONTACT_ENCRYPTED
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Experience Module */}
            <section className="relative">
              <div className="flex items-center gap-4 mb-8">
                <Briefcase className="text-neon-blue" size={32} />
                <h2 className="text-3xl font-cyber text-neon-blue">Mission_History</h2>
                <div className="h-px bg-neon-blue/30 flex-1"></div>
              </div>

              <div className="space-y-8">
                {experience.map((exp, index) => (
                  <div key={index} className="glass-panel p-6 rounded-lg border-l-4 border-l-neon-blue hover:translate-x-2 transition-transform duration-300">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <h3 className="text-xl font-bold text-foreground font-cyber">{exp.title}</h3>
                      <span className="font-mono text-neon-blue text-sm bg-neon-blue/10 px-3 py-1 rounded">{exp.period}</span>
                    </div>
                    <div className="text-lg text-secondary-foreground mb-4 font-semibold">{exp.company}</div>
                    <p className="text-muted-foreground mb-4">{exp.description}</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-primary/80">
                      {exp.achievements.map((achievement, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-neon-blue mt-1">▹</span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Projects Module */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <Cpu className="text-neon-purple" size={32} />
                <h2 className="text-3xl font-cyber text-neon-purple">Deployed_Payloads</h2>
                <div className="h-px bg-neon-purple/30 flex-1"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projects.map((project, index) => (
                  <div key={index} className="glass-panel rounded-xl p-6 border-t border-t-neon-purple/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-neon-purple transition-colors">{project.title}</h3>
                      <span className="text-xs font-mono text-muted-foreground">{project.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 line-clamp-3">{project.description}</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tags.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                      {project.github && (
                        <a href={project.github} target="_blank" className="text-sm flex items-center gap-2 hover:text-neon-purple transition-colors">
                          <Github size={16} /> Source
                        </a>
                      )}
                      {project.demo && (
                        <a href={project.demo} target="_blank" className="text-sm flex items-center gap-2 hover:text-neon-purple transition-colors">
                          <Globe size={16} /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Skills Matrix */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <Terminal className="text-terminal-amber" size={32} />
                <h2 className="text-3xl font-cyber text-terminal-amber">Skill_Matrix</h2>
                <div className="h-px bg-terminal-amber/30 flex-1"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(skills).map(([category, items]) => (
                  <div key={category} className="glass-panel p-5 rounded-lg">
                    <h3 className="text-lg font-bold text-terminal-amber mb-4 uppercase tracking-wider border-b border-terminal-amber/20 pb-2">
                      {category}
                    </h3>
                    <ul className="space-y-2">
                      {items.map((skill: string, idx: number) => (
                        <li key={idx} className="font-mono text-sm text-muted-foreground hover:text-terminal-amber transition-colors cursor-default">
                          {">"} {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Certifications ticker */}
            <div className="glass-panel p-4 rounded-lg overflow-hidden whitespace-nowrap">
              <div className="inline-block animate-marquee">
                {certifications.map((cert, idx) => (
                  <span key={idx} className="mx-8 font-mono text-neon-green">
                    ★ {cert.name} [{cert.issuer}]
                  </span>
                ))}
                {awards.map((award, idx) => (
                  <span key={idx} className="mx-8 font-mono text-terminal-amber">
                    🏆 {award.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === "minimal" && (
          <div className="max-w-4xl mx-auto bg-white text-black p-12 rounded shadow-2xl font-sans">
            <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
              <div>
                <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">{profileData.name}</h1>
                <p className="text-xl text-gray-600">{profileData.title}</p>
              </div>
              <div className="text-right text-sm">
                <p>{profileData.email}</p>
                <p>{profileData.phone}</p>
                <p>{profileData.location}</p>
                <a href={profileData.socials[0].url} className="text-blue-600 hover:underline">github.com/{profileData.socials[0].username}</a>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-4">Professional Summary</h2>
              <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-4">Experience</h2>
              <div className="space-y-6">
                {experience.map((exp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between font-semibold">
                      <h3>{exp.title} - {exp.company}</h3>
                      <span>{exp.period}</span>
                    </div>
                    <p className="text-gray-700 mt-2 mb-2">{exp.description}</p>
                    <ul className="list-disc list-outside ml-5 text-gray-700 text-sm">
                      {exp.achievements.map((ach, i) => <li key={i}>{ach}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-4">Education</h2>
                <div className="font-semibold">{education.institution}</div>
                <div>{education.degree}</div>
                <div className="text-gray-600 text-sm">{education.period}</div>
              </div>
              <div>
                <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                  {[...skills.cybersecurity, ...skills.programming].map((s, i) => (
                    <span key={i} className="bg-gray-100 px-2 py-1 rounded">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="font-mono text-sm text-muted-foreground mb-4">
            SECURE_CONNECTION_ESTABLISHED // ENCRYPTED_BY_AES_256
          </p>
          <div className="flex justify-center gap-6 text-sm text-primary/60">
            <Link to="/challenge" className="hover:text-terminal-green transition-colors">Capture The Flag</Link>
            <Link to="/admin" className="hover:text-terminal-red transition-colors">Admin Portal</Link>
            <span>© 2025 Ziad Salah</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;
