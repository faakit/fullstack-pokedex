import React, { useEffect, useState } from 'react'
import { PokemonDetails } from '../hooks/usePokemonStore'

interface PokemonModalProps {
  pokemonDetails: PokemonDetails | null
  onClose: () => void
}

// Get type color based on type - matches the card component
const getTypeColor = (type: string): string => {
  const typeColorMap: Record<string, string> = {
    normal: 'bg-gray-200 text-gray-700',
    fire: 'bg-orange-100 text-orange-700',
    water: 'bg-blue-100 text-blue-700',
    electric: 'bg-yellow-100 text-yellow-700',
    grass: 'bg-green-100 text-green-700',
    ice: 'bg-cyan-100 text-cyan-700',
    fighting: 'bg-red-100 text-red-700',
    poison: 'bg-purple-100 text-purple-700',
    ground: 'bg-amber-100 text-amber-700',
    flying: 'bg-indigo-100 text-indigo-700',
    psychic: 'bg-pink-100 text-pink-700',
    bug: 'bg-lime-100 text-lime-700',
    rock: 'bg-stone-100 text-stone-700',
    ghost: 'bg-violet-100 text-violet-700',
    dragon: 'bg-indigo-200 text-indigo-800',
    dark: 'bg-gray-800 text-gray-100',
    steel: 'bg-slate-200 text-slate-700',
    fairy: 'bg-rose-100 text-rose-700'
  }

  return typeColorMap[type.toLowerCase()] || 'bg-gray-200 text-gray-700'
}

const PokemonModal: React.FC<PokemonModalProps> = ({
  pokemonDetails,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [activeImage, setActiveImage] = useState<'front' | 'back'>('front')

  useEffect(() => {
    // Animation timing
    setIsVisible(true)
    // Add escape key handler
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEscapeKey)
    return () => {
      window.removeEventListener('keydown', handleEscapeKey)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300) // Match transition duration
  }

  if (!pokemonDetails) return null

  const { name, frontImage, backImage, types, weaknesses, region, id } =
    pokemonDetails

  const toggleImage = () => {
    setActiveImage(activeImage === 'front' ? 'back' : 'front')
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-2xl bg-white/90 shadow-2xl backdrop-blur-md transition-all duration-300 ${
          isVisible ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative header with gradient */}
        <div className="absolute inset-x-0 -top-24 h-56 bg-gradient-to-b from-blue-500/40 to-purple-500/40 blur-2xl"></div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full bg-white/30 p-1.5 text-gray-600 backdrop-blur-md transition-all hover:bg-white/80 hover:text-gray-900"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div className="relative px-6 pb-8 pt-6">
          {/* Pokemon ID label */}
          <div className="absolute right-6 top-6 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
            #{id}
          </div>

          <h2 className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-center text-3xl font-extrabold capitalize text-transparent">
            {name}
          </h2>

          {/* Interactive image section */}
          <div className="relative mb-6 flex justify-center">
            <div
              className="relative size-40 cursor-pointer"
              onClick={toggleImage}
            >
              <img
                src={activeImage === 'front' ? frontImage : backImage}
                alt={`${name} ${activeImage}`}
                className="size-full object-contain transition-all duration-300"
              />
              <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-b from-blue-100/40 to-purple-100/40"></div>
              <div className="absolute bottom-0 left-1/2 w-full -translate-x-1/2 text-center text-xs text-gray-500">
                Click to see {activeImage === 'front' ? 'back' : 'front'} view
              </div>
            </div>
          </div>

          {/* Types section */}
          <div className="mb-4">
            <h4 className="mb-2 font-bold text-gray-700">Types</h4>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <span
                  key={type}
                  className={`rounded-full ${getTypeColor(
                    type
                  )} px-3 py-1 text-sm font-medium capitalize shadow-sm`}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Weaknesses section */}
          <div className="mb-4">
            <h4 className="mb-2 font-bold text-gray-700">Weaknesses</h4>
            <div className="flex flex-wrap gap-2">
              {weaknesses.map((weakness) => (
                <span
                  key={weakness}
                  className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-sm capitalize text-red-600 shadow-sm"
                >
                  {weakness}
                </span>
              ))}
            </div>
          </div>

          {/* Region section */}
          {region && (
            <div className="pt-1">
              <h4 className="mb-1 font-bold text-gray-700">Region</h4>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-sm capitalize text-gray-700">
                  {region}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PokemonModal
