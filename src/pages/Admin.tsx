import { useState } from "react";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple authentication check (in production, this should be done server-side)
    if (username === "admin" && password === "hacker123") {
      // Store auth token (in production, use proper JWT)
      localStorage.setItem("admin_auth", "true");
      navigate("/admin/dashboard");
    } else {
      setError("Invalid credentials. Access denied.");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background crt-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Lock className="text-secondary mx-auto mb-4" size={48} />
          <h1 className="text-3xl font-bold terminal-text mb-2">ADMIN ACCESS</h1>
          <p className="text-primary/60">Restricted Area - Authorization Required</p>
        </div>

        <div className="glass-panel rounded-lg p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium terminal-amber mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-muted/30 border border-primary/30 rounded px-4 py-3 text-primary outline-none focus:border-primary transition-colors font-mono"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium terminal-amber mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted/30 border border-primary/30 rounded px-4 py-3 text-primary outline-none focus:border-primary transition-colors font-mono"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="bg-destructive/20 border border-destructive rounded p-3 text-destructive text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full glass-panel px-6 py-3 rounded terminal-text hover-glow font-semibold"
            >
              AUTHENTICATE
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/portfolio")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Return to Portfolio
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-primary/40">
          <p>Demo credentials: admin / hacker123</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
