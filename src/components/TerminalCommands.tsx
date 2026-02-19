import { profileData, experience, projects, skills, certifications, awards } from "@/data/resumeData";

export const getTerminalOutput = (cmd: string): string[] => {
  const trimmedCmd = cmd.trim().toLowerCase();
  let output: string[] = [];

  // ASCII Art Banner
  const banner = [
    "╔══════════════════════════════════════════════════════════════╗",
    "║  ███████╗██╗ █████╗ ██████╗     ███████╗ █████╗ ██╗      █████╗ ██╗  ██╗ ║",
    "║  ╚══███╔╝██║██╔══██╗██╔══██╗    ██╔════╝██╔══██╗██║     ██╔══██╗██║  ██║ ║",
    "║    ███╔╝ ██║███████║██║  ██║    ███████╗███████║██║     ███████║███████║ ║",
    "║   ███╔╝  ██║██╔══██║██║  ██║    ╚════██║██╔══██║██║     ██╔══██║██╔══██║ ║",
    "║  ███████╗██║██║  ██║██████╔╝    ███████║██║  ██║███████╗██║  ██║██║  ██║ ║",
    "║  ╚══════╝╚═╝╚═╝  ╚═╝╚═════╝     ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ║",
    "║                                                                          ║",
    "║              [ OFFENSIVE SECURITY TERMINAL v2.0 ]                       ║",
    "║              [ PENTESTER | BUG BOUNTY HUNTER ]                          ║",
    "╚══════════════════════════════════════════════════════════════╗",
    "",
  ];

  switch (trimmedCmd) {
    case "banner":
    case "logo":
      output = banner;
      break;

    case "help":
    case "?":
      output = [
        "╔════════════════════ AVAILABLE COMMANDS ═══════════════════╗",
        "│ INFORMATION                                                │",
        "│  help, ?          - Show this help message                 │",
        "│  banner, logo     - Display ASCII art banner               │",
        "│  whoami           - Display current user info              │",
        "│  about, bio       - Personal information                   │",
        "│  cat about.txt    - Read about file                        │",
        "│                                                             │",
        "│ RECONNAISSANCE                                              │",
        "│  ls               - List directory contents                │",
        "│  ls -la           - List all with details                  │",
        "│  pwd              - Print working directory                │",
        "│  tree             - Display directory tree                 │",
        "│                                                             │",
        "│ ENUMERATION                                                 │",
        "│  nmap             - Network scanning info                  │",
        "│  enum             - Enumerate system details               │",
        "│  projects         - List all projects                      │",
        "│  skills           - Show technical skills                  │",
        "│  experience, exp  - Work history                           │",
        "│  certifications   - Display certificates                   │",
        "│  awards           - Show achievements                      │",
        "│                                                             │",
        "│ EXPLOITATION                                                │",
        "│  exploit          - Run exploit framework                  │",
        "│  burp             - Burp Suite info                        │",
        "│  metasploit, msf  - Metasploit framework                   │",
        "│                                                             │",
        "│ CONTACT & SOCIAL                                            │",
        "│  contact          - Display contact info                   │",
        "│  social           - Social media links                     │",
        "│  github           - GitHub profile                         │",
        "│                                                             │",
        "│ SYSTEM                                                      │",
        "│  clear, cls       - Clear terminal                         │",
        "│  neofetch         - System information                     │",
        "│  history          - Command history                        │",
        "╚════════════════════════════════════════════════════════════╝",
        "",
      ];
      break;

    case "whoami":
      output = [
        `root@${profileData.name.toLowerCase().replace(/\s+/g, '-')}`,
        `Status: ${profileData.title}`,
        "Clearance Level: TOP SECRET",
        "Access: GRANTED",
        "",
      ];
      break;

    case "about":
    case "bio":
    case "cat about.txt":
      output = [
        "╔════════════════════ PROFILE ════════════════════╗",
        `│ Name:     ${profileData.name}`,
        `│ Title:    ${profileData.title}`,
        `│ Location: ${profileData.location}`,
        "╚═════════════════════════════════════════════════╝",
        "",
        profileData.bio,
        "",
        "Specializations:",
        "• Web Application Penetration Testing",
        "• Smart Contract Security Auditing",
        "• API Security Assessment",
        "• Vulnerability Research & Automation",
        "• Bug Bounty Hunting",
        "",
      ];
      break;

    case "ls":
      output = [
        "total 8",
        "drwxr-xr-x  2 root root 4096 Jan 12 2025  ./",
        "drwxr-xr-x  8 root root 4096 Jan 12 2025  ../",
        "-rw-r--r--  1 root root 2048 Jan 12 2025  projects/",
        "-rw-r--r--  1 root root 1024 Jan 12 2025  experience/",
        "-rw-r--r--  1 root root  512 Jan 12 2025  skills/",
        "-rw-r--r--  1 root root  256 Jan 12 2025  certifications/",
        "-rw-r--r--  1 root root  128 Jan 12 2025  awards/",
        "-rw-r--r--  1 root root   64 Jan 12 2025  contact.txt",
        "",
      ];
      break;

    case "ls -la":
    case "ls -la ./":
      output = [
        "total 24",
        "drwxr-xr-x  2 root root 4096 Jan 12 17:00 .",
        "drwxr-xr-x  8 root root 4096 Jan 12 16:59 ..",
        "-rw-r--r--  1 root root  220 Jan 12 16:59 .bash_logout",
        "-rw-r--r--  1 root root 3526 Jan 12 16:59 .bashrc",
        "-rw-r--r--  1 root root  807 Jan 12 16:59 .profile",
        "drwxr-xr-x  2 root root 4096 Jan 12 17:00 projects/",
        "drwxr-xr-x  2 root root 4096 Jan 12 17:00 experience/",
        "drwxr-xr-x  2 root root 4096 Jan 12 17:00 skills/",
        "-rw-r--r--  1 root root 2048 Jan 12 17:00 certifications.db",
        "-rw-r--r--  1 root root 1024 Jan 12 17:00 awards.log",
        "-rw-r--r--  1 root root  512 Jan 12 17:00 contact.txt",
        "",
      ];
      break;

    case "pwd":
      output = ["/home/ziad_salah/portfolio", ""];
      break;

    case "tree":
      output = [
        ".",
        "├── projects/",
        "│   ├── malware-detector-ml/",
        "│   └── hacker-helper/",
        "├── experience/",
        "│   ├── freelance-pentester/",
        "│   ├── marketing-manager/",
        "│   └── copywriter/",
        "├── skills/",
        "│   ├── cybersecurity/",
        "│   ├── programming/",
        "│   └── tools/",
        "├── certifications/",
        "│   ├── CEH.cert",
        "│   ├── eWAPTX.cert",
        "│   └── CRTP.cert",
        "└── awards/",
        "    └── EYCC-CTF-2025.trophy",
        "",
        "8 directories, 6 files",
        "",
      ];
      break;

    case "neofetch":
      output = [
        "        _,met$$$$$gg.           root@ziad-salah",
        "     ,g$$$$$$$$$$$$$$$P.        -----------------",
        "   ,g$$P\"     \"\"\"Y$$.\"         OS: Kali Linux",
        "  ,$$P'              `$$.       Host: OFFENSIVE_SECURITY",
        " ',$$P       ,ggs.     `$$b:    Kernel: 5.18.0-pentester",
        " `d$$'     ,$P\"'   .    $$$     Uptime: 1337 days",
        "  $$P      d$'     ,    $$P     Shell: zsh 5.9",
        "  $$:      $$.   -    ,d$$'     Terminal: gnome-terminal",
        "  $$;      Y$b._   _,d$P'       CPU: Intel i7 (8) @ 3.6GHz",
        "  Y$$.    `.`\"Y$$$$P\"'          Memory: 16GB",
        "  `$$b      \"-.__              Skills: GODLIKE",
        "   `Y$$                        ",
        "    `Y$$.                      ",
        "      `$$b.                    ",
        "        `Y$$b.                 ",
        "           `\"Y$b._             ",
        "               `\"\"\"\"           ",
        "",
      ];
      break;

    case "nmap":
    case "nmap -sV":
      output = [
        "Starting Nmap 7.94 ( https://nmap.org )",
        "Nmap scan report for ziad-salah.portfolio",
        "Host is up (0.00050s latency).",
        "",
        "PORT     STATE SERVICE    VERSION",
        "22/tcp   open  ssh        OpenSSH 8.9",
        "80/tcp   open  http       nginx 1.24.0",
        "443/tcp  open  ssl/https  nginx 1.24.0",
        "3000/tcp open  pentesting Custom Security Tools",
        "8080/tcp open  burpsuite  Burp Suite Professional",
        "",
        "Service detection performed. Please report any incorrect results.",
        "Nmap done: 1 IP address (1 host up) scanned in 0.42 seconds",
        "",
      ];
      break;

    case "enum":
      output = [
        "[*] Starting enumeration process...",
        "[+] Target: ziad-salah.portfolio",
        "[+] Scanning for vulnerabilities...",
        "",
        "[✓] SKILLS ENUMERATED:",
        "    ├── Pentesting: EXPERT",
        "    ├── Bug Bounty: EXPERT",
        "    ├── Smart Contracts: ADVANCED",
        "    ├── Machine Learning: ADVANCED",
        "    └── Full-Stack Dev: PROFICIENT",
        "",
        "[✓] TOOLS DETECTED:",
        "    ├── Burp Suite: ACTIVE",
        "    ├── Metasploit: LOADED",
        "    ├── Nmap: READY",
        "    └── Custom Scripts: 100+ modules",
        "",
        "[*] Enumeration complete!",
        "",
      ];
      break;

    case "projects":
    case "ls projects":
    case "ls projects/":
      output = ["╔════════════════════ PROJECTS ═══════════════════╗", ""];
      projects.forEach((project, idx) => {
        output.push(`[${idx + 1}] ${project.title}`);
        output.push(`    Date: ${project.date}`);
        output.push(`    ${project.description}`);
        output.push(`    Tags: [${project.tags.join(", ")}]`);
        output.push(`    Highlight: ${project.highlights}`);
        output.push("");
      });
      output.push("╚═════════════════════════════════════════════════╝", "");
      break;

    case "experience":
    case "exp":
    case "work":
      output = ["╔════════════════════ EXPERIENCE ═════════════════╗", ""];
      experience.forEach((exp) => {
        output.push(`► ${exp.title}`);
        output.push(`  ${exp.company} | ${exp.period}`);
        output.push(`  ${exp.description}`);
        output.push("");
        exp.achievements.forEach((achievement) => {
          output.push(`  • ${achievement}`);
        });
        output.push("");
      });
      output.push("╚═════════════════════════════════════════════════╝", "");
      break;

    case "skills":
    case "cat skills.txt":
      output = [
        "╔════════════════════ SKILL MATRIX ═══════════════╗",
        "",
        "[CYBERSECURITY]",
        ...skills.cybersecurity.map((s) => `  ██████████ ${s}`),
        "",
        "[TOOLS & FRAMEWORKS]",
        ...skills.tools.map((s) => `  ████████░░ ${s}`),
        "",
        "[PROGRAMMING]",
        ...skills.programming.map((s) => `  ██████████ ${s}`),
        "",
        "[BUSINESS]",
        ...skills.business.map((s) => `  ████████░░ ${s}`),
        "",
        "╚═════════════════════════════════════════════════╝",
        "",
      ];
      break;

    case "certifications":
    case "certs":
      output = ["╔════════════════ CERTIFICATIONS ═════════════════╗", ""];
      certifications.forEach((cert) => {
        output.push(`[✓] ${cert.name}`);
        output.push(`    Issued: ${cert.date} | ${cert.issuer}`);
        output.push("");
      });
      output.push("╚═════════════════════════════════════════════════╝", "");
      break;

    case "awards":
    case "achievements":
      output = ["╔═══════════════════ AWARDS ══════════════════════╗", ""];
      awards.forEach((award) => {
        output.push(`🏆 ${award.title}`);
        output.push(`   ${award.issuer} | ${award.date}`);
        output.push(`   ${award.description}`);
        output.push("");
      });
      output.push("╚═════════════════════════════════════════════════╝", "");
      break;

    case "contact":
    case "cat contact.txt":
      output = [
        "╔══════════════════ CONTACT INFO ═════════════════╗",
        `│ Email:    ${profileData.email}`,
        `│ Phone:    ${profileData.phone}`,
        `│ GitHub:   ${profileData.github}`,
        `│ LinkedIn: ${profileData.linkedin}`,
        `│ Location: ${profileData.location}`,
        "╚═════════════════════════════════════════════════╝",
        "",
      ];
      break;

    case "social":
      output = [
        "Social Media & Professional Networks:",
        `GitHub:   ${profileData.github}`,
        `LinkedIn: ${profileData.linkedin}`,
        "",
      ];
      break;

    case "github":
      output = [
        `Opening GitHub profile: ${profileData.github}`,
        "[*] Repositories found: PUBLIC",
        "[*] Contribution graph: ACTIVE",
        "",
      ];
      break;

    case "exploit":
    case "exploit -h":
      output = [
        "[*] Exploit Framework v2.0",
        "[*] Loading exploit modules...",
        "",
        "Available exploits:",
        "  1. web_app_scanner     - Automated web vulnerability scanner",
        "  2. smart_contract      - Solidity audit toolkit",
        "  3. api_fuzzer          - REST API security tester",
        "  4. jwt_cracker         - JWT token analyzer",
        "  5. sqli_hunter         - SQL injection detector",
        "",
        "Use: exploit <module_name> to execute",
        "",
      ];
      break;

    case "burp":
    case "burpsuite":
      output = [
        "[*] Burp Suite Professional",
        "[*] Status: ACTIVE",
        "",
        "Proxy: 127.0.0.1:8080 [LISTENING]",
        "Intruder: READY",
        "Repeater: READY",
        "Scanner: ENABLED",
        "",
        "Recent findings:",
        "  → XSS vulnerabilities detected: 12",
        "  → CSRF tokens missing: 5",
        "  → Information disclosure: 8",
        "",
      ];
      break;

    case "metasploit":
    case "msf":
    case "msfconsole":
      output = [
        "       =[ metasploit v6.3.42-dev                         ]",
        "+ -- --=[ 2387 exploits - 1230 auxiliary - 415 post       ]",
        "+ -- --=[ 1392 payloads - 46 encoders - 11 nops          ]",
        "+ -- --=[ 9 evasion                                       ]",
        "",
        "msf6 > use exploit/multi/handler",
        "[*] Using configured payload generic/shell_reverse_tcp",
        "msf6 exploit(multi/handler) > show options",
        "",
        "Module options (exploit/multi/handler):",
        "   Name  Current Setting  Required  Description",
        "   ----  ---------------  --------  -----------",
        "",
        "msf6 exploit(multi/handler) >",
        "",
      ];
      break;

    case "history":
      output = [
        "Command history:",
        "  1  nmap -sV -A target.com",
        "  2  msfconsole",
        "  3  burpsuite --proxy 8080",
        "  4  python3 malware_detector.py --scan",
        "  5  git clone https://github.com/Zierax/HackerHelper",
        "  6  sqlmap -u http://target.com --dbs",
        "  7  hydra -L users.txt -P pass.txt ssh://target",
        "  8  john --wordlist=rockyou.txt hash.txt",
        "  9  cat /etc/shadow",
        " 10  sudo su",
        "",
      ];
      break;

    case "":
      break;

    default:
      output = [
        `bash: ${cmd}: command not found`,
        "Type 'help' for available commands",
        "",
      ];
  }

  return output;
};
