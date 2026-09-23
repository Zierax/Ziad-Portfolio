import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Cpu,
  FileText,
  Github,
  Grid3x3,
  Linkedin,
  Mail,
  MapPin,
  Radar,
  Shield,
  Terminal,
} from "lucide-react";
import TerminalView from "@/components/TerminalView";
import {
  academicResearches,
  archiveRepos,
  awards,
  certifications,
  displayName,
  division36Systems,
  education,
  experience,
  externalMentions,
  flagshipRepos,
  getRepo,
  githubSignal,
  profileData,
  projects,
  recentRepos,
  signalRepos,
  skills,
  snapshotExcluded,
  snapshotMethod,
  spotlightRepos,
  updatedLabel,
  whyRanked,
  writeups,
} from "@/data/profile";

type ViewMode = "dossier" | "terminal" | "document";

const proofMetrics = [
  { label: "Public repos", value: `${githubSignal.publicRepos}`, note: "GitHub profile" },
  { label: "Repo stars", value: `${githubSignal.combinedOwnedRepoStars}`, note: "owned public repos" },
  { label: "External citations", value: `${externalMentions.length}`, note: "third-party mentions" },
  { label: "Followers", value: `${githubSignal.followers}`, note: "current signal" },
  { label: "VDP rank", value: "#9 EG", note: "Jan-Mar 2026" },
];

const operatingPrinciples = [
  "White-box over black-box",
  "Benchmarks before biography",
  "Logic compressed until it can be audited",
  "Security claims tied to public artifacts",
];

/** Division-36 lab card → canonical public repo, for live star/fork counts. */
const labRepoKey: Record<string, string> = {
  "Planck-99": "Division-36/Planck-99_PublicBenchmarks",
  "Z-Jail": "Division-36/Z-Jail",
  "Z-Privesc": "Division-36/Z-Privesc",
  "Axiom-WAF": "Division-36/AxiomWAF-Brain_PublicBenchmarks",
  SYRTH: "Division-36/Syrth_PublicBenchmark",
  mcOS: "Division-36/mcOS",
};

const Portfolio = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("dossier");
  const primaryResearch = academicResearches.slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <Link to="/" className="group flex min-w-0 items-center gap-3">
            <span className="led h-2.5 w-2.5 shrink-0" aria-hidden />
            <span className="min-w-0">
              <span className="block truncate font-cyber text-lg tracking-[0.24em] text-terminal-green md:text-xl">
                {profileData.name.toUpperCase()}
              </span>
              <span className="block truncate font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
                PUBLIC RESEARCH DOSSIER / SECURITY SYSTEMS
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "dossier" as const, label: "Dossier", icon: Grid3x3 },
              { id: "terminal" as const, label: "Terminal", icon: Terminal },
              { id: "document" as const, label: "Document", icon: FileText },
            ].map((item) => {
              const Icon = item.icon;
              const active = viewMode === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setViewMode(item.id)}
                  className={`inline-flex h-10 items-center gap-2 rounded-sm border px-3 font-mono text-xs tracking-[0.16em] transition-colors ${
                    active
                      ? "border-terminal-green bg-terminal-green text-background"
                      : "border-border text-muted-foreground hover:border-terminal-green/60 hover:text-terminal-green"
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main>
        {viewMode === "terminal" && (
          <section className="mx-auto max-w-[1300px] px-4 py-10 md:px-8">
            <TerminalView projects={projects} />
          </section>
        )}

        {viewMode === "dossier" && (
          <div className="animate-fade-in">
            <section className="relative overflow-hidden border-b border-border">
              <div className="dossier-grid absolute inset-0 opacity-40" aria-hidden />
              <div className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-[1500px] gap-8 px-4 py-10 md:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)] md:px-8 md:py-16">
                <div className="flex flex-col justify-between gap-10">
                  <div>
                    <div className="mb-8 inline-flex max-w-full items-center gap-3 border border-terminal-green/30 bg-terminal-green/5 px-3 py-2 font-mono text-[11px] tracking-[0.2em] text-terminal-green">
                      <Shield size={14} />
                      <span className="truncate">VULNERABILITY RESEARCH / DETERMINISTIC SYSTEMS / PUBLIC PROOF</span>
                    </div>

                    <h1 className="max-w-5xl font-cyber text-[clamp(3rem,8vw,8.7rem)] font-black uppercase leading-[0.84] tracking-normal text-foreground">
                      Evidence
                      <span className="block text-terminal-green">before</span>
                      myth.
                    </h1>

                    <p className="mt-8 max-w-3xl text-lg leading-8 text-foreground/76 md:text-xl">
                      {profileData.bio}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    {proofMetrics.map((metric) => (
                      <div key={metric.label} className="border-l border-border py-2 pl-4">
                        <p className="font-cyber text-3xl text-foreground md:text-4xl">{metric.value}</p>
                        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-terminal-green">
                          {metric.label}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{metric.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <aside className="self-stretch border border-border bg-card/92 p-4 md:p-5">
                  <div className="relative min-h-full overflow-hidden border border-border bg-background">
                    <div className="absolute inset-x-0 top-0 h-1 bg-terminal-green" aria-hidden />
                    <div className="grid gap-5 p-5">
                      <div className="grid grid-cols-[96px_1fr] gap-4">
                        <img
                          src={profileData.avatar}
                          alt={profileData.name}
                          className="h-24 w-24 border border-terminal-green/40 object-cover grayscale"
                        />
                        <div className="min-w-0">
                          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                            Current operator
                          </p>
                          <h2 className="mt-2 truncate font-cyber text-3xl text-foreground">{profileData.name}</h2>
                          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin size={14} />
                            {githubSignal.location} / {profileData.location}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {[
                          ["Org", githubSignal.affiliation],
                          ["Repos", githubSignal.publicRepos],
                          ["Repo stars", githubSignal.combinedOwnedRepoStars],
                          ["Following", githubSignal.following],
                        ].map(([label, value]) => (
                          <div key={label} className="border border-border bg-secondary p-3">
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                            <p className="mt-1 font-cyber text-xl text-terminal-green">{value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        {profileData.socials.slice(0, 4).map((social) => (
                          <a
                            key={social.platform}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between border border-border px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:border-terminal-green/60 hover:text-terminal-green"
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              {social.platform === "GitHub" && <Github size={14} />}
                              {social.platform === "LinkedIn" && <Linkedin size={14} />}
                              <span className="truncate">{social.platform}</span>
                            </span>
                            <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </a>
                        ))}
                        <a
                          href={`mailto:${profileData.email}`}
                          className="flex items-center justify-between border border-terminal-green/50 bg-terminal-green/10 px-3 py-2 font-mono text-xs text-terminal-green transition-colors hover:bg-terminal-green hover:text-background"
                        >
                          <span className="flex items-center gap-2">
                            <Mail size={14} />
                            Contact
                          </span>
                          <ArrowUpRight size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </section>

            <section className="border-b border-border bg-card/35">
              <div className="mx-auto grid max-w-[1500px] gap-8 px-4 py-14 md:grid-cols-[0.72fr_1.28fr] md:px-8">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-terminal-amber">GitHub evidence</p>
                  <h2 className="mt-3 max-w-xl font-cyber text-4xl leading-tight text-foreground md:text-5xl">
                    Live snapshot, not a static resume list.
                  </h2>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
                    {githubSignal.refreshed} · snapshot {githubSignal.refreshedAt.slice(0, 10)}. Star counts are sums over
                    owned public repositories — {githubSignal.ownedRepoStars} on Zierax plus{" "}
                    {githubSignal.division36RepoStars} on Division-36, across{" "}
                    {githubSignal.publicRepos + githubSignal.division36PublicRepos} public repos. The GitHub profile
                    Stars tab ({githubSignal.profileStarredCount ?? "n/a"} starred repos) is a separate number and is never
                    mixed into these totals. {githubSignal.starNote}.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    {[
                      ["Zierax stars", githubSignal.ownedRepoStars],
                      ["Zierax forks", githubSignal.ownedRepoForks],
                      ["Division-36 stars", githubSignal.division36RepoStars],
                      ["Division-36 forks", githubSignal.division36RepoForks],
                    ].map(([label, value]) => (
                      <div key={label} className="border border-border bg-background p-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                        <p className="mt-1 font-cyber text-xl text-terminal-amber">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-terminal-green">
                    Latest updates · activity feed across all lanes
                  </p>
                  <div className="grid gap-3">
                    {recentRepos.map((repo, index) => (
                      <a
                        key={repo.key}
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group grid gap-4 border border-border bg-background p-4 transition-colors hover:border-terminal-green/60 md:grid-cols-[72px_1fr_auto]"
                      >
                        <div className="font-cyber text-3xl text-terminal-green/70 tabular">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h3 className="font-cyber text-xl text-foreground group-hover:text-terminal-green">
                              {displayName(repo)}
                            </h3>
                            <span className="border border-terminal-green/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-terminal-green">
                              {repo.tier}
                            </span>
                            {repo.language && (
                              <span className="border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                {repo.language}
                              </span>
                            )}
                            {(repo.stars > 0 || repo.forks > 0) && (
                              <span className="border border-terminal-amber/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-terminal-amber">
                                {repo.stars} stars / {repo.forks} forks
                              </span>
                            )}
                            {repo.mentions.length > 0 && (
                              <span className="border border-terminal-green/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-terminal-green">
                                {repo.mentions.length} external mention{repo.mentions.length > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{repo.summary}</p>
                        </div>
                        <div className="flex items-start justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:flex-col md:items-end">
                          <span>{updatedLabel(repo.updatedAt)}</span>
                          <ArrowUpRight size={16} className="text-terminal-green" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="border-b border-border bg-terminal-amber/[0.04]">
              <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:gap-8 md:px-8">
                <div className="shrink-0">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-terminal-amber">Independent coverage</p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                    Third parties writing about the work — the strongest proof a portfolio can carry.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {externalMentions.map((mention) => (
                    <a
                      key={`${mention.outlet}-${mention.title}`}
                      href={mention.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`${mention.title} — evidence for ${mention.repo}`}
                      className="group inline-flex items-center gap-2 border border-border bg-background px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:border-terminal-amber/60 hover:text-terminal-amber"
                    >
                      <span>{mention.outlet}</span>
                      <span className="opacity-50 transition-opacity group-hover:opacity-100">→ {mention.repo.split("/")[1]}</span>
                      <ArrowUpRight size={13} />
                    </a>
                  ))}
                </div>
              </div>
            </section>

            <section className="border-b border-border">
              <div className="mx-auto max-w-[1500px] px-4 py-16 md:px-8">
                <div className="mb-8 grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-end">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-terminal-green">Division-36 lab</p>
                    <h2 className="mt-3 font-cyber text-4xl leading-tight text-foreground md:text-5xl">
                      Private lab, public proof surfaces.
                    </h2>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">
                    Division-36 is presented as a lab identity without exposing private material. The visible portfolio points to public benchmarks and repositories: Planck-99, Z-Jail, Z-Privesc, Axiom-WAF, SYRTH, and mcOS.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {division36Systems.map((system) => {
                    const live = getRepo(labRepoKey[system.name]);
                    return (
                    <a
                      key={system.name}
                      href={system.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex min-h-[270px] flex-col justify-between border border-border bg-card p-5 transition-colors hover:border-terminal-green/60"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{system.owner}</p>
                            <h3 className="mt-2 font-cyber text-2xl text-foreground group-hover:text-terminal-green">{system.name}</h3>
                          </div>
                          <ArrowUpRight size={17} className="text-terminal-green" />
                        </div>
                        <p className="mt-4 border-l border-terminal-amber pl-3 font-mono text-xs leading-6 text-terminal-amber">
                          {live ? `${live.stars} stars · ${live.forks} forks · ` : ""}
                          {system.metric}
                        </p>
                        <p className="mt-4 text-sm leading-7 text-muted-foreground">{system.summary}</p>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {system.tags.map((tag) => (
                          <span key={tag} className="border border-border bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </a>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="mx-auto grid max-w-[1500px] gap-8 px-4 py-16 md:grid-cols-[0.85fr_1.15fr] md:px-8">
              <div className="space-y-8">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-terminal-green">Operating logic</p>
                  <h2 className="mt-3 font-cyber text-4xl leading-tight text-foreground md:text-5xl">
                    A portfolio built like an audit trail.
                  </h2>
                </div>

                <div className="grid gap-3">
                  {operatingPrinciples.map((principle) => (
                    <div key={principle} className="flex items-start gap-3 border border-border bg-card p-4">
                      <Radar className="mt-0.5 shrink-0 text-terminal-green" size={17} />
                      <p className="text-sm leading-6 text-foreground/78">{principle}</p>
                    </div>
                  ))}
                </div>

                <div className="border border-terminal-green/30 bg-terminal-green/5 p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-terminal-green">OPSEC correction</p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    Passive recon, browser fingerprinting, WebRTC probing, stealth visitor logging, and inspector-blocking theater have been removed from the app shell. The portfolio now makes the security claim the only defensible way: by linking evidence.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {writeups.map((writeup) => (
                  <a
                    key={writeup.title}
                    href={writeup.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group overflow-hidden border border-border bg-card transition-colors hover:border-terminal-red/60"
                  >
                    <div className="aspect-[16/10] overflow-hidden border-b border-border bg-secondary">
                      <img
                        src={writeup.image}
                        alt={writeup.title}
                        loading="lazy"
                        className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-[1.035] group-hover:grayscale-0"
                      />
                    </div>
                    <div className="p-5">
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-terminal-red">{writeup.date}</p>
                      <h3 className="mt-2 font-cyber text-2xl leading-tight text-foreground">{writeup.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{writeup.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>

            <section className="border-y border-border bg-card/35">
              <div className="mx-auto max-w-[1500px] px-4 py-16 md:px-8">
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-terminal-green">Flagship projects</p>
                    <h2 className="mt-3 font-cyber text-4xl text-foreground md:text-5xl">Highest-conviction public work</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                      Curated pin order, refreshed from the GitHub snapshot. Star counts, timestamps, and links below are
                      live API values — not hand-copied claims.
                    </p>
                  </div>
                  <a
                    href={githubSignal.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-2 border border-border px-4 py-3 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-terminal-green hover:text-terminal-green"
                  >
                    <Github size={15} />
                    View GitHub
                    <ArrowUpRight size={15} />
                  </a>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {flagshipRepos.map((repo) => (
                    <article key={repo.key} className="group border border-border bg-background p-5 transition-colors hover:border-terminal-green/60">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            {repo.owner} / {updatedLabel(repo.updatedAt)}
                            {repo.stars > 0 || repo.forks > 0 ? ` / ${repo.stars} stars · ${repo.forks} forks` : ""}
                            {repo.license && repo.license !== "NOASSERTION" ? ` / ${repo.license}` : ""}
                          </p>
                          <h3 className="mt-2 font-cyber text-2xl text-foreground group-hover:text-terminal-green">
                            {displayName(repo)}
                          </h3>
                        </div>
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${displayName(repo)} repository`}
                          className="shrink-0 border border-border p-2 text-muted-foreground transition-colors hover:border-terminal-green hover:text-terminal-green"
                        >
                          <Github size={18} />
                        </a>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-muted-foreground">{repo.summary}</p>
                      {repo.story && (
                        <p className="mt-3 border-l border-terminal-amber pl-3 text-sm italic leading-7 text-foreground/85">
                          {repo.story}
                        </p>
                      )}
                      {repo.highlights && (
                        <p className="mt-4 border-l border-terminal-green pl-3 font-mono text-xs leading-6 text-terminal-green">
                          {repo.highlights}
                        </p>
                      )}
                      {repo.mentions.length > 0 && (
                        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-terminal-amber">
                          Cited by: {repo.mentions.map((m) => m.outlet).join(" · ")}
                        </p>
                      )}
                      <div className="mt-5 flex flex-wrap gap-2">
                        {repo.tags.map((tag) => (
                          <span key={tag} className="border border-border bg-secondary px-2 py-1 font-mono text-[11px] text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
                        why ranked: {whyRanked(repo)}
                      </p>
                    </article>
                  ))}
                </div>

                <div className="mb-6 mt-14">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-terminal-green">High-signal stream</p>
                  <h3 className="mt-2 font-cyber text-3xl text-foreground">Ranked by evidence, not by age</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                    Strict score order over community signal, freshness, README depth, and external mentions. No manual
                    reordering is possible inside this lane.
                  </p>
                </div>
                <div className="grid gap-3">
                  {signalRepos.map((repo, index) => (
                    <a
                      key={repo.key}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group grid gap-3 border border-border bg-background p-4 transition-colors hover:border-terminal-green/60 md:grid-cols-[56px_1fr_auto]"
                    >
                      <div className="font-cyber text-2xl text-terminal-green/70 tabular">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <h4 className="font-cyber text-lg text-foreground group-hover:text-terminal-green">
                            {displayName(repo)}
                          </h4>
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            {repo.owner}
                          </span>
                          {(repo.stars > 0 || repo.forks > 0) && (
                            <span className="border border-terminal-amber/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-terminal-amber">
                              {repo.stars} stars / {repo.forks} forks
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{repo.summary}</p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
                          why ranked: {whyRanked(repo)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:flex-col md:items-end md:justify-center">
                        <span>{updatedLabel(repo.updatedAt)}</span>
                        <ArrowUpRight size={15} className="text-terminal-green" />
                      </div>
                    </a>
                  ))}
                </div>

                <div className="mb-6 mt-14">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-terminal-amber">Research spotlight</p>
                  <h3 className="mt-2 font-cyber text-3xl text-foreground">Low stars, high conviction</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                    Deterministic systems, benchmarks, and research engines that matter by design rather than by star
                    count. README-reported metrics are shown as reported — verify against the linked repositories.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {spotlightRepos.map((repo) => (
                    <a
                      key={repo.key}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex min-h-[220px] flex-col justify-between border border-border bg-background p-5 transition-colors hover:border-terminal-amber/60"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                              {repo.owner} / {updatedLabel(repo.updatedAt)}
                              {repo.license && repo.license !== "NOASSERTION" ? ` / ${repo.license}` : ""}
                            </p>
                            <h4 className="mt-2 font-cyber text-xl text-foreground group-hover:text-terminal-amber">
                              {displayName(repo)}
                            </h4>
                          </div>
                          <ArrowUpRight size={16} className="shrink-0 text-terminal-amber" />
                        </div>
                        <p className="mt-3 border-l border-terminal-amber pl-3 font-mono text-xs leading-6 text-terminal-amber">
                          {repo.highlights}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">{repo.summary}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {repo.tags.map((tag) => (
                          <span key={tag} className="border border-border bg-secondary px-2 py-1 font-mono text-[10px] text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
                        why ranked: {whyRanked(repo)}
                      </p>
                    </a>
                  ))}
                </div>

                {archiveRepos.length > 0 && (
                  <details className="mt-10 border border-border bg-background">
                    <summary className="cursor-pointer list-none p-4 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-terminal-green">
                      Archive / long tail — {archiveRepos.length} repos (stubs, experiments, older utilities)
                    </summary>
                    <div className="grid gap-2 border-t border-border p-4 md:grid-cols-2">
                      {archiveRepos.map((repo) => (
                        <a
                          key={repo.key}
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-baseline justify-between gap-3 px-2 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-terminal-green"
                        >
                          <span className="truncate">
                            {displayName(repo)} <span className="opacity-60">· {repo.owner}</span>
                          </span>
                          <span className="shrink-0 tabular">{repo.stars}★ / {repo.forks}⑂</span>
                        </a>
                      ))}
                    </div>
                  </details>
                )}

                <details className="mt-6 border border-terminal-green/30 bg-terminal-green/5">
                  <summary className="cursor-pointer list-none p-4 font-mono text-xs uppercase tracking-[0.18em] text-terminal-green">
                    How this ranking works — formula, lanes, exclusions
                  </summary>
                  <div className="grid gap-4 border-t border-terminal-green/20 p-4 font-mono text-xs leading-6 text-muted-foreground md:grid-cols-2">
                    <div>
                      <p className="uppercase tracking-[0.18em] text-terminal-green">Formula</p>
                      <p className="mt-2 normal-case tracking-normal">{snapshotMethod.formula}</p>
                      <p className="mt-3 uppercase tracking-[0.18em] text-terminal-green">Excluded from ranking</p>
                      <p className="mt-2 normal-case tracking-normal">{snapshotMethod.excluded}</p>
                      <p className="mt-2 normal-case tracking-normal">
                        Tracked aside: {snapshotExcluded.forks.count} forks · {snapshotExcluded.hidden.length} hidden ·{" "}
                        {snapshotExcluded.thirdParty.length} third-party quarantined
                        {snapshotExcluded.thirdParty.length > 0 ? ` (${snapshotExcluded.thirdParty.join(", ")})` : ""}.
                      </p>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.18em] text-terminal-green">Lanes</p>
                      {Object.entries(snapshotMethod.lanes).map(([laneName, rule]) => (
                        <p key={laneName} className="mt-2 normal-case tracking-normal">
                          <span className="text-foreground">{laneName}:</span> {rule}
                        </p>
                      ))}
                      <p className="mt-3 normal-case tracking-normal">
                        Snapshot {githubSignal.refreshedAt.slice(0, 10)} · regenerate with `npm run refresh:github` ·
                        overrides in src/data/github-overrides.json.
                      </p>
                    </div>
                  </div>
                </details>
              </div>
            </section>

            <section className="border-b border-border">
              <div className="mx-auto grid max-w-[1500px] gap-8 px-4 py-16 lg:grid-cols-[0.72fr_1.28fr] md:px-8">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-terminal-amber">External references</p>
                  <h2 className="mt-3 font-cyber text-4xl leading-tight text-foreground md:text-5xl">
                    Mentions outside the portfolio.
                  </h2>
                  <p className="mt-5 text-sm leading-7 text-muted-foreground">
                    This lane is reserved for outside references only: indexed tooling feeds, independent tool pages, external articles, trending snapshots, and manual-page mirrors. Internal docs, personal links, and copied source URLs are intentionally kept out.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {externalMentions.map((mention) => (
                    <a
                      key={`${mention.outlet}-${mention.title}`}
                      href={mention.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group border border-border bg-background p-4 transition-colors hover:border-terminal-amber/60"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terminal-amber">{mention.outlet}</p>
                        <span className="border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          {mention.sourceType}
                        </span>
                        <span
                          className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
                            mention.confidence === "high"
                              ? "border-terminal-green/50 text-terminal-green"
                              : mention.confidence === "medium"
                                ? "border-terminal-amber/50 text-terminal-amber"
                                : "border-terminal-red/50 text-terminal-red"
                          }`}
                        >
                          {mention.confidence} confidence
                        </span>
                      </div>
                      <div className="mt-2 flex items-start justify-between gap-3">
                        <h3 className="font-cyber text-xl leading-tight text-foreground group-hover:text-terminal-amber">{mention.title}</h3>
                        <ArrowUpRight size={16} className="shrink-0 text-terminal-amber" />
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{mention.detail}</p>
                      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        Evidence for: <span className="text-terminal-green">{mention.repo}</span>
                        <span className="opacity-60"> · {mention.linkCheck}</span>
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            </section>

            <section className="mx-auto grid max-w-[1500px] gap-8 px-4 py-16 lg:grid-cols-[1fr_0.9fr] md:px-8">
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <BookOpen className="text-terminal-amber" size={22} />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-terminal-amber">Research record</p>
                    <h2 className="mt-1 font-cyber text-4xl text-foreground">Academic and systems research</h2>
                  </div>
                </div>

                <div className="space-y-4">
                  {primaryResearch.map((research) => (
                    <article key={research.title} className="border border-border bg-card p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <h3 className="font-cyber text-xl leading-tight text-foreground">{research.title}</h3>
                        <span className="w-fit shrink-0 border border-terminal-amber/40 px-2 py-1 font-mono text-[11px] text-terminal-amber">
                          {research.status ?? research.date}
                        </span>
                      </div>
                      <p className="mt-3 font-mono text-xs leading-6 text-terminal-green">{research.journalOrConference}</p>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{research.description}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="grid content-start gap-4">
                <div className="border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <Briefcase size={20} className="text-terminal-green" />
                    <h2 className="font-cyber text-2xl text-foreground">Mission history</h2>
                  </div>
                  <div className="mt-5 space-y-5">
                    {experience.slice(0, 4).map((item) => (
                      <div key={`${item.title}-${item.company}`} className="border-l border-border pl-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-terminal-green">{item.period}</p>
                        <h3 className="mt-1 font-semibold text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.company}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <Cpu size={20} className="text-terminal-amber" />
                    <h2 className="font-cyber text-2xl text-foreground">Skill matrix</h2>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {Object.entries(skills).slice(0, 4).map(([category, items]) => (
                      <div key={category}>
                        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-terminal-amber">{category}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{items.slice(0, 4).join(" / ")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t border-border bg-card/35">
              <div className="mx-auto grid max-w-[1500px] gap-4 px-4 py-10 md:grid-cols-3 md:px-8">
                {[...certifications.slice(0, 3), ...awards.slice(0, 3)].map((item) => (
                  <div key={"name" in item ? item.name : item.title} className="border border-border bg-background p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {"issuer" in item ? item.issuer : "award"}
                    </p>
                    <p className="mt-2 font-semibold text-foreground">{"name" in item ? item.name : item.title}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {viewMode === "document" && (
          <section className="mx-auto max-w-5xl px-4 py-10 md:px-8">
            <div className="bg-white p-7 text-black shadow-2xl md:p-14">
              <div className="flex flex-col justify-between gap-6 border-b-2 border-black pb-8 md:flex-row">
                <div>
                  <h1 className="text-4xl font-black uppercase leading-none tracking-tight md:text-5xl">{profileData.name}</h1>
                  <p className="mt-3 text-lg font-medium text-gray-700">{profileData.title}</p>
                </div>
                <div className="space-y-1 text-sm md:text-right">
                  <p className="font-semibold">{profileData.email}</p>
                  <p>{profileData.phone}</p>
                  <p>{profileData.location}</p>
                  <p>github.com/{profileData.socials[0].username}</p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="border-b border-black pb-1 text-lg font-black uppercase">Professional Summary</h2>
                <p className="mt-4 leading-7 text-gray-700">{profileData.bio}</p>
              </div>

              <div className="mt-10 grid gap-10 md:grid-cols-[1.25fr_0.75fr]">
                <div>
                  <h2 className="border-b border-black pb-1 text-lg font-black uppercase">Selected Work</h2>
                  <div className="mt-5 space-y-5">
                    {projects.slice(0, 6).map((project) => (
                      <div key={project.title}>
                        <div className="flex justify-between gap-3 font-bold">
                          <h3>{project.title}</h3>
                          <span className="text-gray-500">{project.date}</span>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-gray-700">{project.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="border-b border-black pb-1 text-lg font-black uppercase">Research & Education</h2>
                  <div className="mt-5 space-y-4 text-sm leading-6 text-gray-700">
                    <p>
                      <strong>{education.institution}</strong>
                      <br />
                      {education.degree}
                    </p>
                    {academicResearches.slice(0, 3).map((research) => (
                      <p key={research.title}>
                        <strong>{research.title}</strong>
                        <br />
                        {research.status ?? research.date}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-8 text-center font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8 md:text-left">
          <span>Public dossier / rebuilt from current GitHub evidence</span>
          <div className="flex flex-wrap justify-center gap-5">
            <Link to="/challenge" className="hover:text-terminal-green">Capture The Flag</Link>
            <Link to="/privacy" className="hover:text-terminal-green">Privacy</Link>
            <span>© {new Date().getFullYear()} Ziad Salah</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;
