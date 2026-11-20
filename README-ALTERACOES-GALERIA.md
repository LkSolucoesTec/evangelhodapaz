# Central da Igreja — Álbuns, eventos e usuários (versão para validação)

## Alterações
- Galeria por álbuns: título, data, descrição, status publicado/rascunho e upload de várias fotos. Fotos avulsas existentes são preservadas. O site exibe os álbuns publicados e permite ampliar/navegar/baixar fotos, sem comentários.
- Nova seção "Momentos da Nossa Igreja" no corpo da página; menus de galeria existentes abrem a mesma galeria.
- Palavra do Dia continua selecionada pela última publicação cadastrada e publicada (ID decrescente).
- Eventos publicados aparecem na página inicial até sua data (inclusive); eventos em destaque têm prioridade, mas deixam a lista após a data. Para retirar antes, use rascunho.
- Usuários: o administrador principal pode criar contas editoras e excluí-las, invalidando as sessões pelo relacionamento no banco. Esta gestão só funciona no modo local (`npm run dev:central`).
- Exportação estática inclui álbuns e suas imagens públicas; rascunhos de álbuns não são exportados.

## Como testar
1. **Faça backup** de `%APPDATA%\\CentralDaIgreja` antes de começar. As tabelas novas são adicionadas automaticamente, preservando dados existentes.
2. Extraia o ZIP em uma nova pasta, execute `npm install` e `npm run dev:central`.
3. Abra `http://127.0.0.1:3000/admin`, entre com sua conta existente e teste criar um álbum e adicionar imagens JPG/PNG/WebP de até 5 MB cada.
4. No site público local, confira "Momentos da Nossa Igreja", a galeria do menu/rodapé e a ampliação/download.
5. Teste o novo menu Usuários como administrador principal, criando uma conta editora, fazendo login e depois excluindo-a.
6. Teste evento com data futura e destaque; verifique que eventos vencidos não aparecem na seção inicial.
7. Execute `npm run build:public` **apenas depois** de testar localmente e revisar o conteúdo publicado. O comando exporta dados e cópias das fotos para `public` e gera `dist` quando o build Vite funcionar.

## Limitações importantes
- **Ainda não existe sincronização automática** do programa local para GitHub/Cloudflare. Alterações no SQLite só chegarão ao site hospedado após uma nova exportação e um novo deploy.
- **Ainda não é o instalador Windows.** O aplicativo está rodando pelo Node/VS Code para testes.
- Comentários foram deliberadamente excluídos.
- Fotos novas são guardadas em `%APPDATA%\\CentralDaIgreja\\uploads` no modo local; precisam ser exportadas para a hospedagem para continuar acessíveis com o PC desligado.
- O botão "Baixar foto" depende do comportamento do navegador quando a imagem é servida por outro domínio.
- **Validação incompleta neste ambiente:** a migração SQLite e a exportação de dados foram executadas; não foi possível concluir `npm install`, `tsc` nem `vite build` por indisponibilidade das dependências. A sintaxe TS/TSX foi verificada, mas os testes de integração e visual precisam ser feitos no Windows.
- Publicar fotos de crianças requer autorização apropriada de seus responsáveis.
