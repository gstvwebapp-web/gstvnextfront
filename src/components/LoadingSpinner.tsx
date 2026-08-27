interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  type?: 'spinner' | 'dots' | 'pulse';
  compact?: boolean; // New prop for compact mode
}

export default function LoadingSpinner({
  message = 'લોડ થઈ રહ્યું છે...',
  size = 'medium',
  color = '#850E00',
  type = 'spinner',
  compact = false
}: LoadingSpinnerProps) {
  const getSizeClass = () => {
    const baseClass = type === 'dots' ? 'loading-dots' :
                     type === 'pulse' ? 'loading-pulse' : 'loading-spinner';

    switch (size) {
      case 'small': return `${baseClass}-small`;
      case 'large': return `${baseClass}-large`;
      default: return baseClass;
    }
  };

  const renderLoader = () => {
    if (type === 'dots') {
      return (
        <div className="loading-dots-container">
          <div className="loading-dot" style={{ backgroundColor: color }}></div>
          <div className="loading-dot" style={{ backgroundColor: color }}></div>
          <div className="loading-dot" style={{ backgroundColor: color }}></div>
        </div>
      );
    }

    if (type === 'pulse') {
      return (
        <div
          className={getSizeClass()}
          style={{ backgroundColor: color }}
        ></div>
      );
    }

    // Default spinner
    return (
      <div
        className={getSizeClass()}
        style={{
          borderTopColor: color,
          borderRightColor: color
        }}
      ></div>
    );
  };

  return (
    <div className={compact ? "loading-container-compact" : "loading-container"}>
      {renderLoader()}
      {message && (
        <p className="loading-message custom-gujrati-font">
          {message}
        </p>
      )}
    </div>
  );
}
