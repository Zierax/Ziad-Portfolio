import { Link } from "react-router-dom";
import { Shield, Eye, Database, Lock, FileWarning } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <Link to="/portfolio" className="terminal-text flex items-center gap-2 font-mono text-sm tracking-widest">
            <span>←</span> BACK TO PORTFOLIO
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="glass-panel rounded-lg p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="text-terminal-green" size={32} />
            <h1 className="text-3xl md:text-4xl font-bold terminal-text">Privacy Policy</h1>
          </div>

          <div className="space-y-8 text-muted-foreground">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="text-terminal-green" size={20} />
                <h2 className="text-2xl font-bold terminal-amber">What this site collects</h2>
              </div>
              <p className="leading-relaxed mb-4">
                Almost nothing — by design, not by accident:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>No cookies, no analytics, no accounts, no newsletters.</li>
                <li>No browser fingerprinting, WebRTC probing, audio/canvas IDs, font enumeration, or hidden telemetry beacons.</li>
                <li>The retired <span className="font-mono text-sm">/api/log-session</span> endpoint answers 410 Gone and stores nothing.</li>
                <li>The public <span className="font-mono text-sm">/api/github-meta</span> endpoint serves already-public snapshot data; its server logs hold method, path, and status only.</li>
                <li>The CTF challenge reads zero device data — puzzles run on fixed seeds, entirely in your browser.</li>
                <li>The Zyo assistant stores one thing, locally: a dismissal flag in your browser's localStorage if you hide it. Nothing leaves your device.</li>
                <li>Pressing play streams audio files from github.com — your browser fetches them directly, like any media embed.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Database className="text-terminal-green" size={20} />
                <h2 className="text-2xl font-bold terminal-amber">Hosting & security baseline</h2>
              </div>
              <p className="leading-relaxed mb-4">
                Standard for every website, stated plainly: the hosting provider (Vercel) necessarily
                processes basic technical data — IP addresses, requested URLs, and timestamps in access
                logs — to deliver pages and defend against abuse. That data lives with the provider under
                their policy; this portfolio itself receives, stores, and analyzes no per-visitor logs.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileWarning className="text-terminal-green" size={20} />
                <h2 className="text-2xl font-bold terminal-amber">Content disclaimers</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Security tools published here are for <strong>authorized testing only</strong> — your systems, your engagements, your permission.</li>
                <li>Benchmark and accuracy figures are README-reported by their repositories (research-phase unless independently reproduced).</li>
                <li>Paper statuses and venues mirror Zenodo/SSRN records and the author's profile README as of the snapshot date.</li>
                <li>External mentions are third-party claims, shown with confidence labels — they are citations, not endorsements of every word.</li>
                <li>Nothing here is legal, financial, or hiring advice.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="text-terminal-green" size={20} />
                <h2 className="text-2xl font-bold terminal-amber">Your Rights</h2>
              </div>
              <p className="leading-relaxed mb-4">
                You have complete control over your data:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>There is nothing to decline — no collection runs in the first place.</li>
                <li>You can clear the assistant's dismissal flag anytime via your browser's site-data settings.</li>
                <li>No account creation or registration is required, anywhere.</li>
                <li>Emailing the listed address shares only what you choose to send.</li>
                <li>External sites (GitHub, LinkedIn, publishers) follow their own privacy policies once you leave.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold terminal-amber mb-4">Contact</h2>
              <p className="leading-relaxed">
                For any privacy concerns or questions, please contact:{" "}
                <a href="mailto:zs.01117875692@gmail.com" className="terminal-text">
                  zs.01117875692@gmail.com
                </a>
              </p>
            </section>

            <section className="border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                Last updated: September 26, 2026
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
