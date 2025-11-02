import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// Map backend PropertyRead -> UI Property shape
function mapApiProperty(p: any) {
  return {
    id: String(p.id),
    lotNumber: p.address ?? String(p.id),
    beds: p.bedrooms ?? 0,
    baths: typeof p.bathrooms === 'number' ? Math.round(p.bathrooms) : Number(p.bathrooms ?? 0),
    sqft: typeof p.area === 'number' ? Math.round(p.area) : Number(p.area ?? 0),
    rent: typeof p.rent_amount === 'number' ? p.rent_amount : Number(p.rent_amount ?? 0),
    amenities: '',
    tenantId: null as string | null,
  };
}

export function useProperties() {
  return useQuery(['properties'], async () => {
    const res = await api.get('/properties/');
    const data = res.data;
    const list = Array.isArray(data) ? data : (data?.properties ?? []);
    return list.map(mapApiProperty);
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation((payload: any) => api.post('/properties/', payload), {
    onSuccess: () => qc.invalidateQueries(['properties']),
  });
}
