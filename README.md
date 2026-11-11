# MAIA — Loja e catálogo informativo

Migração do HTML original para Next.js App Router, com identidade em preto, branco e vermelho, busca, filtros e fichas acessíveis em diálogo nativo. O `index.html` original foi preservado como referência; a aplicação Next.js usa `app/page.js`.

## Executar

Requer Node.js 22.13 ou superior, com suporte a `node:sqlite`.

```sh
npm install
npm run setup:admin
npm run dev
```

Abra http://localhost:3000. Para produção: `npm run build` e `npm start`.

## Editar o catálogo

Abra http://localhost:3000/admin. O e-mail inicial é `admin@maia.local`; a senha aleatória fica em `ADMIN_PASSWORD` no arquivo privado `.env.local`. O comando de configuração preserva credenciais já existentes. Na implantação, configure `ADMIN_EMAIL`, `ADMIN_PASSWORD` (mínimo de 12 caracteres) e `ADMIN_SESSION_SECRET` (mínimo de 32 caracteres) no ambiente do servidor. Troque a senha e o segredo e reinicie o servidor para invalidar acessos anteriores.

O painel permite criar, editar, duplicar e excluir itens; salvar rascunhos; controlar “Exibir no site”; enviar, remover e ordenar fotos; cadastrar categorias e preencher preços nas categorias de camping e vestuário. Alterações salvas aparecem no site sem recompilar. Uma categoria oculta também oculta seus itens. Categorias com itens não podem ser excluídas até que eles sejam movidos ou removidos.

Em cada categoria, escolha um modelo inicial ou crie campos próprios. Configure nome, tipo (texto ou número), unidade, obrigatoriedade e até três destaques para o cartão. Use texto para calibres como `.22 LR`, tamanhos e materiais; use número para medidas e capacidades. Digite números sem unidade (por exemplo `2,5` com a unidade `kg`). Os campos só são exibidos quando preenchidos. Também é possível adicionar especificações exclusivas de um item. Campos obrigatórios são exigidos quando o item é marcado para exibição.

Modelos iniciais: facas/canivetes, armamentos informativos, pressão, barracas, mochilas e camisetas. Os seis itens existentes são migrados apenas na primeira inicialização do banco. Depois disso, `lib/products.js` é somente a referência de migração; edite os registros pelo painel.

O conteúdo é ilustrativo e não constitui catálogo real de estoque. Nomes e especificações seguem o material fornecido pelo usuário; confirme-os na documentação dos fabricantes antes de publicar. A categoria de camping aparecerá automaticamente quando houver uma ficha visível dessa categoria.

Não há checkout, estoque, reservas ou fluxo de compra. O campo de preço aparece no editor de todos os itens, mas só fica ativo para barracas, mochilas e camisetas. Nessas categorias, o valor em reais é opcional e aparece no cartão e na ficha quando preenchido. Em armamentos, pressão e cutelaria, o valor é descartado pelo servidor e não aparece no site. A seção de contato tem telefone, WhatsApp para informações gerais e Google Maps. O painel usa sessão assinada de 12 horas, cookie HttpOnly, validação de origem e limitação de tentativas de login.

## Persistência e implantação

O SQLite fica em `data/maia.sqlite` e as fotos enviadas ficam em `data/uploads`. O diretório `data` e `.env.local` são ignorados pelo Git. Faça backup de todo o diretório `data` com o servidor parado (inclua arquivos WAL/SHM se existirem). Preserve-o nas atualizações da aplicação. Não apague o banco para atualizar o código.

Este projeto exige um servidor Node com disco persistente e permissão de gravação em `data`; não é uma exportação estática. Hospedagens com disco temporário ou múltiplas instâncias exigem adaptar o banco e o armazenamento para serviços compartilhados. As imagens são reprocessadas para WebP, com limite de 8 MB por arquivo, e servidas por `/uploads/...`.

A marca no cabeçalho é uma reconstrução vetorial da referência em `public/maia-logo.svg`. Substitua pelo arquivo oficial da logo quando disponível. Endereço transcrito da referência enviada; confirme-o antes de publicar. Fontes Google Fonts usam alternativa local se a rede estiver indisponível.

## Galeria de imagens

No editor do produto, envie até 12 fotos e use as setas para reordenar. A primeira aparece no cartão; as demais aparecem nas miniaturas e no carrossel da ficha. Os itens iniciais têm apenas uma foto; setas e miniaturas aparecem automaticamente quando houver mais de uma.

Clique na foto do cartão para abrir a ficha e na imagem da galeria para ampliar. Os controles ajustam o zoom de 100% a 300%; use o arraste ou a rolagem para explorar a imagem ampliada. Setas do teclado navegam na galeria, Escape fecha a ficha e o foco retorna ao botão de abertura.

## Temas

O botão no cabeçalho alterna entre claro e escuro. Na primeira visita o tema segue a preferência do sistema; uma escolha manual fica salva em `localStorage` na chave `maia-theme`. Se o armazenamento estiver indisponível, a alternância continua funcionando durante a visita. As cores e ajustes do catálogo ficam em `app/storefront.css`.
