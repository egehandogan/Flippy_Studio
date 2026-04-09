import React, { useMemo } from 'react';
import { useEditorStore } from '../../store/useEditorStore';

const GridBackground: React.FC = () => {
  const zoom = useEditorStore((state) => state.zoom);
  const panning = useEditorStore((state) => state.panning);

  const gridStyles = useMemo(() => {
    const subStep = 20 * zoom;
    const mainStep = 100 * zoom;

    // Adaptive visibility: fade out sub-grid if too far
    const subOpacity = Math.max(0, Math.min(1, (zoom - 0.2) * 2));

    return {
      '--zoom': zoom,
      '--pan-x': `${panning.x}px`,
      '--pan-y': `${panning.y}px`,
      '--sub-step': `${subStep}px`,
      '--main-step': `${mainStep}px`,
      '--sub-opacity': subOpacity,
    } as React.CSSProperties;
  }, [zoom, panning]);

  return (
    <div 
      className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden"
      style={gridStyles}
    >
      <div 
        className="w-full h-full bg-[#1E1E1E]"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px),
            radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: `
            var(--main-step) var(--main-step),
            var(--sub-step) var(--sub-step)
          `,
          backgroundPosition: `
            var(--pan-x) var(--pan-y),
            var(--pan-x) var(--pan-y)
          `,
          opacity: 1,
          transition: 'opacity 0.2s ease-out'
        }}
      >
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: `var(--sub-step) var(--sub-step)`,
            backgroundPosition: `var(--pan-x) var(--pan-y)`,
            opacity: 'var(--sub-opacity)'
          }}
        />
      </div>
    </div>
  );
};

export default GridBackground;
