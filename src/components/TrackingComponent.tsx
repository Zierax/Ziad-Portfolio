import { useEffect, useRef } from 'react';

// Helper to read cookies
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  return '';
}

export function TrackingComponent() {
  const interactions = useRef<{ clicks: number; maxScroll: number }>({ clicks: 0, maxScroll: 0 });
  const startObj = useRef<number>(Date.now());
  const hasSent = useRef<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = Math.round((window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > interactions.current.maxScroll) {
        interactions.current.maxScroll = Math.min(scrollPercent, 100);
      }
    };
    
    const handleClick = () => {
      interactions.current.clicks += 1;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    const dispatchLog = () => {
      if (hasSent.current) return;
      
      const duration = Math.round((Date.now() - startObj.current) / 1000);
      const isTarget = getCookie('x-special-visitor') === 'true';
      
      const payload = {
        sessionId: getCookie('x-session-id') || 'local-testing',
        ip: getCookie('x-visitor-ip') || '127.0.0.1',
        geo: getCookie('x-visitor-geo') || 'Localhost',
        isTarget: isTarget,
        org: getCookie('x-visitor-org'),
        referrer: document.referrer || 'Direct Entry',
        duration,
        interactions: interactions.current,
      };

      // Ensure beacon is sent reliably upon exit
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/log-session', blob);
      hasSent.current = true;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        dispatchLog();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleVisibilityChange);
    };
  }, []);

  return null; // Invisible component
}
