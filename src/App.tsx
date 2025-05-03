import { useEffect, useState, useRef } from 'react'
import usePokemonStore, { PokemonListItem } from './hooks/usePokemonStore'
import PokemonCard from './components/PokemonCard'
import PokemonModal from './components/PokemonModal'
import { useInView } from 'react-intersection-observer'

function App() {
  const {
    pokemonList,
    fetchInitialList,
    fetchNextListItems,
    isLoadingList,
    error,
    nextOffset,
    count
  } = usePokemonStore()

  const [selectedPokemon, setSelectedPokemon] =
    useState<PokemonListItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const currentOffset = useRef(0)

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false
  })

  useEffect(() => {
    fetchInitialList()
  }, [])

  useEffect(() => {
    if (inView && !isLoadingList && nextOffset && pokemonList.length < count) {
      console.log('Fetching next page, offset:', currentOffset.current)
      fetchNextListItems()
    }
  }, [
    inView,
    isLoadingList,
    nextOffset,
    pokemonList.length,
    count,
    fetchNextListItems
  ])

  const handleCardClick = (pokemon: PokemonListItem) => {
    if (pokemon.details) {
      setSelectedPokemon(pokemon)
      setIsModalOpen(true)
    } else {
      console.log('Details not available yet for', pokemon.name)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPokemon(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-100">
      <div className="container mx-auto p-4 pb-12">
        <header className="mb-8 pt-8">
          <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-center text-5xl font-bold text-transparent">
            Pokédex
          </h1>
          <p className="mt-2 text-center text-gray-600">
            Gotta catch &apos;em all!
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-center text-red-500 shadow-sm">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {pokemonList.map((pokemon, index) => (
            <PokemonCard
              key={pokemon.name + index}
              pokemon={pokemon}
              onClick={() => handleCardClick(pokemon)}
            />
          ))}
        </div>

        {nextOffset && pokemonList.length < count && (
          <div ref={ref} className="mt-8 flex h-16 items-center justify-center">
            {isLoadingList && (
              <div className="flex items-center gap-2">
                <div className="size-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                <p className="text-blue-600">Loading more Pokémon...</p>
              </div>
            )}
          </div>
        )}

        {!nextOffset &&
          pokemonList.length > 0 &&
          pokemonList.length >= count && (
            <div className="mt-8 text-center text-lg font-medium text-purple-600">
              You&apos;ve caught &apos;em all!
            </div>
          )}

        {isModalOpen && selectedPokemon?.details && (
          <PokemonModal
            pokemonDetails={selectedPokemon.details}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  )
}

export default App
