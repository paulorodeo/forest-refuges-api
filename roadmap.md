# Casa na Floresta — Roadmap

## Rebaseline 13/09/2026
- [x] Auditar, sem implementar, URLs editoriais, mocks/hardcodes, referências a vídeos removidos, mídia e conflitos de rotas; apresentar diagnóstico e plano para aprovação
- [ ] Fase 1: inventário longo de posts/pages e colisões cancelado pelo usuário; ficará para Codex
- [ ] Fase 2: aguardar aprovação antes de restaurar artigos em `/{slug}/` e redirecionar `/blog/{slug}`

## Etapa 1 — estabilidade e marca
- [x] Garantir que falhas/timeout do WordPress não causem 5xx acidental ou SSR vazio nas rotas públicas principais
- [x] Substituir o favicon Lovable por um ativo existente da marca Casa na Floresta
- [x] Validar tipos e comportamento público sem alterar URLs `/blog/{slug}`

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
- [x] P0 de arquitetura: atualizar origem WordPress centralizada para `www2.`, mantendo URLs públicas em `www.`
- [x] P0 de desempenho: cache fresh/stale, revalidação em segundo plano, deduplicação e timeout
- [x] P0 de navegação: preload por intenção e barra global de progresso
- [x] P0 de diagnóstico: logs de endpoint, duração, status e estado do cache
- [x] P0 de resiliência: listagens não retornam erro 500 quando o WordPress expira sem cache
- [x] P0 mobile: descoberta imediata da imagem LCP, preload/eager/high priority e imagens responsivas
- [ ] P0 mobile: reduzir bloqueio de fontes/CSS e medir Lighthouse mobile antes/depois
- [x] P0 mobile: auditar cache das imagens externas em `ausente.casanafloresta.com.br` (correção depende da origem/Cloudflare)


## Aberto / dependente do usuário
- [ ] Camada "Objetivo" (moradia, lazer, produção, investimento, turismo, eventos): não existe no WordPress. Aguarda decisão (criar taxonomia no WP x deduzir x adiar).
- [ ] Comodidades: lista atual poluída (espanhol/inglês) e quase sem uso. Fase 1 mostra apenas as com imóveis reais; recadastro no WP pendente.
- [ ] Redirects 301 das URLs antigas (/chacaras/ hoje responde 301 no WP; demais tipos 404).

## Fase 2
- [ ] Serviços (anunciar, regularização, avaliação, georreferenciamento)
- [x] Conteúdo editorial: News em `/blog`, artigo individual, cards e 3 posts recentes na home
- [x] Blog normalizado: WordPressBlogAdapter + PayloadBlogAdapter → BlogPost, com prioridade futura do Payload
- [x] Blog resiliente: cache fresh/stale, deduplicação, timeout, logs e resposta degradada sem HTTP 500
- [x] Reescrita seletiva: normalizar apenas permalinks públicos, preservando uploads, mídia, REST, CDN e Object Storage
- [x] Auditar permalinks históricos dos posts e definir URL canônica única com redirects 301 exatos quando necessários
- [x] Detalhes sem stale: resposta controlada de indisponibilidade, sem 200 enganoso, 500 acidental ou Error Boundary global
- [x] Auditoria editorial determinística: distinguir importações automáticas de vídeos de posts legítimos, sem excluir apenas por `videos-youtube`
- [x] Relatório editorial: 1.220 brutos; 1.088 na categoria; 999 automáticos; 89 legítimos nela; corpus final estimado em 221
- [x] SEO editorial: canonical público, Open Graph, BlogPosting e breadcrumbs estruturados
- [x] Fallback editorial específico usando `contentType: "article"`
- [ ] Imóveis dual-source: WordPressPropertyAdapter + PayloadPropertyAdapter → Property
- [ ] Fallbacks específicos por ContentType e destino
- [ ] Páginas de cidade/região
