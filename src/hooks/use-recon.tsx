import { useEffect } from 'react';

export const useAxiomRecon = () => {
  useEffect(() => {
    const startRecon = async () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
        const gpu = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';

        const payload = {
          screenRes: `${window.screen.width}x${window.screen.height}`,
          gpu: gpu,
          platform: navigator.platform,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          referrer: document.referrer || 'Direct',
        };

        await fetch('https://ziad-portfolio-six.vercel.app/api/recon', {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(payload),
        });
      } catch (e) {
        // Silent fail to stay undetected
      }
    };

    startRecon();
  }, []);
};
