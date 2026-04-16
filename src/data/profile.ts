import aiAccessImg from "../assets/AiAccess.png";
import criticalsImg from "../assets/6Criticals.png";

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

export const academicResearches: AcademicResearch[] = [
  {
    title: "PTRR Framework: A Metacognitive Framework for Measuring and Mitigating Automation Bias in AI-Assisted Vulnerability Research",
    date: "2026",
    description: "Introduces ABI, CSI, TIIS — three behavioral indices measuring automation bias, grounded in Dual Process Theory and Cognitive Load Theory. Case study: 0→7 critical-severity findings over equivalent 60-hour periods, confirmed by independent programme triage. Active scholarly correspondence with Prof. Gajos (Harvard SEAS) on HLM design; WOOT '27 endorsement from Prof. Bianchi (Purdue). 167 views · 94 downloads (7 days).",
    journalOrConference: "IEEE AIITA 2026 (Accepted) | Nature Portfolio (Scientific Reports) Under Review by 9 experts",
    doiLink: "https://doi.org/10.5281/zenodo.18873773",
    status: "Accepted / Under Review",
    impact: "Shifting finding profiles from Low to Critical-Dominant"
  },
  {
    title: "DVF Framework: How Non-Living Intelligence Brings Life to Music",
    date: "2026",
    description: "Introduces the Delegated Vitality Framework (DVF). Phenomenological study: 10 naive listeners independently assigned structurally convergent kinetic interpretations to an AI-generated score without narrative context. Engages Hanslick, Meyer, Huron, Gadamer. 232 views · 114 downloads (15 days).",
    journalOrConference: "Neurology Research (Invited)",
    doiLink: "https://doi.org/10.5281/zenodo.18751159",
    status: "Invited",
    impact: "Redefining AI-Vitality via Structural Activation Potential"
  },
  {
    title: "Axiom-Logic: Deterministic Reasoning Engine",
    date: "2026",
    description: "Pure logical inference @ 34ns. Eliminates probabilistic 'possibility' factor in AI reasoning.",
    status: "Production Phase",
    impact: "Blackbox Elimination. Pure logical inference @ 34ns"
  },
  {
    title: "Reverse Correction Assessment Methodology (RCAM): Evaluating Conceptual Understanding Through Elimination-Based Scoring",
    date: "2026",
    description: "Proposes a multiple-choice scoring system where students eliminate incorrect options rather than select correct ones, scored via RMS with continuous penalty exponent. Extends Bruno & Dirkzwager (1995). Preliminary data: ~4× reduction in time-to-mastery.",
    journalOrConference: "Preprint v0.1"
  }
];

export const profileData = {
  name: "Ziad Salah",
  title: "Independent Security Researcher | Vulnerability Researcher | Software Developer",
  email: "zs.01117875692@gmail.com",
  phone: "+201117875692",
  location: "Cairo Core (Egypt)",
  bio: "Independent security researcher and self-directed scholar operating without institutional affiliation. Published academic research indexed on Zenodo, OpenAIRE, and Google Scholar. Discovered critical vulnerabilities in global production infrastructure. Developed open-source security tools adopted by thousands of researchers worldwide. Pioneer of Truthimatics — a logic-driven approach to AI and security that replaces probabilistic guessing with deterministic inference.",
  avatar: "https://github.com/Zierax.png",
  socials: [
    { platform: "GitHub", url: "https://github.com/Zierax", username: "Zierax" },
    { platform: "HackerOne", url: "https://hackerone.com/0xzyo", username: "0xzyo" },
    { platform: "LinkedIn", url: "https://linkedin.com/in/z14d", username: "z14d" },
    { platform: "TryHackMe", url: "https://tryhackme.com/p/Zierax", username: "Zierax" },
    { platform: "X (Twitter)", url: "https://x.com/Zierax_x", username: "@Zierax_x" },
    { platform: "Medium", url: "https://0xzyo.medium.com", username: "0xzyo" },
    { platform: "ORCID", url: "https://orcid.org/0009-0002-6813-2416", username: "0009-0002-6813-2416" },
  ]
};

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
    title: "Founder & Lead Researcher",
    company: "Axiom Logic / Division-36",
    period: "2026 – Present",
    description: "Architect of the Axiom ecosystem. Developing deterministic reasoning engines that outperform traditional neural networks in speed and precision.",
    achievements: [
      "Built Axiom-Qsecurity: 100% recall on unseen data with a 915-byte engine",
      "Developed Axiom-Zspace: 33 planet candidates discovered in 45 minutes",
      "Created TRUTHIMATICS: A sovereign logic framework for zero-hallucination AI"
    ]
  },
  {
    title: "Vulnerability Researcher & Freelance Penetration Tester",
    company: "HackerOne @0xzyo",
    period: "May 2024 – Present",
    description: "Independent vulnerability researcher targeting global production infrastructure. Ranking: #9 Egypt · Top 90 Worldwide (VDP leaderboard, 2026).",
    achievements: [
      "12+ vulnerabilities confirmed in 48 hours in a single engagement, 7 Critical severity",
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
    description: "Spearheaded strategic marketing initiatives to enhance brand visibility and boost sales growth.",
    achievements: [
      "Increased client base by 75%+ in six months through targeted marketing strategies",
      "Declined Regional Marketing Manager offer (Saudi Arabia) to remain focused on research",
    ],
  },
  {
    title: "Copywriter",
    company: "A to Z Marketing Agency",
    period: "Oct – Dec 2023",
    description: "High-impact copy across channels; cross-functional campaign collaboration.",
    achievements: [
      "Managed end-to-end copywriting projects for multiple brand campaigns",
      "Collaborated with cross-functional teams for successful project delivery",
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
    description: "Self-assembled a curriculum from Linux, Bash, and Python at age 7–9. from documentations and trying",
    achievements: [
      "Operational mental model of networking and file systems by age nine",
      "A constitutional refusal to treat any system as a black box — unchanged since",
    ],
  },
];

export const projects: Project[] = [
  {
    title: "Axiom-Qsecurity",
    date: "2026",
    description: "Quantum-Kernel SVM Evolution For Planck-99. A minimalist, zero-overhead security audit engine built on Vectorized Quantum Features. 1KB Milestone: Logic compressed into 915-byte C-header.",
    performance: "100% Recall (Unseen data)",
    tags: ["Quantum Features", "SVM", "C", "SOTA"],
    github: "https://github.com/Zierax/Axiom-Qsecurity",
    highlights: "Model size: 915 Bytes — fits in CPU L1 cache"
  },
  {
    title: "Planck-99",
    date: "2026",
    description: "High-performance Linux Kernel Malware Audit engine. Deterministic analysis of IoT syscalls and kernel-level anomalies.",
    performance: "30-73ns Latency",
    tags: ["Kernel", "Linux", "Security", "Optimization"],
    github: "https://github.com/Division-36/Planck-99_PublicBenchmarks",
    highlights: "Extreme low-latency malware detection"
  },
  {
    title: "Axiom-Astrophysics",
    date: "2026",
    description: "Cosmic Signal Deconvolution engine. Recovers structured signal data from high-entropy astrophysical noise using Truthimatics.",
    performance: "100% Precision",
    tags: ["Astrophysics", "Signal Processing", "Truthimatics"],
    github: "https://github.com/Zierax/Axiom-Astrophysics",
    highlights: "Deterministic signal recovery"
  },
  {
    title: "Axiom-WAF",
    date: "2026",
    description: "Deterministic Web application Firewall defense. Shifting from pattern matching to logical invariant validation.",
    performance: "99.33% Accuracy",
    tags: ["Security", "WAF", "Firewall", "Logic"],
    github: "https://github.com/Division-36/AxiomWAF-Brain_PublicBenchmarks",
    highlights: "Zero-hallucination web defense"
  },
  {
    title: "Axiom-Vesuvius",
    date: "2026",
    description: "Deterministic Herculaneum Papyrus Recovery. Uses sub-millimeter physical feature analysis to detect ink on carbonized scrolls.",
    performance: "91.83% F1-Score",
    tags: ["History", "Signal Recovery", "Physical Modeling"],
    github: "https://github.com/Zierax/Axiom-Vesuvius/",
    highlights: "Zero GPU requirement — solves via Truthimatics"
  },
  {
    title: "SYRTH",
    date: "2026",
    description: "Static Vulnerability Analysis (Scan Your Risk Trace History). AST-based detection system for Python code with production-ready C engine.",
    performance: "4.1K records/s",
    tags: ["SAST", "Vulnerability Research", "C Engine"],
    github: "https://github.com/Division-36/Syrth_PublicBenchmark",
    highlights: "Sub-millisecond vulnerability scanning"
  },
  {
    title: "Axiom-Zspace",
    date: "2026",
    description: "Large-scale signal deconvolution for exoplanet discovery. Discovered 33 new planet candidates in 45 minutes on consumer hardware.",
    performance: "33 discoveries in 45m",
    tags: ["Space", "Signal Analysis", "Physics"],
    github: "https://github.com/Zierax/Axiom-Zspace",
    highlights: "0.86 planets/minute on a laptop"
  },
  {
    title: "TinyML Malware Detector",
    date: "2025–2026",
    description: "Full LightGBM pipeline with TF-IDF + 32 handcrafted behavioral features, 86% real-world accuracy on Linux ELF binaries.",
    tags: ["Python", "C", "LightGBM", "TinyML"],
    highlights: "22,898,948× faster than Python CLI",
    github: "https://github.com/Zierax/TinyML-Malware-LinuxTypes",
  },
  {
    title: "Taskware Manager",
    date: "2025–Present",
    description: "Fully offline Linux threat-hunting platform: YARA real-time signature matching, ML-based syscall analysis.",
    tags: ["Python", "PyQt6", "YARA", "Forensics"],
    highlights: "Fully offline — zero network dependency",
    github: "https://github.com/Zierax/Taskware-Manager",
  },
  {
    title: "Axiom-LRM (In-Development)",
    date: "2026",
    description: "Large Reasoning Model shifting AI from probabilistic guessing to Pure Logical Inference.",
    tags: ["AGI", "Logic", "R&D"],
    highlights: "Alpha Status — Intelligence as a Law"
  }
];

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
  { title: "HackerOne VDP — #9 Egypt · Top 90 Worldwide", date: "2026'upto march", issuer: "HackerOne", description: "Ranked Top 90 Globally on the VDP leaderboard." },
  { title: "1st Place — EYCC CTF", date: "2025", issuer: "HackClub Egypt", description: "Winning first high-school-only CTF in Egypt." },
  { title: "TryHackMe — Top 2% Global", date: "Active", issuer: "TryHackMe" }
];

export const writeups = [
  {
    title: "6 Hours, 6 Real-World Critical Bugs",
    date: "Feb 2026",
    description: "A case study in efficient bug hunting: uncovering multiple critical vulnerabilities in a short timeframe. 7.7K views.",
    image: criticalsImg,
    link: "https://0xzyo.medium.com/6-hours-6-real-world-critical-bugs-a-case-study-in-efficient-bug-hunting-a88c2002abbb",
    tags: ["Bug Bounty", "Critical"]
  },
  {
    title: "Critical Unauthenticated LLM Prompt Editor",
    date: "Jan 2026",
    description: "Discovered a critical vulnerability allowing unauthenticated prompt manipulation in AI infrastructure.",
    image: aiAccessImg,
    link: "https://0xzyx.medium.com",
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
