export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: { name: string; url: string }[];
}

export interface PokemonDetailResponse {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    back_default: string | null;
  };
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];
  species: {
    name: string;
    url: string;
  };
}

export interface TypeDetail {
  name: string;
  url: string;
}

export interface TypeDamageRelations {
  double_damage_from: TypeDetail[];
  half_damage_from: TypeDetail[];
  no_damage_from: TypeDetail[];
}
export interface TypeDetailResponse {
  name: string;
  damage_relations: TypeDamageRelations;
}

export interface PokemonSpeciesResponse {
  name: string;
  generation: {
    name: string;
    url: string;
  } | null; // Generation can sometimes be null
}

export interface GenerationResponse {
  id: number;
  name: string;
  main_region: {
    name: string;
    url: string;
  };
}
