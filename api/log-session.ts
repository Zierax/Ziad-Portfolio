import { Octokit } from '@octokit/rest';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const token = process.env.ITHUB_TOKEN;
    
    if (!token) {
      console.error('GITHUB_TOKEN missing');
      return res.status(500).json({ error: 'Configuration error' });
    }

    const octokit = new Octokit({ auth: token });
    const owner = 'Zierax';
    const repo = 'ZiadTraffic';

    const timestamp = new Date().toISOString();
    const dateStr = timestamp.split('T')[0];
    const ip = data.ip || 'Unknown';
    const geo = data.geo || 'Unknown';
    const referrer = data.referrer || 'Direct';
    const duration = data.duration || 0;
    const isTarget = data.isTarget || false;
    const sessionId = data.sessionId || 'UnknownSession';

    // 1. Update summary.md
    let currentSummary = '';
    let summarySha = '';
    
    try {
      const summaryRes = await octokit.repos.getContent({
        owner,
        repo,
        path: 'summary.md',
      });
      if ('content' in summaryRes.data) {
        currentSummary = Buffer.from(summaryRes.data.content, 'base64').toString('utf8');
        summarySha = summaryRes.data.sha;
      }
    } catch (e: any) {
      if (e.status !== 404) {
        console.error('Error fetching summary.md:', e);
      }
      // If 404, file doesn't exist yet, which is fine
      currentSummary = '# Intelligence Log\\n\\n';
    }

    const targetTag = isTarget ? `**[TARGET DETECTED - ${data.org || 'Unknown'}]** ` : '';
    const newLine = `${timestamp} | IP: ${ip} | Geo: ${geo} | Ref: ${referrer} | Dur: ${duration}s | ${targetTag}Session: ${sessionId}\\n`;
    
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'summary.md',
      message: `Log session: ${ip}`,
      content: Buffer.from(currentSummary + newLine).toString('base64'),
      sha: summarySha || undefined,
    });

    // 2. Add detailed JSON dump
    const jsonPath = `logs/${dateStr}/${ip}-${Date.now()}.json`;
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: jsonPath,
      message: `Full payload: ${ip}`,
      content: Buffer.from(JSON.stringify(data, null, 2)).toString('base64'),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to log session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
