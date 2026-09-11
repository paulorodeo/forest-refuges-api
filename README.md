# Casa na Floresta Escapes

Seguir regras do arquivo  — Casa na Floresta Headless + Lovable Master Context v1

PROJETO: CASA NA FLORESTA — HEADLESS WORDPRESS + LOVABLE casanafloresta.com.br 

Antes de criar, alterar, refatorar ou excluir qualquer parte deste projeto, LEIA E USE COMO FONTE DE VERDADE o arquivo:

“Casa_na_Floresta_Headless_Lovable_Master_Context_v1.docx”

Esse documento é o MASTER CONTEXT do projeto.

Ele contém:

- posicionamento do produto;

- intenção de busca;

- arquitetura de informação;

- regras de SEO, E-E-A-T, AEO/GEO;

- arquitetura Headless WordPress;

- modelo conceitual de dados;

- regras de integração;

- regras de migração;

- critérios de aceitação;

- componentes esperados;

- referências visuais;

- direção de design;

- restrições técnicas.

NÃO trate o DOCX apenas como inspiração.

Trate-o como uma especificação de produto e arquitetura.

==================================================

1. REGRA MESTRA DO PROJETO

==================================================

O WordPress existente em:

https://www.casanafloresta.com.br

deve continuar sendo:

- CMS;

- backend;

- painel administrativo;

- fonte de verdade dos dados.

O frontend criado no Lovable será uma camada Headless.

Portanto:

NÃO hardcode imóveis permanentemente no frontend.

NÃO substitua o cadastro de imóveis do WordPress por arrays locais.

NÃO duplique no código:

- imóveis;

- páginas;

- posts;

- autores;

- taxonomias;

- mídia;

- campos editoriais;

- dados que pertencem ao WordPress.

O frontend deve receber os dados por uma camada de API.

A integração definitiva poderá utilizar:

- WordPress REST API;

- WPGraphQL;

- endpoints customizados;

MAS NÃO escolha ou imponha uma dessas opções antes de auditar como os dados estão armazenados no WordPress atual.

Primeiro devemos descobrir:

- tema atual;

- plugins imobiliários;

- Custom Post Types;

- taxonomias;

- ACF;

- postmeta;

- tabelas próprias;

- plugin SEO;

- mídia;

- estrutura dos imóveis.

Não invente nomes de campos, taxonomias ou endpoints como se eles já existissem.

Quando ainda não conhecermos um campo real do backend, crie uma interface ou adapter abstrato e marque claramente o dado como dependente do mapeamento do WordPress.

==================================================

2. IDENTIDADE E POSICIONAMENTO DO PRODUTO

==================================================

Casa na Floresta NÃO é prioritariamente um portal de produção agrícola, agronegócio ou fazendas produtivas.

O posicionamento correto é:

PORTAL DE REFÚGIOS, VIDA NO CAMPO, LAZER, NATUREZA, TEMPORADA E PROPRIEDADES PARA DESCANSAR, MORAR, HOSPEDAR OU INVESTIR.

A emoção central deve ser:

- tranquilidade;

- natureza;

- descanso;

- família;

- lazer;

- privacidade;

- fim de semana;

- veraneio;

- férias;

- eventos;

- retiros;

- hospedagem;

- turismo de natureza;

- segunda residência;

- investimento em locação de curta temporada.

O usuário ideal procura coisas como:

- comprar uma chácara;

- comprar um sítio;

- alugar uma chácara;

- passar um fim de semana no campo;

- encontrar uma cabana ou chalé;

- comprar um imóvel para Airbnb;

- investir em pequenas propriedades de hospedagem;

- encontrar espaço para eventos;

- encontrar um refúgio próximo de uma cidade;

- morar perto da natureza.

NÃO transforme a experiência principal em algo focado em:

- safra;

- commodities;

- máquinas agrícolas;

- produtividade rural;

- lavouras comerciais;

- pecuária comercial;

- insumos;

- operações agroindustriais.

==================================================

3. HIERARQUIA DE CATEGORIAS

==================================================

A prioridade conceitual do portal deve ser:

1. Chácaras

2. Sítios

3. Chalés / Cabanas

4. Temporada

5. Outros refúgios aderentes ao posicionamento

Categorias secundárias podem existir:

- Pesqueiros

- Ranchos

- Haras

- Hotel Fazenda

- Fazendas de lazer

- Refúgios urbanos

Fazendas NÃO devem dominar a homepage ou a navegação.

Uma fazenda só deve ganhar destaque quando sua proposta conversar com:

- turismo;

- lazer;

- hotelaria;

- eventos;

- moradia;

- equestre;

- natureza;

- hospitalidade;

- refúgio;

- investimento imobiliário compatível.

==================================================

4. INTENÇÃO DE BUSCA E SEO

==================================================

A arquitetura nasce orientada a intenção de busca.

Não devemos criar páginas genéricas apenas para capturar qualquer palavra-chave rural.

As páginas indexáveis devem ter propósito claro.

Exemplos prioritários:

/chacaras/

/chacaras-a-venda/

/chacaras-a-venda/sorocaba/

/chacaras-a-venda/juquitiba/

/chacaras-a-venda/campinas/

/chacaras-a-venda/atibaia/

/sitios-a-venda/

/sitios-a-venda/jundiai/

/sitios-a-venda/braganca-paulista/

/chacaras-para-temporada/

/chacaras-para-temporada/atibaia/

Atenção:

O site atual possui URLs antigas importantes.

Exemplos:

https://www.casanafloresta.com.br/chacaras

https://www.casanafloresta.com.br/chacaras-em-sorocaba

https://www.casanafloresta.com.br/chacaras-em-juquitiba

https://www.casanafloresta.com.br/chacaras-em-campinas

https://www.casanafloresta.com.br/chacaras-em-sao-jose-dos-campos

https://www.casanafloresta.com.br/chacaras-a-venda/sorocaba

https://www.casanafloresta.com.br/chacaras-a-venda/juquitiba

https://www.casanafloresta.com.br/chacaras-a-venda/campinas

https://www.casanafloresta.com.br/chacaras-a-venda/atibaia

https://www.casanafloresta.com.br/sitios-a-venda/mococa

https://www.casanafloresta.com.br/sitios-a-venda/registro

https://www.casanafloresta.com.br/sitios-a-venda/braganca-paulista

https://www.casanafloresta.com.br/sitios-a-venda/jundiai

https://www.casanafloresta.com.br/aluguel-de-temporada

Essas URLs representam patrimônio SEO.

NÃO:

- delete;

- renomeie;

- consolide;

- altere slug;

sem antes existir um plano explícito de:

- canonical;

- redirect 301;

- equivalência semântica;

- auditoria da URL antiga.

Sempre preserve SEO antes de melhorar estética de URL.

==================================================

5. FACETED NAVIGATION E INDEXAÇÃO

==================================================

Os filtros da busca são recursos de UX.

Eles NÃO devem gerar automaticamente milhares de páginas indexáveis.

Exemplo:

NÃO criar páginas indexáveis automaticamente para todas as combinações:

cidade + piscina + quartos + preço + pet friendly + eventos.

Combinações de filtros podem funcionar via estado ou query parameters.

Somente landing pages estrategicamente aprovadas devem ser indexáveis.

Para combinações não estratégicas, prever:

- canonical adequado;

- noindex quando necessário;

- controle de crawling.

==================================================

6. RENDERIZAÇÃO E SEO TÉCNICO

==================================================

O conteúdo principal das páginas estratégicas precisa existir no HTML inicial.

Evite arquitetura em que:

browser

→ carrega JavaScript

→ consulta API

→ só então aparece todo o conteúdo SEO.

Adote arquitetura compatível com:

- SSR;

- SSG;

- ISR;

- ou solução equivalente.

Precisamos preservar:

- title;

- meta description;

- canonical;

- Open Graph;

- breadcrumbs;

- JSON-LD;

- status de indexação;

- sitemap XML;

- robots.txt;

- paginação;

- headings.

==================================================

7. MODELO CONCEITUAL DO IMÓVEL

==================================================

Use o seguinte modelo apenas como INTERFACE CONCEITUAL do frontend.

NÃO presuma que esses campos já existam no WordPress.

Property:

- id

- wordpressId

- title

- slug

- status

- excerpt

- description

- transactionType[]

- propertyType[]

- intendedUse[]

- price

- priceLabel

- area

- areaUnit

- bedrooms

- bathrooms

- parking

- guests

- amenities[]

- location

- coordinates

- gallery[]

- featuredImage

- video

- owner

- agent

- contact

- badges[]

- featured

- documentationStatus

- seoMetadata

- createdAt

- updatedAt

O frontend deve possuir uma camada de adaptação entre:

WordPress API

→ adapter/data mapper

→ modelo Property usado pelos componentes.

Assim, se o backend mudar, o design não deve precisar ser reescrito.

==================================================

8. FINALIDADE DO IMÓVEL

==================================================

Considere conceitualmente:

transactionType:

- venda

- aluguel

- temporada

==================================================

9. INTENÇÃO / USO

==================================================

Considere filtros semânticos como:

- moradia;

- lazer;

- descanso;

- temporada;

- hospedagem;

- eventos;

- turismo rural;

- investimento;

- equestre;

- pesca.

Esse eixo é muito importante.

O usuário nem sempre procura apenas “tipo de imóvel”.

Ele também procura uma experiência.

==================================================

10. AMENIDADES IMPORTANTES

==================================================

Planeje componentes e filtros para:

- piscina;

- churrasqueira;

- espaço gourmet;

- lago;

- represa;

- rio;

- cachoeira;

- nascente;

- montanha;

- mata;

- floresta;

- vista;

- pet friendly;

- Wi-Fi;

- internet;

- acesso asfaltado;

- casa sede;

- chalé;

- cabana;

- eventos;

- jacuzzi;

- sauna;

- lareira;

- pomar;

- horta;

- estrutura equestre;

- número de hóspedes;

- estacionamento;

- distância de cidades e atrações.

Novamente:

NÃO presuma que tudo esteja disponível no WordPress.

Prepare a arquitetura para suportar esses dados.

==================================================

11. HOMEPAGE

==================================================

A homepage deve funcionar como DISTRIBUIDOR DE INTENÇÃO.

Ela não deve virar um artigo gigantesco.

Ordem conceitual preferencial:

1. Hero emocional + busca

2. Comprar / Temporada / Anunciar

3. Imóveis em destaque

4. Categorias

5. Explorar por objetivo

6. Destinos e regiões

7. Temporada

8. Bloco institucional curto

9. Depoimentos

10. CTA para proprietários / corretores

11. Conteúdos / guias

12. Newsletter

13. Footer

Hero sugerido:

H1:

“Encontre seu lugar no campo”

Subheadline:

“Chácaras, sítios, cabanas e refúgios para comprar, alugar ou viver bons momentos perto da natureza.”

Busca:

“Onde você quer descansar, morar ou investir?”

Tabs:

Comprar | Temporada

CTA secundário:

Anuncie seu imóvel

Não copie obrigatoriamente esses textos literalmente se houver uma solução melhor, mas preserve exatamente essa intenção.

==================================================

12. EXPLORAR POR OBJETIVO

==================================================

Crie uma seção orientada a intenção humana.

Exemplos:

- Descansar perto da natureza

- Lazer em família

- Fim de semana no campo

- Espaço para eventos

- Segunda residência

- Temporada

- Investir em hospedagem

- Cabana para Airbnb

- Refúgio romântico

- Lugar com piscina

- Lugar perto de cachoeira

- Pet friendly

Essa camada é estratégica para UX e arquitetura semântica.

==================================================

13. DESIGN

==================================================

Use as imagens presentes no DOCX como referência visual.

NÃO copie pixel a pixel o WordPress atual.

Preserve a identidade e evolua a qualidade.

Direção visual:

- natureza;

- editorial;

- premium;

- acolhedor;

- elegante;

- contemporâneo;

- sem aparência de marketplace genérico.

Preservar:

- verde como cor principal;

- terracota/laranja como CTA;

- off-white e areia nos fundos;

- títulos serifados;

- UI em sans-serif;

- fotografias grandes;

- natureza;

- piscinas;

- chalés;

- cabanas;

- áreas verdes;

- cards fotográficos;

- sombras suaves;

- cantos levemente arredondados.

Evitar:

- excesso de verde + laranja competindo;

- muitos blocos com aparência de widgets WordPress;

- excesso de texto na homepage;

- cards inconsistentes;

- logos gigantes sobre fotos;

- visual genérico de template imobiliário.

==================================================

14. DESIGN SYSTEM

==================================================

Planeje tokens consistentes para:

- spacing;

- typography;

- radius;

- border;

- shadows;

- surfaces;

- colors;

- breakpoints;

- container widths;

- transitions.

Paleta conceitual:

- Forest Deep

- Nature Green

- Sand / Off White

- Terracotta / Orange

- Charcoal

- Warm Gray

Use laranja prioritariamente para ações importantes.

Verde deve comunicar:

- natureza;

- marca;

- confiança;

- estados positivos.

==================================================

15. COMPONENTES BASE

==================================================

Planeje o sistema usando componentes desacoplados e reutilizáveis.

Exemplos:

Header

MegaMenu

HeroSearch

SearchTabs

PropertySearchForm

PropertyCard

PropertyGrid

PropertyCarousel

CategoryCard

CategoryGrid

DestinationCard

DestinationGrid

IntentCard

TestimonialCard

OwnerCTA

AgentContact

WhatsAppCTA

NewsletterForm

EditorialBlock

FAQAccordion

Breadcrumbs

Pagination

LoadMore

Map

LocationSummary

PropertyGallery

AmenitiesGrid

RelatedProperties

SEOTextSection

Footer

Não crie componentes gigantes que misturem layout, acesso à API e regras de negócio.

Separar:

UI

data

domain

API

SEO

==================================================

16. PÁGINA INDIVIDUAL DO IMÓVEL

==================================================

Estrutura recomendada:

- galeria;

- título;

- localidade;

- preço;

- badges;

- resumo;

- características;

- descrição;

- amenidades;

- mapa / região;

- acesso;

- documentação confirmada;

- WhatsApp;

- corretor/responsável;

- imóveis semelhantes;

- conteúdo regional;

- dados estruturados.

Não exponha localização exata quando o proprietário não autorizar.

==================================================

17. TEMPORADA

==================================================

TEMPORADA É UMA VERTICAL PRINCIPAL.

Não trate como simples filtro escondido.

O projeto deve permitir forte crescimento de:

- chácaras para temporada;

- sítios para temporada;

- cabanas;

- chalés;

- espaços de eventos;

- hospedagens de natureza.

Filtros importantes:

- cidade;

- hóspedes;

- quartos;

- piscina;

- churrasqueira;

- pet friendly;

- eventos;

- água/natureza;

- preço;

- disponibilidade futura, caso seja implementada.

==================================================

18. CHALÉS E CABANAS

==================================================

Considere Chalés/Cabanas uma categoria estratégica de crescimento.

Ela deve conversar com:

- escapadas;

- fim de semana;

- casais;

- famílias;

- montanha;

- natureza;

- design;

- hospedagem;

- glamping;

- curta temporada;

- investimento em Airbnb/Booking.

==================================================

19. CONTEÚDO EDITORIAL

==================================================

Não despeje os textos antigos integralmente na homepage.

Distribua o acervo em:

- páginas de categoria;

- guias;

- páginas regionais;

- páginas de intenção;

- conteúdos editoriais.

Exemplos:

/chacaras/

/sitios/

/chales/

/guias/comprar-chacara/

/guias/chacaras-para-temporada/

/guias/investir-em-cabana/

/destinos/atibaia/

Páginas de categoria e cidade devem combinar:

INVENTÁRIO REAL

+

CONTEÚDO ÚTIL

Nunca criar uma landing page SEO cheia de texto sem imóveis relacionados quando a intenção do usuário for comercial.

==================================================

20. E-E-A-T / CONFIABILIDADE

==================================================

Evite afirmações não verificadas.

Não usar números como:

“valoriza 15%”

“rendimento X%”

“crescimento Y%”

sem:

- fonte;

- data;

- contexto.

Não apresentar definições rígidas de:

- chácara;

- sítio;

- fazenda;

baseadas apenas em metragem como se fossem regra jurídica brasileira.

Conteúdo técnico deve demonstrar experiência prática:

- documentação;

- CAR;

- CCIR;

- ITR;

- acesso;

- infraestrutura;

- região;

- vizinhança;

- uso;

- atrações;

- perfil do imóvel;

- cuidados na compra.

==================================================

21. PERFORMANCE

==================================================

Prioridades:

- Core Web Vitals;

- LCP;

- otimização de imagens;

- lazy loading;

- cache;

- CDN;

- revalidação;

- paginação;

- fontes eficientes.

Cloudflare poderá permanecer como:

- DNS;

- CDN;

- WAF;

- cache;

dependendo da arquitetura final.

Não consultar o WordPress pesadamente em toda requisição sem estratégia de cache/revalidação.

==================================================

22. SEGURANÇA

==================================================

Nunca exponha:

- credenciais;

- tokens privados;

- WordPress admin secrets;

no bundle público.

Endpoints de escrita devem prever:

- validação;

- rate limit;

- proteção anti-spam;

- sanitização;

- autenticação quando aplicável.

==================================================

23. MIGRAÇÃO

==================================================

O novo frontend NÃO deve substituir o site atual de uma vez.

Primeiro:

1. Auditar WordPress

2. Mapear CPTs

3. Mapear taxonomias

4. Mapear campos

5. Mapear API

6. Mapear URLs

7. Mapear SEO

8. Criar modelo de dados

9. Fazer uma prova técnica

10. Validar uma listagem

11. Validar uma página individual

12. Validar SSR/SEO

13. Só então avançar para homepage completa

==================================================

24. PRIMEIRA PROVA TÉCNICA

==================================================

Antes de construir todo o portal:

Criar uma integração mínima contendo:

- client de WordPress;

- adapter;

- uma listagem de imóveis;

- PropertyCard;

- página individual do imóvel;

- tratamento de loading/error;

- SEO básico;

- HTML indexável.

Usar dados reais quando o endpoint estiver mapeado.

Mocks podem existir APENAS temporariamente durante desenvolvimento e devem estar isolados em camada própria e claramente identificados como mocks.

Não transformar mock em fonte definitiva.

==================================================

25. CRITÉRIOS DE ACEITAÇÃO GERAIS

==================================================

Uma implementação só é considerada coerente com o projeto quando:

- em até 5 segundos o usuário entende que o portal é sobre chácaras, sítios, cabanas, refúgios, compra e temporada;

- Chácaras e Sítios possuem maior prioridade que Fazendas;

- Temporada possui alta visibilidade;

- o design comunica natureza + editorial + premium;

- os imóveis vêm do WordPress;

- não existem dados permanentes hardcoded;

- páginas estratégicas são indexáveis;

- URLs antigas são preservadas ou corretamente redirecionadas;

- existe CTA de WhatsApp;

- existe CTA para anunciar imóvel;

- a arquitetura é desacoplada;

- o frontend não depende diretamente do schema bruto do WordPress;

- performance e acessibilidade são consideradas;

- o site não se transforma em portal agropecuário.

==================================================

26. COMPORTAMENTO OBRIGATÓRIO ANTES DE CADA ALTERAÇÃO

==================================================

Sempre que eu pedir uma nova funcionalidade:

1. Consulte o Master Context DOCX.

2. Identifique quais regras do documento se aplicam.

3. Verifique possíveis impactos em:

   - WordPress;

   - SEO;

   - URL;

   - arquitetura;

   - dados;

   - performance;

   - mobile;

   - design.

4. Preserve decisões anteriores compatíveis.

5. Não reescreva partes funcionando sem necessidade.

6. Prefira mudanças pequenas e incrementais.

7. Se uma decisão depender de informação ainda desconhecida sobre o WordPress, NÃO invente.

8. Informe exatamente qual dado técnico precisa ser descoberto.

9. Estruture o código para que a integração real possa ser feita depois.

10. Ao terminar, informe resumidamente:

    - o que foi alterado;

    - quais arquivos/componentes foram alterados;

    - quais regras do Master Context foram respeitadas;

    - o que ainda depende do backend.

==================================================

27. REGRA DE CONFLITO

==================================================

Se uma sugestão automática do Lovable, template, biblioteca, componente ou padrão genérico entrar em conflito com o arquivo:

“Casa_na_Floresta_Headless_Lovable_Master_Context_v1.docx”

O MASTER CONTEXT TEM PRIORIDADE.

Se uma instrução minha posterior contradizer deliberadamente o documento, sinalize o conflito de forma curta antes da alteração para eu decidir se a regra será atualizada.

==================================================

28. PRIMEIRA RESPOSTA ESPERADA

==================================================

Ainda NÃO construa tudo.

Primeiro:

1. Confirme que você leu o arquivo Master Context.

2. Resuma em no máximo 10 pontos as regras fundamentais que você entendeu.

3. Mostre a arquitetura que você pretende preservar.

4. Liste o que precisa ser auditado no WordPress antes da integração definitiva.

5. Não altere o projeto até essa interpretação estar alinhada.

A partir de então, use o DOCX como documentação persistente em todas as próximas etapas deste projeto.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://forest-refuges-api.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b2219803-4b86-4998-aedd-71cade2e9dca).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
