import React, { useEffect, useState, useRef } from 'react';
import { Terminal } from 'lucide-react';

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  return '';
}

export function TargetBanner() {
  const [isActive, setIsActive] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const idleTimeoutRef = useRef<any>(null);
  const hasGhostTyped = useRef(false);

  useEffect(() => {
    // For local testing without backend, optionally just set 'isActive' directly to true here.
    // In production, we read the cookie injected by Vercel edge middleware:
    const isTarget = getCookie('x-special-visitor') === 'true';
    if (!isTarget) return; // Do nothing if not targeted.

    const geo = getCookie('x-visitor-geo') || 'Unknown Location';
    const org = getCookie('x-visitor-org') || 'Unknown Organization';

    const bootSequence = [
      '[OK] Local Storage Decrypted',
      '[OK] Identifying Visitor...',
      `[OK] Source: ${geo}`,
      `[WARN] Corporate IP Detected: ${org}`,
      '[SYSTEM] Axiom Kernel v2.0 - Status: Watching.',
      '',
      '> You seem interesting. Just contact me directly—I will answer your questions instead of this intelligence. You are dealing with an engineer with 10 years of experience; I know how you move.'
    ];

    const bootStartTimer = setTimeout(() => {
      setIsActive(true);
      
      let step = 0;
      const typeNext = () => {
        if (step < bootSequence.length) {
          setLines(prev => [...prev, bootSequence[step]]);
          step++;
          const nextDelay = bootSequence[step - 1] === '' ? 500 : 800;
          setTimeout(typeNext, nextDelay);
        }
      };
      typeNext();
    }, 5000);

    return () => clearTimeout(bootStartTimer);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    // Ghost typing for idle
    const resetIdle = () => {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(() => {
        if (!hasGhostTyped.current) {
          setLines(prev => [...prev, '', '> Guest_1502, are you lost? The Answer is in the Logic, not the CSS.']);
          hasGhostTyped.current = true;
        }
      }, 15000); // 15 seconds to be considered idle
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    resetIdle();

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setLines(prev => [...prev, '> [SECURITY] Don\'t bother. The Kernel is encrypted. Just use the terminal.']);
    };
    
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J'))) {
        e.preventDefault();
        setLines(prev => [...prev, '> [SECURITY] Don\'t bother. The Kernel is encrypted. Just use the terminal.']);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeydown);

    return () => {
      clearTimeout(idleTimeoutRef.current);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[450px] max-w-[90vw] bg-black/95 border border-green-500/30 rounded-md shadow-2xl overflow-hidden z-[9999] font-mono text-sm shadow-green-900/20">
      <div className="bg-zinc-900 px-3 py-2 border-b border-green-500/20 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-green-500" />
        <span className="text-green-500/70 text-xs font-semibold">AXIOM KERNEL</span>
        <span className="ml-auto text-green-500/50 text-[10px]">v2.0.4</span>
      </div>
      <div className="p-4 h-[300px] overflow-y-auto space-y-2 flex flex-col justify-end">
        <div>
          {lines.map((line, index) => (
            <div 
              key={index} 
              className={`
                ${line.includes('[WARN]') ? 'text-yellow-400' : ''}
                ${line.includes('[SYSTEM]') ? 'text-blue-400' : ''}
                ${line.includes('[SECURITY]') ? 'text-red-500 font-bold' : ''}
                ${line.startsWith('>') ? 'text-green-300' : 'text-green-500'}
              `}
            >
              {line}
            </div>
          ))}
          <div className="animate-pulse w-2 h-4 bg-green-500 mt-2"></div>
        </div>
      </div>
    </div>
  );
}
