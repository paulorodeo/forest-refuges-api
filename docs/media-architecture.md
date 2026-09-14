# Arquitetura de mídia

- **WordPress (`www2`)** continua como fonte editorial e de mídia legada em `wp-content/uploads`.
- **Payload CMS** será o futuro editor de artigos. Quando for instalado, seu adaptador S3 deve ler `mediaStorageConfig` e gravar somente no bucket `casanafloresta-media`.
- **`casanafloresta-media`** será o bucket de mídia nova. A URL pública esperada é `MEDIA_PUBLIC_ORIGIN`, futuramente `https://media.casanafloresta.com.br` via Cloudflare/CDN.
- **`repositorio-geral`** é legado e não participa da nova arquitetura; qualquer fallback WordPress continua sendo servido pelo WordPress.
- **VPS NVMe** executa a aplicação e mantém somente assets estruturais versionados, como `/hero` e favicon. Não recebe cópias de mídia WordPress.

Payload ainda não está instalado. Na integração futura, configure as variáveis de `.env.example` no ambiente do serviço, use o endpoint S3-compatible da Contabo e faça o Payload retornar URLs públicas absolutas. `resolveMediaUrl()` preserva essas URLs sem convertê-las para WordPress.
