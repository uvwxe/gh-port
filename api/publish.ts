export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(null, { status: 405 });
  }

  let body: { token: string; username: string; html: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400 });
  }

  const { token, username, html } = body;
  if (!token || !username || !html) {
    return new Response(JSON.stringify({ error: 'missing fields' }), { status: 400 });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  const repoName = `${username}.github.io`;

  const checkRes = await fetch(`https://api.github.com/repos/${username}/${repoName}`, { headers });
  if (checkRes.status === 404) {
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: repoName,
        description: `${username}'s GitHub Portfolio`,
        homepage: `https://${repoName}`,
        private: false,
        auto_init: true,
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      return new Response(JSON.stringify({ error: `failed to create repo: ${err}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else if (!checkRes.ok) {
    return new Response(JSON.stringify({ error: 'repo check failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const existingRes = await fetch(
    `https://api.github.com/repos/${username}/${repoName}/contents/index.html`,
    { headers }
  );

  let existingSha = '';
  if (existingRes.ok) {
    const existing = await existingRes.json() as { sha: string };
    existingSha = existing.sha;
  }

  const content = btoa(unescape(encodeURIComponent(html)));

  const payload: Record<string, string> = {
    message: 'Update portfolio',
    content,
  };
  if (existingSha) payload.sha = existingSha;

  const uploadRes = await fetch(
    `https://api.github.com/repos/${username}/${repoName}/contents/index.html`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    return new Response(JSON.stringify({ error: `upload failed: ${err}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await fetch(`https://api.github.com/repos/${username}/${repoName}/pages`, {
    method: 'POST',
    headers: {
      ...headers,
      Accept: 'application/vnd.github.switcheroo-preview+json',
    },
    body: JSON.stringify({ source: { branch: 'main', path: '/' } }),
  });

  return new Response(JSON.stringify({ url: `https://${username}.github.io` }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
