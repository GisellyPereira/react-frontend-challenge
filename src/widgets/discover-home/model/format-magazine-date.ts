const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatMagazineDate(value: string | null) {
  if (!value) return 'Data não informada'
  const match = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(value)
  if (!match) return value
  const month = Number(match[2])
  if (month < 1 || month > 12) return value
  // The display identifies the issue's month; year-only dates stay year-only.
  const date = new Date(`${match[1]}-${match[2]}-01T12:00:00Z`)
  return monthFormatter.format(date)
}
