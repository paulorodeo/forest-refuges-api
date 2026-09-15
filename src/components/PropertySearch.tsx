import { Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function PropertySearch({ defaultValue = "", context }: { defaultValue?: string; context?: string }) {
  const navigate = useNavigate();
  return <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(event) => { event.preventDefault(); const value = new FormData(event.currentTarget).get("q"); navigate({ to: "/busca", search: typeof value === "string" && value ? { q: value } : {} }); }}>
    <label className="sr-only" htmlFor="property-search">Onde você procura?</label>
    <input id="property-search" name="q" defaultValue={defaultValue} placeholder={context ?? "Cidade, região ou tipo de imóvel"} className="w-full rounded-md border border-input bg-card px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
    <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-foreground"><Search className="size-4" aria-hidden="true" />Buscar imóveis</button>
  </form>;
}
