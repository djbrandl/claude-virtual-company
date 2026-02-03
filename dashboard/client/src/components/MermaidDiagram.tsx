import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#3b82f6',
    primaryTextColor: '#e5e7eb',
    primaryBorderColor: '#1f2937',
    lineColor: '#6b7280',
    secondaryColor: '#8b5cf6',
    tertiaryColor: '#10b981',
    background: '#1f2937',
    mainBkg: '#1f2937',
    secondBkg: '#374151',
    textColor: '#e5e7eb',
    border1: '#4b5563',
    border2: '#6b7280',
    arrowheadColor: '#9ca3af',
    fontFamily: 'ui-monospace, monospace',
    fontSize: '14px',
  },
});

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (ref.current) {
      try {
        mermaid.render(id.current, chart).then(({ svg }) => {
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        }).catch((error) => {
          console.error('Mermaid rendering error:', error);
          if (ref.current) {
            ref.current.innerHTML = `<pre class="text-red-400 text-xs p-2 bg-red-900/20 rounded">${error.message}</pre>`;
          }
        });
      } catch (error) {
        console.error('Mermaid error:', error);
      }
    }
  }, [chart]);

  return <div ref={ref} className="mermaid-diagram my-4" />;
}
