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
- [ ] P0 de arquitetura: atualizar origem WordPress centralizada para `www2.`, mantendo URLs públicas em `www.`
- [x] P0 de desempenho: cache fresh/stale, revalidação em segundo plano, deduplicação e timeout
- [x] P0 de navegação: preload por intenção e barra global de progresso
- [x] P0 de diagnóstico: logs de endpoint, duração, status e estado do cache
- [x] P0 de resiliência: listagens não retornam erro 500 quando o WordPress expira sem cache
- [ ] P0 mobile: descoberta imediata da imagem LCP, preload/eager/high priority e imagens responsivas
- [ ] P0 mobile: reduzir bloqueio de fontes/CSS e medir Lighthouse mobile antes/depois
- [ ] P0 mobile: auditar cache das imagens externas em `ausente.casanafloresta.com.br`


## Aberto / dependente do usuário
- [ ] Camada "Objetivo" (moradia, lazer, produção, investimento, turismo, eventos): não existe no WordPress. Aguarda decisão (criar taxonomia no WP x deduzir x adiar).
- [ ] Comodidades: lista atual poluída (espanhol/inglês) e quase sem uso. Fase 1 mostra apenas as com imóveis reais; recadastro no WP pendente.
- [ ] Redirects 301 das URLs antigas (/chacaras/ hoje responde 301 no WP; demais tipos 404).

## Fase 2
- [ ] Serviços (anunciar, regularização, avaliação, georreferenciamento)
- [ ] Conteúdo editorial: News em `/blog`, artigo individual, cards e 3 posts recentes na home
- [ ] Blog normalizado: WordPressBlogAdapter + PayloadBlogAdapter → BlogPost, com prioridade futura do Payload
- [ ] Blog resiliente: cache fresh/stale, deduplicação, timeout, logs e resposta degradada sem HTTP 500
- [ ] Reescrita seletiva: normalizar apenas permalinks públicos, preservando uploads, mídia, REST, CDN e Object Storage
- [ ] Auditar permalinks históricos dos posts e definir URL canônica única com redirects 301 exatos quando necessários
- [ ] Detalhes sem stale: resposta controlada de indisponibilidade, sem 200 enganoso, 500 acidental ou Error Boundary global
- [ ] Auditoria editorial determinística: distinguir importações automáticas de vídeos de posts legítimos, sem excluir apenas por `videos-youtube`
- [ ] Relatório editorial: totais bruto, taxonomia, importados automáticos, legítimos dentro da taxonomia, assinatura e corpus final
- [ ] SEO editorial: canonical público, Open Graph, BlogPosting e breadcrumbs estruturados
- [ ] Fallback editorial específico usando `contentType: "article"`
- [ ] Imóveis dual-source: WordPressPropertyAdapter + PayloadPropertyAdapter → Property
- [ ] Fallbacks específicos por ContentType e destino
- [ ] Páginas de cidade/região
