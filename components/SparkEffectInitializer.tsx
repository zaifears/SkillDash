'use client';

import { useEffect } from 'react';
import { initSparkEffect } from '@/lib/sparkEffect';

export default function SparkEffectInitializer() {
  useEffect(() => {
    initSparkEffect();
  }, []);

  return null;
}
