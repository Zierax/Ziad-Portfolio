import aiAccessImg from "../assets/AiAccess.png";
import criticalsImg from "../assets/6Criticals.png";
import {
  githubSignal as liveGithubSignal,
  rankedProjects,
  type GithubSignal,
  type PortfolioProject,
} from "./githubSnapshot";
import { MENTIONS } from "./github-overrides";

// ---------------------------------------------------------------------------
// GitHub data: single source of truth is the generated snapshot
// (src/data/generated/github-snapshot.json, refreshed via `npm run refresh:github`).
// This module re-exports it — nothing GitHub-derived is hand-copied here.
// ---------------------------------------------------------------------------
export { flagshipRepos, spotlightRepos, signalRepos, recentRepos, archiveRepos, rankedProjects, displayName, updatedLabel, refreshedLabel, getRepo, whyRanked, snapshotMethod, snapshotExcluded } from "./githubSnapshot";
export type { GithubSignal, PortfolioProject, RankedRepo, RepoTier, RepoLinks } from "./githubSnapshot";

/** Live GitHub evidence summary. Exact field names: ownedRepoStars etc. */
export const githubSignal: GithubSignal = liveGithubSignal;

export interface Project {
  title: string;
  date?: string;
  description: string;
  tags: string[];
  highlights?: string;
  github?: string;
  demo?: string;
  performance?: string;
}

export interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
  achievements: string[];
}

export interface SocialLink {
  platform: string;
  url: string;
  username: string;
}

export interface Writeup {
  title: string;
  date: string;
  description: string;
  image: string;
  link: string;
  tags: string[];
}

export interface AcademicResearch {
  title: string;
  date: string;
  description: string;
  journalOrConference?: string;
  link?: string;
  citation?: string;
  abstract?: string;
  pdfLink?: string;
  doiLink?: string;
  status?: string;
  impact?: string;
}

export interface LabSystem {
  name: string;
  owner: "Zierax" | "Division-36";
  summary: string;
  metric: string;
  tags: string[];
  url: string;
}

export interface ExternalMention {
  outlet: string;
  title: string;
  detail: string;
  url: string;
}

export const academicResearches: AcademicResearch[] = [
  {
    title: "PTRR Framework: A Metacognitive Framework for Measuring and Mitigating Automation Bias in AI-Assisted Vulnerability Research",
    date: "2026",
    description: "Defines three indices — Automation Bias Index (ABI), Cognitive Struggle Index (CSI), Tool Integration Intensity Score (TIIS). A 60-hour naturalistic case study documents a shift from a low-to-medium finding profile to a critical-dominant one, with 7 critical findings independently validated by programme triage.",
    journalOrConference: "IEEE AIITA 2026 (Accepted, Chongqing)",
    doiLink: "https://doi.org/10.5281/zenodo.18873774",
    status: "Accepted / Redirected",
    impact: "Low to Critical-Dominant finding profiles; Nature Scientific Reports path ended at editor out-of-scope after passing a 4-round review"
  },
  {
    title: "Logs, Not Logic: Rethinking Audit Trail Requirements for Tiny On-Device Security Engines",
    date: "2026",
    description: "Regulatory and embedded-security paper on EU Cyber Resilience Act audit-trail requirements for tiny on-device engines. Argues un-bypassable compliance via tiered architecture.",
    journalOrConference: "IEEE CNS CPSSec 2026 (Accepted)",
    doiLink: "https://doi.org/10.5281/zenodo.20820849",
    status: "Accepted",
    impact: "Un-bypassable compliance via tiered architecture"
  },
  {
    title: "Transparent by Design, Vulnerable by Disclosure",
    date: "2026",
    description: "CPS-regulatory paper tied to the Planck-99 public benchmarks: regional transforms after compliance directions.",
    journalOrConference: "EU CRA / Planck-99 / IEEE CNS CPSSec (Accepted)",
    link: "https://github.com/Division-36/Planck-99_PublicBenchmarks",
    status: "Accepted",
    impact: "Compliance-directed regional transforms"
  },
  {
    title: "DVF Framework: How Non-Living Intelligence Brings Life to Music",
    date: "2026",
    description: "Philosophical, cognitive, and structural analysis of AI-created sound, arguing the discourse around AI-generated music misses its kinetic meaning. Introduces Structural Activation Potential.",
    journalOrConference: "Nature AI and Society (Under Review)",
    doiLink: "https://doi.org/10.5281/zenodo.18751159",
    status: "Under Review",
    impact: "Structural Activation Potential"
  },
  {
    title: "Axiom-Astrophysics: White-Box Pulsar Signal Integrity Auditor",
    date: "2026",
    description: "Logic-driven auditing engine for pulsar signal analysis. Version 1.1 validated at 87.5% precision with 0.006% false-positive rate.",
    journalOrConference: "Independent (SSRN)",
    link: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7235123",
    status: "Independent Research",
    impact: "87.5% precision · 0.006% FP (v1.1 validated)"
  },
  {
    title: "Constant Discrepancy of Deterministic Fp-Linear Gadgets and the Lifting Barrier for AC0-Frege Lower Bounds",
    date: "2026",
    description: "Complexity-theoretic no-go result: constant-discrepancy Fp-linear gadgets and the lifting barrier for AC0-Frege lower bounds.",
    journalOrConference: "Independent / Zenodo",
    doiLink: "https://doi.org/10.5281/zenodo.21796746",
    status: "Independent Research",
    impact: "No-go for lifting in NP vs co-NP"
  },
  {
    title: "Axiom-01: A White-Box Reasoning Engine for Discovering Phonosemantic Laws in Animal Naming",
    date: "2026",
    description: "White-box hypothesis-driven system for discovering statistical laws between animal names and biological traits.",
    journalOrConference: "Independent / Zenodo",
    doiLink: "https://doi.org/10.5281/zenodo.20454367",
    status: "Independent Research",
    impact: "Engine for discovering linguistic rules"
  },
  {
    title: "Axiom-Earth2: A Deterministic White-Box Pipeline for TESS Light Curve Analysis and Earth-Analogue Validation",
    date: "2026",
    description: "Deterministic pipeline for detecting, vetting, and validating Earth-analogue exoplanet candidates from TESS light curves. Reports 35 candidates via Axiom-Earth2 and Axiom-Zspace.",
    journalOrConference: "Independent / Zenodo",
    doiLink: "https://doi.org/10.5281/zenodo.20205969",
    status: "Independent Research",
    impact: "35 Earth-analogue candidates"
  },
  {
    title: "Impossibility of Bounded-Memory Lyapunov Functions for Number-Theoretic Dynamical Systems",
    date: "2026",
    description: "Proves an impossibility result for a frequently proposed class of Foster-Lyapunov drift proof strategies. Explicit scope: does not prove, disprove, or advance the Collatz conjecture itself.",
    journalOrConference: "Independent / Zenodo",
    doiLink: "https://doi.org/10.5281/zenodo.21909709",
    status: "Independent Research",
    impact: "No-go for number-theoretic dynamical proof strategies"
  },
  {
    title: "Truthimatics v2.0: Evidence-Driven Determinism Framework",
    date: "2026",
    description: "Deterministic logic framework for building decision systems under evidence-driven determinism rather than probabilistic approximation. Public core repository.",
    journalOrConference: "Theory / Proprietary Core",
    link: "https://github.com/Zierax/Truthimatics_Public",
    status: "Theory",
    impact: "Public logic core for the Axiom line"
  },
  {
    title: "Reverse Correction Assessment Methodology (RCAM): Evaluating Conceptual Understanding Through Elimination-Based Scoring",
    date: "2026",
    description: "Proposes a multiple-choice scoring system where students eliminate incorrect options rather than select correct ones, scored via RMS with continuous penalty exponent. Extends Bruno & Dirkzwager (1995). Preliminary data: ~4x reduction in time-to-mastery.",
    journalOrConference: "Preprint v0.1",
    status: "Unpublished preprint"
  }
];

export const profileData = {
  name: "Ziad Salah",
  title: "Mission-Critical Systems Safety, Security & Sustainability Engineer (MCS-SSS) · Founder @ Division-36 · Independent XAI Researcher",
  email: "zs.01117875692@gmail.com",
  phone: "+201117875692",
  location: "Cairo Core (Egypt)",
  bio: "Mission-critical systems engineer working where safety, security, and sustainability overlap. Founder of Division-36, an independent lab that ships public evidence: a Linux sandbox cited by Risky Business, a 200-plus-star Grafana scanner, embedded-malware benchmarks, and eleven research records stretching from exoplanet pipelines to hallucination suppression — most with versioned Zenodo DOIs. Independent XAI researcher — every claim links to a repo, a benchmark, or a DOI.",
  avatar: "https://github.com/Zierax.png",
  socials: [
    { platform: "GitHub", url: "https://github.com/Zierax", username: "Zierax" },
    { platform: "Google Scholar", url: "https://scholar.google.com/citations?user=7BeAeLcAAAAJ&hl=ar", username: "Ziad Salah" },
    { platform: "ORCID", url: "https://orcid.org/0009-0002-6813-2416", username: "0009-0002-6813-2416" },
    { platform: "LinkedIn", url: "https://linkedin.com/in/z14d", username: "z14d" },
    { platform: "HackerOne", url: "https://hackerone.com/0xzyo", username: "0xzyo" },
    { platform: "TryHackMe", url: "https://tryhackme.com/p/Zierax", username: "Zierax" },
    { platform: "X (Twitter)", url: "https://x.com/Zierax_x", username: "@Zierax_x" },
    { platform: "Medium", url: "https://0xzyo.medium.com", username: "0xzyo" },
  ]
};


export const division36Systems: LabSystem[] = [
  {
    name: "Planck-99",
    owner: "Division-36",
    summary: "On-device malware detection for embedded Linux and IoT/OT targets; public benchmark framing is built around traceable, no-cloud classification.",
    metric: "37 KB · 34 ns median · 96.28% accuracy",
    tags: ["Embedded Linux", "EU CRA", "Malware Detection", "Audit JSON"],
    url: "https://github.com/Division-36/Planck-99_PublicBenchmarks",
  },
  {
    name: "Z-Jail",
    owner: "Division-36",
    summary: "Native-code Linux sandbox with seven ordered isolation layers — rlimits, namespace cloning, fd scrub, pivot_root, NO_NEW_PRIVS, capability drop, seccomp-BPF — plus JSON audit output.",
    metric: "~81 KiB PIE · 7 isolation layers · seccomp-BPF",
    tags: ["C", "Sandbox", "Seccomp", "Defense-in-depth"],
    url: "https://github.com/Division-36/Z-Jail",
  },
  {
    name: "Z-Privesc",
    owner: "Division-36",
    summary: "Linux privilege-escalation auditor designed as a deterministic probe suite with static binary delivery and no dependency chain.",
    metric: "17 probes · 37/37 detection · 2.65s scan",
    tags: ["Linux", "Privilege Escalation", "Auditor", "C"],
    url: "https://github.com/Division-36/Z-Privesc",
  },
  {
    name: "Axiom-WAF",
    owner: "Division-36",
    summary: "Reasoning-based WAF benchmark work that frames attack detection as logic saturation instead of static pattern matching.",
    metric: "99.50% accuracy · MCC 0.9712",
    tags: ["WAF", "Hypothesis Testing", "Benchmarks"],
    url: "https://github.com/Division-36/AxiomWAF-Brain_PublicBenchmarks",
  },
  {
    name: "SYRTH",
    owner: "Division-36",
    summary: "AST-derived Python vulnerability classifier with explainable traces, eight CWE categories, and C-engine benchmark path.",
    metric: "99.0% overall accuracy · 5.6K samples/s C engine · 8 CWE",
    tags: ["SAST", "CWE", "AST", "C Engine"],
    url: "https://github.com/Division-36/Syrth_PublicBenchmark",
  },
  {
    name: "mcOS",
    owner: "Division-36",
    summary: "Safety-critical RTOS concept with deterministic AI inference runtime, zero heap allocation, fault containment, and hot-swappable models.",
    metric: "<5 us model swap target",
    tags: ["RTOS", "Zephyr HAL", "WCET", "Safety"],
    url: "https://github.com/Division-36/mcOS",
  },
];

export interface EnrichedMention extends ExternalMention {
  /** "owner/name" repo this mention is evidence for. */
  repo: string;
  confidence: "high" | "medium" | "low";
  sourceType: "editorial" | "aggregator" | "reference" | "trending" | "mirror";
  linkCheck: string;
}

/**
 * External mentions, mapped to repos in the curated override layer
 * (src/data/github-overrides.json). Confidence and source type travel with
 * each mention so the UI can distinguish editorial coverage from feed mirrors.
 */
export const externalMentions: EnrichedMention[] = MENTIONS.map((m) => ({
  outlet: m.outlet,
  title: m.title,
  detail: m.detail,
  url: m.url,
  repo: m.repo,
  confidence: m.confidence,
  sourceType: m.sourceType,
  linkCheck: m.linkCheck,
}));

export const skills = {
  logic: [
    "Truthimatics",
    "Deterministic Reasoning",
    "Formal Logic Invariants",
    "Quantum-Kernel Features",
    "Signal Deconvolution",
  ],
  cybersecurity: [
    "Kernel-Level Auditing",
    "Quantum Security Logic",
    "SAST/DAST Engineering",
    "Vulnerability Research",
    "WAF Architecture",
    "Web/API Pentesting",
    "Active Directory Pentesting",
    "Bug Bounty Hunting CTF",
  ],
  engineering: [
    "Sub-Microsecond Latency Optimization",
    "C-Header Pipeline Integration",
    "Low-Latency C/C++",
    "Python/Rust Interop",
    "TinyML Deployment",
    "JavaScript/TypeScript React",
  ],
  research: [
    "Metacognitive AI Audit",
    "Neural Music Perception",
    "Structural Activation Potential",
    "Dual Process Theory",
    "Cognitive Load Theory",
    "HLM/LME Modeling",
  ],
  business: [
    "Marketing Manager",
    "Digital Advertising",
    "Strategic Communication",
    "Social Media Management",
    "Professional Copywriting",
  ],
};

export const experience: Experience[] = [
  {
    title: "MCS-SSS Engineer — Founder & Lead Researcher",
    company: "Division-36",
    period: "Apr 2026 – Present",
    description: "MCS-SSS Engineer; founded Division-36 in Apr 2026 to formalize the ongoing mission-critical systems work. Same MCS-SSS career as the prior independent research — the lab is the formal vehicle, not a new direction. Lab scope is Division-36 systems; Axiom-line work continues as personal research.",
    achievements: [
      "Built Axiom-Qsecurity (personal Axiom-line research): 1.0000 recall on 100%-unseen IoT syscalls in the v1.0 benchmark report (0.9875 full-set recall, enforced train/eval separation)",
      "Developed Axiom-Zspace (personal Axiom-line research): blind-search BLS exoplanet pipeline at v1.1.2 — 148/148 validator kernels, BIG400 41.2% recall, dual Python/C99 engine",
      "Created TRUTHIMATICS (personal Axiom-line research): A sovereign logic framework for zero-hallucination AI"
    ]
  },
  {
    title: "Vulnerability Researcher & Freelance Penetration Tester",
    company: "HackerOne @0xzyo",
    period: "May 2024 – Present",
    description: "Independent vulnerability researcher targeting global production infrastructure. Ranking claim is scoped to the January-March 2026 HackerOne VDP leaderboard window: #9 Egypt · Top 90 worldwide.",
    achievements: [
      "Single-engagement record: 12+ vulnerabilities confirmed in 48 hours, 7 Critical severity",
      "Three-layer bypass at a major telecom: WAF (spoofed Host header) → 3DES key derived from bundle constants → null SECRET KEY",
      "Critical unauthenticated LLM prompt editor in production AI infrastructure",
      "Simultaneous bypass of IP restriction, CAPTCHA, and rate limiting in a single chained attack",
      "Active programs: AT&T, IBM, CBRE, DoD VDPs",
    ],
  },
  {
    title: "Technical Mentor — Security Research Community",
    company: "Independent",
    period: "2025 – Present",
    description: "Providing 1-on-1 guidance to mentees on bug bounty methodology, vulnerability chaining, and recon frameworks.",
    achievements: [
      "Guided Mohammed through AT&T's programme — he independently confirmed 3 High-severity vulnerabilities",
      "Maintains global methodology resources: My-Recon-Methodology and AI-Prompts-for-Hunting",
    ],
  },
  {
    title: "Marketing Manager",
    company: "Graphics Studio",
    period: "Dec 2023 – May 2024",
    description: "Ran marketing for a graphics studio and grew its client base 75%+ in six months.",
    achievements: [
      "Increased client base by 75%+ in six months through targeted marketing strategies",
      "Declined Regional Marketing Manager offer (Saudi Arabia) to remain focused on research",
    ],
  },
  {
    title: "Copywriter",
    company: "A to Z Marketing Agency",
    period: "Oct 2023 – Dec 2023",
    description: "Wrote copy across channels and shipped brand campaigns with a cross-functional team.",
    achievements: [
      "Shipped end-to-end copy for multiple brand campaigns",
      "Delivered campaigns jointly with design and media teams",
    ],
  },
  {
    title: "Freelance Copywriter / Social Media Manager",
    company: "Self-Employed",
    period: "May 2022 – Feb 2023",
    description: "Content calendars, scheduling via Hootsuite and Buffer, engagement metric analysis.",
    achievements: [
      "Delivered content calendars and engagement metric analysis across multiple clients",
    ],
  },
  {
    title: "First Encounter with Computing & Systems",
    company: "Localhost",
    period: "2015 – 2016 (Age 7)",
    description: "Self-assembled a curriculum from Linux, Bash, and Python at age 7–9, from documentation and trying things out",
    achievements: [
      "Operational mental model of networking and file systems by age nine",
      "A constitutional refusal to treat any system as a black box — unchanged since",
    ],
  },
];

/**
 * Portfolio project list, derived from the ranked GitHub snapshot
 * (flagship → spotlight → signal → recent → archive). There is no separate
 * manual list: the terminal `projects` command, the dossier sections, and
 * the document view all consume this array.
 */
export const projects: Project[] = rankedProjects.map((p) => ({
  title: p.title,
  date: p.date,
  description: p.description,
  tags: p.tags,
  highlights: p.highlights,
  github: p.github,
  performance: p.performance,
}));

export const education = {
  degree: "General Secondary Certificate (Thanaweya Amma) — Scientific Track",
  period: "2023 – 2026",
  institution: "Egyptian Public School System, Giza, Egypt",
  note: "Self-directed scholarly education focused on Truthimatics and Formal Logic.",
  selfDirected: {
    title: "The Axiom Foundation",
    period: "2019 – Present",
    description: "Offensive security, ML pipelines, systems design, cognitive philosophy. Each domain evidenced by public tool releases and indexed publications."
  }
};

export const certifications = [
  { name: "CRTP (Certified Red Team Professional)", date: "2026", issuer: "Altered Security" },
  { name: "CEH (Certified Ethical Hacker)", date: "2024", issuer: "Self-Study" },
  { name: "eWAPTx", date: "2024", issuer: "Self-Study" },
  { name: "Google Digital Marketing Professional", date: "2021", issuer: "Google", note: "Score: 90% — obtained at age 12" }
];

export const awards = [
  { title: "HackerOne VDP — #9 Egypt · Top 90 Worldwide", date: "Jan-Mar 2026", issuer: "HackerOne", description: "Ranking scoped to the January-March 2026 VDP leaderboard window, not presented as a permanent current rank — verifiable via the linked HackerOne profile." },
  { title: "1st Place — EYCC CTF", date: "2025", issuer: "HackClub Egypt", description: "Winning first high-school-only CTF in Egypt." },
  { title: "TryHackMe — Top 2% Global", date: "Active", issuer: "TryHackMe" }
];

export const writeups = [
  {
    title: "6 Hours, 6 Real-World Critical Bugs",
    date: "Feb 2026",
    description: "A case study in efficient bug hunting: uncovering multiple critical vulnerabilities in a short timeframe.",
    image: criticalsImg,
    link: "https://0xzyo.medium.com/6-hours-6-real-world-critical-bugs-a-case-study-in-efficient-bug-hunting-a88c2002abbb",
    tags: ["Bug Bounty", "Critical"]
  },
  {
    title: "Critical Unauthenticated LLM Prompt Editor",
    date: "Jan 2026",
    description: "Discovered a critical vulnerability allowing unauthenticated prompt manipulation in AI infrastructure.",
    image: aiAccessImg,
    link: "https://0xzyo.medium.com",
    tags: ["AI Security", "Critical"]
  }
];

export const athleticStats = {
  title: "Powerlifting — Deterministic Progression",
  lifts: [
    { name: "Deadlift", lbs: 440, kg: 200 },
    { name: "Squat", lbs: 300, kg: 136 },
    { name: "Bench Press", lbs: 200, kg: 91 },
    { name: "Leg Press", lbs: 1100, kg: 499 }
  ]
};

export const creativeWork = {
  music: {
    identity: "Zy0x",
    album: "What Heaven Sounded Like Before It Fell",
    genres: ["Phonk", "Brazilian Phonk", "Techno", "Classical Opera"]
  },
  novels: [
    { title: "What Heaven Sounded Like Before It Fell", language: "Arabic", genre: "Philosophical Fantasy", description: "A unified music and literature project." },
    { title: "Zeus — The God Who Was Human", language: "Arabic", genre: "Philosophical Fiction" },
    { title: "Drowning in My Brother's Shadow", language: "Arabic", genre: "Psychological Thriller" }
  ]
};
