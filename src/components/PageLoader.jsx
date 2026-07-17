import React from 'react';

const PageLoader = () => (
  <div className="br-loader-overlay" role="alert" aria-busy="true" aria-live="polite">
    <div className="br-loader-content">
      <div className="br-loader-badge">
        <span className="br-loader-ring" />
        <span className="br-loader-text">BR</span>
      </div>
      <div className="br-loader-title">BR Bullion</div>
      <div className="br-loader-subtitle">Loading page...</div>
    </div>
  </div>
);

export default PageLoader;
