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
        // Sanitize raw '$' that isn't already escaped with '\'
        // Since KaTeX is already in math mode, unescaped '$' inside \text{} or math strings is invalid syntax
        const safeMath = math.replace(/(?<!\\)\$/g, () => '\\$');
        katex.render(safeMath, containerRef.current, {
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
