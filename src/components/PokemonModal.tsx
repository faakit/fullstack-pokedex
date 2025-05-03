import React from 'react'
import { PokemonDetails } from '../hooks/usePokemonStore'

interface PokemonModalProps {
  pokemonDetails: PokemonDetails | null
  onClose: () => void
}

const PokemonModal: React.FC<PokemonModalProps> = ({
  pokemonDetails,
  onClose
}) => {
  if (!pokemonDetails) return null

  const { name, frontImage, backImage, types, weaknesses, region } =
    pokemonDetails

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose} // Close modal on backdrop click
    >
      <div
        className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        <button
          onClick={onClose}
          className="absolute right-2 top-2 text-2xl font-bold text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>
        <h2 className="mb-4 text-center text-2xl font-bold capitalize">
          {name}
        </h2>
        <div className="mb-4 flex justify-around">
          <img src={frontImage} alt={`${name} front`} className="size-32" />
          <img src={backImage} alt={`${name} back`} className="size-32" />
        </div>
        <div className="mb-3">
          <h4 className="font-semibold">Types:</h4>
          <div className="mt-1 flex flex-wrap gap-1">
            {types.map((type) => (
              <span
                key={type}
                className="rounded-full bg-blue-200 px-3 py-1 text-sm capitalize text-blue-800"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
        <div className="mb-3">
          <h4 className="font-semibold">Weaknesses:</h4>
          <div className="mt-1 flex flex-wrap gap-1">
            {weaknesses.map((weakness) => (
              <span
                key={weakness}
                className="rounded-full bg-red-200 px-3 py-1 text-sm capitalize text-red-800"
              >
                {weakness}
              </span>
            ))}
          </div>
        </div>
        {region && (
          <div>
            <h4 className="font-semibold">Region:</h4>
            <span className="capitalize text-gray-700">{region}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default PokemonModal
