import React, { useState, useEffect, useMemo } from 'react';
import {
  GitMerge,
  GitPullRequest,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  Link2,
  Users,
  BookOpen,
  Search,
  RefreshCw,
  Code,
  Sparkles,
  Clock,
  Key,
  Star,
  Check,
  Info,
  FolderGit2,
  SlidersHorizontal
} from 'lucide-react';
import './App.css';

// Fallbacks for popular repositories the developer contributes to.
// This prevents unnecessary API hits on first load.
const REPO_FALLBACKS: Record<string, { language: string; color: string; stars: number; description?: string }> = {
  'kubernetes/kubespray': { 
    language: 'Python', 
    color: '#3572A5', 
    stars: 15400, 
    description: 'Deploy a Production Ready Kubernetes Cluster' 
  },
  'kubernetes/kubernetes': { 
    language: 'Go', 
    color: '#00ADD8', 
    stars: 108000, 
    description: 'Production-Grade Container Scheduling and Management' 
  },
  'kubernetes/lws': { 
    language: 'Go', 
    color: '#00ADD8', 
    stars: 250, 
    description: 'LeaderWorkerSet - API for deploying multi-node workloads' 
  },
  'prometheus-operator/prometheus-operator': { 
    language: 'Go', 
    color: '#00ADD8', 
    stars: 9200, 
    description: 'Prometheus Operator creates/configures/manages Prometheus clusters' 
  },
  'backstage/backstage': { 
    language: 'TypeScript', 
    color: '#3178c6', 
    stars: 27500, 
    description: 'Backstage is an open platform for building developer portals' 
  },
  'karpenter/karpenter': { 
    language: 'Go', 
    color: '#00ADD8', 
    stars: 5800, 
    description: 'Karpenter is a Kubernetes Node Auto-scaler built for AWS' 
  },
  'headlamp-k8s/headlamp': { 
    language: 'Go', 
    color: '#00ADD8', 
    stars: 4500, 
    description: 'An extensible Kubernetes web UI' 
  },
  'novuhq/novu': { 
    language: 'TypeScript', 
    color: '#3178c6', 
    stars: 34000, 
    description: 'Open-source notification infrastructure' 
  },
  'sig-no-z/signoz': { 
    language: 'Go', 
    color: '#00ADD8', 
    stars: 17500, 
    description: 'SigNoz is an open-source Application Performance Monitoring tool' 
  },
  'facebook/stylex': { 
    language: 'JavaScript', 
    color: '#f1e05a', 
    stars: 8500, 
    description: 'StyleX is a declarative CSS-in-JS styling system' 
  },
  'excalidraw/excalidraw': { 
    language: 'TypeScript', 
    color: '#3178c6', 
    stars: 48000, 
    description: 'Virtual whiteboard for sketching hand-drawn like diagrams' 
  },
  'expressjs/express': { 
    language: 'JavaScript', 
    color: '#f1e05a', 
    stars: 64000, 
    description: 'Fast, unopinionated, minimalist web framework for Node' 
  },
  'node-fetch/node-fetch': { 
    language: 'JavaScript', 
    color: '#f1e05a', 
    stars: 8800, 
    description: 'A light-weight module that brings window.fetch to Node.js' 
  },
  'helm/helm': { 
    language: 'Go', 
    color: '#00ADD8', 
    stars: 26000, 
    description: 'The Kubernetes Package Manager' 
  },
  'medusajs/medusa': { 
    language: 'TypeScript', 
    color: '#3178c6', 
    stars: 25000, 
    description: 'Building blocks for digital commerce' 
  },
  'octocat/hello-world': { 
    language: 'Markdown', 
    color: '#083fa1', 
    stars: 2200, 
    description: 'My first repository on GitHub' 
  },
  'Dasmat13/oss-portfolio': {
    language: 'TypeScript',
    color: '#3178c6',
    stars: 100,
    description: 'A real-time developer showcase dashboard'
  }
};

const getLanguageColor = (lang: string): string => {
  const colors: Record<string, string> = {
    'Go': '#00ADD8',
    'TypeScript': '#3178c6',
    'JavaScript': '#f1e05a',
    'Python': '#3572A5',
    'Shell': '#89e051',
    'C++': '#f34b7d',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Rust': '#dea584',
    'Java': '#b07219',
    'Markdown': '#083fa1',
    'YAML': '#cb171e',
    'C': '#555555'
  };
  return colors[lang] || '#a855f7';
};

const formatRelativeDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) return 'today';
  if (diffDays === 2) return 'yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 month ago';
  if (diffMonths < 12) return `${diffMonths} months ago`;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

interface RepoDetail {
  language: string;
  color: string;
  stars: number;
  description: string;
}

export default function App() {
  // Input settings
  const [username, setUsername] = useState(() => localStorage.getItem('oss_portfolio_username') || 'dasmat13');
  const [token, setToken] = useState(() => localStorage.getItem('oss_portfolio_token') || '');
  const [showConfig, setShowConfig] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const [tempToken, setTempToken] = useState(token);

  // Loaded data state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mergedPRs, setMergedPRs] = useState<any[]>([]);
  const [openPRs, setOpenPRs] = useState<any[]>([]);
  const [openIssues, setOpenIssues] = useState<any[]>([]);
  const [closedIssues, setClosedIssues] = useState<any[]>([]);

  // Repos detail cache
  const [repoDetails, setRepoDetails] = useState<Record<string, RepoDetail>>({});

  // Active filter states
  const [activeTab, setActiveTab] = useState<'overview' | 'merged' | 'openPrs' | 'openIssues' | 'closedIssues'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'comments'>('newest');

  // Rate limiting indicator
  const [rateLimit, setRateLimit] = useState<{ limit: number; remaining: number; reset: number } | null>(null);

  // Check rate limit state and parse headers
  const handleRateLimitHeaders = (headers: Headers) => {
    const limit = headers.get('x-ratelimit-limit');
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');
    if (limit && remaining && reset) {
      setRateLimit({
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10)
      });
    }
  };

  // Fetch full portfolio data
  const loadPortfolioData = async (user: string, tok: string) => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github+json'
      };
      if (tok.trim()) {
        headers['Authorization'] = `token ${tok.trim()}`;
      }

      // Fetch User profile info
      const userRes = await fetch(`https://api.github.com/users/${user}`, { headers });
      handleRateLimitHeaders(userRes.headers);
      if (!userRes.ok) {
        if (userRes.status === 404) throw new Error(`GitHub user "${user}" not found.`);
        if (userRes.status === 403) throw new Error('API Rate limit exceeded. Please add a GitHub Personal Access Token.');
        throw new Error(`Failed to load profile details (HTTP ${userRes.status}).`);
      }
      const profileData = await userRes.json();
      setProfile(profileData);

      // Fetch Contributions in parallel
      const qMerged = `is:pr+is:merged+author:${user}`;
      const qOpenPr = `is:pr+is:open+author:${user}`;
      const qOpenIssue = `is:issue+is:open+author:${user}`;
      const qClosedIssue = `is:issue+is:closed+author:${user}`;

      const [mergedRes, openPrRes, openIssueRes, closedIssueRes] = await Promise.all([
        fetch(`https://api.github.com/search/issues?q=${qMerged}&per_page=100`, { headers }),
        fetch(`https://api.github.com/search/issues?q=${qOpenPr}&per_page=100`, { headers }),
        fetch(`https://api.github.com/search/issues?q=${qOpenIssue}&per_page=100`, { headers }),
        fetch(`https://api.github.com/search/issues?q=${qClosedIssue}&per_page=100`, { headers })
      ]);

      handleRateLimitHeaders(mergedRes.headers);

      if (!mergedRes.ok || !openPrRes.ok || !openIssueRes.ok || !closedIssueRes.ok) {
        throw new Error('Failed to query contribution list. Rate limit might be reached.');
      }

      const [mergedJson, openPrJson, openIssueJson, closedIssueJson] = await Promise.all([
        mergedRes.json(),
        openPrRes.json(),
        openIssueRes.json(),
        closedIssueRes.json()
      ]);

      setMergedPRs(mergedJson.items || []);
      setOpenPRs(openPrJson.items || []);
      setOpenIssues(openIssueJson.items || []);
      setClosedIssues(closedIssueJson.items || []);

      // Extract unique repository names across all resources
      const allItems = [
        ...(mergedJson.items || []),
        ...(openPrJson.items || []),
        ...(openIssueJson.items || []),
        ...(closedIssueJson.items || [])
      ];

      const uniqueRepos = Array.from(
        new Set(allItems.map(item => item.html_url.split('/').slice(3, 5).join('/')))
      );

      // Resolve Repo details (fetch if missing, use cache/fallbacks where possible)
      const detailsMap: Record<string, RepoDetail> = {};
      const fetchQueue: string[] = [];

      for (const repo of uniqueRepos) {
        if (REPO_FALLBACKS[repo]) {
          detailsMap[repo] = {
            language: REPO_FALLBACKS[repo].language,
            color: REPO_FALLBACKS[repo].color,
            stars: REPO_FALLBACKS[repo].stars,
            description: REPO_FALLBACKS[repo].description || ''
          };
        } else {
          const cached = localStorage.getItem(`repo_cache_${repo}`);
          if (cached) {
            try {
              detailsMap[repo] = JSON.parse(cached);
            } catch (e) {
              fetchQueue.push(repo);
            }
          } else {
            fetchQueue.push(repo);
          }
        }
      }

      // Fetch outstanding repo details (limit parallel fetches to prevent immediately hitting rate limit)
      const limitedQueue = fetchQueue.slice(0, 12); 
      await Promise.all(
        limitedQueue.map(async (repo) => {
          try {
            const res = await fetch(`https://api.github.com/repos/${repo}`, { headers });
            if (res.ok) {
              const data = await res.json();
              const detail: RepoDetail = {
                language: data.language || 'Markdown',
                color: getLanguageColor(data.language || 'Markdown'),
                stars: data.stargazers_count || 0,
                description: data.description || ''
              };
              localStorage.setItem(`repo_cache_${repo}`, JSON.stringify(detail));
              detailsMap[repo] = detail;
            } else {
              detailsMap[repo] = { language: 'Markdown', color: '#083fa1', stars: 0, description: '' };
            }
          } catch (e) {
            detailsMap[repo] = { language: 'Markdown', color: '#083fa1', stars: 0, description: '' };
          }
        })
      );

      setRepoDetails(detailsMap);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while loading dashboard.');
    } finally {
      setLoading(false);
    }
  };

  // Run on mount or when username/token changes
  useEffect(() => {
    loadPortfolioData(username, token);
  }, [username, token]);

  // Handle setting updates
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('oss_portfolio_username', tempUsername);
    localStorage.setItem('oss_portfolio_token', tempToken);
    setUsername(tempUsername);
    setToken(tempToken);
    setShowConfig(false);
  };

  // Helper: Extract repository name from URL
  const getRepoName = (htmlUrl: string): string => {
    return htmlUrl.split('/').slice(3, 5).join('/');
  };

  // Helper: Get repo language
  const getRepoLanguage = (repoName: string): string => {
    return repoDetails[repoName]?.language || REPO_FALLBACKS[repoName]?.language || 'Markdown';
  };

  // Helper: Get repo stars
  const getRepoStars = (repoName: string): string => {
    const count = repoDetails[repoName]?.stars ?? REPO_FALLBACKS[repoName]?.stars ?? 0;
    return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString();
  };

  // Active items based on Tab selection
  const activeItemsList = useMemo(() => {
    switch (activeTab) {
      case 'merged': return mergedPRs;
      case 'openPrs': return openPRs;
      case 'openIssues': return openIssues;
      case 'closedIssues': return closedIssues;
      default: return [];
    }
  }, [activeTab, mergedPRs, openPRs, openIssues, closedIssues]);

  // Aggregate repository stats across all contributions
  const reposStats = useMemo(() => {
    const counts: Record<string, number> = {};
    const increment = (repo: string) => { counts[repo] = (counts[repo] || 0) + 1; };

    mergedPRs.forEach(item => increment(getRepoName(item.html_url)));
    openPRs.forEach(item => increment(getRepoName(item.html_url)));
    openIssues.forEach(item => increment(getRepoName(item.html_url)));
    closedIssues.forEach(item => increment(getRepoName(item.html_url)));

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        language: getRepoLanguage(name),
        color: getLanguageColor(getRepoLanguage(name)),
        stars: repoDetails[name]?.stars ?? REPO_FALLBACKS[name]?.stars ?? 0,
        description: repoDetails[name]?.description ?? REPO_FALLBACKS[name]?.description ?? ''
      }))
      .sort((a, b) => b.count - a.count);
  }, [mergedPRs, openPRs, openIssues, closedIssues, repoDetails]);

  // Aggregate languages stats based on repository contributions
  const languagesStats = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalContributions = 0;
    
    reposStats.forEach(repo => {
      counts[repo.language] = (counts[repo.language] || 0) + repo.count;
      totalContributions += repo.count;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalContributions > 0 ? Math.round((count / totalContributions) * 100) : 0,
        color: getLanguageColor(name)
      }))
      .sort((a, b) => b.count - a.count);
  }, [reposStats]);

  // Filtered and sorted items for active tab
  const processedItems = useMemo(() => {
    let result = [...activeItemsList];

    // Text search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        item =>
          item.title.toLowerCase().includes(q) ||
          item.number.toString().includes(q) ||
          getRepoName(item.html_url).toLowerCase().includes(q)
      );
    }

    // Repository filter
    if (selectedRepo) {
      result = result.filter(item => getRepoName(item.html_url) === selectedRepo);
    }

    // Language filter
    if (selectedLanguage) {
      result = result.filter(item => getRepoLanguage(getRepoName(item.html_url)) === selectedLanguage);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortOrder === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortOrder === 'comments') {
        return (b.comments || 0) - (a.comments || 0);
      }
      return 0;
    });

    return result;
  }, [activeItemsList, searchTerm, selectedRepo, selectedLanguage, sortOrder, repoDetails]);

  // Timeline list for Overview Tab (Recent 10 activities)
  const recentActivityTimeline = useMemo(() => {
    const list: any[] = [];
    
    mergedPRs.slice(0, 5).forEach(item => list.push({ ...item, type: 'merged', date: item.closed_at || item.updated_at }));
    openPRs.slice(0, 5).forEach(item => list.push({ ...item, type: 'open_pr', date: item.created_at }));
    openIssues.slice(0, 5).forEach(item => list.push({ ...item, type: 'open_issue', date: item.created_at }));
    closedIssues.slice(0, 5).forEach(item => list.push({ ...item, type: 'closed_issue', date: item.closed_at || item.updated_at }));

    return list
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [mergedPRs, openPRs, openIssues, closedIssues]);

  // Reset Filters
  const clearFilters = () => {
    setSelectedRepo(null);
    setSelectedLanguage(null);
    setSearchTerm('');
  };

  return (
    <>
      {/* Top Header */}
      <header className="app-header">
        <div className="container header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </div>
            <div>
              <span className="logo-text">GitHub Contribution Showcase</span>
              <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--text-muted)', marginTop: '-2px' }}>
                GitHub Contribution Hub
              </span>
            </div>
          </div>

          <div className="config-section">
            <button className="btn-primary" onClick={() => setShowConfig(!showConfig)}>
              <SlidersHorizontal size={14} />
              <span>Configure Account</span>
            </button>
            <button className="btn-primary" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} onClick={() => loadPortfolioData(username, token)} title="Refresh data">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ flex: 1 }}>
        {/* Settings Drawer / Top Section */}
        {showConfig && (
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--accent-cyan)',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '16px',
            boxShadow: 'var(--shadow-glow)',
            animation: 'fadeIn 0.3s ease'
          }}>
            <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={16} className="gradient-text" />
              Configure Target Developer & Token
            </h3>
            <form onSubmit={handleSaveConfig} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                  GitHub Username
                </label>
                <div className="input-group" style={{ width: '100%' }}>
                  <Users size={16} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    placeholder="e.g. dasmat13"
                    style={{ width: '100%', flex: 1 }}
                    required
                  />
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '220px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                  Personal Access Token (PAT) - Optional
                </label>
                <div className="input-group" style={{ width: '100%' }}>
                  <Key size={16} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    value={tempToken}
                    onChange={(e) => setTempToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    style={{ width: '100%', flex: 1 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>Apply Changes</span>
                </button>
                <button type="button" className="btn-primary" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} onClick={() => setShowConfig(false)}>
                  Cancel
                </button>
              </div>
            </form>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              ℹ️ Adding a token increases the GitHub API rate limit from 60 to 5,000 requests/hour. Your token is stored locally in your browser.
            </p>
          </div>
        )}

        {/* Rate limit warning banner */}
        {rateLimit && rateLimit.remaining < 20 && (
          <div className="rate-limit-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} />
              <span>
                <strong>Warning:</strong> GitHub API rate limit is almost reached ({rateLimit.remaining} remaining of {rateLimit.limit}).
              </span>
            </div>
            <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setShowConfig(true)}>
              Add Access Token
            </button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="empty-state" style={{ margin: '32px 0', border: '1px solid rgba(236, 72, 153, 0.3)', background: 'rgba(236, 72, 153, 0.04)' }}>
            <AlertCircle size={40} className="empty-state-icon" style={{ color: 'var(--accent-pink)' }} />
            <h3 className="empty-state-title">Data Fetching Failed</h3>
            <p className="empty-state-desc">{error}</p>
            <button className="btn-primary" style={{ margin: '0 auto' }} onClick={() => setShowConfig(true)}>
              <Key size={14} />
              <span>Configure Account Token</span>
            </button>
          </div>
        )}

        {/* Profile Card */}
        {!error && profile && (
          <section className="profile-section">
            <div className="profile-card">
              <img src={profile.avatar_url} alt={profile.login} className="profile-avatar" />
              <div className="profile-info">
                <div className="profile-name-row">
                  <h2 className="profile-name">{profile.name || profile.login}</h2>
                  <a href={profile.html_url} target="_blank" rel="noreferrer" className="profile-login">
                    @{profile.login}
                  </a>
                </div>
                <p className="profile-bio">{profile.bio || 'Open Source Contributor & Software Architect.'}</p>
                
                <div className="profile-meta">
                  {profile.location && (
                    <div className="profile-meta-item">
                      <MapPin size={13} />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.blog && (
                    <div className="profile-meta-item">
                      <Link2 size={13} />
                      <a href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`} target="_blank" rel="noreferrer">
                        {profile.blog}
                      </a>
                    </div>
                  )}
                  <div className="profile-meta-item">
                    <Calendar size={13} />
                    <span>Joined {new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              </div>

              <div className="profile-stats">
                <div className="p-stat">
                  <div className="p-stat-val">{profile.public_repos}</div>
                  <div className="p-stat-lbl">Repos</div>
                </div>
                <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                <div className="p-stat">
                  <div className="p-stat-val">{profile.followers}</div>
                  <div className="p-stat-lbl">Followers</div>
                </div>
                <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                <div className="p-stat">
                  <div className="p-stat-val">
                    {mergedPRs.length + openPRs.length + openIssues.length + closedIssues.length}
                  </div>
                  <div className="p-stat-lbl">Contributions</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Stats Cards Row */}
        {!error && !loading && profile && (
          <section className="stats-grid">
            <div className="stat-card" onClick={() => setActiveTab('merged')} style={{ cursor: 'pointer' }}>
              <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)' }}>
                <GitMerge size={22} />
              </div>
              <div className="stat-card-info">
                <span className="stat-value" style={{ color: 'var(--accent-emerald)' }}>{mergedPRs.length}</span>
                <span className="stat-label">Merged PRs</span>
              </div>
            </div>

            <div className="stat-card" onClick={() => setActiveTab('openPrs')} style={{ cursor: 'pointer' }}>
              <div className="stat-card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)' }}>
                <GitPullRequest size={22} />
              </div>
              <div className="stat-card-info">
                <span className="stat-value" style={{ color: 'var(--accent-blue)' }}>{openPRs.length}</span>
                <span className="stat-label">Ongoing PRs</span>
              </div>
            </div>

            <div className="stat-card" onClick={() => setActiveTab('openIssues')} style={{ cursor: 'pointer' }}>
              <div className="stat-card-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)' }}>
                <AlertCircle size={22} />
              </div>
              <div className="stat-card-info">
                <span className="stat-value" style={{ color: 'var(--accent-purple)' }}>{openIssues.length}</span>
                <span className="stat-label">Ongoing Issues</span>
              </div>
            </div>

            <div className="stat-card" onClick={() => setActiveTab('closedIssues')} style={{ cursor: 'pointer' }}>
              <div className="stat-card-icon" style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent-pink)' }}>
                <CheckCircle2 size={22} />
              </div>
              <div className="stat-card-info">
                <span className="stat-value" style={{ color: 'var(--accent-pink)' }}>{closedIssues.length}</span>
                <span className="stat-label">Solved Issues</span>
              </div>
            </div>
          </section>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="skeleton-row" style={{ margin: '32px 0' }}>
            <div className="skeleton-item"></div>
            <div className="skeleton-item" style={{ animationDelay: '0.2s' }}></div>
            <div className="skeleton-item" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}

        {/* Main interactive panel */}
        {!error && !loading && profile && (
          <>
            {/* Tabs List */}
            <div className="tabs-container">
              <div className="tabs">
                <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => { setActiveTab('overview'); clearFilters(); }}>
                  <Sparkles size={16} />
                  <span>Overview</span>
                </button>
                <button className={`tab-btn ${activeTab === 'merged' ? 'active' : ''}`} onClick={() => setActiveTab('merged')}>
                  <GitMerge size={16} />
                  <span>Merged PRs</span>
                  <span className="tab-badge">{mergedPRs.length}</span>
                </button>
                <button className={`tab-btn ${activeTab === 'openPrs' ? 'active' : ''}`} onClick={() => setActiveTab('openPrs')}>
                  <GitPullRequest size={16} />
                  <span>Ongoing PRs</span>
                  <span className="tab-badge">{openPRs.length}</span>
                </button>
                <button className={`tab-btn ${activeTab === 'openIssues' ? 'active' : ''}`} onClick={() => setActiveTab('openIssues')}>
                  <AlertCircle size={16} />
                  <span>Ongoing Issues</span>
                  <span className="tab-badge">{openIssues.length}</span>
                </button>
                <button className={`tab-btn ${activeTab === 'closedIssues' ? 'active' : ''}`} onClick={() => setActiveTab('closedIssues')}>
                  <CheckCircle2 size={16} />
                  <span>Solved Issues</span>
                  <span className="tab-badge">{closedIssues.length}</span>
                </button>
              </div>

              {activeTab !== 'overview' && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sort:</label>
                  <select className="sort-dropdown" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="comments">Comments Count</option>
                  </select>
                </div>
              )}
            </div>

            {/* Layout Grid */}
            <div className={activeTab === 'overview' ? 'overview-layout' : 'dashboard-layout'}>
              
              {/* Sidebar Filters - Only visible in contribution listings */}
              {activeTab !== 'overview' && (
                <aside className="sidebar-panel">
                  {/* Search box */}
                  <div className="sidebar-card">
                    <h3 className="sidebar-title">
                      <Search size={15} />
                      <span>Search</span>
                    </h3>
                    <div className="search-input-wrap">
                      <Search size={14} className="search-icon-inside" />
                      <input
                        type="text"
                        placeholder="Search contributions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    {(searchTerm || selectedRepo || selectedLanguage) && (
                      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }} onClick={clearFilters}>
                        Reset Filters
                      </button>
                    )}
                  </div>

                  {/* Filter Repositories */}
                  <div className="sidebar-card">
                    <h3 className="sidebar-title">
                      <FolderGit2 size={15} />
                      <span>Repositories</span>
                    </h3>
                    <div className="filter-list">
                      <div className={`filter-pill ${selectedRepo === null ? 'active' : ''}`} onClick={() => setSelectedRepo(null)}>
                        <span>All Repositories</span>
                        <span className="filter-count">{activeItemsList.length}</span>
                      </div>
                      {reposStats.map(repo => {
                        const count = activeItemsList.filter(item => getRepoName(item.html_url) === repo.name).length;
                        if (count === 0) return null;
                        return (
                          <div key={repo.name} className={`filter-pill ${selectedRepo === repo.name ? 'active' : ''}`} onClick={() => setSelectedRepo(repo.name)}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }} title={repo.name}>
                              {repo.name.split('/')[1]}
                            </span>
                            <span className="filter-count">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Filter Languages */}
                  <div className="sidebar-card">
                    <h3 className="sidebar-title">
                      <Code size={15} />
                      <span>Languages</span>
                    </h3>
                    <div className="filter-list">
                      <div className={`filter-pill ${selectedLanguage === null ? 'active' : ''}`} onClick={() => setSelectedLanguage(null)}>
                        <span>All Languages</span>
                        <span className="filter-count">{activeItemsList.length}</span>
                      </div>
                      {languagesStats.map(lang => {
                        const count = activeItemsList.filter(item => getRepoLanguage(getRepoName(item.html_url)) === lang.name).length;
                        if (count === 0) return null;
                        return (
                          <div key={lang.name} className={`filter-pill ${selectedLanguage === lang.name ? 'active' : ''}`} onClick={() => setSelectedLanguage(lang.name)}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="lang-dot" style={{ backgroundColor: lang.color }}></span>
                              {lang.name}
                            </span>
                            <span className="filter-count">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </aside>
              )}

              {/* Primary Panel Content */}
              {activeTab === 'overview' ? (
                // TAB 1: OVERVIEW PANEL
                <div className="overview-panel">
                  <div className="overview-row">
                    {/* Left: Languages & Projects */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      
                      {/* Language Footprint */}
                      <div className="overview-card">
                        <h3 className="overview-card-title">
                          <Code size={16} className="gradient-text" />
                          <span>Technology Footprint</span>
                        </h3>
                        <div className="lang-bar-container">
                          {languagesStats.length === 0 ? (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No language data available.</p>
                          ) : (
                            languagesStats.map(lang => (
                              <div className="lang-row" key={lang.name}>
                                <div className="lang-info">
                                  <span className="lang-name">
                                    <span className="lang-dot" style={{ backgroundColor: lang.color }}></span>
                                    {lang.name}
                                  </span>
                                  <span className="lang-pct">{lang.percentage}% ({lang.count})</span>
                                </div>
                                <div className="lang-progress">
                                  <div className="lang-progress-fill" style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}></div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Repos list */}
                      <div className="overview-card">
                        <h3 className="overview-card-title">
                          <FolderGit2 size={16} className="gradient-text" />
                          <span>Top Contributed Repositories</span>
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {reposStats.slice(0, 6).map(repo => (
                            <div key={repo.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                              <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <a href={`https://github.com/${repo.name}`} target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }} className="timeline-link">
                                    {repo.name}
                                  </a>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '2px' }}>
                                  {repo.description || 'No description provided.'}
                                </p>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px', fontSize: '0.75rem' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                                    <span className="lang-dot" style={{ backgroundColor: repo.color, width: '8px', height: '8px' }}></span>
                                    {repo.language}
                                  </span>
                                  {repo.stars > 0 && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-secondary)' }}>
                                      <Star size={11} style={{ fill: 'var(--accent-amber)', stroke: 'none' }} />
                                      {repo.stars >= 1000 ? `${(repo.stars/1000).toFixed(1)}k` : repo.stars} stars
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span className="repo-badge">
                                  {repo.count} {repo.count === 1 ? 'contrib' : 'contribs'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Activity Timeline */}
                    <div className="overview-card">
                      <h3 className="overview-card-title">
                        <Clock size={16} className="gradient-text" />
                        <span>Recent Open Source Feed</span>
                      </h3>
                      <div className="timeline-list">
                        {recentActivityTimeline.length === 0 ? (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No activities logged.</p>
                        ) : (
                          recentActivityTimeline.map((item, idx) => {
                            let markerClass = 'issue';
                            let actionText = '';
                            if (item.type === 'merged') {
                              markerClass = 'merged';
                              actionText = 'Merged PR';
                            } else if (item.type === 'open_pr') {
                              markerClass = 'open';
                              actionText = 'Opened PR';
                            } else if (item.type === 'closed_issue') {
                              actionText = 'Solved Issue';
                            } else if (item.type === 'open_issue') {
                              markerClass = 'open';
                              actionText = 'Opened Issue';
                            }

                            const repo = getRepoName(item.html_url);
                            return (
                              <div className="timeline-item" key={`${item.id}-${idx}`}>
                                <span className={`timeline-marker ${markerClass}`}></span>
                                <div className="timeline-content">
                                  <span className="timeline-date">{formatRelativeDate(item.date)}</span>
                                  <div style={{ marginTop: '2px' }}>
                                    <span style={{ 
                                      fontSize: '0.75rem', 
                                      fontWeight: 700, 
                                      color: item.type === 'merged' ? 'var(--accent-emerald)' : item.type.includes('pr') ? 'var(--accent-blue)' : 'var(--accent-purple)',
                                      textTransform: 'uppercase',
                                      marginRight: '6px'
                                    }}>
                                      {actionText}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                      {repo.split('/')[1]}#{item.number}
                                    </span>
                                  </div>
                                  <a href={item.html_url} target="_blank" rel="noreferrer" className="timeline-link" style={{ fontSize: '0.9rem', marginTop: '2px', display: 'inline-block' }}>
                                    {item.title}
                                  </a>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // TABS 2-5: DYNAMIC LIST PANELS (Merged, Open PRs, Open Issues, Closed Issues)
                <section className="content-panel">
                  <div className="panel-header">
                    <div className="results-count">
                      Found <strong>{processedItems.length}</strong> items {selectedRepo && `in ${selectedRepo.split('/')[1]}`} {selectedLanguage && `written in ${selectedLanguage}`}
                    </div>
                  </div>

                  {processedItems.length === 0 ? (
                    <div className="empty-state">
                      <Search size={40} className="empty-state-icon" />
                      <h3 className="empty-state-title">No matches found</h3>
                      <p className="empty-state-desc">Try clearing your search query or filters.</p>
                      <button className="btn-primary" style={{ margin: '0 auto' }} onClick={clearFilters}>
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {processedItems.map(item => {
                        const repo = getRepoName(item.html_url);
                        const lang = getRepoLanguage(repo);
                        const langColor = getLanguageColor(lang);
                        const repoStars = repoDetails[repo]?.stars ?? REPO_FALLBACKS[repo]?.stars;

                        let cardState = 'open';
                        let badgeLabel = 'Open';
                        if (activeTab === 'merged') {
                          cardState = 'merged';
                          badgeLabel = 'Merged';
                        } else if (item.draft) {
                          cardState = 'draft';
                          badgeLabel = 'Draft';
                        } else if (activeTab === 'closedIssues') {
                          cardState = 'closed';
                          badgeLabel = 'Solved';
                        }

                        return (
                          <div className={`contribution-card ${cardState}`} key={item.id}>
                            <div className="card-top">
                              <a href={item.html_url} target="_blank" rel="noreferrer" className="card-title-link">
                                {item.title}
                              </a>
                              <span className={`badge badge-${cardState}`}>
                                {cardState === 'merged' && <GitMerge size={12} />}
                                {cardState === 'open' && <GitPullRequest size={12} />}
                                {cardState === 'closed' && <CheckCircle2 size={12} />}
                                {badgeLabel}
                              </span>
                            </div>

                            <div className="card-meta-row">
                              <span className="repo-badge">
                                <BookOpen size={11} />
                                {repo}
                              </span>
                              
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="lang-dot" style={{ backgroundColor: langColor, width: '8px', height: '8px' }}></span>
                                {lang}
                              </span>

                              {repoStars !== undefined && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <Star size={11} style={{ fill: 'var(--accent-amber)', stroke: 'none' }} />
                                  {getRepoStars(repo)} stars
                                </span>
                              )}

                              <span className="date-text">
                                {activeTab === 'merged' 
                                  ? `merged ${formatRelativeDate(item.closed_at || item.updated_at)}` 
                                  : `created ${formatRelativeDate(item.created_at)}`}
                              </span>

                              {item.comments > 0 && (
                                <span style={{ color: 'var(--accent-cyan)' }}>
                                  💬 {item.comments} {item.comments === 1 ? 'comment' : 'comments'}
                                </span>
                              )}
                            </div>

                            {item.labels && item.labels.length > 0 && (
                              <div className="card-labels">
                                {item.labels.slice(0, 5).map((label: any) => (
                                  <span
                                    key={label.id}
                                    className="label-pill"
                                    style={{
                                      borderColor: `#${label.color}`,
                                      color: `#${label.color}`,
                                      backgroundColor: `#${label.color}10`
                                    }}
                                  >
                                    {label.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>
            GitHub Contribution Showcase © {new Date().getFullYear()} · Developed for{' '}
            <a href={`https://github.com/${username}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
              @{username}
            </a>
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Built using GitHub Search API · Live tracking of merged code, active pull requests, and ongoing issues.
          </p>
        </div>
      </footer>
    </>
  );
}
