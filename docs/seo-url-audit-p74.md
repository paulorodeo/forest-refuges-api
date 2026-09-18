# P7.4 — auditoria SEO e arquitetura de URLs

Data: 2026-09-18

## Arquitetura final de URLs

| Classe                     | URL canônica                                       | Status esperado                                  | Observação                              |
| -------------------------- | -------------------------------------------------- | ------------------------------------------------ | --------------------------------------- |
| Hub editorial              | `https://www.casanafloresta.com.br/noticias`       | 200                                              | Substitui o antigo `/blog`.             |
| Hub editorial antigo       | `https://www.casanafloresta.com.br/blog`           | 301 → `/noticias`                                | Compatibilidade preservada.             |
| Artigo individual          | `https://www.casanafloresta.com.br/{slug}`         | 200                                              | Não foi movido para `/noticias/{slug}`. |
| Artigo no caminho antigo   | `https://www.casanafloresta.com.br/blog/{slug}`    | 301 → `/{slug}`                                  | Compatibilidade preservada.             |
| Post legado no WordPress   | `https://www2.casanafloresta.com.br/{slug}`        | 301 → `https://www.casanafloresta.com.br/{slug}` | Mantém política editorial atual.        |
| Imóvel no WordPress legado | `https://www2.casanafloresta.com.br/imovel/{slug}` | 200                                              | Não alterado.                           |
| Imóvel público headless    | `https://www.casanafloresta.com.br/imovel/{slug}`  | 200                                              | Canonical público do imóvel.            |
| REST/admin/login           | `wp-json`, `wp-admin`, `wp-login.php`              | bloqueado/fora do sitemap                        | Intencionalmente técnico.               |

## Redirects implementados

- `www/blog` e `www/blog/` agora retornam 301 direto para `https://www.casanafloresta.com.br/noticias`.
- `www/blog/{slug}` continua retornando 301 para `www/{slug}` pela rota histórica existente.
- Os artigos individuais continuam em `www/{slug}`.
- A política de imóveis não foi alterada.
- Não houve alteração de Cloudflare, DNS, Media Cloud, Object Storage ou `.htaccess`.

## Sitemap final

O sitemap público do `www` deve listar apenas URLs finais, canônicas, HTTP 200 e indexáveis.

- `sitemap-pages.xml` passa a incluir `/noticias` e deixa de incluir `/blog`.
- `sitemap-posts.xml` continua listando artigos como `/{slug}/`.
- `sitemap-properties.xml` continua listando imóveis como `/imovel/{slug}`.
- URLs `www2`, parâmetros, previews, `wp-admin`, `wp-json`, redirects e páginas `noindex` não devem entrar nos sitemaps.

## Robots e noindex

- `robots.txt` mantém bloqueio de caminhos técnicos: `/wp-admin/`, `/wp-login.php`, `/wp-json/`, `/_server/` e `/api/`.
- Rotas de erro ou conteúdo indisponível continuam usando `noindex`.
- A rota antiga `/blog` é redirect e não deve ser indexada nem aparecer em sitemap.

## Amostras por classe observada no Search Console

Sem acesso ao conector do Search Console nesta sessão; a classificação abaixo usa amostras técnicas públicas e padrões já observados na arquitetura.

| Classe                       | Amostra                                                        | Classificação    | Tratamento                                                                                           |
| ---------------------------- | -------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------- |
| 404                          | URL antiga sem equivalente semântico conhecido                 | C                | Deve permanecer 404/410; não redirecionar genericamente para Home.                                   |
| noindex                      | Página de busca `/busca` e estados de conteúdo indisponível    | A                | Intencional para páginas utilitárias ou sem conteúdo indexável.                                      |
| páginas com redirecionamento | `/blog`                                                        | B                | 301 implementado para `/noticias`.                                                                   |
| páginas com redirecionamento | `/blog/{slug}`                                                 | A                | 301 preservado para `/{slug}`.                                                                       |
| canonical alternativa        | `www2/{slug}`                                                  | A                | Correto: legado redireciona para canonical público `www/{slug}`.                                     |
| canonical alternativa        | `www2/imovel/{slug}`                                           | A                | Correto: legado pode responder 200, mas canonical aponta para `www/imovel/{slug}`.                   |
| bloqueadas por robots.txt    | `/wp-json/`, `/wp-admin/`, `/wp-login.php`                     | A                | Técnico e intencional; não deve estar em sitemap.                                                    |
| 403                          | URLs externas oficiais que bloqueiam robôs, como redes sociais | A                | Bloqueio anti-bot externo; não é erro do site.                                                       |
| 5xx                          | Respostas transitórias do backend WordPress/API                | D se persistente | Investigar apenas se aparecer em páginas públicas finais.                                            |
| Rastreada, mas não indexada  | hubs ou artigos com conteúdo fino/duplicado                    | E                | Priorizar páginas canônicas com demanda e remover duplicidade quando houver versão integral externa. |
| Detectada, mas não indexada  | URLs novas no sitemap                                          | E                | Acompanhar após publicação/deploy; não exige redirect se forem 200 canônicas.                        |

## Problemas reais encontrados

- O hub editorial antigo `/blog` ainda era tratado como URL canônica no app e sitemap.
- O menu público usava “News” apontando para `/blog`.
- Breadcrumbs de artigo apontavam para “Blog”.
- O sitemap de páginas incluía `/blog`, uma URL que passará a ser redirect.
- A documentação legada ainda menciona `/blog` como hub histórico; manter como histórico ou atualizar em etapa documental posterior.

## URLs que podem ser ignoradas

- `wp-admin`, `wp-login.php`, `wp-json`, endpoints internos e `/_server`.
- Páginas com parâmetros, previews ou busca interna.
- 404 antigas sem destino semanticamente equivalente.
- Bloqueios externos de redes sociais ao `curl` ou bots.

## Próximos itens recomendados

1. Conferir no Search Console, após recrawl, se `/blog` saiu do sitemap e foi consolidado em `/noticias`.
2. Revisar manualmente 404 antigas com impressões ou backlinks antes de criar qualquer 301.
3. Investigar 5xx apenas se ocorrerem em URLs públicas finais, não em endpoints técnicos.
4. Acompanhar artigos importantes em “Rastreada, mas não indexada”, especialmente quando também existir versão integral no Blogger.
5. Em etapa separada, decidir se a documentação e os MU-plugins versionados que ainda citam `/blog` devem ser atualizados para reduzir hops em rotas legadas do WordPress.
