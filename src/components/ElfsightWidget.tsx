import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchElfsightWidget,
  type ElfsightWidgetConfig,
  type ElfsightWidgetId,
} from "@/lib/elfsight.functions";

const SCRIPT_ATTRIBUTE = "data-cnf-elfsight-whatsapp-chat";
let scriptPromise: Promise<void> | undefined;

declare global {
  interface Window {
    eappsWhatsappChat?: (element: Element, options: Record<string, unknown>) => unknown;
  }
}

function loadScript(src: string) {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[${SCRIPT_ATTRIBUTE}]`);
    if (existing) {
      if (existing.dataset["loaded"] === "true") resolve();
      else {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Elfsight script failed to load")), { once: true });
      }
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.setAttribute(SCRIPT_ATTRIBUTE, "true");
    script.addEventListener("load", () => { script.dataset["loaded"] = "true"; resolve(); }, { once: true });
    script.addEventListener("error", () => reject(new Error("Elfsight script failed to load")), { once: true });
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function ElfsightWidget({ id, fallbackWhatsApp = false }: { id: ElfsightWidgetId; fallbackWhatsApp?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const widgetElement = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<ElfsightWidgetConfig | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const readyRef = useRef(false);

  useEffect(() => {
    setConfig(null);
    setReady(false);
    setFailed(false);
    readyRef.current = false;
    void fetchElfsightWidget({ data: { id } })
      .then((nextConfig) => {
        if (!nextConfig) throw new Error("Elfsight widget unavailable");
        setConfig(nextConfig);
      })
      .catch(() => setFailed(true));
  }, [id]);

  const options = useMemo(
    () => config ? JSON.parse(config.optionsJson) as Record<string, unknown> : null,
    [config],
  );
  const widgetId = typeof options?.["widgetId"] === "string" ? options["widgetId"] : null;
  const portalId = widgetId ? `portal-${widgetId}` : null;
  // Widget 10 is embedded in a responsive content column. The legacy runtime defaults an
  // unspecified embed width to 400px, which overflows a 390px viewport; content settings
  // remain managed by WordPress while this layout constraint follows its container.
  const runtimeOptions = useMemo(
    () => id === 10 && options ? { ...options, width: "100%" } : options,
    [id, options],
  );

  useEffect(() => {
    if (!config || !runtimeOptions || !widgetElement.current) return;
    let cancelled = false;
    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled && !readyRef.current) setFailed(true);
    }, 15_000);

    const element = widgetElement.current;
    element.className = "elfsight-widget-whatsapp-chat elfsight-widget";
    element.setAttribute("data-elfsight-whatsapp-chat-options", encodeURIComponent(config.optionsJson));
    element.setAttribute("data-elfsight-whatsapp-chat-version", config.version);
    element.setAttribute("data-elfsight-widget-id", `elfsight-whatsapp-chat-${id}`);
    void loadScript(config.scriptUrl)
      .then(() => {
        if (cancelled || !widgetElement.current) return;
        const init = window.eappsWhatsappChat;
        if (typeof init !== "function") throw new Error("Elfsight runtime unavailable");
        init(element, runtimeOptions);
        window.setTimeout(() => {
          if (!cancelled && portalId && document.getElementById(portalId)) {
            readyRef.current = true;
            setReady(true);
          }
        }, 250);
      })
      .catch(() => { if (!cancelled) setFailed(true); });

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      if (portalId) document.getElementById(portalId)?.remove();
    };
  }, [config, id, portalId, runtimeOptions]);

  return (
    <div className="mt-6" data-cnf-elfsight-widget={id}>
      <div ref={host}>
        <div ref={widgetElement} />
        {/* The local plugin uses its configured widgetId to name the portal. Supplying the
            same portal inside this host keeps Widget 10 embedded instead of appending it to body. */}
        {id === 10 && portalId && (
          <div
            id={portalId}
            className={`eapp-whatsapp-chat-root-layout-component eapps-whatsapp-chat-${widgetId}-custom-css-hook`}
            style={{ width: "100%", maxWidth: "100%", minWidth: 0 }}
            data-cnf-elfsight-embed-portal
          />
        )}
      </div>
      {fallbackWhatsApp && failed && !ready && (
        <a
          href="https://wa.me/556540426464"
          className="inline-flex w-full items-center justify-center rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          Falar pelo WhatsApp
        </a>
      )}
    </div>
  );
}
