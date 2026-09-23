/**
 * Curated override layer — typed view over github-overrides.json.
 *
 * The JSON file is the single source of truth (the refresh script reads it
 * with plain Node, no TS compilation needed). This module gives the frontend
 * typed access to the same data. Edit the JSON, not the snapshot.
 *
 * Ownership note: the pipeline only ranks repos owned by Zierax or
 * Division-36. Third-party repos (e.g. 4osp3l/0xJS, whose 67 stars do NOT
 * belong to this portfolio) stay in HIDE unless a human explicitly pins
 * them in PIN_ORDER and takes responsibility for the claim.
 */
import raw from "./github-overrides.json";

export type MentionConfidence = "high" | "medium" | "low";
export type MentionSourceType = "editorial" | "aggregator" | "reference" | "trending" | "mirror";

export interface CopyOverride {
  /** Display name when the repo name is unwieldy (e.g. AxiomWAF-Brain_PublicBenchmarks -> Axiom-WAF). */
  label?: string;
  summary?: string;
  highlights?: string;
  tags?: string[];
  /**
   * One-line editorial voice for flagship cards. Curation, not measurement:
   * may interpret, never invent — every claim in a story must already hold
   * in API data, README text, or mapped mentions.
   */
  story?: string;
}

export interface MentionOverride {
  outlet: string;
  title: string;
  detail: string;
  url: string;
  repo: string;
  confidence: MentionConfidence;
  sourceType: MentionSourceType;
  linkCheck: string;
}

interface OverridesFile {
  PIN_ORDER: string[];
  SPOTLIGHT: string[];
  HIDE: string[];
  COPY: Record<string, CopyOverride>;
  DOMAIN_BOOST: Record<string, number>;
  MENTIONS: MentionOverride[];
}

const data = raw as OverridesFile;

export const PIN_ORDER: string[] = data.PIN_ORDER;
/** Research-spotlight lane: important regardless of stars, ordered by score. */
export const SPOTLIGHT: string[] = data.SPOTLIGHT;
export const HIDE: string[] = data.HIDE;
export const COPY: Record<string, CopyOverride> = data.COPY;
export const DOMAIN_BOOST: Record<string, number> = data.DOMAIN_BOOST;
export const MENTIONS: MentionOverride[] = data.MENTIONS;
