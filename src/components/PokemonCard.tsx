import React from 'react'
import { PokemonListItem } from '../hooks/usePokemonStore'

interface PokemonCardProps {
  pokemon: PokemonListItem
  onClick: () => void
}

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onClick }) => {
  const { name, details, isLoadingDetails, errorDetails } = pokemon

  return (
    <div
      className="cursor-pointer rounded-lg border bg-white p-4 shadow-md transition-shadow hover:shadow-lg"
      onClick={onClick}
    >
      {isLoadingDetails && <div className="text-center">Loading...</div>}
      {errorDetails && (
        <div className="text-center text-red-500">Error loading details</div>
      )}
      {details && (
        <>
          <img
            src={details.frontImage}
            alt={name}
            className="mx-auto mb-2 size-24"
          />
          <h3 className="mb-1 text-center text-lg font-semibold capitalize">
            {name}
          </h3>
          <div className="flex justify-center space-x-1">
            {details.types.map((type) => (
              <span
                key={type}
                className="rounded-full bg-gray-200 px-2 py-0.5 text-xs capitalize text-gray-700"
              >
                {type}
              </span>
            ))}
          </div>
        </>
      )}
      {!details && !isLoadingDetails && !errorDetails && (
        <div className="text-center capitalize">{name}</div> // Show name if details haven't loaded yet but aren't actively loading/erroring
      )}
    </div>
  )
}

export default PokemonCard
