import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = '' }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: block,
          throwOnError: false,
          output: 'html',
        });
      } catch (err) {
        console.error('KaTeX error:', err);
      }
    }
  }, [math, block]);

  return <span ref={containerRef} className={className} />;
};
