# ⛪ O Evangelho da Paz

### Site Oficial & Central Administrativa

**Comunidade Evangélica Pentecostal O Evangelho da Paz**

Uma plataforma digital desenvolvida para aproximar a igreja de seus membros, compartilhar a Palavra de Deus e facilitar a gestão de conteúdos e atividades da comunidade.

---

## ✨ Sobre o Projeto

O **Evangelho da Paz** é uma solução web moderna, responsiva e acessível, criada para oferecer uma experiência digital acolhedora aos membros, visitantes e à liderança da igreja.

O projeto reúne um **site institucional público** e uma **Central Administrativa**, permitindo organizar publicações, estudos bíblicos, eventos, comunicados e galerias de fotografias em uma única plataforma.

O desenvolvimento prioriza desempenho, facilidade de navegação, segurança e simplicidade de uso.

## 🌟 Funcionalidades

### 🌐 Site Público

- **Palavra do Dia:** mensagens bíblicas e reflexões em destaque.
- **Estudos Bíblicos:** conteúdos organizados para leitura e aprofundamento espiritual.
- **Frases e Reflexões:** mensagens de fé e inspiração.
- **Agenda de Cultos:** programação e próximos eventos da igreja.
- **Avisos e Comunicados:** informações importantes para a comunidade.
- **Galeria de Fotos:** álbuns organizados por cultos, encontros e eventos.
- **Dízimos e Ofertas:** informações e QR Code Pix para contribuições.
- **Localização:** endereço e integração com mapas.
- **Redes Sociais:** acesso aos canais oficiais da igreja.
- **Design Responsivo:** navegação adaptada para computadores, tablets e smartphones.

### 🔐 Central Administrativa

Uma área de gerenciamento desenvolvida para a liderança da igreja.

- Autenticação com e-mail e senha.
- Cadastro e gerenciamento de usuários autorizados.
- Criação, edição e exclusão de publicações.
- Gerenciamento de Palavra do Dia, estudos e reflexões.
- Administração de eventos e comunicados.
- Criação de álbuns fotográficos e upload de múltiplas imagens.
- Organização de conteúdos em rascunhos e publicações.
- Configuração das informações institucionais.
- Armazenamento local com SQLite.
- Recursos de backup e exportação de dados públicos.

> **Nota:** A Central Administrativa está em fase de preparação para distribuição como aplicativo Windows. A sincronização automática com o site hospedado será integrada e validada separadamente.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Aplicação |
|---|---|
| React | Interface do usuário |
| TypeScript | Desenvolvimento tipado |
| Vite | Ambiente de desenvolvimento e build |
| Tailwind CSS | Estilização e responsividade |
| Node.js | Ambiente de execução |
| Express | API e servidor local |
| SQLite | Banco de dados administrativo |
| GitHub | Versionamento do código |
| Cloudflare Pages | Hospedagem planejada do site público |

---

## 📁 Estrutura do Projeto

```text
evangelhodapaz/
├── public/                 # Imagens e recursos públicos
├── src/
│   ├── components/         # Componentes da interface
│   ├── types/              # Tipagens TypeScript
│   └── App.tsx             # Aplicação principal
├── server/
│   └── db.ts               # Banco de dados SQLite
├── server.ts               # API Express
├── package.json            # Dependências e scripts
└── README.md               # Documentação
```

## 💻 Executando Localmente

### Pré-requisitos

- Node.js e npm instalados.
- Git.
- VS Code ou outro editor de código.

Clone o repositório:

```bash
git clone https://github.com/LkSolucoesTec/evangelhodapaz.git
```

Acesse a pasta:

```bash
cd evangelhodapaz
```

Instale as dependências:

```bash
npm install
```

Inicie a Central em modo de desenvolvimento:

```bash
npm run dev:central
```

Acesse a aplicação:

```text
http://127.0.0.1:3000
```

Para acessar a área administrativa:

```text
http://127.0.0.1:3000/admin
```

### Build do Site Público

```bash
npm run build:public
```

Os arquivos gerados na pasta `dist/` são destinados à hospedagem estática, após validação da exportação dos conteúdos e das imagens.

---

## 🔒 Segurança e Privacidade

O projeto separa os dados administrativos dos arquivos destinados à publicação.

- Senhas armazenadas com hash.
- Sessões autenticadas para acesso administrativo.
- Rotas protegidas no servidor local.
- Banco SQLite mantido fora da hospedagem pública.
- Dados privados e credenciais excluídos do versionamento.
- Publicação de conteúdo público sem expor informações administrativas.

**Nunca inclua arquivos `.env`, bancos de dados reais, backups, tokens ou credenciais no repositório.**

---

## 🎨 Identidade Visual

A interface utiliza uma combinação de **azul-marinho, dourado e branco**, inspirada na identidade visual da igreja.

O design busca transmitir acolhimento, confiança, reverência e modernidade, preservando a facilidade de navegação para pessoas de diferentes idades.

---

## 🙏 Sobre a Igreja

**Comunidade Evangélica Pentecostal O Evangelho da Paz**

**Presidência:** Pr. Robson Andrade e Pra. Simone Andrade.

📍 **Endereço:** Rua Professora Nina Stocco, 529 — Jardim Catanduva, São Paulo — SP, Brasil.

### Redes e Contato

- [Instagram Oficial](https://www.instagram.com/oevangelhodapaz)
- [Facebook Oficial](https://www.facebook.com/oevangelhodapaz)
- [WhatsApp](https://wa.me/5511983646182)

---

## 👨‍💻 Desenvolvimento

Projeto desenvolvido por **LK Soluções Tecnológicas**, com foco em desenvolvimento web, soluções digitais, experiência do usuário e sistemas de gerenciamento.

**GitHub:** [@LkSolucoesTec](https://github.com/LkSolucoesTec)

---

## 📌 Status do Projeto

**Em fase de implantação e validação.**

O site público e a Central Administrativa estão sendo preparados para publicação, testes de integração e distribuição do aplicativo Windows.

---

<div align="center">

### ✝️ Fé, comunhão e tecnologia conectando pessoas.

**Comunidade Evangélica Pentecostal O Evangelho da Paz**

*Desenvolvido com dedicação pela LK Soluções Tecnológicas.*

</div>
