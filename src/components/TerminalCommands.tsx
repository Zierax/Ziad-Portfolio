import {
  academicResearches,
  archiveRepos,
  awards,
  certifications,
  displayName,
  division36Systems,
  experience,
  externalMentions,
  flagshipRepos,
  githubSignal,
  profileData,
  rankedProjects,
  recentRepos,
  signalRepos,
  skills,
  snapshotExcluded,
  snapshotMethod,
  spotlightRepos,
  updatedLabel,
  writeups,
} from "@/data/profile";

const columns = (label: string, value: string | number) =>
  `${label.padEnd(18, " ")} ${String(value)}`;

const formatTags = (tags: string[]) => tags.join(" · ");

const getSocial = (platform: string) =>
  profileData.socials.find((social) => social.platform.toLowerCase().includes(platform.toLowerCase()))?.url || "N/A";

export const getTerminalOutput = (cmd: string): string[] => {
  const trimmedCmd = cmd.trim().toLowerCase();

  // Box width is 64 cols on purpose: wider art wraps on small screens
  // (overflow-wrap breaks the ─ runs) and shatters the frame.
  const banner = [
    "┌──────────────────────────────────────────────────────────────┐",
    "│ ZIAD SALAH / ZIERAX                                          │",
    "│ MCS-SSS engineer · Founder @ Division-36 · XAI researcher    │",
    "│ Mode: read-only console · Authorized testing only            │",
    "└──────────────────────────────────────────────────────────────┘",
    "",
    "run: help, github, division36, projects, research, mentions, opsec",
    "",
  ];

  switch (trimmedCmd) {
    case "":
      return [];

    case "banner":
    case "logo":
      return banner;

    case "help":
    case "?":
      return [
        "AVAILABLE COMMANDS",
        "  whoami           identity and current public signal",
        "  github           live public GitHub snapshot",
        "  division36       private-lab/public-benchmark systems",
        "  projects         selected repositories and engines",
        "  archive          long-tail repos (stubs, experiments, older utilities)",
        "  method           ranking formula, lanes, and exclusions",
        "  api              public API routes (metadata good, telemetry gone)",
        "  zyo              respawn the assistant pet (clears dismissal)",
        "  research         papers, frameworks, and review status",
        "  mentions         external references for Z-Jail and related work",
        "  writeups         public vulnerability writeups",
        "  skills           security, systems, research, and engineering stack",
        "  opsec            current portfolio privacy/security posture",
        "  experience       mission history",
        "  certs            certifications",
        "  awards           recognitions",
        "  contact          contact and scheduling links",
        "  clear            reset terminal",
        "",
      ];

    case "whoami":
    case "id":
      return [
        profileData.name,
        profileData.title,
        "",
        columns("GitHub", "github.com/Zierax"),
        columns("Organization", githubSignal.affiliation),
        columns("Location", profileData.location),
        columns("Public repos", githubSignal.publicRepos),
        columns("Followers", githubSignal.followers),
        columns("Owned repo stars", githubSignal.combinedOwnedRepoStars),
        columns("Owned repo forks", githubSignal.combinedOwnedRepoForks),
        columns("Verified", githubSignal.refreshed),
        "",
      ];

    case "about":
    case "bio":
    case "cat about.txt":
      return [
        "PROFILE",
        profileData.bio,
        "",
        "Principle: evidence before myth. Benchmarks, papers, source, and public artifacts are treated as the primary resume.",
        "",
      ];

    case "github":
      return [
        "GITHUB SNAPSHOT (generated, `npm run refresh:github`)",
        columns("Profile", githubSignal.profileUrl),
        columns("Public repos", githubSignal.publicRepos),
        columns("Followers", githubSignal.followers),
        columns("Following", githubSignal.following),
        columns("Zierax repo stars", githubSignal.ownedRepoStars),
        columns("Zierax repo forks", githubSignal.ownedRepoForks),
        columns("Division-36 stars", githubSignal.division36RepoStars),
        columns("Combined stars", githubSignal.combinedOwnedRepoStars),
        columns("Combined forks", githubSignal.combinedOwnedRepoForks),
        columns("Stars tab", `${githubSignal.profileStarredCount ?? "n/a"} (starred repos, NOT owned stars)`),
        columns("Note", githubSignal.starNote),
        columns("Affiliation", githubSignal.affiliation),
        columns("Refreshed", githubSignal.refreshed),
        "",
        `FLAGSHIP (${flagshipRepos.length}) / SPOTLIGHT (${spotlightRepos.length}) / SIGNAL (${signalRepos.length}) / RECENT (${recentRepos.length}) / ARCHIVE (${archiveRepos.length})`,
        ...flagshipRepos.flatMap((repo, index) => [
          `${String(index + 1).padStart(2, "0")}. [flagship] ${displayName(repo)} (${repo.owner})`,
          `    ${repo.summary}`,
          `    signal: ${repo.stars} stars · ${repo.forks} forks · created ${updatedLabel(repo.createdAt)} · updated ${updatedLabel(repo.updatedAt)}${repo.headSha ? ` · head @${repo.headSha}` : ""}`,
          repo.mentions.length > 0 ? `    cited by: ${repo.mentions.map((m) => m.outlet).join(", ")}` : "",
          `    ${repo.url}`,
          "",
        ]).filter(Boolean),
      ];

    case "division36":
    case "lab":
    case "org":
      return [
        "DIVISION-36 PUBLIC LAB SURFACE",
        "Private lab identity with public benchmark repositories. Private-only material is not exposed here; public proof surfaces are linked.",
        "",
        ...division36Systems.flatMap((system) => [
          `${system.name} / ${system.owner}`,
          `  ${system.metric}`,
          `  ${system.summary}`,
          `  tags: ${formatTags(system.tags)}`,
          `  ${system.url}`,
          "",
        ]),
      ];

    case "projects":
    case "ls projects":
    case "ls projects/": {
      // Primary lanes only; rankedProjects is already de-duplicated at the
      // source (recent is an overlapping feed shown in the dossier).
      const visible = rankedProjects.filter(
        (p) => p.tier === "flagship" || p.tier === "spotlight" || p.tier === "signal"
      );
      const archived = rankedProjects.filter((p) => p.tier === "archive");
      return [
        "RANKED PROJECTS (same snapshot list as the dossier — flagship, spotlight, signal)",
        ...visible.flatMap((project, index) => [
          `${String(index + 1).padStart(2, "0")}. [${project.tier} · score ${project.score}] ${project.title}${project.performance ? ` / ${project.performance}` : ""}`,
          `    created ${updatedLabel(project.createdAt)} · updated ${updatedLabel(project.updatedAt)}`,
          `    ${project.description}`,
          `    tags: ${formatTags(project.tags)}`,
          project.highlights ? `    proof: ${project.highlights}` : "",
          project.mentions.length > 0 ? `    cited by: ${project.mentions.map((m) => `${m.outlet} (${m.confidence})`).join(", ")}` : "",
          project.github ? `    repo: ${project.github}` : "",
          "",
        ]).filter(Boolean),
        `... plus ${archived.length} archived/long-tail repos (see dossier archive section)`,
        "",
      ];
    }

    case "method":
    case "ranking":
    case "how":
      return [
        "RANKING METHOD (snapshot-driven, regenerate with `npm run refresh:github`)",
        `  formula: ${snapshotMethod.formula}`,
        "",
        ...Object.entries(snapshotMethod.lanes).flatMap(([laneName, rule]) => [
          `  ${laneName.padEnd(10, " ")} ${rule}`,
        ]),
        "",
        `  excluded: ${snapshotMethod.excluded}`,
        `  tracked aside: ${snapshotExcluded.forks.count} forks, ${snapshotExcluded.hidden.length} hidden, ${snapshotExcluded.thirdParty.length} third-party`,
        snapshotExcluded.thirdParty.length > 0 ? `    third-party: ${snapshotExcluded.thirdParty.join(", ")}` : "",
        `  refreshed: ${githubSignal.refreshed}`,
        "",
      ].filter(Boolean);

    case "archive":
    case "ls archive":
      return [
        `ARCHIVE / LONG TAIL (${archiveRepos.length} repos — stubs, experiments, older utilities)`,
        ...archiveRepos.flatMap((repo) => [
          `${displayName(repo)} (${repo.owner}) — ${repo.stars} stars · updated ${updatedLabel(repo.updatedAt)}`,
          `  ${repo.url}`,
        ]),
        "",
      ];
    case "api":
    case "routes":
    case "endpoints":
      return [
        "PUBLIC API ROUTES",
        "  GET  /api/github-meta    snapshot metadata: refreshedAt, totals,",
        "                           lane counts, flagship list, exclusion counts.",
        "                           Edge-cached 1h. No state, no telemetry.",
        "  POST /api/log-session    RETIRED (410 Gone). Passive visitor",
        "                           telemetry was removed as an OPSEC defect.",
        "                           Nothing is stored, logged, or echoed —",
        "                           server logs carry method/path/status only,",
        "                           every response carries x-request-id.",
        "",
      ];
    case "zyo":
    case "assistant":
    case "pet":
      try {
        window.dispatchEvent(new Event("zyo:respawn"));
      } catch {
        // non-browser context — message still informs
      }
      return [
        "ZYO RESPAWN SIGNAL SENT",
        "  dismissal cleared · pet recentered · fact incoming",
        "  (look bottom-right; on small screens find the music button)",
        "",
      ];
    case "research":
    case "academic":
    case "ls research":
    case "ls research/":
      return [
        "RESEARCH LOG",
        ...academicResearches.flatMap((research, index) => [
          `${String(index + 1).padStart(2, "0")}. ${research.title}`,
          `    status: ${research.status ?? research.date}`,
          research.journalOrConference ? `    venue: ${research.journalOrConference}` : "",
          research.impact ? `    impact: ${research.impact}` : "",
          research.doiLink ? `    doi: ${research.doiLink}` : "",
          `    ${research.description}`,
          "",
        ]).filter(Boolean),
      ];

    case "mentions":
    case "press":
    case "external":
      return [
        "EXTERNAL REFERENCES (confidence + source type tracked per mention)",
        ...externalMentions.flatMap((mention, index) => [
          `${String(index + 1).padStart(2, "0")}. ${mention.outlet} — ${mention.title}`,
          `    evidence for ${mention.repo} · ${mention.confidence} confidence · ${mention.sourceType} · ${mention.linkCheck}`,
          `    ${mention.detail}`,
          `    ${mention.url}`,
          "",
        ]),
      ];

    case "writeups":
    case "ls writeups":
    case "ls writeups/":
      return [
        "PUBLIC WRITEUPS",
        ...writeups.flatMap((writeup, index) => [
          `${String(index + 1).padStart(2, "0")}. ${writeup.title} / ${writeup.date}`,
          `    ${writeup.description}`,
          `    tags: ${formatTags(writeup.tags)}`,
          `    ${writeup.link}`,
          "",
        ]),
      ];

    case "skills":
    case "cat skills.txt":
      return [
        "SKILL MATRIX",
        "",
        "[logic]",
        ...skills.logic.map((skill) => `  - ${skill}`),
        "",
        "[cybersecurity]",
        ...skills.cybersecurity.map((skill) => `  - ${skill}`),
        "",
        "[engineering]",
        ...skills.engineering.map((skill) => `  - ${skill}`),
        "",
        "[research]",
        ...skills.research.map((skill) => `  - ${skill}`),
        "",
        "[business]",
        ...skills.business.map((skill) => `  - ${skill}`),
        "",
      ];

    case "opsec":
    case "privacy":
    case "threat-model":
      return [
        "PORTFOLIO OPSEC POSTURE",
        "  passive recon hook: disabled",
        "  visitor dump API: returns 410 Gone",
        "  host access logs: provider-side only, see /privacy",
        "  browser fingerprinting: removed from app shell",
        "  WebRTC/audio/canvas/font probes: removed from app shell",
        "  terminal mode: read-only local state",
        "  outbound links: explicit anchors only",
        "",
        "Remaining rule: keep the site as proof-of-work, not a visitor trap.",
        "",
      ];

    case "experience":
    case "exp":
    case "work":
      return [
        "MISSION HISTORY",
        ...experience.flatMap((item) => [
          `${item.title} / ${item.company} / ${item.period}`,
          `  ${item.description}`,
          ...item.achievements.map((achievement) => `  - ${achievement}`),
          "",
        ]),
      ];

    case "certifications":
    case "certs":
      return [
        "CERTIFICATIONS",
        ...certifications.flatMap((cert) => [
          `${cert.name} / ${cert.issuer} / ${cert.date}`,
          cert.note ? `  ${cert.note}` : "",
        ]).filter(Boolean),
        "",
      ];

    case "awards":
    case "achievements":
      return [
        "AWARDS",
        ...awards.flatMap((award) => [
          `${award.title} / ${award.issuer} / ${award.date}`,
          `  ${award.description}`,
          "",
        ]),
      ];

    case "contact":
    case "cat contact.txt":
      return [
        "CONTACT",
        columns("Email", profileData.email),
        columns("GitHub", getSocial("GitHub")),
        columns("Scholar", getSocial("Google Scholar")),
        columns("ORCID", getSocial("ORCID")),
        columns("LinkedIn", getSocial("LinkedIn")),
        columns("HackerOne", getSocial("HackerOne")),
        columns("X", getSocial("Twitter")),
        columns("Cal", "https://cal.com/zierax"),
        "",
      ];

    case "social":
      return [
        "SOCIALS",
        ...profileData.socials.map((social) => `${social.platform.padEnd(14, " ")} ${social.url}`),
        "",
      ];

    case "ls":
    case "tree":
      return [
        "portfolio/",
        "  identity/whoami",
        "  github/live-public-signal",
        "  division36/private-lab-public-benchmarks",
        "  projects/security-research-engines",
        "  research/papers-frameworks",
        "  mentions/external-references",
        "  opsec/privacy-posture",
        "",
      ];

    case "pwd":
      return ["/portfolio/read-only-dossier", ""];

    case "neofetch":
      return [
        "zierax@portfolio",
        "----------------",
        "OS: Public proof surface",
        "Shell: evidence-console",
        `Repos: ${githubSignal.publicRepos} public`,
        `Repo stars: ${githubSignal.combinedOwnedRepoStars} owned public`,
        "Org: Division-36",
        "Focus: deterministic security systems",
        "Privacy: passive recon disabled",
        "",
      ];

    case "history":
      return [
        "No persistent command history is stored. Arrow-key history exists only in this browser session.",
        "",
      ];

    default:
      return [
        `command not found: ${cmd}`,
        "try: help, github, division36, projects, research, mentions, opsec",
        "",
      ];
  }
};
