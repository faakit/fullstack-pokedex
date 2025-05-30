import React from 'react'
import { PokemonListItem } from '../hooks/usePokemonStore'
import { getTypeColor } from '../utils'

interface PokemonCardProps {
  pokemon: PokemonListItem
  onClick: () => void
}

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onClick }) => {
  const { name, details, isLoadingDetails, errorDetails } = pokemon

  return (
    <div
      className="cursor-pointer rounded-xl border border-white/40 bg-white/80 p-5 shadow-lg backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl"
      onClick={onClick}
    >
      {isLoadingDetails && (
        <div className="flex h-40 flex-col items-center justify-center">
          <div className="mb-2 size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <div className="font-medium text-blue-600">Loading...</div>
        </div>
      )}

      {errorDetails && (
        <div className="flex h-40 flex-col items-center justify-center text-center">
          <div className="mb-1 text-lg text-red-500">⚠️</div>
          <div className="font-medium text-red-500">Error</div>
          <div className="mt-1 text-sm text-red-400">
            Unable to load Pokémon data
          </div>
        </div>
      )}

      {details && (
        <>
          <div className="relative mb-3">
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-blue-50 to-purple-50 opacity-70 blur-sm"></div>
            <img
              src={details.frontImage}
              alt={name}
              className="relative mx-auto size-28 object-contain drop-shadow-md transition-transform hover:scale-110"
            />
          </div>

          <h3 className="mb-2 text-center text-lg font-bold capitalize text-gray-800">
            {name}
          </h3>

          <div className="flex flex-wrap justify-center gap-1.5">
            {details.types.map((type) => {
              const { bg, text } = getTypeColor(type)
              return (
                <span
                  key={type}
                  className={`rounded-full ${bg} ${text} px-3 py-1 text-xs font-medium capitalize shadow-sm`}
                >
                  {type}
                </span>
              )
            })}
          </div>
        </>
      )}

      {!details && !isLoadingDetails && !errorDetails && (
        <div className="flex h-40 flex-col items-center justify-center">
          <div className="mb-3 size-12 animate-pulse rounded-full bg-gray-200"></div>
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
          <p className="mt-3 text-center text-sm capitalize text-gray-500">
            {name}
          </p>
        </div>
      )}
    </div>
  )
}

export default PokemonCard
