import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/tipos-de-imoveis-rurais", label: "Imóveis" },
  { to: "/regioes", label: "Regiões" },
  { to: "/temporada", label: "Temporada" },
  { to: "/blog", label: "News" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-[#FFFFFF] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          to="/"
          className="flex shrink-0 items-center"
          aria-label="Casa na Floresta — página inicial"
        >
          <picture>
            <source
              srcSet="/brand/casa-na-floresta-logo.avif"
              type="image/avif"
            />
            <source srcSet="/brand/casa-na-floresta-logo.webp" type="image/webp" />
            <img
              src="/brand/casa-na-floresta-logo.png"
              alt="Casa na Floresta"
              width={215}
              height={60}
              className="h-8 w-auto sm:h-10"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Tipos de refúgio">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-foreground/80 transition-colors hover:text-primary"
              activeProps={{ className: "text-sm text-primary font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://wa.me/556540426464"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 md:inline-flex"
          >
            Anuncie
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-md border border-border p-2 md:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-[#FFFFFF] px-4 py-3 md:hidden" aria-label="Menu">
          <ul className="flex flex-col gap-1">
            {nav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-2 text-sm text-foreground/85 hover:bg-secondary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li><a href="https://wa.me/556540426464" target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="mt-1 block rounded-md bg-accent px-3 py-2 text-center text-sm font-medium text-accent-foreground">Anuncie</a></li>
          </ul>
        </nav>
      )}
    </header>
  );
}
