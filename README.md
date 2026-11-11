# MAIA — loja e catálogo de demonstração

Aplicação Next.js com catálogo ilustrativo, identidade MAIA, painel administrativo e imagens de exemplo. O `index.html` original foi preservado como referência.

## Executar localmente

Requer Node.js 22.13 ou superior.

```sh
npm install
npm run setup:admin
npm run dev
```

Abra `http://localhost:3000`. Para testar o build: `npm run build` e `npm start`.

## Dados da demo

Categorias e produtos iniciais vêm de `lib/products.js` e `lib/spec-templates.js`. Não há banco de dados. O painel em `/admin` permite experimentar criação, edição, exclusão, categorias, especificações, visibilidade e preço. Essas alterações ficam somente na memória do processo Node e são descartadas quando ele reinicia ou quando há novo deploy. Fotos enviadas são guardadas no diretório temporário do servidor e também podem desaparecer ao reiniciar. Para uma apresentação reproduzível, edite os dados iniciais no código e faça novo deploy.

O comando `npm run setup:admin` cria credenciais locais em `.env.local`. No Render, configure `ADMIN_EMAIL` e `ADMIN_PASSWORD` (mínimo de 12 caracteres); `ADMIN_SESSION_SECRET` é gerado no Blueprint. O painel usa sessão assinada, cookie HttpOnly e validação de origem. Não envie `.env.local` ao repositório.

Os itens e imagens são ilustrativos. Não há checkout, estoque ou reservas. A regra atual de preço e contato está em `lib/pricing.js` e `lib/database.js`.

## Deploy no Render

Conecte o repositório Git e crie um Blueprint usando `render.yaml`. O serviço usa Docker, plano `free` e a rota `/api/health` para verificação. Não precisa de disco persistente, pois os dados são mockados. Preencha as credenciais solicitadas pelo Render. Para login em domínio próprio, configure `APP_ORIGIN` com a origem HTTPS completa; o domínio `onrender.com` é reconhecido automaticamente.

O `Dockerfile` gera a versão standalone do Next.js e inicia o servidor na porta 10000. O `.dockerignore` exclui dados locais e segredos do contexto de build.

## Galeria e temas

O editor aceita até 12 fotos por produto. A primeira aparece no cartão; as demais aparecem no carrossel e no zoom da ficha. O tema claro/escuro segue a preferência do sistema inicialmente e pode ser alterado no cabeçalho.
