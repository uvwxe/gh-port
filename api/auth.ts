export default async function handler(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    const clientId = process.env.VITE_GITHUB_CLIENT_ID;
    const scope = 'public_repo,user';
    const redirect = `${url.origin}/api/auth`;
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirect}&scope=${scope}`;
    return Response.redirect(githubUrl, 302);
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.VITE_GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await tokenRes.json() as { access_token?: string; error?: string };

  if (data.error || !data.access_token) {
    return new Response(JSON.stringify({ error: data.error || 'no token' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const appUrl = url.origin;
  return new Response(null, {
    status: 302,
    headers: { Location: `${appUrl}/#token=${data.access_token}` },
  });
}
