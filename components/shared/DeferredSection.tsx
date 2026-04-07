'use client';

import React, { useEffect, useRef, useState } from 'react';

type DeferredSectionProps = {
  children: React.ReactNode;
  className?: string;
  minHeightClassName?: string;
  rootMargin?: string;
};

export default function DeferredSection({
  children,
  className,
  minHeightClassName = 'min-h-[320px]',
  rootMargin = '300px 0px',
}: DeferredSectionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = containerRef.current;

    if (!node || isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? children : <div className={minHeightClassName} aria-hidden="true" />}
    </div>
  );
}
