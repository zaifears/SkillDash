import React, { Suspense, lazy } from 'react';

// Lazy load feature previews for better performance
const SimulatorPreview = lazy(() => 
  import('./SimulatorPreview').then(module => ({
    default: module.default
  })).catch(() => ({
    default: () => <div className="sr-only">Simulator preview unavailable</div>
  }))
);

const ContentSections = () => {
  return (
    <>
      {/* Simulator Preview - Lazy loaded - MAIN FOCUS */}
      <Suspense fallback={<div className="min-h-96" role="status" aria-label="Loading simulator preview"><span className="sr-only">Loading simulator preview...</span></div>}>
        <SimulatorPreview />
      </Suspense>
    </>
  );
};

export default ContentSections;