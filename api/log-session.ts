import { Octokit } from '@octokit/rest';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const token = process.env.GITHUB_TOKEN; // تأكد من الاسم الصحيح في الـ Environment Variables
    
    if (!token) {
      console.error('GITHUB_TOKEN missing');
      return res.status(500).json({ error: 'Configuration error' });
    }

    const octokit = new Octokit({ auth: token });
    const owner = 'Zierax';
    const repo = 'ZiadTraffic';

    // --- RECONNAISSANCE LAYER ---
    const timestamp = new Date().toISOString();
    const dateStr = timestamp.split('T')[0];
    
    // Server-Side Data
    const userAgent = req.headers['user-agent'] || 'Unknown UA';
    const cfIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || 'Unknown';
    const cfCountry = req.headers['cf-ipcountry'] || 'Unknown';
    
    // Client-Side Recon (Passed in body)
    const {
      screenRes = 'Unknown', // e.g., "1920x1080"
      deviceType = 'Unknown', // e.g., "Mobile" or "Desktop"
      gpu = 'Unknown',        // e.g., "NVIDIA GeForce RTX 3080"
      timezone = 'Unknown',
      language = 'Unknown',
      platform = 'Unknown',   // e.g., "Win32"
      isIncognito = false,
      referrer = 'Direct',
      duration = 0,
      isTarget = false,
      sessionId = 'UnknownSession'
    } = data;

    // 1. Fetch current summary.md
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
      if (e.status !== 404) console.error('Error fetching summary.md:', e);
      currentSummary = '# Axiom-02 Intelligence Log\\n\\n';
    }

    // --- FORMATTING THE INTEL ---
    const targetTag = isTarget ? `⚠️ **[TARGET: ${data.org || 'UNKNOWN'}]** ` : '';
    const reconLine = `
---
### 🛡️ Capture: ${timestamp}
- **Identity:** IP: \`${cfIp}\` (${cfCountry}) | Session: \`${sessionId}\`
- **Device:** ${deviceType} | ${platform} | Screen: ${screenRes}
- **Browser:** \`${userAgent}\`
- **GPU:** ${gpu} | Lang: ${language} | TZ: ${timezone}
- **Behavior:** Ref: ${referrer} | Stay: ${duration}s | ${targetTag}
`;

    // Update summary.md
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'summary.md',
      message: `Intelligence Report: ${cfIp}`,
      content: Buffer.from(currentSummary + reconLine).toString('base64'),
      sha: summarySha || undefined,
    });

    // 2. Add full detailed JSON dump for Axiom Engine
    const fullPayload = {
        timestamp,
        server_recon: { ip: cfIp, country: cfCountry, ua: userAgent },
        client_recon: data,
        headers: req.headers // Full dump for manual analysis
    };

    const jsonPath = `logs/${dateStr}/${cfIp.replace(/:/g, '-')}-${Date.now()}.json`;
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: jsonPath,
      message: `Full Recon Dump: ${cfIp}`,
      content: Buffer.from(JSON.stringify(fullPayload, null, 2)).toString('base64'),
    });

    return res.status(200).json({ success: true, message: "Axiom has recorded your presence." });
  } catch (error) {
    console.error('Failed to log session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
