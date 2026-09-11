# Casa na Floresta — Roadmap

## Fase 1
- [x] Auditoria da API pública do WordPress (tipos, situações, regiões, campos, Yoast)
- [x] Design system (verde, terracota, areia, títulos serifados)
- [x] Adapter WordPress (server functions, sem credenciais — API pública, cache 5 min)
- [x] Home: hero + busca + tipos + "por que comprar" + últimos imóveis
- [x] Páginas fortes: /chacaras, /sitios, /chales, /temporada, /pesqueiros
- [x] Agregadora: /tipos-de-imoveis-rurais (demais tipos)
- [x] Página do imóvel: /imovel/$slug com SEO (Yoast + canonical para a URL atual)
- [x] Sistema de imagens de fallback por tipo (getFallbackImage)
- [x] Busca: /busca com palavra-chave e finalidade
- [x] P0 de arquitetura: origem WordPress centralizada em `portal.`, URLs públicas em `www.`
- [x] P0 de desempenho: cache fresh/stale, revalidação em segundo plano, deduplicação e timeout
- [x] P0 de navegação: preload por intenção e barra global de progresso
- [x] P0 de diagnóstico: logs de endpoint, duração, status e estado do cache


## Aberto / dependente do usuário
- [ ] Camada "Objetivo" (moradia, lazer, produção, investimento, turismo, eventos): não existe no WordPress. Aguarda decisão (criar taxonomia no WP x deduzir x adiar).
- [ ] Comodidades: lista atual poluída (espanhol/inglês) e quase sem uso. Fase 1 mostra apenas as com imóveis reais; recadastro no WP pendente.
- [ ] Corrigir no WordPress/Cloudflare o redirecionamento de `https://portal.` para `http://www.portal.`; o conector atual responde, mas o domínio público da API está mal redirecionado.
- [ ] Redirects 301 das URLs antigas (/chacaras/ hoje responde 301 no WP; demais tipos 404).

## Fase 2
- [ ] Serviços (anunciar, regularização, avaliação, georreferenciamento)
- [ ] Conteúdo editorial (guias, mercado, turismo rural, documentação, notícias)
- [ ] Blog normalizado: WordPressBlogAdapter + PayloadBlogAdapter → BlogPost
- [ ] Imóveis dual-source: WordPressPropertyAdapter + PayloadPropertyAdapter → Property
- [ ] Fallbacks específicos por ContentType e destino
- [ ] Páginas de cidade/região
