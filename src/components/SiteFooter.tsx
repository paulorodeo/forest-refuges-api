import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-forest text-forest-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-lg">Casa na Floresta</p>
          <p className="mt-3 text-sm text-forest-foreground/75">
            Portal de refúgios no campo: chácaras, sítios, chalés e casas de temporada para morar,
            descansar e investir.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider">Imóveis</h2>
          <ul className="mt-3 space-y-2 text-sm text-forest-foreground/80">
            <li>
              <Link to="/chacaras" search={{ page: 1 }} className="hover:underline">
                Chácaras
              </Link>
            </li>
            <li>
              <Link to="/sitios" search={{ page: 1 }} className="hover:underline">
                Sítios
              </Link>
            </li>
            <li>
              <Link to="/chales" search={{ page: 1 }} className="hover:underline">
                Chalés e cabanas
              </Link>
            </li>
            <li>
              <Link to="/pesqueiros" search={{ page: 1 }} className="hover:underline">
                Pesqueiros
              </Link>
            </li>
            <li>
              <Link to="/tipos-de-imoveis-rurais" className="hover:underline">
                Todos os tipos
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider">Finalidade</h2>
          <ul className="mt-3 space-y-2 text-sm text-forest-foreground/80">
            <li>
              <Link to="/busca" search={{ finalidade: "compra-e-venda" }} className="hover:underline">
                Comprar
              </Link>
            </li>
            <li>
              <Link to="/temporada" search={{ page: 1 }} className="hover:underline">
                Temporada
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider">Sobre</h2>
          <p className="mt-3 text-sm text-forest-foreground/75">
            Anúncios publicados e mantidos no painel do Casa na Floresta. Informações de área,
            valores e documentação devem ser confirmadas com o anunciante.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-forest-foreground/60">
        © {new Date().getFullYear()} Casa na Floresta. Todos os direitos reservados.
      </div>
    </footer>
  );
}
