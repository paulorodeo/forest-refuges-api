# Inventário de URLs públicas do WordPress legado

Leitura realizada em 2026-09-17 pela REST API pública de `www2`. Este inventário não altera conteúdo do WordPress.

| Grupo | Quantidade | Classificação | Tratamento |
| --- | ---: | --- | --- |
| Properties publicados | 128 | A | 301 direto de `/imovel/{slug}/` para `https://www.casanafloresta.com.br/imovel/{slug}` |
| Posts publicados | 103 | A | 301 direto do permalink histórico (inclusive `/blog/{slug}/`) para `https://www.casanafloresta.com.br/{slug}` |
| Categorias de posts | 49 | A | 301 para o hub semântico ou `/blog` |
| Tags de posts | 13 | A | 301 para o hub semântico ou `/blog` |
| Archives editoriais (author, date, search, post format e post archive) | dinâmico | A | 301 para `/blog`; feeds ficam inalterados |
| Páginas publicadas que precisam de equivalente | 111 | B | Sem redirect em massa; requer triagem editorial individual |
| Páginas obsoletas identificadas | 32 | C | Candidatas a 410 após revisão de tráfego, backlinks e dependências |
| Taxonomias de property (type, status, city, area, state e feature) | 232+ | B | Equivalentes parciais já existem, mas não foram redirecionados sem uma tabela de destino aprovada |
| Tipos internos, REST, admin, login, cron e uploads | 0 conteúdos públicos | D | Excluídos dos redirects e da migração |

Contagem consolidada: **A = 293**, **B = 343+**, **C = 32**, **D = 0 conteúdos públicos**. B inclui 111 pages e 232+ termos de property; archives editoriais são dinâmicos e não entram numa contagem fixa.

## Formatos históricos confirmados

- Properties: `https://www2.casanafloresta.com.br/imovel/{slug}/`
- Posts: `https://www2.casanafloresta.com.br/{slug}/`
- Categorias: caminhos históricos como `/rural/.../{slug}/`
- Tags: caminhos históricos como `/portal-imobiliario/{slug}/`

## Destinos semânticos de category/tag

| Slug legado | Destino |
| --- | --- |
| `chacara`, `chacaras-e-glebas`, `dicas-para-chacaras` | `/chacaras` |
| `sitio` | `/sitios` |
| `aluguel-de-temporada`, `airbnb` | `/temporada` |
| `sao-paulo`, `vale-do-ribeira`, `sorocaba`, `campinas`, `ribeirao-preto`, `barretos`, `bauru` | `/regiao/{slug}` |
| demais categorias e tags editoriais | `/blog` |

## B — precisa de equivalente antes de redirecionar

As 143 pages incluem landing pages e conteúdo institucional/editorial que não têm mapeamento seguro individual no frontend. Exemplos: `sobre-nos`, `anuncie`, `trabalhe-conosco`, `politica-de-privacidade`, `termos-e-condicoes`, páginas locais de cidade e páginas de cursos/eventos. Também ficam nesta classe as taxonomias de property, até existir uma tabela de equivalência aprovada por slug.

## C — candidatas a HTTP 410 após revisão editorial

Não foram ativados 410s. As candidatas identificadas são páginas de demonstração, templates e fluxos legados, por exemplo: `login-customizer`, `sign-in`, `sign-in-2`, `dashboard`, `dashboard-2`, `author-profile`, `single-tag`, `single-location`, `single-category`, `all-listings`, `search-home`, `search-result`, `user-dashboard`, `with-parallax-3`, `with-featured-on-top-3`, `with-tabs-3`, `with-content-bottom-3`, `with-content-top-3`, `v7-carousel-test`, `property-search`, `saved-search-2`, `favorite-properties-2`, `membership-info-2`, `invoices-2`, `packages`, `packages-2`, `typography-3` e `inquiry-form-3`.

Antes de retornar 410, validar tráfego, backlinks e qualquer dependência autenticada. Nenhuma URL inexistente recebe redirect genérico: continua 404.
