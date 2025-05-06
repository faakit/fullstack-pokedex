export interface PokemonListResponse {
  count: number
  results: { name: string }[]
  next: number | null
  previous: number | null
}

export interface PokemonDetail {
  id: number
  name: string
  frontImage: string
  backImage: string
  types: string[]
  weaknesses: string[]
  region: string
}

/**
 * PokemonApi service class to handle API calls to the Pokedex backend
 */
export class PokemonApi {
  private baseUrl: string = 'http://localhost:3000'

  /**
   * Fetches a list of Pokemon with pagination
   * @param limit Number of Pokemon to fetch
   * @param offset Starting position for fetching Pokemon
   * @returns Promise with the Pokemon list response
   */
  async getPokemonList(limit = 20, offset = 0): Promise<PokemonListResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch Pokemon list: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching Pokemon list:', error)
      throw error
    }
  }

  /**
   * Fetches details for a specific Pokemon by name or ID
   * @param nameOrId Pokemon name or ID
   * @returns Promise with the Pokemon detail
   */
  async getPokemonDetail(nameOrId: string | number): Promise<PokemonDetail> {
    try {
      const response = await fetch(`${this.baseUrl}/pokemon/${nameOrId}`)

      if (!response.ok) {
        throw new Error(
          `Failed to fetch Pokemon detail: ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error(`Error fetching Pokemon detail for ${nameOrId}:`, error)
      throw error
    }
  }

  /**
   * Fetches the front image URL for a specific Pokemon
   * @param nameOrId Pokemon name or ID
   * @returns Promise with the front image URL as a blob
   */
  async getPokemonFrontImage(nameOrId: string | number): Promise<Blob> {
    try {
      const response = await fetch(
        `${this.baseUrl}/pokemon/${nameOrId}/front-image`
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch Pokemon front image: ${response.statusText}`
        )
      }

      return await response.blob()
    } catch (error) {
      console.error(
        `Error fetching front image for Pokemon ${nameOrId}:`,
        error
      )
      throw error
    }
  }

  /**
   * Fetches the back image URL for a specific Pokemon
   * @param nameOrId Pokemon name or ID
   * @returns Promise with the back image URL as a blob
   */
  async getPokemonBackImage(nameOrId: string | number): Promise<Blob> {
    try {
      const response = await fetch(
        `${this.baseUrl}/pokemon/${nameOrId}/back-image`
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch Pokemon back image: ${response.statusText}`
        )
      }

      return await response.blob()
    } catch (error) {
      console.error(`Error fetching back image for Pokemon ${nameOrId}:`, error)
      throw error
    }
  }
}

export const pokemonApi = new PokemonApi()
