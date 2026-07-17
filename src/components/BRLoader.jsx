import React, { useEffect, useState } from 'react';
import { subscribeLoading } from '../utils/loader';

const BRLoader = () => {
  const [loading, setLoading] = useState({ isReading: false, isWriting: false });

  useEffect(() => {
    const unsubscribe = subscribeLoading(setLoading);
    return unsubscribe;
  }, []);

  const { isReading, isWriting } = loading;

  if (!isReading && !isWriting) {
    return null;
  }

  return (
    <>
      {/* Top linear progress bar for background read/GET requests */}
      {isReading && !isWriting && (
        <div className="br-loader-bar" role="progressbar" aria-label="Loading content..." />
      )}

      {/* Full-screen glassmorphic overlay for write/POST/PUT/DELETE requests */}
      {isWriting && (
        <div className="br-loader-overlay" role="alert" aria-busy="true" aria-live="polite">
          <div className="br-loader-content">
            <div className="br-loader-badge">
              <span className="br-loader-ring" />
              <span className="br-loader-text">BR</span>
            </div>
            <div className="br-loader-title">BR Bullion</div>
            <div className="br-loader-subtitle">Securing transaction...</div>
          </div>
        </div>
      )}
    </>
  );
};

export default BRLoader;
