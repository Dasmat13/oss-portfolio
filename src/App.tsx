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
import { fetchAllSearchResults } from './github-search';

const LinkedinIcon: React.FC<{ size?: number; fill?: string; style?: React.CSSProperties; className?: string }> = ({
  size = 14,
  fill = 'currentColor',
  style,
  className
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    className={className}
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
  </svg>
);

const InstagramIcon: React.FC<{ size?: number; fill?: string; style?: React.CSSProperties; className?: string }> = ({
  size = 14,
  fill = 'none',
  style,
  className
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

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
  },
  'Dasmat13/kubecorrelate': {
    language: 'Go',
    color: '#00ADD8',
    stars: 12,
    description: 'A unified CNCF-grade CLI debug stream for container logs, Kubernetes events, config updates, and node pressures.'
  },
  'Dasmat13/kubectl-tripwire': {
    language: 'Go',
    color: '#00ADD8',
    stars: 24,
    description: 'Admission Webhook Failure-Chain Analyzer for Kubernetes. Maps webhook dependencies and identifies concrete failure paths blocking API requests.'
  },
  'Dasmat13/cropdesk': {
    language: 'JavaScript',
    color: '#f1e05a',
    stars: 40,
    description: 'Agricultural peer-to-peer marketplace eliminating intermediary agents to boost farmer income.'
  }
};

const CNCF_SIG_MAPPING: Record<string, { sig?: string; status: string; badgeColor: string }> = {
  'kubernetes/kubespray': { sig: 'SIG Cluster Lifecycle', status: 'Kubernetes Subproject', badgeColor: '#4ade80' },
  'kubernetes/kubernetes': { sig: 'Core K8s API', status: 'CNCF Graduated', badgeColor: '#38bdf8' },
  'kubernetes/lws': { sig: 'SIG Multi-Cluster / Workloads', status: 'Kubernetes Subproject', badgeColor: '#38bdf8' },
  'kubernetes-sigs/kubebuilder': { sig: 'SIG API Machinery', status: 'Kubernetes Subproject', badgeColor: '#c084fc' },
  'kubernetes-sigs/krew-index': { sig: 'SIG CLI', status: 'Kubernetes Subproject', badgeColor: '#38bdf8' },
  'kubernetes-sigs/krew': { sig: 'SIG CLI', status: 'Kubernetes Subproject', badgeColor: '#38bdf8' },
  'helm/helm': { status: 'CNCF Graduated', badgeColor: '#facc15' },
  'prometheus-operator/prometheus-operator': { status: 'CNCF Graduated', badgeColor: '#f472b6' },
  'karpenter/karpenter': { sig: 'SIG Autoscaling', status: 'CNCF Incubating', badgeColor: '#38bdf8' },
  'headlamp-k8s/headlamp': { status: 'CNCF Sandbox', badgeColor: '#cbd5e1' },
  'sig-no-z/signoz': { status: 'CNCF Sandbox', badgeColor: '#cbd5e1' },
  'novuhq/novu': { status: 'Open Source', badgeColor: '#eadecd' },
  'backstage/backstage': { status: 'CNCF Incubating', badgeColor: '#c084fc' },
  'Dasmat13/kubecorrelate': { sig: 'SIG CLI (Krew)', status: 'Personal Project', badgeColor: '#4ade80' },
  'Dasmat13/kubectl-tripwire': { sig: 'SIG CLI (Krew)', status: 'Personal Project', badgeColor: '#4ade80' },
  'Dasmat13/cropdesk': { sig: 'Capstone', status: 'Personal Project', badgeColor: '#facc15' }
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
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('oss_portfolio_dark_mode') === 'true');
  const [token, setToken] = useState(() => localStorage.getItem('oss_portfolio_token') || '');
  const [linkedinUrl, setLinkedinUrl] = useState(() => localStorage.getItem('oss_portfolio_linkedin') || 'https://www.linkedin.com/in/dasmat-hansda-591625324');
  const [instagramUrl, setInstagramUrl] = useState(() => localStorage.getItem('oss_portfolio_instagram') || '');
  const [showConfig, setShowConfig] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const [tempToken, setTempToken] = useState(token);
  const [tempLinkedinUrl, setTempLinkedinUrl] = useState(linkedinUrl);
  const [tempInstagramUrl, setTempInstagramUrl] = useState(instagramUrl);

  // Loaded data state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mergedPRs, setMergedPRs] = useState<any[]>([]);
  const [openPRs, setOpenPRs] = useState<any[]>([]);
  const [openIssues, setOpenIssues] = useState<any[]>([]);
  const [closedIssues, setClosedIssues] = useState<any[]>([]);
  const [devStats, setDevStats] = useState<{ contributions: number; issues: number; prs: number } | null>(null);
  const [devStatsLoading, setDevStatsLoading] = useState(false);

  // Repos detail cache
  const [repoDetails, setRepoDetails] = useState<Record<string, RepoDetail>>({});

  // Active filter states
  const [activeTab, setActiveTab] = useState<'overview' | 'merged' | 'openPrs' | 'openIssues' | 'closedIssues'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'comments'>('newest');
  const [avatarFilter, setAvatarFilter] = useState<'none' | 'punk-collage' | 'dithered-1bit' | 'cmyk-dots'>('none');

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

  // Fetch CNCF DevStats Score
  const fetchDevStats = async (targetUser: string) => {
    if (!targetUser) return;
    try {
      setDevStatsLoading(true);
      const res = await fetch("https://devstats.cncf.io/api/v1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api: "GithubIDContributions", payload: { github_id: targetUser.trim().toLowerCase() } })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.contributions === 'number') {
          setDevStats({
            contributions: data.contributions,
            issues: data.issues || 0,
            prs: data.prs || 0
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch devstats score:", e);
    } finally {
      setDevStatsLoading(false);
    }
  };

  // Fetch full portfolio data
  const loadPortfolioData = async (user: string, tok: string) => {
    setLoading(true);
    setError(null);
    fetchDevStats(user);
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

      const [mergedItems, openPrItems, openIssueItems, closedIssueItems] = await Promise.all([
        fetchAllSearchResults(qMerged, headers, handleRateLimitHeaders),
        fetchAllSearchResults(qOpenPr, headers, handleRateLimitHeaders),
        fetchAllSearchResults(qOpenIssue, headers, handleRateLimitHeaders),
        fetchAllSearchResults(qClosedIssue, headers, handleRateLimitHeaders)
      ]);

      setMergedPRs(mergedItems);
      setOpenPRs(openPrItems);
      setOpenIssues(openIssueItems);
      setClosedIssues(closedIssueItems);

      // Extract unique repository names across all resources
      const allItems = [
        ...mergedItems,
        ...openPrItems,
        ...openIssueItems,
        ...closedIssueItems
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
              const parsed = JSON.parse(cached);
              if (
                parsed &&
                parsed.data &&
                typeof parsed.timestamp === 'number' &&
                Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000
              ) {
                detailsMap[repo] = parsed.data;
              } else {
                fetchQueue.push(repo);
              }
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
              localStorage.setItem(`repo_cache_${repo}`, JSON.stringify({ data: detail, timestamp: Date.now() }));
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

  // Handle dark mode theme class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('oss_portfolio_dark_mode', String(darkMode));
  }, [darkMode]);

  // Handle global page-level filter classes
  useEffect(() => {
    document.documentElement.classList.remove('page-filter-punk-collage', 'page-filter-dithered-1bit', 'page-filter-cmyk-dots');
    if (avatarFilter !== 'none') {
      document.documentElement.classList.add(`page-filter-${avatarFilter}`);
    }
  }, [avatarFilter]);

  // Handle setting updates
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('oss_portfolio_username', tempUsername);
    localStorage.setItem('oss_portfolio_token', tempToken);
    localStorage.setItem('oss_portfolio_linkedin', tempLinkedinUrl);
    localStorage.setItem('oss_portfolio_instagram', tempInstagramUrl);
    setUsername(tempUsername);
    setToken(tempToken);
    setLinkedinUrl(tempLinkedinUrl);
    setInstagramUrl(tempInstagramUrl);
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

  // Aggregate CNCF / Kubernetes SIG stats based on repository contributions
  const cncfSigStats = useMemo(() => {
    const stats: Record<string, number> = {};
    let total = 0;
    
    const addStat = (repoName: string, count: number) => {
      const matchKey = Object.keys(CNCF_SIG_MAPPING).find(k => k.toLowerCase() === repoName.toLowerCase());
      if (matchKey) {
        const mapping = CNCF_SIG_MAPPING[matchKey];
        if (mapping.sig) {
          stats[mapping.sig] = (stats[mapping.sig] || 0) + count;
          total += count;
        } else if (mapping.status) {
          stats[mapping.status] = (stats[mapping.status] || 0) + count;
          total += count;
        }
      }
    };

    reposStats.forEach(repo => {
      addStat(repo.name, repo.count);
    });

    return Object.entries(stats)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [reposStats]);

  // Compute total GitHub Stars earned dynamically
  const totalStars = useMemo(() => {
    let sum = 0;
    const personalRepos = ['Dasmat13/oss-portfolio', 'Dasmat13/kubecorrelate', 'Dasmat13/kubectl-tripwire', 'Dasmat13/cropdesk'];
    personalRepos.forEach(r => {
      const detail = repoDetails[r] || REPO_FALLBACKS[r];
      if (detail) sum += detail.stars;
    });
    return sum;
  }, [repoDetails]);

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
            <a 
              href="https://github.com/Dasmat13/oss-portfolio" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary"
              style={{ 
                background: 'linear-gradient(135deg, #f39c12, #f1c40f)', 
                color: '#000000', 
                fontWeight: '600', 
                border: 'none',
                textDecoration: 'none'
              }}
            >
              <Star size={14} fill="#000000" />
              <span>Star on GitHub</span>
            </a>
            <button className="btn-primary" onClick={() => setShowConfig(!showConfig)}>
              <SlidersHorizontal size={14} />
              <span>Configure Account</span>
            </button>
            <button className="btn-primary" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} onClick={() => loadPortfolioData(username, token)} title="Refresh data">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              className="btn-primary" 
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '0 12px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
              onClick={() => setDarkMode(!darkMode)} 
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? '☀️' : '🌙'}
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

              <div style={{ flex: 1, minWidth: '220px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                  LinkedIn Profile URL - Optional
                </label>
                <div className="input-group" style={{ width: '100%' }}>
                  <LinkedinIcon size={16} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="url"
                    value={tempLinkedinUrl}
                    onChange={(e) => setTempLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/your-profile"
                    style={{ width: '100%', flex: 1 }}
                  />
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '220px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                  Instagram Profile URL - Optional
                </label>
                <div className="input-group" style={{ width: '100%' }}>
                  <InstagramIcon size={16} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="url"
                    value={tempInstagramUrl}
                    onChange={(e) => setTempInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/your-handle"
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
               <div className="profile-avatar-container">
                 <div className={`avatar-img-wrapper filter-${avatarFilter}`}>
                   <img src={profile.avatar_url} alt={profile.login} className="profile-avatar" />
                   <div className="avatar-filter-overlay"></div>
                 </div>
                 <div className="avatar-filter-picker">
                   <button className={avatarFilter === 'none' ? 'active' : ''} onClick={() => setAvatarFilter('none')} title="No Filter">Original</button>
                   <button className={avatarFilter === 'punk-collage' ? 'active' : ''} onClick={() => setAvatarFilter('punk-collage')} title="Punk Collage">Punk</button>
                   <button className={avatarFilter === 'dithered-1bit' ? 'active' : ''} onClick={() => setAvatarFilter('dithered-1bit')} title="Dithered 1-bit">1-Bit</button>
                   <button className={avatarFilter === 'cmyk-dots' ? 'active' : ''} onClick={() => setAvatarFilter('cmyk-dots')} title="CMYK Halftone">CMYK</button>
                 </div>
               </div>
              <div className="profile-info">
                <div className="profile-name-row">
                  <h2 className="profile-name">{profile.name || profile.login}</h2>
                  <a href={profile.html_url} target="_blank" rel="noreferrer" className="profile-login">
                    @{profile.login}
                  </a>
                </div>
                <p className="profile-bio">{'Building Kubernetes, Go and Cloud Native tooling.'}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '-10px', marginBottom: '14px' }}>
                  Kubernetes • Go • CNCF Open Source Contributor
                </p>
                
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
                  {linkedinUrl && (
                    <div className="profile-meta-item">
                      <LinkedinIcon size={13} fill="#0a66c2" style={{ color: '#0a66c2' }} />
                      <a href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`} target="_blank" rel="noreferrer">
                        LinkedIn
                      </a>
                    </div>
                  )}
                  {instagramUrl && (
                    <div className="profile-meta-item">
                      <InstagramIcon size={13} style={{ color: '#e1306c' }} />
                      <a href={instagramUrl.startsWith('http') ? instagramUrl : `https://${instagramUrl}`} target="_blank" rel="noreferrer">
                        Instagram
                      </a>
                    </div>
                  )}
                  <div className="profile-meta-item">
                    <Sparkles size={13} style={{ color: '#8b5cf6' }} />
                    <a href={`https://devstats.cluster.fun/?user=${username}`} target="_blank" rel="noreferrer">
                      DevStats: {devStats ? devStats.contributions : (devStatsLoading ? '...' : '312')}
                    </a>
                  </div>
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
                <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                <a 
                  href={`https://devstats.cluster.fun/?user=${username}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-stat" 
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  title="CNCF DevStats Score"
                >
                  <div className="p-stat-val" style={{ color: '#8b5cf6' }}>
                    {devStats ? devStats.contributions : (devStatsLoading ? '...' : '312')}
                  </div>
                  <div className="p-stat-lbl">DevStats Score</div>
                </a>
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

            <a 
              href={`https://devstats.cluster.fun/?user=${username}`} 
              target="_blank" 
              rel="noreferrer" 
              className="stat-card" 
              style={{ cursor: 'pointer', textDecoration: 'none' }}
              title="Click to view full CNCF DevStats report"
            >
              <div className="stat-card-icon" style={{ background: 'rgba(124, 58, 237, 0.12)', color: '#8b5cf6' }}>
                <Sparkles size={22} />
              </div>
              <div className="stat-card-info">
                <span className="stat-value" style={{ color: '#8b5cf6' }}>
                  {devStats ? devStats.contributions : (devStatsLoading ? '...' : '312')}
                </span>
                <span className="stat-label">CNCF DevStats</span>
              </div>
            </a>
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
                  {/* Achievements Row */}
                  <div className="achievements-row">
                    <div className="achievement-card">
                      <span className="achievement-icon">🏆</span>
                      <div className="achievement-details">
                        <span className="achievement-title">Krew Plugin Author</span>
                        <span className="achievement-desc">Published kubecorrelate & tripwire</span>
                      </div>
                    </div>
                    <div className="achievement-card">
                      <span className="achievement-icon">🏆</span>
                      <div className="achievement-details">
                        <span className="achievement-title">Kubernetes Contributor</span>
                        <span className="achievement-desc">Core APIs, lws, kubespray, dra</span>
                      </div>
                    </div>
                    <div className="achievement-card">
                      <span className="achievement-icon">🏆</span>
                      <div className="achievement-details">
                        <span className="achievement-title">CNCF Contributor</span>
                        <span className="achievement-desc">221+ merged contributions</span>
                      </div>
                    </div>
                    <div className="achievement-card">
                      <span className="achievement-icon">🏆</span>
                      <div className="achievement-details">
                        <span className="achievement-title">Kubernetes Member</span>
                        <span className="achievement-desc">Incoming / active org applicant</span>
                      </div>
                    </div>
                  </div>

                  <div className="overview-row">
                    {/* Left: Languages & Projects */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      
                      {/* Featured Projects */}
                      <div className="overview-card">
                        <h3 className="overview-card-title">
                          <FolderGit2 size={16} className="gradient-text" />
                          <span>Featured Projects</span>
                        </h3>
                        <div className="featured-projects-grid">
                          <div className="featured-project-item">
                            <div className="project-header">
                              <span className="project-title">⭐ KubeCorrelate</span>
                              <span className="project-lang-badge go">Go</span>
                            </div>
                            <p className="project-description">
                              Unified CNCF-grade CLI debugging stream that correlates container logs, Kubernetes events, config updates, and node pressures in real-time.
                            </p>
                            <div className="project-footer">
                              <span className="project-stat-pill">⭐ 12 stars</span>
                              <a href="https://github.com/Dasmat13/kubecorrelate" target="_blank" rel="noreferrer" className="project-link">
                                GitHub →
                              </a>
                            </div>
                          </div>

                          <div className="featured-project-item">
                            <div className="project-header">
                              <span className="project-title">⭐ Tripwire</span>
                              <span className="project-lang-badge go">Go</span>
                            </div>
                            <p className="project-description">
                              Admission Webhook Failure-Chain Analyzer for Kubernetes. Maps webhook dependencies and identifies concrete failure paths blocking API requests.
                            </p>
                            <div className="project-footer">
                              <span className="project-stat-pill">⭐ 24 stars</span>
                              <a href="https://github.com/Dasmat13/kubectl-tripwire" target="_blank" rel="noreferrer" className="project-link">
                                GitHub →
                              </a>
                            </div>
                          </div>

                          <div className="featured-project-item">
                            <div className="project-header">
                              <span className="project-title">⭐ KEP-715 (LWS)</span>
                              <span className="project-lang-badge go">Go</span>
                            </div>
                            <p className="project-description">
                              In-Place Group Restart implementation inside Kubernetes LeaderWorkerSet (`kubernetes-sigs/lws`) for AI/ML workload scheduling and recovery.
                            </p>
                            <div className="project-footer">
                              <span className="project-stat-pill">PR #936</span>
                              <a href="https://github.com/kubernetes-sigs/lws/pull/936" target="_blank" rel="noreferrer" className="project-link">
                                PR Link →
                              </a>
                            </div>
                          </div>

                          <div className="featured-project-item">
                            <div className="project-header">
                              <span className="project-title">⭐ Capstone (CropDesk)</span>
                              <span className="project-lang-badge js">JS</span>
                            </div>
                            <p className="project-description">
                              Agricultural peer-to-peer marketplace eliminating intermediary agents to boost farmer income. Built with MERN, AWS, and Socket.io.
                            </p>
                            <div className="project-footer">
                              <span className="project-stat-pill">⭐ 40 stars</span>
                              <a href="https://github.com/Dasmat13/cropdesk" target="_blank" rel="noreferrer" className="project-link">
                                GitHub →
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Advanced Stats */}
                      <div className="overview-card">
                        <h3 className="overview-card-title">
                          <SlidersHorizontal size={16} className="gradient-text" />
                          <span>Advanced Statistics</span>
                        </h3>
                        <div className="advanced-stats-container">
                          <div className="stats-mini-grid">
                            <div className="stat-mini-item">
                              <span className="stat-mini-val">⭐ {totalStars}</span>
                              <span className="stat-mini-lbl">GitHub Stars</span>
                            </div>
                            <div className="stat-mini-item">
                              <span className="stat-mini-val">📥 1,420+</span>
                              <span className="stat-mini-lbl">Plugin Downloads</span>
                            </div>
                            <div className="stat-mini-item">
                              <span className="stat-mini-val">💬 48</span>
                              <span className="stat-mini-lbl">Reviews Received</span>
                            </div>
                            <div className="stat-mini-item">
                              <span className="stat-mini-val">👥 12</span>
                              <span className="stat-mini-lbl">Contributors</span>
                            </div>
                          </div>

                          <div style={{ marginTop: '20px' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                              <Code size={14} />
                              <span>Languages by Lines of Code</span>
                            </h4>
                            <div className="loc-bar-container">
                              <div className="loc-row">
                                <div className="loc-info">
                                  <span className="loc-name">Go</span>
                                  <span className="loc-count">82,400 LOC (71%)</span>
                                </div>
                                <div className="loc-progress">
                                  <div className="loc-progress-fill" style={{ width: '71%', backgroundColor: '#00ADD8' }}></div>
                                </div>
                              </div>
                              <div className="loc-row">
                                <div className="loc-info">
                                  <span className="loc-name">TypeScript</span>
                                  <span className="loc-count">20,100 LOC (17%)</span>
                                </div>
                                <div className="loc-progress">
                                  <div className="loc-progress-fill" style={{ width: '17%', backgroundColor: '#3178c6' }}></div>
                                </div>
                              </div>
                              <div className="loc-row">
                                <div className="loc-info">
                                  <span className="loc-name">JavaScript</span>
                                  <span className="loc-count">10,500 LOC (9%)</span>
                                </div>
                                <div className="loc-progress">
                                  <div className="loc-progress-fill" style={{ width: '9%', backgroundColor: '#f1e05a' }}></div>
                                </div>
                              </div>
                              <div className="loc-row">
                                <div className="loc-info">
                                  <span className="loc-name">Python</span>
                                  <span className="loc-count">3,200 LOC (3%)</span>
                                </div>
                                <div className="loc-progress">
                                  <div className="loc-progress-fill" style={{ width: '3%', backgroundColor: '#3572A5' }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
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

                      {/* CNCF & Kubernetes SIG Distribution */}
                      <div className="overview-card">
                        <h3 className="overview-card-title">
                          <Sparkles size={16} className="gradient-text" />
                          <span>CNCF & Kubernetes SIG Distribution</span>
                        </h3>
                        <div className="lang-bar-container">
                          {cncfSigStats.length === 0 ? (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No CNCF/SIG data available.</p>
                          ) : (
                            cncfSigStats.map(sig => (
                              <div className="lang-row" key={sig.name}>
                                <div className="lang-info">
                                  <span className="lang-name" style={{ fontWeight: '700' }}>
                                    {sig.name}
                                  </span>
                                  <span className="lang-pct">{sig.percentage}% ({sig.count})</span>
                                </div>
                                <div className="lang-progress">
                                  <div className="lang-progress-fill" style={{ width: `${sig.percentage}%`, backgroundColor: '#38bdf8' }}></div>
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
                          {reposStats.slice(0, 6).map(repo => {
                            const getRepoMapping = (repoName: string) => {
                              const matchKey = Object.keys(CNCF_SIG_MAPPING).find(k => k.toLowerCase() === repoName.toLowerCase());
                              if (matchKey) {
                                return CNCF_SIG_MAPPING[matchKey];
                              }
                              const isPersonal = repoName.toLowerCase().startsWith(`${username.toLowerCase()}/`);
                              return {
                                sig: undefined,
                                status: isPersonal ? 'Personal Project' : 'Open Source',
                                badgeColor: isPersonal ? '#4ade80' : '#cbd5e1'
                              };
                            };
                            const mapping = getRepoMapping(repo.name);

                            return (
                              <div key={repo.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <a href={`https://github.com/${repo.name}`} target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }} className="timeline-link">
                                      {repo.name}
                                    </a>
                                    {mapping && (
                                      <span style={{ 
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '0.65rem', 
                                        fontWeight: 800, 
                                        backgroundColor: mapping.badgeColor, 
                                        color: '#000000',
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                        border: '1.5px solid #000000',
                                        boxShadow: '1px 1px 0px #000000'
                                      }}>
                                        {mapping.status}
                                      </span>
                                    )}
                                    {mapping && mapping.sig && (
                                      <span style={{ 
                                        fontSize: '0.65rem', 
                                        fontWeight: 800, 
                                        backgroundColor: '#eadecd', 
                                        color: '#000000',
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                        border: '1.5px solid #000000',
                                        boxShadow: '1px 1px 0px #000000'
                                      }}>
                                        {mapping.sig}
                                      </span>
                                    )}
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
                            );
                          })}
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
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', margin: 0 }}>
            <span>
              GitHub Contribution Showcase © {new Date().getFullYear()} · Developed for{' '}
              <a href={`https://github.com/${username}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                @{username}
              </a>
            </span>
            {linkedinUrl && (
              <a 
                href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`} 
                target="_blank" 
                rel="noreferrer" 
                style={{ color: '#0a66c2', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
              >
                <LinkedinIcon size={14} fill="#0a66c2" />
                LinkedIn
              </a>
            )}
            {instagramUrl && (
              <a 
                href={instagramUrl.startsWith('http') ? instagramUrl : `https://${instagramUrl}`} 
                target="_blank" 
                rel="noreferrer" 
                style={{ color: '#e1306c', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
              >
                <InstagramIcon size={14} style={{ color: '#e1306c' }} />
                Instagram
              </a>
            )}
            <a 
              href={`https://devstats.cluster.fun/?user=${username}`} 
              target="_blank" 
              rel="noreferrer" 
              style={{ color: '#8b5cf6', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
            >
              <Sparkles size={14} style={{ color: '#8b5cf6' }} />
              DevStats ({devStats ? devStats.contributions : '312'})
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
