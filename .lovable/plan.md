# P0 — Origem WordPress, navegação e resiliência

## Diagnóstico confirmado

- **Conexão existente:** “Casa's WordPress (self-hosted)” respondeu HTTP 200 pelo conector. Ela será preservada, sem novas credenciais ou autenticação. O conector está disponível no workspace, mas consta como **não vinculado ao projeto**; o app atual usa a API pública diretamente.
- **Origem atual:** está hardcoded em `src/lib/wp.server.ts` como `https://www.casanafloresta.com.br/wp-json/wp/v2`.
- **URLs hardcoded:** esse é o único literal do domínio em `src/`. Porém, o canonical e o botão “Falar com o anunciante” usam `p.link` vindo do WordPress; após a mudança, isso pode apontar para `portal.` e precisa ser normalizado para `www.`.
- **Links internos:** a navegação normal usa corretamente o `Link` do router. Os únicos `<a>` internos são recarga de emergência nas telas de erro; o outro `<a>` é o link externo do anunciante.
- **Causa provável do congelamento:** os loaders aguardam a API antes de concluir a troca de página; não existe indicador global, prefetch por intenção nem timeout. As consultas de termos ocorrem antes da listagem e aumentam a espera.
- **Tempos medidos hoje:** `/types` 4,97 s; `/property_type` 6,48 s; `/posts` 9,55 s; `/properties` com 12 itens e `_embed` 14,98 s. A listagem é o maior bloqueio observado.
- **Problema no domínio legado:** `https://portal.casanafloresta.com.br` responde 301 para `http://www.portal.casanafloresta.com.br`; o destino HTTPS falhou no teste. Isso deve ser corrigido na hospedagem/Cloudflare, embora o conector atual tenha respondido.
- **Cache atual:** somente memória por 5 minutos; sem stale-while-revalidate, deduplicação, timeout ou cache antigo em caso de falha.
- **Fallbacks atuais:** `ContentType` não participa da decisão; `locationSlug` é ignorado; artigo, destino, agente, depoimento e categoria não têm fallback próprio; a galeria só é considerada manualmente na página do imóvel.

## Arquitetura futura preservada

- `BlogPost`: `id`, `source`, `legacyWordPressId`, `slug`, `title`, `excerpt`, `content`, `featuredImage`, `author`, `publishedAt`, `updatedAt`, `categories`, `tags`, `seo`, `canonical`, `status`. `WordPressBlogAdapter` e `PayloadBlogAdapter` entregarão o mesmo modelo; Payload vence duplicatas.
- `Property`: modelo normalizado com `source`, `legacyWordPressId`, identidade, preço, localização, imagens, finalidade, características e SEO. `WordPressPropertyAdapter` esconderá os campos Houzez; `PayloadPropertyAdapter` entregará o mesmo contrato; Payload vence duplicatas.
- Blog e dual-source de imóveis ficam preparados conceitualmente agora, mas sua implementação permanece em P1/P2 conforme solicitado.

## Implementação P0

1. **Configuração central**
   - Criar configuração única com `PUBLIC_SITE_URL`, `WORDPRESS_ORIGIN` e espaço para `PAYLOAD_ORIGIN`.
   - Usar `https://portal.casanafloresta.com.br` somente como origem de dados e `https://www.casanafloresta.com.br` para URLs públicas/canônicas.
   - Normalizar links públicos retornados pelo WordPress para o domínio `www.`.

2. **Fetch resiliente do WordPress**
   - Substituir o cache simples por cache fresh/stale: servir entradas frescas imediatamente; servir cache ainda válido imediatamente e revalidar em segundo plano quando estiver stale.
   - Deduplicar requisições idênticas em andamento.
   - Adicionar timeout explícito, erro classificado e fallback para cache stale quando a revalidação falhar.
   - Instrumentar endpoint, duração, status e `hit`, `stale`, `miss` ou `deduped`, sem registrar dados sensíveis.
   - Resolver consultas independentes de taxonomias em paralelo e manter listagens paginadas e enxutas.

3. **Navegação com resposta imediata**
   - Ativar preload por intenção nos links.
   - Adicionar uma barra global de progresso no topo, visível quase imediatamente durante transições.
   - Definir limites de cache do router para não recarregar a mesma listagem a cada retorno recente.
   - Manter os links internos no router e os links realmente externos como `<a>`.

4. **Validação**
   - Confirmar home, categoria, busca e detalhe no navegador.
   - Medir uma primeira navegação e uma repetida para verificar feedback imediato e cache.
   - Conferir que canonicals usam `www.` e nenhuma chamada de API usa `www.` como origem.

## Primeiros arquivos

- `src/lib/site-config.ts` — configuração central de domínios.
- `src/lib/wp.server.ts` — origem, cache SWR, deduplicação, timeout, instrumentação e canonicals normalizados.
- `src/components/NavigationProgress.tsx` — feedback global.
- `src/routes/__root.tsx` e `src/router.tsx` — montagem do indicador, preload e política de cache da navegação.
- `roadmap.md` — registrar P0 concluído e manter P1/P2 pendentes.

## Fora deste P0

- Não vincular, substituir ou recriar a conexão WordPress.
- Não implementar Payload, Blog ou migração de registros ainda.
- Não reconstruir a homepage, criar páginas fracas ou alterar a estratégia de tipos prioritários.
- Não apagar URLs antigas.
