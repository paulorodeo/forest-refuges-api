import { useEffect, useRef, useState } from "react";
import { fetchElfsightWidget, type ElfsightWidgetId } from "@/lib/elfsight.functions";

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
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const readyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const portalId = `portal-${id}`;
    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled && !readyRef.current) setFailed(true);
    }, 15_000);

    void fetchElfsightWidget({ data: { id } })
      .then(async (config) => {
        if (!config || !host.current || cancelled) throw new Error("Elfsight widget unavailable");
        const element = host.current;
        const options = JSON.parse(config.optionsJson) as Record<string, unknown>;
        element.className = "elfsight-widget-whatsapp-chat elfsight-widget";
        element.setAttribute("data-elfsight-whatsapp-chat-options", encodeURIComponent(config.optionsJson));
        element.setAttribute("data-elfsight-whatsapp-chat-version", config.version);
        element.setAttribute("data-elfsight-widget-id", `elfsight-whatsapp-chat-${id}`);
        await loadScript(config.scriptUrl);
        if (cancelled || !host.current) return;
        const init = window.eappsWhatsappChat;
        if (typeof init !== "function") throw new Error("Elfsight runtime unavailable");
        init(element, options);
        // The plugin renders in a named portal. It proves the runtime initialized without
        // depending on a copied widget DOM or a hard-coded panel configuration.
        window.setTimeout(() => {
          if (!cancelled && document.getElementById(portalId)) {
            readyRef.current = true;
            setReady(true);
          }
        }, 250);
      })
      .catch(() => { if (!cancelled) setFailed(true); });

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      document.getElementById(portalId)?.remove();
    };
  }, [id]);

  return (
    <div className="mt-6" data-cnf-elfsight-widget={id}>
      <div ref={host} />
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
