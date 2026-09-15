import { describe, expect, it } from 'vitest'

import {
  parseGoogleBooksSearchResponse,
  parseGoogleVolume,
} from './map-google-volume'

describe('parseGoogleVolume', () => {
  it('preserva permissões de leitura e somente downloads disponíveis com URL segura', () => {
    const book = parseGoogleVolume({
      id: 'readable',
      accessInfo: {
        embeddable: true,
        viewability: 'ALL_PAGES',
        pdf: {
          isAvailable: true,
          downloadLink: 'http://books.google.com/download.pdf',
        },
        epub: { isAvailable: true, downloadLink: 'javascript:alert(1)' },
      },
      volumeInfo: {
        industryIdentifiers: [{ type: 'ISBN_13', identifier: '9780000000000' }],
      },
    })
    expect(book.reading).toEqual({
      embeddable: true,
      viewability: 'ALL_PAGES',
      pdf: 'https://books.google.com/download.pdf',
      epub: null,
    })
    expect(book.identifiers).toEqual([
      { type: 'ISBN_13', identifier: '9780000000000' },
    ])
    expect(
      parseGoogleVolume({
        id: 'unavailable',
        accessInfo: {
          pdf: {
            isAvailable: false,
            downloadLink: 'https://books.google.com/download.pdf',
          },
          epub: { isAvailable: true },
        },
      }).reading,
    ).toMatchObject({ pdf: null, epub: null })
  })
  it('transforma um volume completo no modelo limpo do Libris', () => {
    const book = parseGoogleVolume({
      accessInfo: {
        webReaderLink: 'https://books.google.com/web-reader',
      },
      id: '  volume-1  ',
      volumeInfo: {
        authors: ['Robert C. Martin'],
        averageRating: 4.7,
        categories: ['Computação', 'Engenharia de software'],
        description: '  Um guia sobre código sustentável.  ',
        imageLinks: {
          extraLarge: 'https://images.example.com/extra-large.jpg',
          large: 'https://images.example.com/large.jpg',
          medium: 'https://images.example.com/medium.jpg',
          small: 'https://images.example.com/small.jpg',
          smallThumbnail: 'https://images.example.com/small-thumbnail.jpg',
          thumbnail: 'https://images.example.com/thumbnail.jpg',
        },
        infoLink: '  https://books.google.com/info/volume-1  ',
        language: '  pt-BR  ',
        pageCount: 464,
        previewLink: 'https://books.google.com/preview/volume-1',
        publishedDate: '  2008-08-01  ',
        publisher: '  Prentice Hall  ',
        ratingsCount: 1820,
        subtitle: '  Um manual de boas práticas  ',
        title: '  Código Limpo  ',
      },
    })

    expect(book).toEqual({
      identifiers: [],
      reading: { embeddable: false, viewability: null, pdf: null, epub: null },
      authors: ['Robert C. Martin'],
      averageRating: 4.7,
      categories: ['Computação', 'Engenharia de software'],
      cover: {
        large: 'https://images.example.com/extra-large.jpg',
        small: 'https://images.example.com/small.jpg',
      },
      description: 'Um guia sobre código sustentável.',
      id: 'volume-1',
      infoUrl: 'https://books.google.com/info/volume-1',
      language: 'pt-BR',
      pageCount: 464,
      previewUrl: 'https://books.google.com/preview/volume-1',
      publishedDate: '2008-08-01',
      publisher: 'Prentice Hall',
      ratingsCount: 1820,
      subtitle: 'Um manual de boas práticas',
      title: 'Código Limpo',
    })
  })

  it('representa campos ausentes com null e listas vazias', () => {
    expect(parseGoogleVolume({ id: 'volume-minimo' })).toEqual({
      identifiers: [],
      reading: { embeddable: false, viewability: null, pdf: null, epub: null },
      authors: [],
      averageRating: null,
      categories: [],
      cover: {
        large: null,
        small: null,
      },
      description: null,
      id: 'volume-minimo',
      infoUrl: null,
      language: null,
      pageCount: null,
      previewUrl: null,
      publishedDate: null,
      publisher: null,
      ratingsCount: null,
      subtitle: null,
      title: null,
    })
  })

  it('normaliza e remove autores e categorias repetidos ou inválidos', () => {
    const book = parseGoogleVolume({
      id: 'volume-listas',
      volumeInfo: {
        authors: [
          '  Ursula K. Le Guin  ',
          'Ursula K. Le Guin',
          '',
          '   ',
          null,
          42,
        ],
        categories: [
          '  Ficção científica  ',
          'Ficção científica',
          'Fantasia',
          false,
        ],
      },
    })

    expect(book.authors).toEqual(['Ursula K. Le Guin'])
    expect(book.categories).toEqual(['Ficção científica', 'Fantasia'])
  })

  it('converte capas HTTP para HTTPS e respeita a prioridade de tamanho', () => {
    const book = parseGoogleVolume({
      id: 'volume-capa',
      volumeInfo: {
        imageLinks: {
          extraLarge: 'http://images.example.com/capa-grande.jpg',
          smallThumbnail: 'http://images.example.com/capa-miniatura.jpg',
          thumbnail: 'http://images.example.com/capa-pequena.jpg',
        },
      },
    })

    expect(book.cover).toEqual({
      large: 'https://images.example.com/capa-grande.jpg',
      small: 'https://images.example.com/capa-pequena.jpg',
    })
  })

  it('solicita uma capa maior do Google quando só existem miniaturas', () => {
    const book = parseGoogleVolume({
      id: 'volume-miniatura',
      volumeInfo: {
        imageLinks: {
          thumbnail:
            'http://books.google.com/books/content?id=volume-miniatura&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
        },
      },
    })

    expect(book.cover.large).toBe(
      'https://books.google.com/books/content?id=volume-miniatura&printsec=frontcover&img=1&zoom=3&source=gbs_api',
    )
    expect(book.cover.small).toBe(
      'https://books.google.com/books/content?id=volume-miniatura&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    )
  })

  it('usa a primeira URL válida quando uma opção prioritária está quebrada', () => {
    const book = parseGoogleVolume({
      accessInfo: {
        webReaderLink: 'https://books.google.com/web-reader-valido',
      },
      id: 'volume-fallbacks',
      volumeInfo: {
        imageLinks: {
          extraLarge: 'javascript:alert(1)',
          large: 'https://images.example.com/capa-grande-valida.jpg',
          small: 'https://images.example.com/capa-pequena-valida.jpg',
          thumbnail: 'URL inválida',
        },
        previewLink: 'ftp://books.example.com/preview-invalido',
      },
    })

    expect(book.cover).toEqual({
      large: 'https://images.example.com/capa-grande-valida.jpg',
      small: 'https://images.example.com/capa-pequena-valida.jpg',
    })
    expect(book.previewUrl).toBe('https://books.google.com/web-reader-valido')
  })

  it('converte a sinopse HTML em texto seguro e preserva sua leitura', () => {
    const book = parseGoogleVolume({
      id: 'volume-sinopse',
      volumeInfo: {
        description:
          '<p>Uma história &amp; seus caminhos.</p><script>alert("xss")</script><p>Segundo parágrafo.<br>Nova linha.</p>',
      },
    })

    expect(book.description).toBe(
      'Uma história & seus caminhos.\n\nSegundo parágrafo.\nNova linha.',
    )
  })

  it.each([0, 6])(
    'descarta uma avaliação fora do intervalo oficial: %s',
    (averageRating) => {
      const book = parseGoogleVolume({
        id: 'volume-avaliacao',
        volumeInfo: { averageRating },
      })

      expect(book.averageRating).toBeNull()
    },
  )

  it('rejeita URLs inválidas e protocolos inseguros', () => {
    const book = parseGoogleVolume({
      accessInfo: {
        webReaderLink: 'file:///catalogo/livro.html',
      },
      id: 'volume-links-invalidos',
      volumeInfo: {
        imageLinks: {
          extraLarge: 'javascript:alert(1)',
          thumbnail: 'isto não é uma URL',
        },
        infoLink: 'data:text/html,<script>alert(1)</script>',
        previewLink: 'ftp://books.example.com/preview',
      },
    })

    expect(book.cover).toEqual({ large: null, small: null })
    expect(book.infoUrl).toBeNull()
    expect(book.previewUrl).toBeNull()
  })

  it('usa o leitor web quando o link de prévia não foi informado', () => {
    const book = parseGoogleVolume({
      accessInfo: {
        webReaderLink: 'http://books.google.com/web-reader',
      },
      id: 'volume-leitor-web',
    })

    expect(book.previewUrl).toBe('https://books.google.com/web-reader')
  })
})

describe('parseGoogleBooksSearchResponse', () => {
  it('descarta um item sem id sem afetar os volumes válidos', () => {
    const result = parseGoogleBooksSearchResponse(
      {
        items: [
          { id: 'volume-1', volumeInfo: { title: 'Primeiro livro' } },
          { volumeInfo: { title: 'Livro sem identificação' } },
          { id: 'volume-2', volumeInfo: { title: 'Segundo livro' } },
        ],
        totalItems: 30,
      },
      { maxResults: 3, startIndex: 6 },
    )

    expect(result.books.map((book) => book.id)).toEqual([
      'volume-1',
      'volume-2',
    ])
    expect(result.books.map((book) => book.title)).toEqual([
      'Primeiro livro',
      'Segundo livro',
    ])
  })

  it('calcula a próxima página pela quantidade bruta recebida', () => {
    const result = parseGoogleBooksSearchResponse(
      {
        items: [
          { id: 'volume-1' },
          { volumeInfo: { title: 'Item inválido sem id' } },
          { id: 'volume-2' },
        ],
        totalItems: 30,
      },
      { maxResults: 3, startIndex: 6 },
    )

    expect(result.books).toHaveLength(2)
    expect(result.receivedItems).toBe(3)
    expect(result.nextStartIndex).toBe(9)
    expect(result).toMatchObject({
      pageSize: 3,
      startIndex: 6,
      totalItems: 30,
    })
  })

  it('trata uma resposta sem items como uma página vazia', () => {
    const result = parseGoogleBooksSearchResponse(
      { totalItems: 0 },
      { maxResults: 12, startIndex: 0 },
    )

    expect(result).toEqual({
      books: [],
      nextStartIndex: null,
      pageSize: 12,
      receivedItems: 0,
      startIndex: 0,
      totalItems: 0,
    })
  })

  it.each([{}, { items: null, totalItems: 0 }])(
    'rejeita um contrato de busca inválido',
    (payload) => {
      expect(() =>
        parseGoogleBooksSearchResponse(payload, {
          maxResults: 12,
          startIndex: 0,
        }),
      ).toThrow()
    },
  )

  it('encerra a paginação quando a API devolve menos itens que o solicitado', () => {
    const result = parseGoogleBooksSearchResponse(
      {
        items: [{ id: 'volume-final' }],
        totalItems: 100,
      },
      { maxResults: 12, startIndex: 24 },
    )

    expect(result.receivedItems).toBe(1)
    expect(result.nextStartIndex).toBeNull()
  })
})
