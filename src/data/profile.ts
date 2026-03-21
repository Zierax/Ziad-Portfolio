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
}

export const academicResearches: AcademicResearch[] = [
  {
    title: "PTRR: A Metacognitive Framework for Measuring and Mitigating Automation Bias in AI-Assisted Vulnerability Research",
    date: "2026",
    description: "Introduces ABI, CSI, TIIS — three behavioral indices measuring automation bias, grounded in Dual Process Theory and Cognitive Load Theory. Case study: 0→7 critical-severity findings over equivalent 60-hour periods, confirmed by independent programme triage. Active scholarly correspondence with Prof. Gajos (Harvard SEAS) on HLM design; WOOT '27 endorsement from Prof. Bianchi (Purdue). 167 views · 94 downloads (7 days).",
    journalOrConference: "IEEE AIITA 2026 (Accepted)",
    doiLink: "https://doi.org/10.5281/zenodo.18873774"
  },
  {
    title: "How Non-Living Intelligence Brings Life to Music",
    date: "2026",
    description: "Introduces the Delegated Vitality Framework (DVF). Phenomenological study: 10 naive listeners independently assigned structurally convergent kinetic interpretations to an AI-generated score without narrative context. Engages Hanslick, Meyer, Huron, Gadamer. 232 views · 114 downloads (15 days).",
    journalOrConference: "Preprint — Zenodo, OpenAIRE, Google Scholar",
    pdfLink: "https://github.com/Zierax/Ziad-Portfolio/blob/main/src/assets/researches/How_Non-Living_Intelligence_Brings_Life_to_Music.pdf",
    doiLink: "https://doi.org/10.5281/zenodo.18751159"
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
  location: "Giza, Egypt",
  bio: "Independent security researcher and self-directed scholar operating without institutional affiliation. Published academic research indexed on Zenodo, OpenAIRE, and Google Scholar. Discovered critical vulnerabilities in global production infrastructure. Developed open-source security tools adopted by thousands of researchers worldwide. Research axis: the intersection of human–computer interaction, offensive security, and cognitive psychology.",
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
  cybersecurity: [
    "Web/API Pentesting",
    "Smart Contract Auditing",
    "Active Directory Pentesting",
    "Binary Exploitation",
    "Malware Analysis",
    "OSINT",
    "Bug Bounty Hunting",
    "Security Automation",
    "CTF Competitions",
  ],
  tools: [
    "Burp Suite",
    "Caido",
    "nmap",
    "ffuf",
    "Arjun",
    "Shodan",
    "Censys",
    "nuclei",
    "Metasploit",
    "YARA",
    "strace",
  ],
  programming: [
    "Python (advanced)",
    "C/C++",
    "Bash",
    "JavaScript/TypeScript",
    "React",
    "Solidity",
    "LightGBM",
    "scikit-learn",
    "TF-IDF",
  ],
  research: [
    "Dual Process Theory",
    "Cognitive Load Theory",
    "Signal Detection Theory",
    "HLM/LME Modeling",
    "Framework Development",
    "Phenomenological Analysis",
  ],
  business: [
    "Marketing",
    "Digital Advertising",
    "Communication",
    "Social Media Management",
    "Copywriting",
  ],
};

export const experience: Experience[] = [
  {
    title: "Vulnerability Researcher & Freelance Penetration Tester",
    company: "HackerOne @0xzyo",
    period: "May 2024 – Present",
    description: "Independent vulnerability researcher targeting global production infrastructure across public bug bounty and VDP programs. Ranking: #9 Egypt · Top 90 Worldwide (VDP leaderboard, 2026).",
    achievements: [
      "12+ vulnerabilities confirmed in 48 hours in a single engagement, 7 Critical severity",
      "Three-layer bypass at a major telecom: WAF (spoofed Host header) → 3DES key derived from bundle constants enabling offline traffic decryption → null SECRET KEY rendering 10,000 OTPs precomputable offline. All layers confirmed by independent triage",
      "Critical unauthenticated LLM prompt editor: read/write of all base system prompts affecting every tenant simultaneously in a live FastAPI production deployment",
      "Simultaneous bypass of IP restriction, CAPTCHA, and rate limiting in a single chained attack",
      "Programs: AT&T, IBM, CBRE, DoD VDPs",
    ],
  },
  {
    title: "Technical Mentor — Security Research Community",
    company: "Independent",
    period: "2025 – Present",
    description: "Providing 1-on-1 guidance to mentees on bug bounty methodology, vulnerability chaining, and recon frameworks. Framing: mutual problem-solving rather than instruction, to preserve intellectual equality.",
    achievements: [
      "Guided Mohammed through AT&T's programme — he independently confirmed 3 High-severity vulnerabilities",
      "Maintains two free global methodology resources: My-Recon-Methodology and AI-Prompts-for-Hunting",
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
    description: "Bypassed household router parental controls through first-principles reasoning before having a guide or English literacy. Self-assembled a curriculum from Linux, Bash, and Python at age 7–9, without a teacher or course.",
    achievements: [
      "Operational mental model of networking, process isolation, and file systems by age nine",
      "A constitutional refusal to treat any system as a black box — unchanged since",
    ],
  },
];

export const writeups: Writeup[] = [
  {
    title: "6 Hours, 6 Real-World Critical Bugs",
    date: "Feb 2026",
    description: "A case study in efficient bug hunting: uncovering multiple critical vulnerabilities in a short timeframe. 7.7K views · 2.6K reads.",
    image: criticalsImg,
    link: "https://0xzyo.medium.com/6-hours-6-real-world-critical-bugs-a-case-study-in-efficient-bug-hunting-a88c2002abbb",
    tags: ["Bug Bounty", "Critical", "Web Security"]
  },
  {
    title: "Critical Unauthenticated LLM Prompt Editor",
    date: "Jan 2026",
    description: "Discovered a critical vulnerability allowing unauthenticated prompt injection and manipulation in AI infrastructure. 1.1K views.",
    image: aiAccessImg,
    link: "https://0xzyo.medium.com/how-i-found-a-critical-unauthenticated-llm-prompt-editor-in-ai-infrastructure-bfca98d68e1f",
    tags: ["AI Security", "LLM Injection", "Critical"]
  },
  {
    title: "How I Bypassed IP Restrictions, CAPTCHA, and Rate Limiting in One Shot",
    date: "2026",
    description: "Simultaneous bypass of three independent security controls in a single chained attack. 1.5K views.",
    image: aiAccessImg,
    link: "https://0xzyo.medium.com",
    tags: ["Bug Bounty", "WAF Bypass", "CAPTCHA", "Rate Limiting"]
  }
];

export const projects: Project[] = [
  {
    title: "TinyML Malware Detector",
    date: "2025–2026",
    description: "Full LightGBM pipeline with TF-IDF + 32 handcrafted behavioral features, 86% real-world accuracy on 7 malware families from a self-curated dataset of 4,000+ Linux ELF binaries detonated in isolated VMs. TinyML C-header pipeline: zero dynamic memory allocation, 95 ns kernel latency (22,898,948× faster than Python CLI), 4.4 KB binary, ROC-AUC 0.9979, FPR 0.53%.",
    tags: ["Python", "C", "LightGBM", "scikit-learn", "TinyML", "Malware Analysis"],
    highlights: "22,898,948× faster than Python CLI — runs on microcontrollers",
    github: "https://github.com/Zierax/TinyML-Malware-LinuxTypes",
  },
  {
    title: "Taskware Manager",
    date: "2025–Present",
    description: "Fully offline Linux threat-hunting platform: YARA real-time memory/disk signature matching, ML-based syscall analysis, heuristic evasion and persistence detection, memory dumping for forensics. Offline-by-design — shaped by chronic infrastructure constraints into a deliberate architectural principle.",
    tags: ["Python", "PyQt6", "YARA", "LightGBM", "strace", "Forensics"],
    highlights: "Fully offline — zero network dependency by design",
    github: "https://github.com/Zierax/Taskware-Manager",
  },
  {
    title: "Grafana Final Scanner",
    date: "2026",
    description: "First comprehensive open-source scanner covering 10 Grafana CVEs (2018–2025). Adopted by thousands of researchers globally within four days; no equivalent tool existed prior.",
    tags: ["Python", "CVE Scanner", "Grafana", "Security Tool"],
    highlights: "70 stars · 10 forks · adopted by thousands within 4 days",
    github: "https://github.com/Zierax/Grafana-Final-Scanner",
  },
  {
    title: "AdmitGPT",
    date: "2026",
    description: "Deterministic client-side admissions engine on transparent logistic regression. Outlier Protocol (Tier 0) for professional-grade achievers; zero-knowledge handler for non-standard educational systems. 100% zero-data architecture.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Logistic Regression"],
    highlights: "100% zero-data architecture — fully client-side",
    github: "https://github.com/Zierax/AdmitGPT",
  },
  {
    title: "HackerHelper",
    description: "Full-stack security research workflow platform combining mind mapping, AI assistance, and penetration testing utilities.",
    tags: ["React", "TypeScript", "AI", "Pentesting Workflow"],
    highlights: "AI-assisted workflow optimization",
    github: "https://github.com/Zierax/HackerHelper",
  },
  {
    title: "GoogleDorker v2.0",
    description: "Advanced Google Dorking tool featuring proxy support and WAF bypass techniques.",
    tags: ["Python", "OSINT", "Reconnaissance", "Automation"],
    highlights: "Visual Dorking Mode & WAF Bypass",
    github: "https://github.com/Zierax/GoogleDorker",
  },
  {
    title: "TREVER (ReverseAPK)",
    description: "Powerful Android security analysis CLI wrapper for apktool, jadx, and d2j-dex2jar.",
    tags: ["Android Security", "Reverse Engineering", "Bash", "Java"],
    highlights: "Automated APK Analysis Pipeline",
    github: "https://github.com/Zierax/TREVER",
  },
  {
    title: "My Recon Methodology",
    description: "Personal, constantly updated reconnaissance methodology and checklist for bug bounty hunting. Free, open-access global resource.",
    tags: ["Methodology", "Recon", "Bug Bounty"],
    github: "https://github.com/Zierax/My-Recon-Methology",
  },
  {
    title: "AI Prompts for Hunting",
    description: "Specialized AI prompts designed to assist in vulnerability hunting and security research tasks. Free, open-access global resource.",
    tags: ["AI", "Prompt Engineering", "Bug Bounty"],
    github: "https://github.com/Zierax/AI-prompts-for-hunting",
  },
  {
    title: "G-dorks",
    description: "Curated collection of Google dorks for bug hunters and OSINT researchers.",
    tags: ["Google Dorks", "Recon", "OSINT"],
    github: "https://github.com/Zierax/G-dorks",
  },
];

export const education = {
  degree: "General Secondary Certificate (Thanaweya Amma) — Scientific Track",
  period: "2023 – 2026",
  institution: "Egyptian Public School System, Giza, Egypt",
  note: "No GPA, no class rank — structurally unavailable.",
  selfDirected: {
    title: "Self-Directed Technical & Scholarly Education",
    period: "2019 – Present",
    description: "Offensive security, ML pipelines, systems design, cognitive philosophy, literary fiction. Each domain evidenced by public tool releases, indexed publications, or competitive results — not self-assertion. Produced under chronic hardware constraints (2 GB RAM machine), unreliable electricity, zero family background in technology or academia, and no library, laboratory, or faculty access."
  }
};

export const certifications = [
  {
    name: "CRTP (Certified Red Team Professional)",
    date: "2026",
    issuer: "Altered Security",
  },
  {
    name: "CEH (Certified Ethical Hacker)",
    date: "Jan 2024",
    issuer: "Self-Study",
  },
  {
    name: "eWAPTx",
    date: "Jan 2024",
    issuer: "Self-Study",
  },
  {
    name: "Google Digital Marketing Professional",
    date: "2021",
    issuer: "Google",
    note: "Score: 90% — obtained at age 12"
  },
];

export const awards = [
  {
    title: "1st Place — EYCC CTF",
    date: "October 2025",
    description: "First place in Egypt Youth Cybersecurity Championship — the first high-school-only CTF in Egypt, organized by HackClub Egypt.",
    issuer: "HackClub Egypt",
  },
  {
    title: "HackerOne VDP — #9 Egypt · Top 90 Worldwide",
    date: "2026",
    description: "Ranked #9 in Egypt and Top 90 Worldwide on the HackerOne VDP leaderboard.",
    issuer: "HackerOne",
  },
  {
    title: "TryHackMe — Top 2% Global",
    date: "Active",
    description: "Top 2% globally across Active Directory, Binary Exploitation, Web Security, Forensics, and Cryptography.",
    issuer: "TryHackMe",
  },
];

export const athleticStats = {
  title: "Powerlifting — Self-Directed Program",
  period: "Mid-2024 – Present",
  note: "Twelve consecutive months unbroken (July 2024 – July 2025, zero missed sessions). No coach, no institution.",
  lifts: [
    { name: "Deadlift", lbs: 440, kg: 200 },
    { name: "Squat", lbs: 300, kg: 136 },
    { name: "Bench Press", lbs: 200, kg: 91 },
    { name: "Leg Press", lbs: 1100, kg: 499 },
    { name: "Single-Arm Row", lbs: 200, kg: 91 },
  ]
};

export const creativeWork = {
  music: {
    identity: "Zy0x",
    period: "2023 – Present",
    genres: ["Phonk", "Brazilian Phonk", "Techno", "Classical Opera"],
    album: "What Heaven Sounded Like Before It Fell",
    albumNote: "Structural companion to the novel: each phase of the protagonist's transformation arc scored as a distinct compositional movement. Pen name Zy0x is the devil king — a deliberate collapse of author and subject.",
    study: "AI composition study (2026): 10 naive listeners independently assigned structurally convergent kinetic interpretations to an AI-generated score without narrative context — empirical foundation for the DVF paper.",
  },
  novels: [
    {
      title: "What Heaven Sounded Like Before It Fell",
      language: "Arabic",
      genre: "Philosophical Fantasy",
      description: "A child born in Hell dismantles cosmic power systems — and is corrupted by the same forces he defeated. Paired chapter-by-chapter with the music discography as a unified project.",
    },
    {
      title: "Zeus — The God Who Was Human",
      language: "Arabic",
      genre: "Philosophical Fiction",
      description: "Systems of oppression require no malice; only forgetting.",
    },
    {
      title: "Drowning in My Brother's Shadow",
      language: "Arabic",
      genre: "Psychological Thriller",
      description: "Unreliable narration, fractured memory, identity dissolution.",
    },
    {
      title: "The Last Night of Rain",
      language: "Arabic",
      genre: "Psychological Thriller",
      description: "Unreliable narration, fractured memory, identity dissolution.",
    },
  ]
};
