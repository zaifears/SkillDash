'use client';
import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [info, setInfo] = useState<any>({});

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        const response = await fetch('/api/debug-info');
        const data = await response.json();
        setInfo(data);
      } catch (error: any) {
        setInfo({ error: error.message });
      }
    };
    
    fetchDebugInfo();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Information</h1>
      <pre>{JSON.stringify(info, null, 2)}</pre>
      <hr />
      <h2>Browser Info</h2>
      <p>User Agent: {navigator.userAgent}</p>
      <p>Language: {navigator.language}</p>
      <p>Platform: {navigator.platform}</p>
    </div>
  );
}
