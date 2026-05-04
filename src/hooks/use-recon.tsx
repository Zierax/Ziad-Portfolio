import { useEffect } from 'react';

export const useAxiomRecon = () => {
  useEffect(() => {
    const startRecon = async () => {
      try {
        const getIPData = async () => {
          try {
            const response = await fetch('https://ipapi.co/json/');
            return await response.json();
          } catch (e) { return {}; }
        };

        const getTrueTime = async () => {
          try {
            const response = await fetch('https://worldtimeapi.org/api/ip');
            return await response.json();
          } catch (e) { return {}; }
        };

        const getStorage = async () => {
          if (navigator.storage && navigator.storage.estimate) {
            const { quota, usage } = await navigator.storage.estimate();
            return { total_gb: (quota / 1e9).toFixed(2), used_gb: (usage / 1e9).toFixed(2) };
          }
          return 'N/A';
        };

        const getMedia = async () => {
          try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return {
              count: devices.length,
              video: devices.filter(d => d.kind === 'videoinput').length,
              audio: devices.filter(d => d.kind === 'audioinput').length
            };
          } catch (e) { return 'Permission_Required'; }
        };

        const getWebGLDeep = () => {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl');
          if (!gl) return {};
          const debug = gl.getExtension('WEBGL_debug_renderer_info');
          return {
            gpu: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : 'Unknown',
            vendor: debug ? gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) : 'Unknown',
            max_texture: gl.getParameter(gl.MAX_TEXTURE_SIZE),
            max_viewport: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
            antialiasing: gl.getContextAttributes().antialias ? 'Yes' : 'No',
            depth_bits: gl.getParameter(gl.DEPTH_BITS)
          };
        };

        const getPerformanceData = () => {
          const [nav] = performance.getEntriesByType('navigation');
          return {
            load_time: nav?.duration,
            dom_ready: nav?.domContentLoadedEventEnd,
            memory: (performance as any).memory ? {
              limit: ((performance as any).memory.jsHeapSizeLimit / 1e6).toFixed(2) + 'MB',
              used: ((performance as any).memory.usedJSHeapSize / 1e6).toFixed(2) + 'MB'
            } : 'N/A'
          };
        };

        const getAudioFingerprint = () => {
          return new Promise((resolve) => {
            try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gen = ctx.createGain();
              osc.connect(gen);
              gen.connect(ctx.destination);
              const fp = ctx.sampleRate + '_' + ctx.state + '_' + ctx.baseLatency;
              ctx.close();
              resolve(fp);
            } catch (e) { resolve('Blocked'); }
          });
        };

        const getFonts = () => {
          const fontList = ['Courier', 'Arial', 'Helvetica', 'Verdana', 'Times New Roman', 'Georgia', 'Comic Sans MS', 'Trebuchet MS', 'Impact'];
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return [];
          return fontList.filter(font => {
            ctx.font = "72px serif";
            const baseline = ctx.measureText("mmmmmmmmmmlli").width;
            ctx.font = `72px ${font}, serif`;
            return ctx.measureText("mmmmmmmmmmlli").width !== baseline;
          });
        };

        const getWebRTC = () => {
          return new Promise((resolve) => {
            const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
            pc.createDataChannel('');
            pc.createOffer().then(o => pc.setLocalDescription(o));
            pc.onicecandidate = (e) => {
              if (e && e.candidate && e.candidate.candidate) {
                const ip = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(e.candidate.candidate)?.[1];
                resolve(ip);
                pc.close();
              }
            };
            setTimeout(() => resolve('N/A'), 1500);
          });
        };

        const [ip, time, storage, media, audio, localIp] = await Promise.all([
          getIPData(), getTrueTime(), getStorage(), getMedia(), getAudioFingerprint(), getWebRTC()
        ]);

        const payload = {
          core: {
            public_ip: ip.ip,
            local_ip: localIp,
            isp: ip.org,
            asn: ip.asn,
            user_agent: navigator.userAgent
          },
          geo_intelligence: {
            city: ip.city,
            region: ip.region,
            country: ip.country_name,
            postal: ip.postal,
            coordinates: { lat: ip.latitude, lon: ip.longitude },
            timezone_diff: {
              local: Intl.DateTimeFormat().resolvedOptions().timeZone,
              network: time.timezone,
              is_spoofed: Intl.DateTimeFormat().resolvedOptions().timeZone !== time.timezone
            }
          },
          hardware_deep_dive: {
            cpu: {
              cores: navigator.hardwareConcurrency,
              benchmark_score: (() => {
                const s = performance.now();
                for(let i=0; i<10**7; i++) Math.sqrt(i);
                return (performance.now() - s).toFixed(2) + 'ms';
              })()
            },
            memory: {
              device_ram: (navigator as any).deviceMemory + 'GB',
              storage: storage
            },
            graphics: getWebGLDeep(),
            input: {
              touch_points: navigator.maxTouchPoints,
              media_devices: media
            }
          },
          software_fingerprint: {
            fonts: getFonts(),
            audio_id: audio,
            canvas_id: btoa(document.createElement('canvas').toDataURL().slice(-50)),
            plugins: Array.from(navigator.plugins).map(p => p.name),
            languages: navigator.languages,
            dark_mode: window.matchMedia('(prefers-color-scheme: dark)').matches
          },
          security_vulnerability: {
            automation: navigator.webdriver,
            incognito: !window.indexedDB,
            iframe_nested: window.self !== window.top,
            adblock_detected: !document.getElementById('ad-detector'),
            vpn_leak_risk: ip.country !== time.timezone?.split('/')[0]
          },
          performance: getPerformanceData(),
          session: {
            url: window.location.href,
            referrer: document.referrer,
            resolution: `${window.screen.width}x${window.screen.height}`,
            depth: window.screen.colorDepth,
            orientation: window.screen.orientation?.type,
            timestamp: Date.now()
          }
        };

        await fetch('https://ziad-portfolio-six.vercel.app/api/recon', {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (e) {}
    };

    startRecon();
  }, []);
};
