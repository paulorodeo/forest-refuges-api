import { useEffect, useRef } from "react";

const CLIENT = "ca-pub-5061534320708000";
const SLOT = "6646033851";
const SCRIPT_ID = "adsense-script";
const SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;

function ensureAdSenseScript(): void {
  if (document.getElementById(SCRIPT_ID)) return;
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = SCRIPT_SRC;
  document.head.appendChild(script);
}

/** Client-only article ad. The fixed container reserves space before AdSense fills it. */
export function AdSenseSlot() {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      const ads = ((window as Window & { adsbygoogle?: unknown[] }).adsbygoogle ??= []);
      ads.push({});
      ensureAdSenseScript();
    } catch {
      // Ad blockers and unavailable third-party scripts must not affect the article.
      console.warn("[adsense] não foi possível preparar o anúncio do artigo");
    }
  }, []);

  return (
    <div className="mx-auto min-h-[250px] max-w-3xl px-4 pb-12" aria-label="Publicidade">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-ad-client={CLIENT}
        data-ad-slot={SLOT}
      />
    </div>
  );
}
