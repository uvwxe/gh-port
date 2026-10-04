import type { GitHubUser, GitHubRepo } from '../api/github';

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  Ruby: '#701516',
  'C++': '#f34b7d',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Shell: '#89e051',
  Lua: '#000080',
  C: '#555555',
  'C#': '#178600',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  PHP: '#4F5D95',
  Vue: '#41b883',
  Jupyter: '#DA5B0B',
  Liquid: '#67b8a3',
  SCSS: '#c6538c',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
};

function esc(s: string | null): string {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function repoCard(repo: GitHubRepo, i: number): string {
  const langColor = repo.language ? (LANG_COLORS[repo.language] || '#6e6e73') : null;
  return `
    <a href="${esc(repo.html_url)}" class="repo-card" style="animation-delay:${i * 0.05}s" target="_blank" rel="noopener">
      <div class="repo-card-top">
        <h3 class="repo-name">${esc(repo.name)}</h3>
        <span class="repo-visibility">public</span>
      </div>
      ${repo.description ? `<p class="repo-desc">${esc(repo.description)}</p>` : ''}
      <div class="repo-meta">
        ${langColor ? `<span class="repo-lang"><span class="lang-dot" style="background:${langColor}"></span>${esc(repo.language!)}</span>` : ''}
        <span class="repo-stars">${repo.stargazers_count} stars</span>
        <span class="repo-forks">${repo.forks_count} forks</span>
        <span class="repo-updated">Updated ${fmtDate(repo.updated_at)}</span>
      </div>
    </a>`;
}

export function renderPortfolio(profile: GitHubUser, repos: GitHubRepo[]): string {
  const cards = repos.map((r, i) => repoCard(r, i)).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(profile.name || profile.login)} — GitHub Portfolio</title>
  <meta name="description" content="${esc(profile.bio || profile.login + "'s GitHub portfolio")}">
  <meta property="og:title" content="${esc(profile.name || profile.login)} — GitHub Portfolio">
  <meta property="og:description" content="${esc(profile.bio || '')}">
  <meta property="og:image" content="${esc(profile.avatar_url)}">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Sora',sans-serif;background:#fbfbfd;color:#1d1d1f;-webkit-font-smoothing:antialiased;min-height:100vh}
    a{color:#0071e3;text-decoration:none}
    .container{max-width:900px;margin:0 auto;padding:0 24px}

    header{background:rgba(251,251,253,.8);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid #e5e5e7;position:sticky;top:0;z-index:10;padding:16px 0}
    header .container{display:flex;justify-content:space-between;align-items:center}
    header a{font-size:14px;color:#6e6e73}
    .gh-link{font-family:'JetBrains Mono',monospace;font-size:13px;color:#0071e3}

    .hero{padding:80px 0 40px}
    .profile{display:flex;align-items:center;gap:24px}
    .profile img{width:96px;height:96px;border-radius:50%;border:3px solid #e5e5e7}
    .profile-info{flex:1}
    .profile h1{font-size:36px;font-weight:700;letter-spacing:-0.03em;margin:0}
    .profile .bio{color:#6e6e73;font-size:17px;line-height:1.5;margin-top:6px;max-width:500px}
    .stats-row{display:flex;gap:28px;margin-top:16px;font-size:15px;color:#6e6e73}
    .stats-row span strong{color:#1d1d1f;font-weight:600}
    .extra-links{margin-top:14px;display:flex;gap:16px;flex-wrap:wrap}
    .extra-links a{font-size:14px;display:flex;align-items:center;gap:4px}

    .section{margin-top:56px;padding-bottom:80px}
    .section-title{font-size:22px;font-weight:600;margin-bottom:24px}
    .repo-count{font-size:14px;color:#6e6e73;font-weight:400;margin-left:10px}

    .repo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:16px}
    .repo-card{background:#fff;border-radius:16px;padding:20px 24px;box-shadow:0 2px 8px rgba(0,0,0,.04);transition:box-shadow .3s ease,transform .3s ease;display:block;color:inherit;animation:fadeUp .6s cubic-bezier(.25,.1,.25,1) both}
    .repo-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08);transform:translateY(-2px)}
    .repo-card-top{display:flex;align-items:center;gap:8px;margin-bottom:8px}
    .repo-name{font-size:15px;font-weight:600;color:#0071e3}
    .repo-visibility{font-size:11px;color:#6e6e73;border:1px solid #e5e5e7;border-radius:12px;padding:1px 8px;font-weight:500;text-transform:lowercase}
    .repo-desc{font-size:14px;color:#6e6e73;line-height:1.5;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .repo-meta{display:flex;align-items:center;gap:14px;font-size:12px;color:#6e6e73;flex-wrap:wrap}
    .repo-lang{display:flex;align-items:center;gap:5px}
    .lang-dot{width:10px;height:10px;border-radius:50%;display:inline-block;flex-shrink:0}

    footer{text-align:center;padding:32px 0;color:#6e6e73;font-size:13px;border-top:1px solid #e5e5e7}
    footer a{color:#0071e3}

    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}

    @media(max-width:768px){
      .hero{padding:40px 0 24px}
      .profile{flex-direction:column;text-align:center}
      .stats-row{justify-content:center;flex-wrap:wrap}
      .extra-links{justify-content:center}
      .repo-grid{grid-template-columns:1fr}
      .profile .bio{margin:6px auto 0}
    }
  </style>
</head>
<body>
<header>
  <div class="container">
    <a href="https://github.com/${esc(profile.login)}" class="gh-link" target="_blank" rel="noopener">github.com/${esc(profile.login)}</a>
    <span style="font-size:13px">Portfolio</span>
  </div>
</header>
<main class="container">
  <div class="hero">
    <div class="profile">
      <img src="${esc(profile.avatar_url)}" alt="${esc(profile.name || profile.login)}" width="96" height="96" loading="eager">
      <div class="profile-info">
        <h1>${esc(profile.name || profile.login)}</h1>
        ${profile.bio ? `<p class="bio">${esc(profile.bio)}</p>` : ''}
        <div class="stats-row">
          <span><strong>${profile.public_repos}</strong> repos</span>
          <span><strong>${profile.followers}</strong> followers</span>
          <span><strong>${profile.following}</strong> following</span>
        </div>
        <div class="extra-links">
          ${profile.blog ? `<a href="${profile.blog.replace(/^https?:\/\//, '') === profile.blog ? 'https://' + profile.blog : profile.blog}" target="_blank" rel="noopener">${profile.blog.replace(/^https?:\/\//, '')}</a>` : ''}
          ${profile.twitter_username ? `<a href="https://x.com/${esc(profile.twitter_username)}" target="_blank" rel="noopener">@${esc(profile.twitter_username)}</a>` : ''}
          ${profile.company ? `<span style="color:#6e6e73;font-size:14px">${esc(profile.company)}</span>` : ''}
          ${profile.location ? `<span style="color:#6e6e73;font-size:14px">${esc(profile.location)}</span>` : ''}
        </div>
      </div>
    </div>
  </div>
  <div class="section">
    <h2 class="section-title">Repositories<span class="repo-count">${repos.length} shown</span></h2>
    <div class="repo-grid">${cards}</div>
  </div>
</main>
<footer>
  <div class="container">Generated by <a href="#" target="_blank">GitHub Portfolio Builder</a></div>
</footer>
</body>
</html>`;
}
