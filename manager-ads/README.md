# Manager-ADS

Sistema de gestão de anúncios via embed: banners em slots, rastreio de impressões e cliques por IP, relatórios no dashboard.

## Estrutura

- **backend** – API Node (Express) + MongoDB. Porta **3001**. Serve `/ads.js` (embed) e rotas de auth, slots, banners, track e relatórios.
- **frontend** – Dashboard React (Vite). Porta **3000**. Login, slots, cadastro de banners, relatórios (impressões/cliques totais e por IP único).

## Configuração

Os arquivos `.env` já estão criados. Backend: `manager-ads/backend/.env`. Frontend: `manager-ads/frontend/.env`.

### Backend

```bash
cd manager-ads/backend
npm install
npm run seed   # Cria usuário guilherme.santos@me.com e slots AD_SLOT_1..5
npm run dev    # http://localhost:3001
```

### Frontend

```bash
cd manager-ads/frontend
npm install
npm run dev    # http://localhost:3000
```

## Uso do embed (ex.: página Odonnto)

Na página, defina a URL da API (ex.: `http://localhost:3001`) e inclua o script:

```html
<script src="<adsApiUrl>/ads.js" data-api="<adsApiUrl>" data-slot="AD_SLOT_1" async></script>
```

O script busca o banner ativo do slot, injeta no `.ad-slot__placeholder`, e registra impressão e clique (IP no backend).

## Relatórios

No dashboard (Relatórios): por slot, totais de impressões e cliques, e impressões/cliques por **IP único**. Filtro opcional por data (De/Até).

## Produção

- **Frontend:** build com `npm run build`, servir a pasta `dist/` (ou usar `npm start` com `serve`). Ex.: https://ads.onlyflow.com.br
- **Backend:** ex.: https://manager-ads-back-ads.rfxeig.easypanel.host
- **CORS:** no servidor do backend, defina `CORS_ORIGIN` com a origem do frontend (e da página que carrega o embed), separadas por vírgula se houver mais de uma:
  - Ex.: `CORS_ORIGIN=https://ads.onlyflow.com.br,https://odonto-company-odontocompany.rfxeig.easypanel.host`
  - Para dev local: `CORS_ORIGIN=http://localhost:3000,https://ads.onlyflow.com.br`
