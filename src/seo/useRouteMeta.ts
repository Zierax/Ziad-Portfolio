import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Per-route document metadata for the SPA.
 *
 * Sets title, meta description, canonical, and OG URL/tags on client-side
 * navigation. Note the honest limitation: social crawlers that do not
 * execute JavaScript only ever see index.html's static head — which is why
 * the static head carries the full homepage payload and this hook mirrors
 * it per route for crawlers that do render JS.
 */
const SITE = "https://ziad-portfolio-six.vercel.app";

interface RouteMeta {
  title: string;
  description: string;
}

const DEFAULT_META: RouteMeta = {
  title: "Ziad Salah (Zierax) — Mission-Critical Systems Engineer",
  description:
    "Mission-Critical Systems engineer (MCS-SSS) and Division-36 founder: safety, security and sustainability systems, vulnerability research, public benchmarks.",
};

const ROUTE_META: Record<string, RouteMeta> = {
  "/": DEFAULT_META,
  "/portfolio": {
    title: "Public Research Dossier — Ziad Salah (Zierax)",
    description:
      "Flagship mission-critical systems, ranked GitHub evidence, research spotlight, and independent coverage — Grafana-Final-Scanner, Z-Jail, Planck-99, Axiom-Zspace.",
  },
  "/academic": {
    title: "Academic Research — Ziad Salah (Zierax)",
    description:
      "Peer-facing research record: metacognitive AI audit, neural music perception, deterministic reasoning engines, and review status.",
  },
  "/challenge": {
    title: "Capture The Flag — Ziad Salah (Zierax)",
    description: "Interactive CTF challenge on the portfolio — authorized testing only, scoped to this page.",
  },
  "/privacy": {
    title: "Privacy Policy — Ziad Salah (Zierax)",
    description:
      "This portfolio collects no visitor telemetry: no fingerprinting, no WebRTC probing, no stealth logging.",
  },
  "/boot": {
    title: "Ziad Salah (Zierax) — Security Researcher",
    description: DEFAULT_META.description,
  },
};

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = ROUTE_META[pathname] ?? DEFAULT_META;
    const url = pathname === "/" ? `${SITE}/` : `${SITE}${pathname}`;
    document.title = meta.title;
    setMeta("name", "description", meta.description);
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:url", url);
    setCanonical(url);
  }, [pathname]);

  return null;
}
