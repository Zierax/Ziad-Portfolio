import { Link } from "react-router-dom";
import { Shield, Eye, Database, Lock } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background crt-screen">
      <header className="glass-panel border-b border-primary/20">
        <div className="container mx-auto px-4 py-6">
          <Link to="/portfolio" className="terminal-text hover-glow flex items-center gap-2">
            <span>←</span> BACK TO PORTFOLIO
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="glass-panel rounded-lg p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="text-secondary" size={32} />
            <h1 className="text-3xl md:text-4xl font-bold terminal-text">Privacy Policy</h1>
          </div>

          <div className="space-y-8 text-primary/80">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="text-secondary" size={20} />
                <h2 className="text-2xl font-bold terminal-amber">Data Collection</h2>
              </div>
              <p className="leading-relaxed mb-4">
                This portfolio website respects your privacy. The site operates primarily as a static 
                showcase and collects minimal data.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Basic analytics (page views, referrers) may be collected via standard web server logs</li>
                <li>No personal information is stored without explicit consent</li>
                <li>No cookies are used for tracking purposes</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Database className="text-secondary" size={20} />
                <h2 className="text-2xl font-bold terminal-amber">Challenge Mode Data</h2>
              </div>
              <p className="leading-relaxed mb-4">
                The "Challenge The Hacker" feature collects device information only after explicit consent:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All data is processed entirely client-side (in your browser)</li>
                <li>No device information is transmitted to servers</li>
                <li>No data is stored permanently</li>
                <li>Data is used solely for puzzle generation during your session</li>
                <li>Closing the page clears all collected information</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="text-secondary" size={20} />
                <h2 className="text-2xl font-bold terminal-amber">Your Rights</h2>
              </div>
              <p className="leading-relaxed mb-4">
                You have complete control over your data:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You can decline data collection for the Challenge feature</li>
                <li>You can clear your browser cache and local storage at any time</li>
                <li>No account creation or registration is required</li>
                <li>No email marketing or newsletters without your explicit opt-in</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold terminal-amber mb-4">Contact</h2>
              <p className="leading-relaxed">
                For any privacy concerns or questions, please contact:{" "}
                <a href="mailto:zs.01117875692@gmail.com" className="terminal-text hover-glow">
                  zs.01117875692@gmail.com
                </a>
              </p>
            </section>

            <section className="border-t border-primary/20 pt-6">
              <p className="text-sm text-primary/60">
                Last updated: January 2025
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
