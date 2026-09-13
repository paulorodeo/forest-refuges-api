# Rebaseline editorial e de rotas — 13/09/2026

## Diagnóstico atual

### A. Onde o código assume `/blog/:slug`
- `src/lib/wp.server.ts`: `toBlogPost()` define `canonicalUrl` como `https://www.casanafloresta.com.br/blog/{slug}`.
- `src/components/BlogPostCard.tsx`: os cards apontam para `/blog/$slug`.
- `src/routes/blog.$slug.tsx`: a página individual existe em `/blog/$slug`, usa esse canonical e o inclui no `BlogPosting`.
- `src/routes/$slug.tsx`: a URL histórica na raiz consulta o post e faz redirect 301 para `/blog/$slug`.
- `src/routeTree.gen.ts`: confirma as duas rotas geradas; é arquivo automático e não deve ser editado.

### B. Mocks ou hardcodes de posts
- Não há posts, autores, títulos ou listas editoriais fictícias gravados no frontend.
- A home e o hub consultam posts reais pelo `WordPressBlogAdapter`.
- `PayloadBlogAdapter` é apenas um adapter vazio de preparação; não injeta conteúdo.
- O fallback editorial é somente uma imagem visual local, não um post substituto.

### C. Referências aos posts de vídeo removidos
- Ainda há lógica legada em `src/lib/wp.server.ts`: `hasYouTubeEmbed()` e `isAutomaticVideoImport()`.
- Ela reconhece categoria numérica `5`, URLs/embeds do YouTube, tamanho do texto e quantidade de títulos para omitir antigas importações.
- Não há conteúdo desses posts hardcoded nem rotina que os recrie.
- Como os posts foram removidos do CMS, essa regra ficou obsoleta e deve sair após confirmar a resposta atual da API.

### D. Resolução atual de imagens do WordPress
- Imagem destacada: usa, nesta ordem, `large.source_url`, `medium_large.source_url` e `source_url`, todos fornecidos pela API.
- Galeria de imóvel: consulta attachments pelos IDs registrados no imóvel e usa `large.source_url` ou `source_url` retornado pela API.
- Artigos e imóveis exibem essas URLs sem trocar sua origem.
- Na ausência de mídia válida no dado, o frontend usa fallback semântico por artigo, tipo de imóvel ou finalidade.
- O HTML editorial vindo do WordPress é renderizado como fornecido; referências de mídia dentro dele não são remontadas.

### E. Construção manual de URLs de mídia
- Não foi encontrada construção de URL para S3, Contabo, `wp-content/uploads` ou `ausente.casanafloresta.com.br`.
- `site-config.ts` exclui caminhos técnicos e arquivos da normalização de permalinks.
- `ausente.casanafloresta.com.br` não aparece no código ativo; se surgir no navegador, será consequência da resolução/redirecionamento feito pela infraestrutura WordPress.

### F. Rotas atuais
- Posts: hub `/blog`; detalhe `/blog/$slug`; rota raiz `/$slug` apenas redireciona posts históricos para `/blog/$slug`.
- Páginas institucionais do WordPress: não há adapter nem rota genérica implementados.
- Imóveis: detalhe `/imovel/$slug`; busca `/busca`.
- Categorias fortes: `/chacaras`, `/sitios`, `/chales`, `/temporada` e `/pesqueiros`.
- Demais tipos: `/tipos-de-imoveis-rurais`.
- Home: `/`.

### G. Mudanças necessárias para preservar `/{post-slug}/`
1. Transformar `src/routes/$slug.tsx` em página editorial real, em vez de redirect para `/blog/$slug`.
2. Definir canonical do artigo com base na URL pública histórica `/{slug}/` validada, sem alterar URLs de mídia.
3. Fazer cards, breadcrumbs e dados estruturados apontarem para `/$slug`.
4. Remover a rota pública duplicada `/blog/$slug` ou fazê-la redirecionar exatamente, via 301, para `/$slug`; não manter duas páginas indexáveis.
5. Auditar colisões antes da mudança: rotas estáticas têm precedência, mas slugs de posts que coincidam com `blog`, `busca`, `chacaras`, `sitios`, `chales`, `temporada`, `pesqueiros`, `tipos-de-imoveis-rurais` ou `imovel` exigem decisão explícita.
6. Diferenciar corretamente `not-found` de indisponibilidade do WordPress; posts removidos permanecem 404/410 pendentes de decisão, sem redirect inventado.
7. Auditar separadamente páginas legadas do WordPress na raiz antes de adicionar qualquer resolução genérica de páginas.

### H. Partes a manter intactas
- WordPress `www2` como fonte de verdade e frontend público em `www`.
- Adapter normalizado e fronteira desacoplada entre frontend e CMS.
- Cache fresh/stale, deduplicação, timeout e estados degradados sem erro 500 acidental.
- URLs de mídia entregues pela API e a cascata legada de mídia, sem construir URLs de storage.
- Fallbacks visuais semânticos somente quando a mídia do CMS não estiver disponível.
- Rotas e páginas de imóveis, busca e categorias fortes.
- Hub editorial `/blog`.
- Normalização seletiva que não reescreve uploads, REST, endpoints técnicos, CDN, Object Storage ou arquivos.

## Plano proposto — aguarda aprovação

1. Reauditar a API atual após a remoção dos vídeos e registrar o total editorial real, sem inferir ou restaurar conteúdo apagado.
2. Remover somente a classificação obsoleta de importações de vídeo, mantendo o adapter orientado ao conteúdo existente no CMS.
3. Preservar artigos em `/{slug}/`, atualizar links, canonical e schema, e eliminar a duplicidade indexável de `/blog/{slug}` com redirects 301 exatos apenas para artigos existentes.
4. Auditar colisões entre slugs editoriais, rotas fixas e futuras páginas WordPress antes de ativar a resolução na raiz.
5. Manter imagens exatamente nas URLs resolvidas pela API e validar destacada, attachment, conteúdo incorporado e fallback semântico.
6. Validar 200, 301, 404 e indisponibilidade controlada sem alterar imóveis, categorias, infraestrutura de mídia ou o WordPress.
