import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export function useProperties() {
  return useQuery(['properties'], async () => {
    const res = await api.get('/properties/');
    const data = res.data;
    // normalize { value: [...], Count } or direct array
    return Array.isArray(data) ? data : data?.value ?? [];
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation((payload: any) => api.post('/properties/', payload), {
    onSuccess: () => qc.invalidateQueries(['properties']),
  });
}
