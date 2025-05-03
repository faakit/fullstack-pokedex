import React, { useEffect, useState, useCallback } from 'react'
import { PokemonDetails } from '../hooks/usePokemonStore'
import { getTypeColorClasses } from '../utils'

interface PokemonModalProps {
  pokemonDetails: PokemonDetails | null
  onClose: () => void
}

const PokemonModal: React.FC<PokemonModalProps> = ({
  pokemonDetails,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [activeImage, setActiveImage] = useState<'front' | 'back'>('front')

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }, [onClose])

  useEffect(() => {
    setIsVisible(true)

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEscapeKey)
    return () => {
      window.removeEventListener('keydown', handleEscapeKey)
    }
  }, [handleClose])

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
        <div className="absolute inset-x-0 -top-24 h-56 bg-gradient-to-b from-blue-500/40 to-purple-500/40 blur-2xl"></div>

        <div className="relative px-6 pb-8 pt-6">
          <div className="absolute right-6 top-6 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
            #{id}
          </div>

          <h2 className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-center text-3xl font-extrabold capitalize text-transparent">
            {name}
          </h2>

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

          <div className="mb-4">
            <h4 className="mb-2 font-bold text-gray-700">Types</h4>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <span
                  key={type}
                  className={`rounded-full ${getTypeColorClasses(
                    type
                  )} px-3 py-1 text-sm font-medium capitalize shadow-sm`}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

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
