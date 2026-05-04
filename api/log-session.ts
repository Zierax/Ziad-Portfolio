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
    
    const userAgent = req.headers['user-agent'] || 'Unknown UA';
    const cfIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || 'Unknown';
    const cfCountry = req.headers['cf-ipcountry'] || 'Unknown';
    
    const {
      network_layer = {},
      hardware_layer = {},
      browser_layer = {},
      security_context = {},
      session = {}
    } = data;

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
      currentSummary = '# 🛡️ Axiom-02 Intelligence Log\n\n';
    }

    const vpnFlag = security_context.vpn_leak_risk ? '🚨 **[VPN/PROXY DETECTED]**' : '✅ Clean';
    const incognitoFlag = security_context.is_incognito ? '🕵️ **[INCOGNITO]**' : 'Normal';
    const botFlag = security_context.is_webdriver ? '🤖 **[AUTOMATION/BOT]**' : '👤 Human';

    const reconLine = `
---
### 📍 Intel Captured: ${timestamp}
- **Network:** IP: \`${network_layer.public_ip || cfIp}\` | Local: \`${network_layer.local_ip || 'N/A'}\` | Org: \`${network_layer.isp || 'Unknown'}\`
- **Location:** ${network_layer.geo?.country || cfCountry} (${network_layer.geo?.city || 'Unknown'}) | TZ: \`${session.timezone}\`
- **Security:** ${vpnFlag} | ${incognitoFlag} | ${botFlag}
- **Hardware:** CPU: \`${hardware_layer.cpu?.cores} Cores\` | RAM: \`${hardware_layer.memory?.device_ram}\` | Benchmark: \`${hardware_layer.cpu?.benchmark_score}\`
- **Graphics:** GPU: \`${hardware_layer.graphics?.gpu}\` | Vendor: \`${hardware_layer.graphics?.vendor}\`
- **Environment:** Resolution: \`${session.resolution}\` | DarkMode: \`${browser_layer.dark_mode}\` | Lang: \`${browser_layer.languages?.[0]}\`
- **Trace:** Ref: \`${session.referrer}\` | Path: \`${session.path}\`
`;

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'summary.md',
      message: `Axiom Recon: ${cfIp} [${cfCountry}]`,
      content: Buffer.from(currentSummary + reconLine).toString('base64'),
      sha: summarySha || undefined,
    });

    const fullPayload = {
        metadata: {
          timestamp,
          server_ip: cfIp,
          server_country: cfCountry,
          raw_headers: req.headers
        },
        intel: data
    };

    const jsonPath = `logs/${dateStr}/${cfIp.replace(/:/g, '-')}-${Date.now()}.json`;
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: jsonPath,
      message: `Full Deep-Recon Dump: ${cfIp}`,
      content: Buffer.from(JSON.stringify(fullPayload, null, 2)).toString('base64'),
    });

    return res.status(200).json({ 
      success: true, 
      status: "Axiom Intelligence Recorded",
      vector: cfIp 
    });
  } catch (error) {
    console.error('Failed to log session:', error);
    return res.status(500).json({ error: 'Axiom internal fault' });
  }
}
