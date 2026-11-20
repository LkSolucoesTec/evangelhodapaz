# Central da Igreja — versão de testes locais

## Estado atual
Este pacote **não contém um instalador Setup.exe**. É a base de código revisada para testes no Windows, com painel web local e exportação de conteúdo público para Cloudflare Pages. A instalação Windows independente e a publicação automática ainda precisam ser implementadas e validadas no computador Windows.

## Pré-requisitos
Node.js 22.13+ (recomendado Node 24 LTS) e npm.

## Testar a Central local
1. Extraia o ZIP em uma pasta sua.
2. No terminal PowerShell nessa pasta, execute `npm install`.
3. Execute `npm run dev:central`.
4. Abra `http://127.0.0.1:3000/admin`.
5. Cadastre o primeiro administrador **somente no seu computador**. Não publique o backend Express na internet.

O banco, segredo de sessão e uploads são criados em `%APPDATA%\\CentralDaIgreja\\data` e `%APPDATA%\\CentralDaIgreja\\uploads`. Não envie essas pastas ao GitHub. A API local escuta apenas `127.0.0.1`.

## Backup
Depois do login, acesse `http://127.0.0.1:3000/api/admin/backup` para baixar uma cópia consistente do banco SQLite. Também fica uma cópia em `%APPDATA%\\CentralDaIgreja\\data\\backups`. Guarde-a em local protegido; pode conter dados pessoais.

## Site público estático
Com a Central fechada ou aberta, execute `npm run build:public` na mesma máquina e com a variável `CENTRAL_LOCAL_MODE=1` definida no terminal, para exportar o conteúdo do banco local para `public/site-data.json` e compilar a pasta `dist`.

PowerShell:
```
$env:CENTRAL_LOCAL_MODE='1'
npm run build:public
```

No Cloudflare Pages use build command `npm run build:public` **somente quando houver dados públicos exportados versionados no repositório**; caso contrário o CI gerará conteúdo demonstrativo, pois não tem acesso ao banco local. Recomendação inicial: executar o build local e fazer deploy do diretório `dist` pelo método de upload direto do Cloudflare Pages. **Não publique o servidor Express, banco de dados ou dados privados.**

O site estático oculta o botão de acesso ao pastor e lê `/site-data.json` em vez de `/api/public/site`. O painel fica apenas na Central local. Os uploads referenciados são copiados para a pasta pública de exportação.

## Limitações e próximos passos
- Não há sincronização automática de publicações para o GitHub/Cloudflare.
- Não há Setup.exe nem serviço instalado no Windows; Node e npm ainda são necessários.
- O banco de dados incluído no ZIP original foi excluído desta entrega para proteger dados privados. O primeiro início criará banco novo. Para migrar dados antigos, copie o banco e arquivos WAL/SHM com o servidor parado e com backup prévio, depois revise os dados antes de publicar.
- O cadastro inicial só é permitido a partir do próprio computador. Não expor a porta 3000 à rede.
- O backup atual protege o banco; faça cópias separadas da pasta uploads.
- Validar funcionalmente no Windows: cadastro, login, logout, uploads, backup, exportação e deploy.
