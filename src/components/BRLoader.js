import React, { useEffect, useState } from 'react';
import { subscribeLoading } from '../utils/loader';

// Full-screen BR logo loader shown while any API request is in flight.
const BRLoader = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeLoading(setLoading);
    return unsubscribe;
  }, []);

  if (!loading) {
    return null;
  }

  return (
    <div className="br-loader-overlay" role="alert" aria-busy="true" aria-live="polite">
      <div className="br-loader-content">
        <div className="br-loader-badge">
          <span className="br-loader-ring" />
          <span className="br-loader-text">BR</span>
        </div>
        <div className="br-loader-title">BR Bullion</div>
        <div className="br-loader-subtitle">Loading...</div>
      </div>
    </div>
  );
};

export default BRLoader;
