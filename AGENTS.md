<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Deployment guardrails

- Casa na Floresta suporta os targets VPS e Cloudflare.
- Nunca remover ou substituir o build VPS; `vite.config.vps.ts` é uma configuração preservada.
- Configurações Cloudflare devem ser paralelas às configurações VPS.
- Não modificar `vps-stable`.
- Não modificar `vps-migration` sem instrução explícita.
- Não realizar deploy automaticamente.
- Não inserir secrets no repositório.
- WordPress continua sendo a fonte de verdade durante a migração.
- Não hardcodar imóveis, artigos, taxonomias ou mídia vindos do WordPress.
- Não restaurar dependências ou URLs Lovable.
- Não utilizar diretamente URLs privadas Contabo/S3 no frontend.
