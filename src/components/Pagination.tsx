type PaginationProps = {
  page: number;
  totalPages: number;
  pathname: string;
  search?: Record<string, string | undefined>;
};

function hrefFor(pathname: string, search: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) if (value) params.set(key, value);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function Pagination({ page, totalPages, pathname, search = {} }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from(new Set([1, page - 1, page, page + 1, totalPages].filter((n) => n >= 1 && n <= totalPages)));
  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Paginação">
      {page > 1 && <a className="rounded border px-3 py-2 text-sm hover:border-primary" href={hrefFor(pathname, search, page - 1)}>Anterior</a>}
      {pages.map((item, index) => (
        <span key={item} className="contents">
          {index > 0 && pages[index - 1] !== item - 1 && <span aria-hidden="true" className="px-1">…</span>}
          <a aria-current={item === page ? "page" : undefined} className={item === page ? "rounded bg-primary px-3 py-2 text-sm text-primary-foreground" : "rounded border px-3 py-2 text-sm hover:border-primary"} href={hrefFor(pathname, search, item)}>{item}</a>
        </span>
      ))}
      {page < totalPages && <a className="rounded border px-3 py-2 text-sm hover:border-primary" href={hrefFor(pathname, search, page + 1)}>Próxima</a>}
    </nav>
  );
}
