import { next } from '@vercel/edge';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|assets|favicon.ico).*)',
  ],
};

const TARGET_KEYWORDS = ['google', 'github', 'aikido', 'amsterdam-tech-hub', 'meta', 'microsoft', 'amazon', 'apple'];

function expandIPv6(ip: string): string {
  try {
    const [left = '', right = ''] = ip.split('::');
    let leftParts = left.split(':').filter(Boolean);
    let rightParts = right.split(':').filter(Boolean);
    let missing = 8 - (leftParts.length + rightParts.length);
    let middle = Array(missing).fill('0000');
    let full = [...leftParts, ...middle, ...rightParts];
    return full.map(p => p.padStart(4, '0')).join('');
  } catch (e) {
    return '00000000000000000000000000000000';
  }
}

function ipToPtr(ip: string): string {
  if (ip.includes('.')) {
    return ip.split('.').reverse().join('.') + '.in-addr.arpa';
  } else {
    // IPv6
    const expanded = expandIPv6(ip);
    return expanded.split('').reverse().join('.') + '.ip6.arpa';
  }
}

export default async function middleware(req: Request) {
  const url = new URL(req.url);
  
  // Extract info from Vercel edge headers
  const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || '127.0.0.1';
  const city = req.headers.get('x-vercel-ip-city') || 'Unknown City';
  const country = req.headers.get('x-vercel-ip-country') || 'Unknown Country';
  const sessionId = crypto.randomUUID();

  let targetDetected = false;
  let detectedOrg = 'Unknown Identity';

  // Perform unlimited free DNS over HTTPS (DoH) PTR Lookup
  if (ip && ip !== '127.0.0.1' && ip !== '::1') {
    try {
      const ptr = ipToPtr(ip);
      const dnsRes = await fetch(`https://dns.google/resolve?name=${ptr}&type=PTR`);
      if (dnsRes.ok) {
        const json = await dnsRes.json();
        if (json.Answer && json.Answer.length > 0) {
          const hostname = json.Answer[0].data.toLowerCase();
          
          for (const keyword of TARGET_KEYWORDS) {
            if (hostname.includes(keyword)) {
              targetDetected = true;
              detectedOrg = keyword.charAt(0).toUpperCase() + keyword.slice(1);
              break;
            }
          }
        }
      }
    } catch (e) {
      console.error('DNS Lookup failed:', e);
    }
  }

  // Force true for testing purposes if IP is localhost, wait, just keep real logic
  // We can test locally via vite, but vite doesn't run this middleware unless using Vercel CLI (`vercel dev`).

  const response = next();
  
  // Set cookies to transport data to the React app
  response.headers.append('Set-Cookie', `x-session-id=${sessionId}; Path=/; SameSite=Strict`);
  response.headers.append('Set-Cookie', `x-visitor-ip=${encodeURIComponent(ip)}; Path=/; SameSite=Strict`);
  response.headers.append('Set-Cookie', `x-visitor-geo=${encodeURIComponent(city + ', ' + country)}; Path=/; SameSite=Strict`);
  
  if (targetDetected) {
    response.headers.append('Set-Cookie', `x-special-visitor=true; Path=/; SameSite=Strict`);
    response.headers.append('Set-Cookie', `x-visitor-org=${encodeURIComponent(detectedOrg)}; Path=/; SameSite=Strict`);
  } else {
    // Clear them if they exist
    response.headers.append('Set-Cookie', `x-special-visitor=; Path=/; Max-Age=0`);
    response.headers.append('Set-Cookie', `x-visitor-org=; Path=/; Max-Age=0`);
  }

  return response;
}
