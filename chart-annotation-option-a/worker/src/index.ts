export interface Env {
  SUBMISSIONS: KVNamespace;
  // Optional GitHub integration
  GITHUB_TOKEN?: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
  // Optional CORS allowlist
  ALLOWED_ORIGIN?: string;
}

function corsHeaders(origin: string | null, allowedOrigin?: string) {
  const allow = allowedOrigin ?? origin ?? '*';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

async function maybeCreateGitHubIssue(env: Env, submissionId: string, payload: any) {
  if (!env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO) {
    return { attempted: false, ok: false, reason: 'GitHub env vars not set' };
  }

  const issueTitle = `Chart annotation submission: ${payload.participantId ?? 'unknown'} (${new Date().toISOString()})`;
  const issueBody =
    'Automated submission payload (JSON):

```json
' +
    JSON.stringify({ submissionId, ...payload }, null, 2) +
    '
```';

  const ghRes = await fetch(`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: issueTitle, body: issueBody, labels: ['annotation-submission'] }),
  });

  if (!ghRes.ok) {
    const txt = await ghRes.text();
    return { attempted: true, ok: false, status: ghRes.status, detail: txt };
  }
  const data = await ghRes.json<any>();
  return { attempted: true, ok: true, issueUrl: data?.html_url };
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get('Origin');
    const headers = corsHeaders(origin, env.ALLOWED_ORIGIN);

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(req.url);
    if (req.method !== 'POST' || url.pathname !== '/submit') {
      return new Response('Not found', { status: 404, headers });
    }

    let payload: any;
    try {
      payload = await req.json();
    } catch {
      return new Response('Invalid JSON', { status: 400, headers });
    }

    const submissionId = `${payload.participantId ?? 'unknown'}:${Date.now()}`;

    // Store raw submission in KV
    await env.SUBMISSIONS.put(submissionId, JSON.stringify(payload));

    const gh = await maybeCreateGitHubIssue(env, submissionId, payload);

    return new Response(
      JSON.stringify({ ok: true, submissionId, github: gh }),
      { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } },
    );
  },
};
