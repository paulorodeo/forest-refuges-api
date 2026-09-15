# Casa na Floresta — Deployment Targets

## VPS

Arquitetura atual:

Cloudflare edge  
→ OpenLiteSpeed  
→ proxy local  
→ Node/TanStack Start  
→ WordPress REST como fonte de conteúdo

Configuração principal: `vite.config.vps.ts`

Runtime: Node / Nitro `node-server`

A linha VPS permanece suportada e deve continuar compilável. Esta configuração não deve ser removida, renomeada ou substituída pelo target Cloudflare.

## Cloudflare

Target futuro:

Cloudflare  
→ Worker runtime  
→ TanStack Start  
→ WordPress REST

Será desenvolvido separadamente na branch `cloudflare-deploy`. O runtime Cloudflare e sua configuração própria ainda não fazem parte desta etapa.

Cloudflare não deve obrigar a remoção do target VPS. Configurações futuras, como `vite.config.cloudflare.ts` e `wrangler.jsonc`, devem coexistir em paralelo com `vite.config.vps.ts`.

## Shared Application

O mesmo código de aplicação deve compartilhar, quando possível:

- componentes React;
- rotas;
- WordPress adapters;
- mídia;
- SEO;
- related content;
- busca;
- modelos de domínio.

Somente código realmente dependente de runtime deve ser separado.

## Deployment Principle

Nunca tornar componentes de negócio dependentes de APIs exclusivas da Cloudflare quando isso puder ser evitado.

Usar abstrações server/runtime quando necessário.

Durante a migração, WordPress continua sendo a fonte de verdade. Não hardcodar conteúdo, taxonomias, mídia ou URLs privadas de infraestrutura no frontend.
