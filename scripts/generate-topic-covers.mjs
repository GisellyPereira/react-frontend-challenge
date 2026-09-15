import { mkdirSync, writeFileSync } from 'node:fs'

const destination = 'src/shared/assets/topic-covers'
mkdirSync(destination, { recursive: true })
const path = (d, extra = '') => `<path d="${d}" ${extra}/>`
const circle = (x, y, r, extra = '') =>
  `<circle cx="${x}" cy="${y}" r="${r}" ${extra}/>`
const star = (x, y, r = 5) =>
  path(
    `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`,
    'fill="currentColor" stroke="none"',
  )
const lines = (count, fn) =>
  Array.from({ length: count }, (_, i) => fn(i)).join('')
const leaf = (x, y, angle, scale = 1) =>
  `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">${path('M0 0C-24-12-24-40 0-58C24-40 24-12 0 0ZM0 0V-53M0-12-12-26M0-24 13-39M0-34-9-43')}</g>`
const book = `<path d="M61 111Q91 100 113 115Q137 100 166 111V139Q137 129 113 144Q87 130 61 139ZM113 115V144M67 117Q89 110 105 119M67 124Q88 117 105 126M121 119Q140 110 160 117M121 126Q141 117 160 124"/>`
const orbit = (angle) =>
  `<ellipse cx="118" cy="89" rx="57" ry="20" transform="rotate(${angle} 118 89)"/>`
const arch = path(
  'M74 140V76A43 43 0 0 1 86 46A43 43 0 0 1 148 76V140M82 140V76A35 35 0 0 1 140 76V140',
)
const motifs = [
  [
    'literatura-brasileira',
    'Literatura brasileira',
    '#bc472f',
    '#fff0c9',
    circle(146, 56, 25, 'opacity=".5"') +
      circle(146, 56, 19, 'opacity=".3"') +
      path('M109 143Q99 92 113 46M108 119Q131 104 148 87M106 98Q81 79 72 64') +
      leaf(108, 116, -38, 0.75) +
      leaf(112, 88, 26, 0.73) +
      leaf(132, 105, 56, 0.65) +
      path(
        'M57 145Q83 131 110 145T176 140M58 151Q88 139 111 151T174 146',
        'opacity=".45"',
      ),
  ],
  [
    'romance',
    'Romance',
    '#285271',
    '#f8dfbd',
    path(
      'M115 136C101 121 64 97 65 70C66 39 101 39 115 61C132 36 168 43 168 71C168 98 134 119 115 136Z',
    ) +
      path(
        'M115 126C97 109 75 92 75 72C75 51 99 48 115 70C131 48 158 51 158 72C158 91 135 112 115 126',
        'opacity=".5"',
      ) +
      leaf(73, 135, -25, 0.5) +
      leaf(155, 135, 25, 0.5) +
      star(115, 39, 5) +
      circle(115, 98, 9) +
      path('M115 88V107M107 98H123'),
  ],
  [
    'fantasia',
    'Fantasia',
    '#c68808',
    '#302b20',
    arch +
      path(
        'M68 140H155M89 133H134M94 125H130M100 116H124M91 101 101 75 111 101ZM117 101 131 65 141 101M96 84V67H106V83M126 78V55L131 46 136 55V82',
      ) +
      circle(111, 51, 8, 'fill="currentColor" fill-opacity=".12"') +
      star(162, 44, 7) +
      star(60, 93, 4) +
      path('M93 140 108 106H120L135 140', 'opacity=".55"'),
  ],
  [
    'ficcao-cientifica',
    'Ficção científica',
    '#246465',
    '#e8e9c7',
    circle(116, 87, 33) +
      `<ellipse cx="116" cy="87" rx="65" ry="13" transform="rotate(-25 116 87)"/>` +
      path(
        'M90 67Q112 57 139 76M85 81Q112 69 146 91M91 99Q119 88 141 107',
        'opacity=".4"',
      ) +
      circle(159, 42, 9) +
      path('M153 42H165M159 36V48', 'opacity=".5"') +
      star(70, 44, 5) +
      star(159, 125, 6) +
      circle(64, 121, 2) +
      path('M72 142H138M86 147H125', 'opacity=".4"'),
  ],
  [
    'misterio-e-suspense',
    'Mistério e suspense',
    '#792640',
    '#f6d5bd',
    path('M56 87Q113 27 173 87Q115 146 56 87Z') +
      circle(115, 87, 24) +
      circle(115, 87, 12) +
      circle(120, 81, 4, 'fill="currentColor"') +
      lines(9, (i) => {
        const a = ((i * 18 + 18) * Math.PI) / 180
        return path(
          `M${115 + 58 * Math.cos(a)} ${83 - 48 * Math.sin(a)}l${9 * Math.cos(a)} ${-9 * Math.sin(a)}`,
        )
      }) +
      path('M109 127A7 7 0 1 1 120 132L124 145H106L110 132') +
      star(62, 130, 4),
  ],
  [
    'terror',
    'Terror',
    '#c77d8b',
    '#382630',
    circle(139, 53, 22, 'fill="currentColor" fill-opacity=".08"') +
      path(
        'M149 33A21 21 0 1 0 160 64A24 24 0 0 1 149 33ZM82 140V91L116 61 151 91V140M76 94 116 54 158 94M95 140V114H109V140M126 140V114H141V140M109 91A7 7 0 0 1 123 91V99H109ZM65 139V90L58 75M65 106 77 89M165 140V82L174 69M165 100 155 85M57 145H177',
      ) +
      path('M88 51 95 48 102 51M54 65 60 62 66 65', 'opacity=".6"'),
  ],
  [
    'poesia',
    'Poesia',
    '#596337',
    '#f5edc8',
    path(
      'M82 143Q105 117 139 47C156 35 167 38 166 51C163 80 135 113 105 121L82 143ZM105 121 157 48M116 103 119 76M124 90 149 79M134 75 136 55M100 138H153M100 145H138',
    ) +
      circle(74, 69, 17, 'opacity=".35"') +
      star(79, 69, 7) +
      path('M55 110Q67 99 77 110T98 110', 'opacity=".5"'),
  ],
  [
    'classicos',
    'Clássicos',
    '#ddbd95',
    '#544532',
    path(
      'M57 66 115 38 173 66ZM67 69H163V77H67ZM63 138H167V145H63M69 131H162V138H69',
    ) +
      lines(
        4,
        (i) =>
          `<g transform="translate(${77 + i * 24} 0)">${path('M-5 82H9V126H-5ZM-8 78H12V83H-8ZM-8 126H12V131H-8M0 87V122M4 87V122')}</g>`,
      ) +
      path('M80 60 115 45 150 60Z', 'opacity=".45"') +
      circle(115, 55, 4),
  ],
  [
    'contos',
    'Contos',
    '#bc472f',
    '#fff0c9',
    book +
      path(
        'M113 105Q82 82 84 61Q106 62 113 92Q119 61 144 52Q151 82 121 103M113 109V69M94 82 102 73M130 82 135 68',
      ) +
      star(68, 56, 5) +
      star(155, 88, 6) +
      circle(118, 47, 10, 'opacity=".55"') +
      path('M71 148H160', 'opacity=".4"'),
  ],
  [
    'biografias',
    'Biografias',
    '#285271',
    '#f8dfbd',
    `<rect x="74" y="36" width="84" height="108" rx="42"/>` +
      path(
        'M82 139C82 121 92 113 105 110V99C89 91 92 62 108 57C131 48 140 65 135 82L144 94H135V103H123V111C141 116 150 126 150 139M105 110Q113 119 123 111',
      ) +
      path(
        'M91 48Q115 33 141 49M62 87H67M165 87H170M92 148H140',
        'opacity=".45"',
      ) +
      circle(128, 79, 1.5, 'fill="currentColor"'),
  ],
  [
    'historia',
    'História',
    '#c68808',
    '#302b20',
    path(
      'M79 43H151V51H79ZM79 135H151V143H79ZM85 52C85 78 96 84 110 93C96 103 85 112 85 135M145 52C145 78 134 84 120 93C134 103 145 112 145 135M93 59H137M95 68Q115 88 135 68ZM96 128 115 107 135 128ZM115 89V103',
    ) +
      circle(115, 92, 60, 'stroke-dasharray="1 7" opacity=".5"') +
      path('M66 141H72M158 45H164'),
  ],
  [
    'filosofia',
    'Filosofia',
    '#246465',
    '#e8e9c7',
    path('M62 132 114 42 169 132ZM75 124H156L115 55Z') +
      circle(115, 102, 27) +
      path('M65 87H169M115 42V145', 'opacity=".35"') +
      circle(115, 102, 12) +
      path('M111 97C111 90 123 90 123 97C123 103 115 101 115 108M115 113V114') +
      star(64, 51, 5) +
      circle(168, 59, 4),
  ],
  [
    'psicologia',
    'Psicologia',
    '#792640',
    '#f6d5bd',
    path(
      'M88 143V120C59 101 68 61 95 47C131 28 160 53 159 79L169 101H157V120H137V144M104 127V111C89 101 89 84 97 74C110 56 137 65 139 83C141 99 129 108 118 106C106 104 104 88 113 83C122 77 131 87 124 93',
    ) +
      circle(111, 86, 43, 'stroke-dasharray="2 6" opacity=".35"') +
      star(64, 45, 5),
  ],
  [
    'ciencia',
    'Ciência',
    '#c77d8b',
    '#382630',
    orbit(0) +
      orbit(60) +
      orbit(120) +
      circle(118, 89, 8, 'fill="currentColor" fill-opacity=".2"') +
      circle(175, 89, 4, 'fill="currentColor"') +
      circle(90, 40, 4, 'fill="currentColor"') +
      circle(91, 137, 4, 'fill="currentColor"') +
      star(65, 44, 4) +
      path('M151 138H174M163 127V149', 'opacity=".6"'),
  ],
  [
    'tecnologia',
    'Tecnologia',
    '#596337',
    '#f5edc8',
    `<rect x="87" y="60" width="62" height="62" rx="7"/><rect x="98" y="71" width="40" height="40" rx="2"/>` +
      lines(4, (i) =>
        path(
          `M${96 + i * 14} 60V${43 - (i % 2) * 8}M${96 + i * 14} 122V${138 + (i % 2) * 8}M87 ${69 + i * 14}H${65 - (i % 2) * 8}M149 ${69 + i * 14}H${169 + (i % 2) * 8}`,
        ),
      ) +
      path('M112 83 104 91 112 99M125 83 133 91 125 99M121 81 116 102') +
      [
        [96, 43],
        [124, 43],
        [110, 146],
        [138, 146],
        [57, 83],
        [177, 111],
      ]
        .map(([x, y]) => circle(x, y, 3))
        .join(''),
  ],
  [
    'design',
    'Design',
    '#ddbd95',
    '#544532',
    `<rect x="64" y="43" width="103" height="103"/><rect x="64" y="43" width="64" height="64"/><rect x="128" y="107" width="39" height="39"/>` +
      path(
        'M64 107A64 64 0 0 1 128 43A103 103 0 0 1 167 146A39 39 0 0 1 128 107A24 24 0 0 1 152 131A15 15 0 0 1 137 146M55 43H60M64 34V39M171 146H177M167 151V156',
        'stroke-width="1.7"',
      ) +
      circle(96, 75, 23, 'opacity=".3"'),
  ],
  [
    'negocios',
    'Negócios',
    '#bc472f',
    '#fff0c9',
    path(
      'M64 142V115H84V142M97 142V93H117V142M130 142V70H150V142M58 147H170M66 99 99 75 117 80 158 42M141 43 158 42 157 59',
    ) +
      circle(158, 42, 13, 'opacity=".35"') +
      lines(4, (i) =>
        path(
          `M65 ${120 + i * 6}H83M98 ${101 + i * 9}H116M131 ${80 + i * 16}H149`,
          'opacity=".3"',
        ),
      ) +
      star(72, 49, 6),
  ],
  [
    'infantojuvenil',
    'Infantojuvenil',
    '#285271',
    '#f8dfbd',
    path(
      'M102 109C91 78 111 49 135 37C147 65 143 98 119 117ZM103 86 86 94 83 120 103 108M135 101 139 119 119 132 119 115M102 119 98 138 114 125',
    ) +
      circle(122, 71, 9) +
      circle(122, 71, 5, 'fill="currentColor" fill-opacity=".2"') +
      star(67, 53, 7) +
      star(165, 84, 5) +
      star(153, 135, 5) +
      circle(73, 105, 3) +
      path('M91 129 77 145M90 140 86 147', 'opacity=".5"'),
  ],
  [
    'hqs-e-mangas',
    'HQs e mangás',
    '#c68808',
    '#302b20',
    path(
      'M71 51H154Q165 51 165 63V106Q165 118 153 118H112L91 137 95 118H71Q59 118 59 106V63Q59 51 71 51Z',
    ) +
      path(
        'M118 64 98 90H112L105 108 134 81H118Z',
        'fill="currentColor" fill-opacity=".16"',
      ) +
      path(
        'M54 42 64 47M81 32 85 44M151 34 146 44M175 62 185 57M176 90H188M161 129 170 138',
      ) +
      lines(5, (i) =>
        circle(72 + i * 4, 104, 0.8, 'fill="currentColor" opacity=".5"'),
      ),
  ],
  [
    'saude-e-bem-estar',
    'Saúde e bem-estar',
    '#246465',
    '#e8e9c7',
    path(
      'M115 137C80 132 63 111 61 88C81 88 103 103 115 137ZM115 137C149 133 166 111 169 88C143 92 125 107 115 137ZM115 133C85 109 88 74 115 50C142 74 145 109 115 133ZM115 64V128M71 99 104 128M158 101 126 129',
    ) +
      circle(115, 88, 52, 'stroke-dasharray="1 6" opacity=".35"') +
      path('M84 146Q116 154 147 146') +
      star(164, 45, 5),
  ],
  [
    'culinaria',
    'Culinária',
    '#792640',
    '#f6d5bd',
    path(
      'M65 99H164C161 124 141 140 115 140C88 140 68 124 65 99ZM83 142H146M74 106H154M94 85C80 72 105 66 93 52M114 86C99 72 127 61 113 44M136 85C123 73 145 67 135 56M166 99 174 52',
      'stroke-width="1.5"',
    ) +
      leaf(66, 91, -25, 0.43) +
      circle(173, 47, 7) +
      path('M79 116Q84 125 92 128', 'opacity=".5"'),
  ],
  [
    'artes',
    'Artes',
    '#c77d8b',
    '#382630',
    path(
      'M112 43C81 42 58 62 60 90C62 119 90 135 105 133C128 130 109 114 124 107C135 101 144 115 158 101C181 79 149 44 112 43Z',
    ) +
      [
        [84, 72, 7],
        [107, 59, 6],
        [132, 64, 7],
        [150, 82, 6],
      ]
        .map(([x, y, r]) =>
          circle(x, y, r, 'fill="currentColor" fill-opacity=".15"'),
        )
        .join('') +
      path(
        'M113 133 161 54 167 58 121 138ZM113 133C97 132 102 148 91 150C113 154 122 149 121 138',
      ) +
      circle(85, 105, 8) +
      path('M65 143H85', 'opacity=".5"'),
  ],
  [
    'educacao',
    'Educação',
    '#596337',
    '#f5edc8',
    book +
      path(
        'M102 89C79 72 89 43 114 43C141 43 150 73 127 89L126 99H103ZM103 104H126M108 109H121M110 94 106 70 115 76 124 70 120 94M115 29V35M78 43 84 49M150 44 145 50M72 70H80M151 70H159',
      ) +
      circle(115, 68, 19, 'opacity=".3"') +
      star(163, 41, 4),
  ],
  [
    'viagens',
    'Viagens',
    '#ddbd95',
    '#544532',
    circle(115, 91, 47) +
      circle(115, 91, 39) +
      path(
        'M115 49V56M115 126V133M73 91H80M150 91H157M85 61 90 66M140 116 145 121M85 121 90 116M140 66 145 61M129 65 122 98 101 118 108 84ZM108 84 122 98',
        'stroke-width="1.4"',
      ) +
      path('M129 65 115 91 108 84Z', 'fill="currentColor" fill-opacity=".3"') +
      circle(115, 91, 4) +
      path(
        'M110 34V25L120 34V25M57 145Q77 128 91 145T131 145T173 145',
        'opacity=".6"',
      ),
  ],
]

for (const [slug, label, background, ink, artwork] of motifs) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 280" fill="none">
  <title>${label} — capa ilustrada</title>
  <defs>
    <linearGradient id="cloth" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".08"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
    <linearGradient id="spine"><stop stop-color="#000" stop-opacity=".24"/><stop offset=".5" stop-color="#000" stop-opacity=".03"/><stop offset=".8" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
    <pattern id="weave" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 .5H4M.5 0V4" stroke="${ink}" stroke-opacity=".045" stroke-width=".5"/></pattern>
  </defs>
  <rect width="220" height="280" rx="8" fill="${background}"/>
  <rect width="220" height="280" rx="8" fill="url(#cloth)"/>
  <rect width="220" height="280" rx="8" fill="url(#weave)"/>
  <path d="M8 0H19V280H8Z" fill="url(#spine)"/>
  <path d="M20 6H210Q214 6 214 10V270" stroke="${ink}" stroke-opacity=".32"/>
  <path d="M22 0V280" stroke="#000" stroke-opacity=".16"/>
  <g color="${ink}" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round">
    <g transform="translate(5 4)">${artwork}</g>
    <path d="M36 167H65M36 172H53" opacity=".7"/>
    <path d="M173 253H195M181 258H195" opacity=".55"/>
    <path d="M36 262H151" opacity=".16"/>
  </g>
</svg>
`
  writeFileSync(`${destination}/${slug}.svg`, svg)
}
console.log(
  `Generated ${motifs.length} illustrated SVG covers in ${destination}`,
)
