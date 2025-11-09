import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { components } from '../types/api';

type ApiProperty = components['schemas']['PropertyRead'];

// Map backend PropertyRead -> UI Property shape
function mapApiProperty(p: ApiProperty) {
  return {
    id: String(p.id),
    lotNumber: p.address ?? String(p.id),
    beds: (p.bedrooms ?? 0) as number,
    baths: (p.bathrooms ?? 0) as number,
    sqft: (p.area ?? 0) as number,
    rent: typeof p.rent_amount === 'number' ? p.rent_amount : Number(p.rent_amount ?? 0),
    amenities: (p as any).amenities ?? '',
    notes: (p as any).notes ?? '',
    tenantId: null as string | null,
  };
}

export function useProperties() {
  return useQuery(['properties'], async () => {
    const res = await api.get('/properties/');
    const data = res.data;
    const list: ApiProperty[] = Array.isArray(data) ? data : (data?.properties ?? []);
    return list.map(mapApiProperty);
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  // Allow both backend and UI field names; backend accepts aliases
  return useMutation((payload: Record<string, any>) => api.post('/properties/', payload), {
    onSuccess: () => qc.invalidateQueries(['properties']),
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation(
    (args: { id: string | number; payload: Record<string, any> }) =>
      api.put(`/properties/${Number(args.id)}`, args.payload),
    {
      onSuccess: () => qc.invalidateQueries(['properties']),
    }
  );
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation((id: string | number) => api.delete(`/properties/${Number(id)}`), {
    onSuccess: () => qc.invalidateQueries(['properties']),
  });
}
