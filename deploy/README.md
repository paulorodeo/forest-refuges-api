# Staging no VPS

O serviço de staging escuta somente em `127.0.0.1:3010`. Nenhuma configuração de DNS ou Cloudflare é necessária para estes comandos.

## Instalação inicial

Copie o unit versionado e recarregue o systemd:

```bash
sudo install -m 0644 deploy/casanafloresta-staging.service /etc/systemd/system/casanafloresta-staging.service
sudo systemctl daemon-reload
```

## Build

```bash
cd /opt/casanafloresta/repo
bunx vite build --config vite.config.vps.ts
```

## Start

Habilite o início automático e suba o serviço:

```bash
sudo systemctl enable --now casanafloresta-staging
```

## Restart

Após cada build novo:

```bash
sudo systemctl restart casanafloresta-staging
```

## Status

```bash
sudo systemctl status casanafloresta-staging
```

## Logs

```bash
sudo journalctl -u casanafloresta-staging -f
```
