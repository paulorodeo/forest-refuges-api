# WordPress www2 + Blog / News

## Diagnóstico confirmado

- A origem ativa ainda é `portal.casanafloresta.com.br`, centralizada em `src/lib/site-config.ts`; não há referência ativa a `app.casanafloresta.com.br`.
- A nova REST API respondeu em `https://www2.casanafloresta.com.br/wp-json/wp/v2/posts`: há **1.220 posts**. A consulta de 1 post levou cerca de **8,45 s** e a de 3 posts com `_embed` cerca de **3,54 s**; a raiz `/wp-json/` excedeu 25 s em uma tentativa.
- As listagens de imóveis já retornam um estado seguro quando o WordPress falha. O fetch compartilhado tem cache fresh de 5 min, stale de 24 h, deduplicação, timeout de 8 s e logs; detalhes de imóvel ainda podem propagar falha e serão protegidos.
- Não existe implementação ativa de Blog. O padrão de metadata dinâmica e canonical já existe na página individual de imóvel.
- A home já entrega o `<img>` principal no HTML renderizado, mas ele não declara `fetchpriority="high"`, `loading="eager"`, `srcset` ou `sizes`, e não há preload por rota. O JPEG atual tem cerca de 198 KB.
- As fontes Fraunces e DM Sans são carregadas por stylesheet externo no documento global, mantendo Google Fonts na cadeia crítica.

## Implementação

1. **Configuração e resiliência**
   - Atualizar a configuração central para `WORDPRESS_ORIGIN=https://www2.casanafloresta.com.br`, preservando `PUBLIC_SITE_URL=https://www.casanafloresta.com.br` e o espaço para Payload.
   - Remover referências ativas a `portal.` e normalizar somente permalinks públicos retornados pelo WordPress. Preservar origens reais de `/wp-content/uploads/`, imagens, REST, endpoints técnicos, Object Storage, CDN e arquivos estáticos.
   - Consolidar o cliente REST resiliente para imóveis e blog: fresh/stale cache, revalidação em segundo plano, deduplicação, timeout, fallback stale após falha e logs de duração/status/cache.
   - Garantir respostas degradadas tipadas sem levar indisponibilidade do WordPress ao erro global: listas sem stale mostram estado seguro; detalhe sem stale retorna uma indisponibilidade controlada e apropriada, nunca um 200 enganoso ou 500 acidental.

2. **P0 de performance mobile**
   - Tornar a imagem principal imediatamente prioritária no HTML inicial com `loading="eager"`, `fetchpriority="high"` e preload por rota apontando para exatamente o mesmo recurso.
   - Gerar variantes responsivas AVIF/WebP dos fallbacks principais e usar `srcset`/`sizes`; manter imagens abaixo da dobra em lazy loading.
   - Retirar Google Fonts da cadeia crítica por self-host apenas dos pesos usados, com `font-display: swap`, sem FOUC ou mudança da identidade visual.
   - Auditar o cache de imagens externas em `ausente.casanafloresta.com.br`; ajustar no código apenas o que estiver sob controle do frontend e registrar qualquer correção de origem/Cloudflare que dependa do usuário.
   - Medir novamente a home em perfil mobile e comparar LCP, FCP, Speed Index, TBT, CLS, recurso LCP, formato, tamanho e headers. Analytics permanecerá ativo e não bloqueante.

3. **Auditoria editorial antes do filtro**
   - Auditar diretamente `wp/v2/posts`, sem usar `/noticias/` como inventário e sem misturar o CPT `/imovel/` ao Blog.
   - Identificar a taxonomia `videos-youtube`, medir seus posts e detectar a assinatura estrutural real do importador por conteúdo, embeds/URLs/shortcodes, autor, datas e metadata exposta.
   - Tratar `videos-youtube` apenas como sinal. O adapter só excluirá um post quando sinais estruturais suficientes indicarem importação automática; o post `7-captacao-e-nutricao-de-leads` será usado como caso de proteção contra falso positivo.
   - Produzir os totais bruto, marcado pela taxonomia, automático, editorial legítimo dentro dela e corpus editorial estimado, sem classificação manual dos 1.220 registros.
   - Auditar a estrutura histórica dos permalinks diretamente nos registros. Definir uma única URL pública por artigo e redirects 301 exatos quando a URL histórica não puder ser preservada; não criar duplicidade com `/blog/$slug`.

4. **Domínio editorial e adapters**
   - Criar o modelo normalizado `BlogPost` e resultados paginados com estado de indisponibilidade.
   - Criar `WordPressBlogAdapter`, aplicando o filtro auditado e mapeando posts reais com `_embed` para imagem, autor, categorias, tags e Yoast sem N+1.
   - Criar o contrato `PayloadBlogAdapter` e o agregador preparado para mesclar fontes; quando ativado, Payload substituirá duplicatas por `legacyWordPressId` e depois por slug.
   - Expor a leitura por server functions, mantendo a UI independente do JSON do WordPress.

5. **Imagens e componentes**
   - Gerar uma imagem editorial própria e integrar `contentType: "article"` à resolução central de fallback.
   - Criar `BlogPostCard` reutilizável com imagem, categoria, título, resumo limpo, autor e data, com limites visuais consistentes.
   - Reutilizar cabeçalho, rodapé, tokens e estilos de conteúdo já existentes; adicionar somente `News → /blog` ao menu.

6. **Rotas e SEO**
   - Criar `/blog` com breadcrumb, destaque, grid real, categorias disponíveis, paginação e CTA relacionado.
   - Criar a rota individual segundo o resultado da auditoria de permalinks, com conteúdo completo, relacionados, CTA, canonical único em `www.`, metadata social, `BlogPosting` e breadcrumbs em JSON-LD.
   - Adicionar três conteúdos recentes na home usando o mesmo card, sem redesenhar as demais seções.

7. **Validação**
   - Verificar `/`, `/blog` e um artigo real em desktop e mobile.
   - Confirmar que chamadas usam `www2.`, enquanto canonicals e links públicos usam `www.`.
   - Simular upstream lento/indisponível e confirmar HTTP 200, estado degradado, ausência de tela branca e ausência de erro global.
   - Medir chamadas frias e aquecidas e registrar no relatório final os endpoints, quantidade de posts e tempos observados.
   - Reexecutar auditoria mobile da home publicada quando a nova versão estiver disponível; métricas de campo dependem de nova coleta real e não mudam imediatamente.

## Arquivos principais

- Alterar: `src/lib/site-config.ts`, `src/lib/wp.server.ts`, `src/lib/fallback-images.ts`, `src/components/SiteHeader.tsx`, `src/routes/index.tsx`, `roadmap.md`.
- Criar: modelo/adapters/funções de blog, `BlogPostCard`, `/blog`, `/blog/$slug`, fallback editorial, fontes locais e variantes responsivas dos fallbacks necessários.
- Não alterar: estrutura das páginas imobiliárias, filtros, identidade global ou conexão/autenticação existente.