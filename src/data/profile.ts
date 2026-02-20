
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
    title: "How Non-Living Intelligence Brings Life to Music",
    date: "2026",
    description: "An exploration into the intersection of artificial intelligence and musical composition, detailing how non-living algorithms can generate lifelike and emotionally resonant music. Keywords: Artificial Intelligence, Music Generation, Algorithmic Composition, Machine Learning",
    journalOrConference: "Independent Research",
    pdfLink: "/src/assets/researches/How_Non-Living_Intelligence_Brings_Life_to_Music.pdf",
    doiLink: "#"
  }
];

export const profileData = {
  name: "Ziad Salah",
  title: "Vulnerability Researcher | Offensive Security Engineer",
  email: "zs.01117875692@gmail.com",
  phone: "+201117875692",
  location: "Giza, Egypt",
  bio: "Cybersecurity professional specializing in web, API, and smart contract testing, with strong skills in automation and vulnerability research. Passionate about securing the decentralized web and breaking complex systems.",
  avatar: "https://github.com/Zierax.png",
  socials: [
    { platform: "GitHub", url: "https://github.com/Zierax", username: "Zierax" },
    { platform: "HackerOne", url: "https://hackerone.com/0xzyo", username: "0xzyo" },
    { platform: "LinkedIn", url: "https://linkedin.com/in/z14d", username: "z14d" },
    { platform: "TryHackMe", url: "https://tryhackme.com/p/Zierax", username: "Zierax" },
    { platform: "X (Twitter)", url: "https://x.com/Zierax_x", username: "@Zierax_x" },
    { platform: "Medium", url: "https://0xzyo.medium.com", username: "0xzyo" },
  ]
};

export const skills = {
  cybersecurity: [
    "Web2 Pentesting",
    "Smart Contract Auditing",
    "AD pentesting",
    "Vulnerability Assessments",
    "CTF Competitions",
    "Bug Bounty Hunting",
    "Security Automation",
    "Malware Analysis"
  ],
  tools: [
    "Burp Suite",
    "OpenVAS",
    "Caido",
    "Metasploit",
    "Nmap",
    "Wireshark",
    "Solidity Analysis Tools"
  ],
  programming: [
    "Python",
    "Bash",
    "Solidity",
    "Full-Stack Development",
    "Machine Learning",
    "TypeScript/JavaScript",
    "C/C++"
  ],
  business: [
    "Marketing",
    "Digital Advertising",
    "Communication",
    "Social Media Management",
  ],
};

export const experience: Experience[] = [
  {
    title: "Web2/Web3 Penetration Tester | Bug Hunter",
    company: "Freelancer",
    period: "Mar 2024 - Present",
    description: "Experienced Web2/Web3 Penetration Tester and Bug Bounty Hunter skilled in discovering and automating detection of high-impact vulnerabilities across web, mobile, and blockchain systems. Proficient in Burp Suite, OpenVAS, Caido, and Solidity auditing for secure, research-driven assessments.",
    achievements: [
      "Identified and disclosed several high-impact vulnerabilities in well-known public security programs",
      "Enhanced overall platform resilience through responsible disclosure",
      "Automated vulnerability detection workflows",
    ],
  },
  {
    title: "Marketing Manager",
    company: "Graphics Studio",
    period: "Jan 2024 - Apr 2024",
    description: "Spearheaded strategic marketing initiatives to enhance brand visibility, attract new clients, and boost sales growth.",
    achievements: [
      "Increased client base by over 75% within six months through targeted marketing strategies",
      "High-quality lead acquisition campaigns",
    ],
  },
  {
    title: "Copywriter",
    company: "A to Z Marketing Agency",
    period: "Oct 2023 - Jan 2024",
    description: "Highly skilled copywriter with a proven track record of creating impactful marketing copy.",
    achievements: [
      "Collaborated with cross-functional teams for successful campaigns",
    ],
  },
    {
    title: "Script-Kiddie",
    company: "Localhost",
    period: "Jan 2016 - Jan 2021",
    description: "Litterly a Script Kid, I was 7 in 2016",
    achievements: [
      "I was just using random hacking scripts from github and Learnt basic python and bash in this time",
    ],
  },
];

export const writeups: Writeup[] = [
  {
    title: "6 Hours, 6 Real-World Critical Bugs",
    date: "Feb 2026", // Assuming recent based on prompt context, or leave date generic
    description: "A case study in efficient bug hunting: uncovering multiple critical vulnerabilities in a short timeframe.",
    image: criticalsImg,
    link: "https://0xzyo.medium.com/6-hours-6-real-world-critical-bugs-a-case-study-in-efficient-bug-hunting-a88c2002abbb",
    tags: ["Bug Bounty", "Critical", "Web Security"]
  },
  {
    title: "Critical Unauthenticated LLM Prompt Editor",
    date: "Jan 2026",
    description: "Discovered a critical vulnerability allowing unauthenticated prompt injection and manipulation in AI infrastructure.",
    image: aiAccessImg,
    link: "https://0xzyo.medium.com/how-i-found-a-critical-unauthenticated-llm-prompt-editor-in-ai-infrastructure-bfca98d68e1f",
    tags: ["AI Security", "LLM Injection", "Critical"]
  }
];

export const projects: Project[] = [
  {
    title: "Grafana Final Scanner",
    description: "Comprehensive vulnerability detection tool for Grafana deployments covering 10 CVEs (2018-2025) with smart version detection and multi-endpoint fingerprinting.",
    tags: ["Python", "CVE Scanner", "Grafana", "Security Tool"],
    highlights: "Detects 10+ CVEs with high precision",
    github: "https://github.com/Zierax/Grafana-Final-Scanner",
  },
  {
    title: "Malware Linux Types Detector (ML)",
    description: "Behavior-based machine learning malware classifier using syscall sequences. Features TF-IDF pipeline, LightGBM model, and CLI/API interfaces.",
    tags: ["Machine Learning", "Python", "Malware Analysis", "LightGBM"],
    highlights: "Balanced class weights & rare-class filtering",
    github: "https://github.com/Zierax/Malware-LinuxTypes-Detector-ML",
  },
  {
    title: "HackerHelper",
    description: "Comprehensive security research toolkit combining mind mapping, AI assistance, and penetration testing utilities in a modern React application.",
    tags: ["React", "TypeScript", "AI", "Pentesting Workflow"],
    highlights: "AI-assisted workflow optimization",
    github: "https://github.com/Zierax/HackerHelper",
  },
  {
    title: "GoogleDorker v2.0",
    description: "Advanced Google Dorking tool featuring proxy support, WAF bypass techniques, visual dorking mode, and multi-threaded operations for rapid reconnaissance.",
    tags: ["Python", "OSINT", "Reconnaissance", "Automation"],
    highlights: "Visual Dorking Mode & WAF Bypass",
    github: "https://github.com/Zierax/GoogleDorker",
  },
  {
    title: "TREVER (ReverseAPK)",
    description: "Powerful Android security analysis CLI wrapper for apktool, jadx, and d2j-dex2jar. Automates unpacking, decompilation, and manifest analysis.",
    tags: ["Android Security", "Reverse Engineering", "Bash", "Java"],
    highlights: "Automated APK Analysis Pipeline",
    github: "https://github.com/Zierax/TREVER",
  },
  {
    title: "My Recon Methodology",
    description: "Personal, constantly updated reconnaissance methodology and checklist for bug bounty hunting and pentesting.",
    tags: ["Methodology", "Recon", "Bug Bounty"],
    github: "https://github.com/Zierax/My-Recon-Methology",
  },
  {
    title: "G-dorks",
    description: "Curated collection of 'harmless' Google dorks for bug hunters to discover exposed assets and information.",
    tags: ["Google Dorks", "Recon", "OSINT"],
    github: "https://github.com/Zierax/G-dorks",
  },
  {
    title: "AI Prompts for Hunting",
    description: "Specialized AI prompts designed to assist in vulnerability hunting and security research tasks.",
    tags: ["AI", "Prompt Engineering", "Bug Bounty"],
    github: "https://github.com/Zierax/AI-prompts-for-hunting",
  }
];

export const education = {
  degree: "High School Diploma - Scientific Sciences",
  period: "Jan 2023 - Jan 2026",
  institution: "High School",
};

export const certifications = [
  {
    name: "Google Marketing Certificate",
    date: "2022",
    issuer: "Google",
    note: "Got it when I was 12 years old"
  },
  {
    name: "CEH (Certified Ethical Hacker)",
    date: "Jan 2024",
    issuer: "Self-Study",
  },
  {
    name: "eWAPTX",
    date: "Jan 2024",
    issuer: "Self-Study",
  },
  {
    name: "CRTP",
    date: "2026",
    issuer: "Altered Security",
  },
];

export const awards = [
  {
    title: "1st Place - EYCC CTF",
    date: "October 2025",
    description: "First place in Egypt Youth Cybersecurity Championship CTF - the first CTF for high schoolers in Egypt.",
    issuer: "EYCC",
  },
];
