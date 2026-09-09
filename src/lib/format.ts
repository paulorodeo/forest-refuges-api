export function formatPrice(price: number | null, postfix?: string | null): string {
  if (!price) return "Valor sob consulta";
  const value = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(price);
  return postfix ? `${value} · ${postfix}` : value;
}

export function formatSize(size: number | null): string | null {
  if (!size) return null;
  return `${new Intl.NumberFormat("pt-BR").format(size)} m²`;
}

export function formatLocation(city: string | null, state: string | null): string {
  return [city, state].filter(Boolean).join(", ") || "Localização a confirmar";
}
