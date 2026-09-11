# Arquitetura do Libris

O projeto usa React, TypeScript e Vite, organizado por responsabilidade seguindo Feature-Sliced Design. Os módulos expõem sua API pública pelo `index.ts`; as páginas compõem funcionalidades e widgets, sem implementar acesso à API.

## Organização

- `app`: inicialização, providers e estilos globais.
- `routes`: configuração do TanStack Router e validação dos parâmetros de URL.
- `pages`: composição e layout de cada tela.
- `widgets`: blocos de interface, como cabeçalho e resultados.
- `features`: comportamentos de autenticação e pesquisa.
- `entities`: modelos, adapters e componentes de livro.
- `shared`: componentes básicos, assets e utilitários.

## Estado e pesquisa

A URL guarda a pesquisa confirmada, filtros e índice da página. O texto ainda em edição fica no formulário; limpar o campo não desmonta os resultados. Enviar o formulário ou escolher um assunto confirma a pesquisa e reinicia a paginação.

O TanStack Query mantém o estado assíncrono e o cache. A integração com Google Books valida a resposta com Zod e converte os volumes para o modelo `Book`. O adapter trata dados ausentes e calcula a continuação da paginação. Zustand mantém a sessão local de demonstração.

## Padrão visual

**Barlow Condensed é a fonte padrão da interface**, incluindo títulos, formulários, menus, cards e diálogos. A fonte é servida localmente em `app/styles/fonts.css`, nos pesos 400, 600 e 700. A exceção decorativa é Lobster 400 nas palavras de abertura “Que” do hero e “Explore” da introdução aos temas, aplicada pela classe `discover-script` e pelo token `--font-family-accent`. Esse recurso fica restrito aos títulos aprovados da página Discover; controles e textos de leitura usam a fonte padrão. Logos, capas externas e ilustrações são assets, não elementos tipográficos da interface.

Os tokens de fonte, cores e raios ficam em `app/styles/theme.css`. `app/styles/index.css` conecta esses tokens ao Tailwind, importa as fontes e define o fundo compartilhado. A interface herda a família global; variações visuais usam tamanho, peso e espaçamento.

Cada componente importa seu próprio CSS. O CSS de página define apenas o layout da página, sem alterar elementos internos de componentes de outra camada:

- `DiscoverControls` oferece `variant="home"` e `variant="results"`. A variante controla somente a presença das buscas populares; os campos compartilham os mesmos estilos.
- `BookCard` oferece `variant="default"`, com metadados, e `variant="compact"`, com capa e título. A versão compacta não renderiza metadados ocultos.
- `BookResults` organiza o grid, os desenhos decorativos e a paginação. As capas ficam alinhadas, os desenhos são SVGs em assets e a paginação usa o componente shadcn, adaptado para botões de navegação. O total exibido é `totalItems`, informado pelo Google Books.

Os detalhes desenhados à mão ficam em SVG nos assets e não interceptam cliques. Os estilos de movimento respeitam `prefers-reduced-motion`, e os controles mantêm foco visível e nomes acessíveis.

## Verificação

ESLint verifica o código TypeScript/React, Prettier padroniza a formatação, e o build valida tipos e resolução de assets. Vitest e Testing Library cobrem adapters, hooks e fluxos de interface, incluindo busca, paginação, autenticação e navegação.

## Limites atuais

A autenticação é uma simulação local, sem backend de identidade. A estante usa Zustand e localStorage, com livros separados pelo email da sessão; não há sincronização entre dispositivos nem proteção equivalente a uma conta real. O armazenamento é validado com Zod e falhas de gravação são informadas sem confirmar um salvamento inexistente. Os detalhes consultam a edição e os relacionados no Google Books. Prévia incorporada e downloads dependem da disponibilidade informada pelo serviço.
