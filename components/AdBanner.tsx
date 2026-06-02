"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
  /** ✏️ Replace with your real Ad Slot ID from Google AdSense */
  adSlot: string;
  /** ✏️ Replace with your real Publisher ID  e.g. ca-pub-1550416832618336 */
  adClient?: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
}

export default function AdBanner({
  adSlot,
  adClient = "ca-pub-1550416832618336", // ✏️ Replace with your Publisher ID
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
    // Transparent, borderless wrapper: an unfilled AdSense unit collapses to
    // zero height, so empty ad space stays invisible instead of rendering a
    // broken-looking empty box. The ad fills this in once it serves.
    <div className="w-full overflow-hidden" style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", width: "100%", ...style }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={String(fullWidthResponsive)}
      />
    </div>
  );
}
