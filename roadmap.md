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


## Aberto / dependente do usuário
- [ ] Camada "Objetivo" (moradia, lazer, produção, investimento, turismo, eventos): não existe no WordPress. Aguarda decisão (criar taxonomia no WP x deduzir x adiar).
- [ ] Comodidades: lista atual poluída (espanhol/inglês) e quase sem uso. Fase 1 mostra apenas as com imóveis reais; recadastro no WP pendente.
- [ ] Conexão autenticada ao WordPress (senha de aplicativo) para dados privados/rascunhos — cartão de conexão recusado; hoje usamos só a API pública.
- [ ] Redirects 301 das URLs antigas (/chacaras/ hoje responde 301 no WP; demais tipos 404).

## Fase 2
- [ ] Serviços (anunciar, regularização, avaliação, georreferenciamento)
- [ ] Conteúdo editorial (guias, mercado, turismo rural, documentação, notícias)
- [ ] Páginas de cidade/região
