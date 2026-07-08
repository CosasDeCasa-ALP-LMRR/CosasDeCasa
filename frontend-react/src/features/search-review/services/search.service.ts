import api from '../../../lib/axios';
import type { ProfesionalCard } from '../../auth-profile/types/perfil.types';

export interface SearchParams {
  q?: string;
  category?: string;
  minRating?: number;
}

/** GET /search/profesionales — endpoint para búsqueda avanzada (RF6) */
export async function searchProfesionales(params: SearchParams): Promise<ProfesionalCard[]> {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.append('q', params.q);
  if (params.category) queryParams.append('category', params.category);
  if (params.minRating) queryParams.append('minRating', params.minRating.toString());

  const { data } = await api.get<ProfesionalCard[]>(`/search/profesionales?${queryParams.toString()}`);
  return data;
}
