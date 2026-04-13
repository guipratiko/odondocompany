# Manager-ADS

Sistema de gestão de anúncios via embed: banners em slots, rastreio de impressões e cliques por IP, relatórios no dashboard.

## Estrutura

- **backend** – API Node (Express) + MongoDB. Porta **3001**. Serve `/promo.js` (embed de destaques; evita ad block) e rotas de auth, slots, banners, track e relatórios.
- **frontend** – Dashboard React (Vite). Porta **3000**. Login, slots, cadastro de banners, relatórios (impressões/cliques totais e por IP único).

## Configuração

Os arquivos `.env` já estão criados. Backend: `manager-ads/backend/.env`. Frontend: `manager-ads/frontend/.env`.

### Backend

```bash
cd manager-ads/backend
npm install
npm run seed       # Usuário + slots AD_SLOT_1..5
npm run seed:user  # Só cria/atualiza o usuário de login (veja abaixo)
npm run dev        # http://localhost:3001
```

**Login do dashboard (padrão):**

- **Email:** `guilherme.santos@me.com`
- **Senha:** `Bingo3945"!`

Para outro email/senha no seed (sem commitar segredo), use variáveis de ambiente ao rodar:

```bash
SEED_USER_EMAIL=outro@email.com SEED_USER_PASSWORD='suaSenha' npm run seed:user
```

### Frontend

```bash
cd manager-ads/frontend
npm install
npm run dev    # http://localhost:3000
```

## Uso do embed (ex.: página Odonnto)

Na página, defina `ODONTO_CONFIG.promoApiUrl` (ou equivalente) e inclua o script (uso de "promo" evita ad block):

```html
<script src="<promoApiUrl>/promo.js" data-api="<promoApiUrl>" data-slot="AD_SLOT_1" async></script>
```

O script busca o banner ativo do slot, injeta no `.promo-slot__placeholder`, e registra impressão e clique (IP no backend).

## Relatórios

No dashboard (Relatórios): por slot, totais de impressões e cliques, e impressões/cliques por **IP único**. Filtro opcional por data (De/Até).

## Produção

### Frontend (obrigatório: pasta `dist`)

O `index.html` **do repositório** (com `/src/main.jsx`) só funciona com `npm run dev`. Em produção o navegador precisa do **`npm run build`**, que gera `dist/` com `.js` e MIME correto.

**Se aparecer:** `Failed to load module script` ou `MIME type of ""` em `/src/main.jsx` → o servidor está apontando para a **raiz do frontend** em vez de **`dist/`**.

No **EasyPanel** (recomendado — evita Caddy servindo a pasta errada):

1. Tipo de app: **Node.js** (não só “site estático” com root na raiz do repo).
2. **Diretório do app:** `manager-ads/frontend` (ou onde está o `package.json` do frontend).
3. **Instalar:** `npm ci` (ou `npm install`).
4. **Build:** `npm run build` (gera `dist/`).
5. **Comando de start:** `npm start` → sobe **`scripts/serve-dist.mjs`**, que lê **`dist/`** e define **Content-Type** correto para `.js` (resolve MIME vazio).
6. **Porta:** a que o painel expõe (ex.: 3000); o script usa **`PORT`** do ambiente se existir.

Se insistir em **Caddy estático**, a **root** tem que ser **`dist`** (não a pasta do código-fonte).

**Local após build:** `npm start` ou `npm run start:serve` (pacote `serve`).

- **Frontend:** build com `npm run build`, servir **somente** a pasta `dist/`. Ex.: https://ads.onlyflow.com.br
- **Backend:** ex.: https://duplloflow-ads-backsercice.qyspkj.easypanel.host
- **CORS:** no servidor do backend, defina `CORS_ORIGIN` com a origem do frontend (e da página que carrega o embed), separadas por vírgula se houver mais de uma:
  - Ex.: `CORS_ORIGIN=https://ads.onlyflow.com.br,https://odonto-company-odontocompany.rfxeig.easypanel.host`
  - Para dev local: `CORS_ORIGIN=http://localhost:3000,https://ads.onlyflow.com.br`
