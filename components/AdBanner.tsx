"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
  /** ✏️ Replace with your real Ad Slot ID from Google AdSense */
  adSlot: string;
  /** ✏️ Replace with your real Publisher ID  e.g. ca-pub-XXXXXXXXXXXXXXXXX */
  adClient?: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
}

export default function AdBanner({
  adSlot,
  adClient = "ca-pub-XXXXXXXXXXXXXXXXX", // ✏️ Replace with your Publisher ID
  adFormat = "auto",
  fullWidthResponsive = true,
  style,
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      // Only push when the AdSense script has loaded
      if (typeof window !== "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        pushed.current = true;
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div
      className="w-full overflow-hidden rounded-xl"
      style={{ minHeight: 100, background: "var(--fb-bg)", border: "1px solid var(--fb-border)", ...style }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={String(fullWidthResponsive)}
      />
    </div>
  );
}
