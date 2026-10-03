# Libris

Sua próxima leitura começa aqui. O Libris é uma biblioteca pessoal para descobrir livros, montar uma estante virtual e acompanhar o que você quer ler, está lendo ou já leu.

[Acessar o Libris](https://libris-tests.netlify.app/login) · [Código-fonte](https://github.com/GisellyPereira/react-frontend-challenge)

## A experiência

A identidade visual traz livros ilustrados, textura de papel e uma composição editorial que aproxima a interface do universo da leitura. A aplicação oferece temas claro e escuro e se adapta ao computador e ao celular.

### Acesso à biblioteca

![Tela de acesso do Libris, com marca autoral e uma estante ilustrada](docs/images/libris-login.png)

### Descoberta de livros

![Tela Descobrir do Libris, com busca por título, autoria ou assunto e sugestões de leitura](docs/images/libris-discover.png)

## Funcionalidades

Da descoberta à organização da estante:

- Descoberta de livros por busca, sugestões e tópicos.
- Login local e estantes separadas por usuário.
- Inclusão e remoção de livros da estante.
- Status de leitura: Quero ler, Lendo e Lido.
- Busca, filtros, ordenação e paginação.
- Visualização em prateleiras e em tabela.
- Detalhes do livro e pré-visualização quando disponível.
- Estados de carregamento, erro e lista vazia.
- Tema claro e escuro.
- Layout responsivo, incluindo navegação de prateleiras em carrossel no mobile.
- Persistência da sessão e da estante no `localStorage`.

## Tecnologias e arquitetura

- React com TypeScript em modo estrito e Vite.
- TanStack Query para busca remota, cache e estados assíncronos.
- Zustand para autenticação e gerenciamento persistido da estante.
- TanStack Router para rotas protegidas e navegação.
- TanStack Table para a listagem tabular, com ordenação e paginação controladas.
- TanStack Form e Zod para validação do formulário de login.
- Vitest e React Testing Library para testes unitários, de integração e de fluxo.
- Organização modular inspirada em Feature-Sliced Design.
- Tratamento de erros de rede, respostas inválidas e limites da API.
- Acessibilidade com labels, foco visível, navegação por teclado e regiões de status.
- Adaptação para diferentes larguras de tela e preferência por movimento reduzido.

## Decisões técnicas

O estado remoto fica concentrado no TanStack Query, enquanto dados específicos da sessão e da estante são mantidos no Zustand. Essa separação evita misturar cache de API com estado de interação local.

As estantes são associadas ao e-mail informado no login e persistidas no navegador. A sessão é local: o login permite separar as estantes neste navegador e não representa uma autenticação em servidor. Para experimentar, use um e-mail válido e uma senha com pelo menos 7 caracteres.

A tabela usa TanStack Table para manter a lógica de ordenação, filtragem e paginação independente da apresentação. A visualização em prateleiras é uma camada visual alternativa para os mesmos livros.

## Organização do código

```text
src/
├── entities/   entidades e integração com a Google Books API
├── features/   autenticação, descoberta, temas, leitura e estante
├── pages/      composição das telas e estilos específicos
├── widgets/    blocos maiores reutilizáveis da interface
└── shared/     componentes, estilos, utilitários e assets compartilhados
```

## Requisitos

- Node.js 22 ou superior.
- npm 10 ou superior.

## Como executar

Instale as dependências:

```bash
npm install
```

Crie o arquivo local de ambiente:

```bash
cp .env.example .env.local
```

Preencha `VITE_GOOGLE_BOOKS_API_KEY` com uma chave da Google Books API. A aplicação também pode ser iniciada sem a chave, mas as consultas estarão sujeitas aos limites públicos da API.

Inicie o projeto:

```bash
npm run dev
```

## Qualidade

Comandos para verificar o projeto:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

A suíte reúne **42 arquivos e 204 testes**, cobrindo componentes, integrações e os principais fluxos de uso.

## Deploy

O arquivo `netlify.toml` já define:

- Comando de build: `npm run build`.
- Diretório publicado: `dist`.
- Redirecionamento de rotas para `index.html`.

No Netlify, a variável `VITE_GOOGLE_BOOKS_API_KEY` deve ser cadastrada nas variáveis de ambiente específicas do projeto e um novo deploy deve ser executado após a configuração.

Arquivos `.env.local` não devem ser versionados. Como variáveis `VITE_` são incluídas no código do navegador, a chave da API deve ser restringida ao domínio usado no deploy.
