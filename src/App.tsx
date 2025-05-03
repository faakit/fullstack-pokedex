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
    triggerOnce: false // Keep triggering as the element comes into view
  })

  // Initial fetch
  useEffect(() => {
    fetchInitialList()
  }, [])

  // Infinite scroll fetch
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
      // Optionally handle cases where details are still loading or failed
      console.log('Details not available yet for', pokemon.name)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPokemon(null)
  }

  return (
    <div className="container mx-auto min-h-screen bg-gray-100 p-4">
      <h1 className="my-6 text-center text-4xl font-bold text-blue-600">
        Pokédex
      </h1>

      {error && (
        <div className="mb-4 text-center text-red-500">Error: {error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {pokemonList.map((pokemon, index) => (
          <PokemonCard
            key={pokemon.name + index} // Use index if names can repeat across fetches before details arrive
            pokemon={pokemon}
            onClick={() => handleCardClick(pokemon)}
          />
        ))}
      </div>

      {/* Intersection Observer Target */}
      {nextOffset && pokemonList.length < count && (
        <div ref={ref} className="flex h-10 items-center justify-center">
          {isLoadingList && <p>Loading more Pokémon...</p>}
        </div>
      )}

      {!nextOffset && pokemonList.length > 0 && pokemonList.length >= count && (
        <div className="mt-6 text-center text-gray-500">
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
  )
}

export default App
