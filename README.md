# Potentia — site institucional

Landing page estática: HTML, CSS e JS puros, sem build.

## Antes de publicar

1. `script.js` → `CONFIG.whatsappNumber`: número com DDI e DDD, só dígitos (ex.: `5531999999999`). Todos os botões de WhatsApp do site usam esse número e já mandam junto os gargalos marcados e a estimativa da calculadora.
2. `index.html` → trocar os placeholders `[E-MAIL]`, `[@PERFIL]`, `[CIDADE]`, `[CNPJ]` e o link do Instagram.
3. `index.html` → links da coluna "Conteúdo" no rodapé apontam para os vídeos quando publicados.
4. Opcional: pixel Meta e GA4 no `<head>`.

## Rodar local

```bash
cd /Users/victor/potentia-site
python3 -m http.server 8080
# abrir http://localhost:8080
```

## Deploy (Vercel)

```bash
npx vercel --prod
```

Ou arrastar a pasta em vercel.com/new. Não precisa de configuração.
