import { pokemonApi } from 'services/pokemonApi'
import { create } from 'zustand'

interface PokemonDetails {
  id: number
  name: string
  frontImage: string
  backImage: string
  types: string[]
  weaknesses: string[]
  region?: string
}

interface PokemonListItem {
  name: string
  details: PokemonDetails | null
  isLoadingDetails: boolean
  errorDetails: string | null
}

interface PokemonState {
  pokemonList: PokemonListItem[]
  count: number
  nextOffset: number | null
  previousOffset: number | null
  isLoadingList: boolean
  error: string | null
  fetchInitialList: () => Promise<void>
  fetchNextListItems: () => Promise<void>
}

const usePokemonStore = create<PokemonState>((set, get) => ({
  pokemonList: [],
  count: 0,
  nextOffset: null,
  previousOffset: null,
  isLoadingList: false,
  error: null,

  fetchInitialList: async () => {
    set({ isLoadingList: true, error: null })
    try {
      const list = await pokemonApi.getPokemonList(10, 0)

      const initialList: PokemonListItem[] = list.results.map(
        (p: { name: string }) => ({
          name: p.name,
          details: null,
          isLoadingDetails: true,
          errorDetails: null
        })
      )

      set({
        pokemonList: initialList,
        count: list.count,
        nextOffset: list.next,
        previousOffset: list.previous,
        isLoadingList: false
      })

      // Fetch details for each pokemon concurrently
      initialList.forEach(async (item, index) => {
        try {
          const details = await pokemonApi.getPokemonDetail(item.name)

          set((state) => ({
            pokemonList: state.pokemonList.map((pokemon, i) =>
              i === index
                ? {
                    ...pokemon,
                    details,
                    isLoadingDetails: false,
                    errorDetails: null
                  }
                : pokemon
            )
          }))
        } catch (error) {
          console.error(`Error fetching details for ${item.name}:`, error)

          set((state) => ({
            pokemonList: state.pokemonList.map((pokemon, i) =>
              i === index
                ? {
                    ...pokemon,
                    isLoadingDetails: false,
                    errorDetails:
                      error instanceof Error
                        ? error.message
                        : 'Failed to load details'
                  }
                : pokemon
            )
          }))
        }
      })
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
        isLoadingList: false
      })
      return
    }
  },

  fetchNextListItems: async () => {
    const { nextOffset, isLoadingList } = get()

    if (!nextOffset || isLoadingList) {
      return
    }

    set({ isLoadingList: true, error: null })

    try {
      const list = await pokemonApi.getPokemonList(10, nextOffset)

      const newItems: PokemonListItem[] = list.results.map(
        (p: { name: string }) => ({
          name: p.name,
          details: null,
          isLoadingDetails: true,
          errorDetails: null
        })
      )

      set((state) => ({
        pokemonList: [...state.pokemonList, ...newItems],
        count: list.count,
        nextOffset: list.next,
        previousOffset: list.previous,
        isLoadingList: false
      }))

      // Fetch details for each new pokemon concurrently
      newItems.forEach(async (item, index) => {
        try {
          const details = await pokemonApi.getPokemonDetail(item.name)

          set((state) => ({
            pokemonList: state.pokemonList.map((pokemon, i) =>
              i === index + state.pokemonList.length - newItems.length
                ? {
                    ...pokemon,
                    details,
                    isLoadingDetails: false,
                    errorDetails: null
                  }
                : pokemon
            )
          }))
        } catch (error) {
          console.error(`Error fetching details for ${item.name}:`, error)

          set((state) => ({
            pokemonList: state.pokemonList.map((pokemon, i) =>
              i === index + state.pokemonList.length - newItems.length
                ? {
                    ...pokemon,
                    isLoadingDetails: false,
                    errorDetails:
                      error instanceof Error
                        ? error.message
                        : 'Failed to load details'
                  }
                : pokemon
            )
          }))
        }
      })
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
        isLoadingList: false
      })
    }
  }
}))

export default usePokemonStore

export type { PokemonDetails, PokemonListItem }
