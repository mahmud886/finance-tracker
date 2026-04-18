'use client';

import { useEffect } from 'react';

type RedocWindow = Window & {
  Redoc?: {
    init: (specUrl: string, options: Record<string, unknown>, element: HTMLElement | null) => void;
  };
};

export default function ReDocUI() {
  useEffect(() => {
    // Load ReDoc script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js';
    script.async = true;
    document.body.appendChild(script);

    // Initialize ReDoc when script is loaded
    script.onload = () => {
      const redocWindow = window as RedocWindow;
      if (redocWindow.Redoc) {
        redocWindow.Redoc.init(
          '/api/v1/openapi.json',
          {
            theme: {
              colors: {
                primary: {
                  main: '#2563eb',
                },
                text: {
                  primary: '#111827',
                  secondary: '#374151',
                },
                bg: {
                  primary: '#ffffff',
                },
                border: {
                  dark: '#e5e7eb',
                  light: '#f3f4f6',
                },
              },
            },
          },
          document.getElementById('redoc-container'),
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="redoc-light-mode" style={{ fontFamily: 'sans-serif' }}>
      <style>{`
        .redoc-light-mode,
        .redoc-light-mode #redoc-container,
        .redoc-light-mode #redoc-container > div {
          color-scheme: light;
          background: #ffffff;
          color: #111827;
        }
      `}</style>
      <div id="redoc-container" />
    </div>
  );
}

