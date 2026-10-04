const API_BASE = 'https://api.github.com';

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  company: string | null;
  location: string | null;
  blog: string;
  twitter_username: string | null;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  homepage: string | null;
  updated_at: string;
  fork: boolean;
  archived: boolean;
}

export async function fetchUser(username: string): Promise<GitHubUser> {
  const res = await fetch(`${API_BASE}/users/${username}`, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) throw new Error(`User not found: ${username}`);
  return res.json();
}

export async function fetchRepos(username: string): Promise<GitHubRepo[]> {
  const res = await fetch(
    `${API_BASE}/users/${username}/repos?per_page=100&sort=updated&type=owner`,
    { headers: { Accept: 'application/vnd.github.v3+json' } }
  );
  if (!res.ok) throw new Error(`Failed to fetch repos for: ${username}`);
  const data: GitHubRepo[] = await res.json();
  return data.filter((r) => !r.fork && !r.archived);
}
