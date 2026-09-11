# Executar o Libris

Projeto escolhido: **Libris**, gerenciador de biblioteca pessoal. A implementação atual inclui login de demonstração, busca no Google Books, filtros, paginação e capas alternativas.

Use Node.js 22.12 ou superior e npm. Não é necessário configurar uma chave para a busca pública atual.

```sh
npm ci
npm run dev
```

Abra o endereço informado pelo Vite. Para entrar na demonstração, use um email válido e uma senha com pelo menos sete caracteres. A sessão é local; não utilize credenciais reais.

## Verificações

```sh
npm run lint
npm run format:check
npm test
npm run build
```

`npm run preview` serve o build de produção. `npm run test:coverage` gera o relatório de cobertura.

Consulte [ARCHITECTURE.md](ARCHITECTURE.md) para estrutura, padrão visual e limitações atuais. Os detalhes incluem prévias quando liberadas pelo Google Books; a estante permite salvar e remover livros localmente por conta de demonstração.
