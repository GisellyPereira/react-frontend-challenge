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

A URL guarda a pesquisa, filtros e índice da página. A digitação atualiza o campo imediatamente e confirma a consulta após 450 ms sem novas teclas, usando `replace` para não acumular entradas no histórico. Buscar, Enter e temas executam a consulta imediatamente e cancelam o debounce pendente. Toda nova consulta reinicia a paginação; limpar o campo mantém os resultados enquanto o usuário escreve outro termo. A navegação cancela rascunhos pendentes e sincroniza o campo com a URL. O debounce fica na entrada, sem uma segunda espera no TanStack Query, e a busca automática preserva o foco no campo.

O TanStack Query mantém o estado assíncrono e o cache. A integração com Google Books valida a resposta com Zod e converte os volumes para o modelo `Book`. O adapter trata dados ausentes e calcula a continuação da paginação. Zustand mantém a sessão local de demonstração.

A estante usa o middleware `persist` do Zustand com `createJSONStorage`, `partialize` para salvar somente as coleções por conta e Zod para validar a hidratação. A chave `libris:shelves:v1` é mantida: o formato antigo é reconhecido na desserialização como versão 0 e convertido por `migrate` para o envelope `{ state: { shelves }, version: 1 }`, preservando livros e status. O middleware faz as gravações; as ações restauram o estado anterior e retornam falha se o armazenamento recusar uma alteração. A ordenação da tabela é aplicada antes da paginação e não altera a ordem salva dos livros.

## Padrão visual

**Barlow Condensed é a fonte padrão da interface**, incluindo títulos, formulários, menus, cards e diálogos. A fonte é servida localmente em `app/styles/fonts.css`, nos pesos 400, 600 e 700. A exceção decorativa é Lobster 400 nas palavras de abertura “Que” do hero e “Explore” da introdução aos temas, aplicada pela classe `discover-script` e pelo token `--font-family-accent`. Esse recurso fica restrito aos títulos aprovados da página Discover; controles e textos de leitura usam a fonte padrão. Logos, capas externas e ilustrações são assets, não elementos tipográficos da interface.

Os tokens de fonte, cores e raios ficam em `app/styles/theme.css`. `app/styles/index.css` conecta esses tokens ao Tailwind, importa as fontes e define o fundo compartilhado. A interface herda a família global; variações visuais usam tamanho, peso e espaçamento.

O tema claro/escuro é gerenciado pela feature `theme`, com `persist` do Zustand e validação do valor restaurado. A primeira visita considera a preferência do sistema; a escolha pelo botão sol/lua prevalece nas visitas seguintes. Um script mínimo no início do HTML aplica essa preferência antes da primeira pintura, evitando o clarão do tema claro. A interface continua alternando em memória se o armazenamento estiver bloqueado.

A paleta das ilustrações (`--book-*`, `--paper` e `--illustration-ink`) permanece estável. Superfícies, textos de destaque e ações usam tokens próprios que mudam de tema. O banner em forma de livro mantém a capa clara e sua tinta escura; os SVGs com anotações soltas e o logo possuem variantes que clareiam apenas letras e traços, sem inverter as cores das imagens. Cada componente mantém seus ajustes no próprio CSS.

Cada componente importa seu próprio CSS. O CSS de página define apenas o layout da página, sem alterar elementos internos de componentes de outra camada:

- `DiscoverControls` oferece `variant="home"` e `variant="results"`. A variante controla somente a presença das buscas populares; os campos compartilham os mesmos estilos.
- `BookCard` oferece `variant="default"`, com metadados, e `variant="compact"`, com capa e título. A versão compacta não renderiza metadados ocultos.
- `BookResults` organiza o grid, os desenhos decorativos e a paginação. As capas ficam alinhadas, os desenhos são SVGs em assets e a paginação usa o componente shadcn, adaptado para botões de navegação. O total exibido é `totalItems`, informado pelo Google Books.

Os detalhes desenhados à mão ficam em SVG nos assets e não interceptam cliques. Os estilos de movimento respeitam `prefers-reduced-motion`, e os controles mantêm foco visível e nomes acessíveis.

As notificações usam Sonner em um componente compartilhado, com Barlow Condensed e os tokens dos temas claro e escuro. As ações da estante mostram sucesso ou erro após a tentativa de persistência; a notificação mais recente substitui a anterior da estante. O `QueryCache` notifica falhas das consultas de busca e detalhes após as tentativas configuradas, sem gerar toasts para cada renderização ou para coleções de fundo. As mensagens locais de erro continuam disponíveis na interface.

## Verificação

ESLint verifica o código TypeScript/React, Prettier padroniza a formatação, e o build valida tipos e resolução de assets. Vitest e Testing Library cobrem adapters, hooks e fluxos de interface, incluindo busca, paginação, autenticação e navegação. Os testes em `app/testing` usam as rotas, stores, shadcn e Sonner reais, com a API simulada por MSW: adicionar nos detalhes, alterar status, buscar, filtrar, ordenar, remover, reidratar a estante e recuperar falhas de gravação. O debounce também é verificado com relógio controlado e em navegação real, incluindo foco, filtros e retorno pelo histórico.

## Limites atuais

A autenticação é uma simulação local, sem backend de identidade. A estante usa `persist` do Zustand sobre localStorage, com livros separados pelo email da sessão; não há sincronização entre dispositivos nem proteção equivalente a uma conta real. O armazenamento é validado com Zod e falhas de gravação são informadas sem confirmar um salvamento inexistente. Os detalhes consultam a edição e os relacionados no Google Books. Prévia incorporada e downloads dependem da disponibilidade informada pelo serviço.
