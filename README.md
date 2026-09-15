# Libris — entrega do desafio React

## Case escolhido

Foi escolhido o case **Libris**, um gerenciador de biblioteca pessoal e estante virtual. A aplicação permite descobrir livros, salvar títulos, acompanhar o status de leitura e consultar os detalhes de cada item.

## Entrega

A solução contempla os fluxos principais do desafio:

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

## Critérios e diferenciais atendidos

- React com TypeScript em modo estrito e Vite.
- TanStack Query para busca remota, cache e estados assíncronos.
- Zustand para autenticação e gerenciamento persistido da estante.
- TanStack Router para rotas protegidas e navegação.
- TanStack Table para a listagem tabular, com ordenação e paginação controladas.
- React Hook Form e Zod para validação do formulário de login.
- Vitest e React Testing Library para testes unitários, de integração e de fluxo.
- Organização modular inspirada em Feature-Sliced Design.
- Tratamento de erros de rede, respostas inválidas e limites da API.
- Acessibilidade com labels, foco visível, navegação por teclado e regiões de status.
- Adaptação para diferentes larguras de tela e preferência por movimento reduzido.

## Decisões técnicas

O estado remoto fica concentrado no TanStack Query, enquanto dados específicos da sessão e da estante são mantidos no Zustand. Essa separação evita misturar cache de API com estado de interação local.

As estantes são associadas ao e-mail informado no login e persistidas no navegador. Como o desafio é uma aplicação front-end, não foi criado um servidor próprio ou banco de dados.

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

## Veja o projeto aqui:

