interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
  retryText?: string;
}

export default function ErrorMessage({ 
  error, 
  onRetry, 
  retryText = 'ફરી પ્રયાસ કરો' 
}: ErrorMessageProps) {
  return (
    <div className="blogs-main-section">
      <div className="error-message">
        <p className="custom-gujrati-font">ન્યૂઝ લોડ કરવામાં ભૂલ: {error}</p>
        {onRetry && (
          <button onClick={onRetry} className="retry-btn custom-gujrati-font">
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
}
