'use client';

interface LockScreenProps {
  userId: number;    // 0 or user id
}

export default function LockScreen({ userId }: LockScreenProps) {
  return (
    <div className="lockNewsDetail">
      <div className="lockNewsOverly">&nbsp;</div>

      <div className="lockFlexSec">
        {/* Lock Icon */}
        <div className="lockNews_icon">
          <hr />
          <img
            className="lock_icon"
            src="/assets/images/lock-icon.svg"
            alt="Lock Icon"
          />
        </div>

        {/* Banner */}
        <div className="lockNews_banner">
          <img
            className="lock_banner"
            src="/assets/images/lockNews_banner.png"
            alt="Lock News Banner"
          />
        </div>

        {/* Message */}
        <div className="lockNews_line">
          {userId !== 0 ? (
            <>
              અધૂરું નહીં! વાંચો પૂરું! વાંચો પૂરા સમાચાર GSTV એપ પર{' '}
              <a href="/payment">વેબસાઇટ પર જ વાંચો</a>
            </>
          ) : (
            <>
              પ્રીમિયમ મેમ્બર શિપ હોય, તો{' '}
              <a href="/login">લોગીન કરો</a>
            </>
          )}
        </div>

        {/* Buy Now */}
        <div className="lockNews_line buynowlockbtn">
          <a href="/payment" tabIndex={0}>
            પ્લાન જુઓ
          </a>
        </div>

        {/* App Download */}
        <div className="lockNews_apps">
          <img
            className="lockQr_code_image"
            src="/assets/images/qr-code.png"
            alt="QR Code"
          />

          <div className="lockQr_code_right">
            <span className="appDownload_line">
              એપ ડાઉનલોડ કરવા માટે QR સ્કેન કરો
            </span>

            <a
              target="_blank"
              href="https://play.google.com/store/apps/details?id=com.tops.gstvapps"
              rel="noopener noreferrer"
            >
              <img
                className="lock_icon"
                src="/assets/images/playstore.svg"
                alt="Play Store"
              />
            </a>

            <a
              target="_blank"
              href="https://apps.apple.com/in/app/gstv-gujarat-samachar/id1609602449"
              rel="noopener noreferrer"
            >
              <img
                className="lock_icon"
                src="/assets/images/playstore-ios.svg"
                alt="App Store"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
