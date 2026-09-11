# WordPress www2 + Blog / News

## Diagnóstico confirmado

- A origem ativa ainda é `portal.casanafloresta.com.br`, centralizada em `src/lib/site-config.ts`; não há referência ativa a `app.casanafloresta.com.br`.
- A nova REST API respondeu em `https://www2.casanafloresta.com.br/wp-json/wp/v2/posts`: há **1.220 posts**. A consulta de 1 post levou cerca de **8,45 s** e a de 3 posts com `_embed` cerca de **3,54 s**; a raiz `/wp-json/` excedeu 25 s em uma tentativa.
- As listagens de imóveis já retornam um estado seguro quando o WordPress falha. O fetch compartilhado tem cache fresh de 5 min, stale de 24 h, deduplicação, timeout de 8 s e logs; detalhes de imóvel ainda podem propagar falha e serão protegidos.
- Não existe implementação ativa de Blog. O padrão de metadata dinâmica e canonical já existe na página individual de imóvel.

## Implementação

1. **Configuração e resiliência**
   - Atualizar a configuração central para `WORDPRESS_ORIGIN=https://www2.casanafloresta.com.br`, preservando `PUBLIC_SITE_URL=https://www.casanafloresta.com.br` e o espaço para Payload.
   - Remover referências ativas a `portal.` e normalizar URLs retornadas pelo WordPress para o domínio público.
   - Consolidar o cliente REST resiliente para imóveis e blog: fresh/stale cache, revalidação em segundo plano, deduplicação, timeout, fallback stale após falha e logs de duração/status/cache.
   - Garantir respostas degradadas tipadas para listas e detalhes, sem levar indisponibilidade do WordPress ao erro global.

2. **Domínio editorial e adapters**
   - Criar o modelo normalizado `BlogPost` e resultados paginados com estado de indisponibilidade.
   - Criar `WordPressBlogAdapter`, mapeando posts reais com `_embed` para imagem, autor, categorias, tags e Yoast sem N+1.
   - Criar o contrato `PayloadBlogAdapter` e o agregador preparado para mesclar fontes; quando ativado, Payload substituirá duplicatas por `legacyWordPressId` e depois por slug.
   - Expor a leitura por server functions, mantendo a UI independente do JSON do WordPress.

3. **Imagens e componentes**
   - Gerar uma imagem editorial própria e integrar `contentType: "article"` à resolução central de fallback.
   - Criar `BlogPostCard` reutilizável com imagem, categoria, título, resumo limpo, autor e data, com limites visuais consistentes.
   - Reutilizar cabeçalho, rodapé, tokens e estilos de conteúdo já existentes; adicionar somente `News → /blog` ao menu.

4. **Rotas e SEO**
   - Criar `/blog` com breadcrumb, destaque, grid real, categorias disponíveis, paginação e CTA relacionado.
   - Criar `/blog/$slug` preservando o slug legado, com conteúdo completo, relacionados, CTA, canonical em `www.`, metadata social, `BlogPosting` e breadcrumbs em JSON-LD.
   - Adicionar três conteúdos recentes na home usando o mesmo card, sem redesenhar as demais seções.

5. **Validação**
   - Verificar `/`, `/blog` e um artigo real em desktop e mobile.
   - Confirmar que chamadas usam `www2.`, enquanto canonicals e links públicos usam `www.`.
   - Simular upstream lento/indisponível e confirmar HTTP 200, estado degradado, ausência de tela branca e ausência de erro global.
   - Medir chamadas frias e aquecidas e registrar no relatório final os endpoints, quantidade de posts e tempos observados.

## Arquivos principais

- Alterar: `src/lib/site-config.ts`, `src/lib/wp.server.ts`, `src/lib/fallback-images.ts`, `src/components/SiteHeader.tsx`, `src/routes/index.tsx`, `roadmap.md`.
- Criar: modelo/adapters/funções de blog, `BlogPostCard`, `/blog`, `/blog/$slug` e fallback editorial.
- Não alterar: estrutura das páginas imobiliárias, filtros, identidade global ou conexão/autenticação existente.