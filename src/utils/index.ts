export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(' ')
}

// Type colors map for Pokemon type styling
export const typeColors: Record<string, { bg: string; text: string }> = {
  normal: { bg: 'bg-gray-200', text: 'text-gray-700' },
  fire: { bg: 'bg-orange-100', text: 'text-orange-700' },
  water: { bg: 'bg-blue-100', text: 'text-blue-700' },
  electric: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  grass: { bg: 'bg-green-100', text: 'text-green-700' },
  ice: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  fighting: { bg: 'bg-red-100', text: 'text-red-700' },
  poison: { bg: 'bg-purple-100', text: 'text-purple-700' },
  ground: { bg: 'bg-amber-100', text: 'text-amber-700' },
  flying: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  psychic: { bg: 'bg-pink-100', text: 'text-pink-700' },
  bug: { bg: 'bg-lime-100', text: 'text-lime-700' },
  rock: { bg: 'bg-stone-100', text: 'text-stone-700' },
  ghost: { bg: 'bg-violet-100', text: 'text-violet-700' },
  dragon: { bg: 'bg-indigo-200', text: 'text-indigo-800' },
  dark: { bg: 'bg-gray-800', text: 'text-gray-100' },
  steel: { bg: 'bg-slate-200', text: 'text-slate-700' },
  fairy: { bg: 'bg-rose-100', text: 'text-rose-700' }
}

// Get color for a Pokemon type with fallback
export const getTypeColor = (type: string) => {
  return (
    typeColors[type.toLowerCase()] || {
      bg: 'bg-gray-200',
      text: 'text-gray-700'
    }
  )
}

// Get combined type color classes as a single string
export const getTypeColorClasses = (type: string): string => {
  const { bg, text } = getTypeColor(type)
  return `${bg} ${text}`
}
