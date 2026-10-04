const API_BASE = '/api';

function getStoredToken(): string | null {
  return sessionStorage.getItem('gh_token') || null;
}

function getClientId(): string {
  return import.meta.env.VITE_GITHUB_CLIENT_ID || '';
}

export async function startOAuth(pendingUser?: string): Promise<string> {
  const clientId = getClientId();
  if (pendingUser) sessionStorage.setItem('gh_pending_user', pendingUser);
  const redirect = window.location.origin + '/api/auth';
  const scope = 'public_repo user';
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}&scope=${encodeURIComponent(scope)}`;

  window.location.href = authUrl;
  return '';
}

export async function publishPortfolio(
  username: string,
  html: string
): Promise<{ url: string }> {
  let token = getStoredToken();

  if (!token) {
    const clientId = getClientId();
    if (!clientId) {
      throw new Error('GitHub OAuth not configured. Set VITE_GITHUB_CLIENT_ID.');
    }
    token = await startOAuth(username);
  }

  const res = await fetch(`${API_BASE}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, username, html }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'publish failed' }));
    throw new Error(err.error || 'publish failed');
  }

  return res.json();
}

export function hasToken(): boolean {
  return !!getStoredToken();
}
