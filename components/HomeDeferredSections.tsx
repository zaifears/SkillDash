'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import DeferredSection from '@/components/shared/DeferredSection';

type HomeDeferredSectionsProps = {
  section: 'core' | 'content' | 'footer';
};

const CoreFeaturesSection = dynamic(() => import('./CoreFeaturesSection'), {
  ssr: false,
  loading: () => <div className="min-h-[420px]" aria-hidden="true" />,
});

const SimulatorPreview = dynamic(() => import('./SimulatorPreview'), {
  ssr: false,
  loading: () => <div className="min-h-[460px]" aria-hidden="true" />,
});

const GoPreview = dynamic(() => import('./GoPreview'), {
  ssr: false,
  loading: () => <div className="min-h-[460px]" aria-hidden="true" />,
});

const Footer = dynamic(() => import('./shared/Footer'), {
  ssr: false,
  loading: () => <div className="min-h-[220px]" aria-hidden="true" />,
});

export default function HomeDeferredSections({ section }: HomeDeferredSectionsProps) {
  if (section === 'core') {
    return (
      <section className="relative z-10">
        <DeferredSection minHeightClassName="min-h-[420px]" rootMargin="280px 0px">
          <CoreFeaturesSection />
        </DeferredSection>
      </section>
    );
  }

  if (section === 'content') {
    return (
      <section className="relative z-10">
        <DeferredSection minHeightClassName="min-h-[460px]" rootMargin="240px 0px">
          <SimulatorPreview />
        </DeferredSection>
        <DeferredSection minHeightClassName="min-h-[460px]" rootMargin="240px 0px">
          <GoPreview />
        </DeferredSection>
      </section>
    );
  }

  return (
    <DeferredSection minHeightClassName="min-h-[220px]" rootMargin="120px 0px">
      <Footer />
    </DeferredSection>
  );
}
