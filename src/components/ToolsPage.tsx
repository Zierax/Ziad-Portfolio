import React, { useState, useEffect } from "react";
import {
  Star,
  GitFork,
  Clock,
  ArrowUpRight,
  Terminal,
  Search,
  Code2,
  Cpu,
  Shield,
  Activity,
  Share2,
  Copy,
  ExternalLink,
  GitBranch,
  Download,
  Eye,
  AlertCircle,
  CheckCircle2,
  GitCommit,
  Settings,
  RotateCcw,
} from "lucide-react";

const ToolsPage = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [sortOrder, setSortOrder] = useState("stars");
  const [activeCard, setActiveCard] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/users/Zierax/repos?sort=stars&per_page=12"
        );
        if (!response.ok) throw new Error("Failed to fetch repositories");
        const data = await response.json();
        setRepos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  // Quick Actions Tools
  const quickTools = [
    {
      id: "clone",
      name: "Clone Repo",
      icon: GitBranch,
      action: (repo) => {
        navigator.clipboard.writeText(`git clone ${repo.clone_url}`);
        setCopiedId("clone");
        setTimeout(() => setCopiedId(null), 2000);
      },
    },
    {
      id: "download",
      name: "Download ZIP",
      icon: Download,
      action: (repo) =>
        window.open(`${repo.html_url}/archive/refs/heads/main.zip`),
    },
    {
      id: "share",
      name: "Share",
      icon: Share2,
      action: (repo) => {
        navigator.clipboard.writeText(repo.html_url);
        setCopiedId("share");
        setTimeout(() => setCopiedId(null), 2000);
      },
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getAllTopics = () => {
    const topics = new Set();
    repos.forEach((repo) => {
      repo.topics?.forEach((topic) => topics.add(topic));
    });
    return Array.from(topics);
  };

  // Filter and sort repositories
  const filteredRepos = repos
    .filter((repo) => {
      const matchesSearch =
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTopic =
        !selectedTopic || repo.topics?.includes(selectedTopic);
      return matchesSearch && matchesTopic;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "stars":
          return b.stargazers_count - a.stargazers_count;
        case "recent":
          return new Date(b.updated_at) - new Date(a.updated_at);
        case "forks":
          return b.forks_count - a.forks_count;
        default:
          return 0;
      }
    });

  // Status badge component
  const StatusBadge = ({ repo }) => {
    let status = {
      icon: CheckCircle2,
      text: "Original",
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    };

    if (repo.fork) {
      status = {
        icon: GitFork,
        text: "Forked",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
      };
    } else if (repo.archived) {
      status = {
        icon: AlertCircle,
        text: "Archived",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
      };
    }

    const Icon = status.icon;

    return (
      <div
        className={`inline-flex items-center px-3 py-1 rounded-full ${status.bg} ${status.color} border ${status.border} text-xs`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status.text}
      </div>
    );
  };

  // Repository metrics component
  const RepoMetrics = ({ repo }) => (
    <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
      <div className="flex items-center space-x-2 bg-cyan-500/5 p-2 rounded-lg">
        <GitCommit className="w-4 h-4 text-cyan-400" />
        <span className="text-gray-400">{repo.default_branch}</span>
      </div>
      <div className="flex items-center space-x-2 bg-purple-500/5 p-2 rounded-lg">
        <Eye className="w-4 h-4 text-purple-400" />
        <span className="text-gray-400">{repo.watchers_count} watching</span>
      </div>
    </div>
  );

  // Quick Actions Bar component
  const QuickActionsBar = ({ repo }) => (
    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
      {quickTools.map((tool) => (
        <button
          key={tool.id}
          onClick={(e) => {
            e.preventDefault();
            tool.action(repo);
          }}
          className="p-2 bg-black/90 rounded-lg border border-cyan-500/20 hover:border-cyan-500/50 text-cyan-400 transform hover:scale-110 transition-all duration-300 group/tool"
        >
          <tool.icon className="w-4 h-4" />
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-black/90 rounded-md opacity-0 group-hover/tool:opacity-100 whitespace-nowrap">
            {copiedId === tool.id ? "Copied!" : tool.name}
          </span>
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-8 flex items-center justify-center">
        <div className="relative w-40 h-40">
          <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-transparent opacity-30 blur-lg"></div>
          </div>
          <div className="absolute inset-4 border-4 border-transparent border-l-purple-500 rounded-full animate-spin-slow">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-transparent opacity-30 blur-lg"></div>
          </div>
          <div className="absolute inset-8 border-4 border-transparent border-r-pink-500 rounded-full animate-spin">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-transparent opacity-30 blur-lg"></div>
          </div>
          <Shield className="absolute inset-12 w-16 h-16 text-cyan-500 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_50%)] animate-pulse"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.9),transparent,rgba(0,0,0,0.9))] animate-gradient"></div>
        <div className="absolute inset-0 backdrop-blur-3xl"></div>

        {/* Animated grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(0,255,255,0.05)_25%,rgba(0,255,255,0.05)_26%,transparent_27%,transparent_74%,rgba(0,255,255,0.05)_75%,rgba(0,255,255,0.05)_76%,transparent_77%)] bg-[length:60px_60px] animate-grid-slide"></div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24%,rgba(0,255,255,0.05)_25%,rgba(0,255,255,0.05)_26%,transparent_27%,transparent_74%,rgba(0,255,255,0.05)_75%,rgba(0,255,255,0.05)_76%,transparent_77%)] bg-[length:60px_60px] animate-grid-slide"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="relative inline-block group">
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-30 group-hover:opacity-75 transition-all duration-1000"></div>
            <Terminal className="w-20 h-20 text-cyan-500 mx-auto mb-4 animate-float" />
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 animate-gradient-text mb-4">
            Digital Arsenal
          </h1>
          <div className="flex items-center justify-center space-x-4 text-cyan-400/80">
            <Activity className="w-5 h-5 animate-pulse" />
            <div className="font-mono tracking-wider flex items-center space-x-2">
              <span className="inline-block w-2 h-2 bg-cyan-500 rounded-full animate-ping"></span>
              <span>SYSTEM STATUS: OPERATIONAL</span>
            </div>
            <Cpu className="w-5 h-5 animate-spin-slow" />
          </div>
        </div>

        {/* Tools Dashboard */}
        <div className="mb-8 p-4 bg-black/50 backdrop-blur-xl rounded-lg border border-cyan-500/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-cyan-500/5 rounded-lg border border-cyan-500/20 flex items-center space-x-3">
              <GitBranch className="w-6 h-6 text-cyan-400" />
              <div>
                <div className="text-sm text-gray-400">Total Repos</div>
                <div className="text-xl text-cyan-400">{repos.length}</div>
              </div>
            </div>
            <div className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/20 flex items-center space-x-3">
              <GitFork className="w-6 h-6 text-purple-400" />
              <div>
                <div className="text-sm text-gray-400">Forked</div>
                <div className="text-xl text-purple-400">
                  {repos.filter((repo) => repo.fork).length}
                </div>
              </div>
            </div>
            <div className="p-4 bg-pink-500/5 rounded-lg border border-pink-500/20 flex items-center space-x-3">
              <Star className="w-6 h-6 text-pink-400" />
              <div>
                <div className="text-sm text-gray-400">Total Stars</div>
                <div className="text-xl text-pink-400">
                  {repos.reduce((acc, repo) => acc + repo.stargazers_count, 0)}
                </div>
              </div>
            </div>
            <div className="p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/20 flex items-center space-x-3">
              <Settings className="w-6 h-6 text-yellow-400" />
              <div>
                <div className="text-sm text-gray-400">Active</div>
                <div className="text-xl text-yellow-400">
                  {repos.filter((repo) => !repo.archived).length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Your existing search and filter controls... */}

        {/* Enhanced Repository Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRepos.map((repo) => (
            <div
              key={repo.id}
              className="group relative"
              onMouseEnter={() => setActiveCard(repo.id)}
              onMouseLeave={() => setActiveCard(null)}
            >
              {/* Your existing glowing border effect... */}

              {/* Main card */}
              <div className="relative bg-black/80 border border-gray-800 rounded-lg p-6 backdrop-blur-xl transform transition duration-500 hover:scale-[1.02] hover:bg-black/90">
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <StatusBadge repo={repo} />
                </div>

                {/* Card content */}
                <div className="mb-8">
                  <div className="flex items-center mb-3">
                    <h2 className="text-xl font-semibold text-cyan-400 group-hover:text-cyan-300">
                      {repo.name}
                    </h2>
                  </div>
                  <p className="text-gray-400 h-12 overflow-hidden">
                    {repo.description || "No description available"}
                  </p>
                </div>

                {/* Repository Metrics */}
                <RepoMetrics repo={repo} />

                {/* Topics */}
                {repo.topics && repo.topics.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {repo.topics.map((topic) => (
                      <span
                        key={topic}
                        onClick={() => setSelectedTopic(topic)}
                        className="px-3 py-1 text-xs rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer transform hover:scale-105"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                {/* Language indicator */}
                {repo.language && (
                  <div className="mt-4 flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse"></span>
                    <span className="text-sm text-gray-400 group-hover:text-cyan-400 transition-colors duration-300">
                      {repo.language}
                    </span>
                  </div>
                )}

                {/* Quick Actions Bar */}
                <QuickActionsBar repo={repo} />
              </div>
            </div>
          ))}
        </div>

        {/* Empty state message */}
        {filteredRepos.length === 0 && (
          <div className="text-center mt-8">
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-30 animate-pulse"></div>
              <div className="relative text-gray-400 px-6 py-3 border border-gray-800 rounded-lg backdrop-blur-xl">
                No repositories found matching your criteria
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsPage;
