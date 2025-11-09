import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { components } from '../types/api';

type ApiTenant = components['schemas']['TenantRead'];

function mapApiTenant(t: ApiTenant) {
  // Map backend TenantRead -> UI Tenant shape
  const rawStatus = (t.status || '').toString().toLowerCase();
  let status: 'Active' | 'Applicant' | 'Disabled' | 'Declined' = 'Active';
  if (rawStatus.includes('applicant')) status = 'Applicant';
  else if (rawStatus.includes('inactive') || rawStatus.includes('disabled')) status = 'Disabled';
  else if (rawStatus.includes('declined')) status = 'Declined';

  const name = [t.first_name, t.last_name].filter(Boolean).join(' ').trim() || t.email || `Tenant ${t.id}`;

  return {
    id: String(t.id),
    name,
    email: t.email ?? '',
    phone: t.phone ?? '',
    status,
    propertyId: null as string | null,
    notes: '',
  };
}

export function useTenants() {
  return useQuery(['tenants'], async () => {
    const res = await api.get('/tenants/');
    const data = res.data;
    const list = Array.isArray(data) ? data : (data?.tenants ?? []);
    return list.map(mapApiTenant);
  });
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation((payload: Record<string, any>) => api.post('/tenants/', payload), {
    onSuccess: () => qc.invalidateQueries(['tenants']),
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation(
    (args: { id: string | number; payload: Record<string, any> }) =>
      api.put(`/tenants/${Number(args.id)}`, args.payload),
    {
      onSuccess: () => qc.invalidateQueries(['tenants']),
    }
  );
}

export function usePatchTenant() {
  const qc = useQueryClient();
  return useMutation(
    (args: { id: string | number; payload: Record<string, any> }) =>
      api.patch(`/tenants/${Number(args.id)}`, args.payload),
    {
      onSuccess: () => qc.invalidateQueries(['tenants']),
    }
  );
}

export function useDeleteTenant() {
  const qc = useQueryClient();
  return useMutation((id: string | number) => api.delete(`/tenants/${Number(id)}`), {
    onSuccess: () => qc.invalidateQueries(['tenants']),
  });
}

export function useAssignTenant() {
  const qc = useQueryClient();
  return useMutation(
    (args: { tenantId: string | number; propertyId: string | number }) =>
      api.post(`/tenants/${Number(args.tenantId)}/assign/${Number(args.propertyId)}`),
    {
      onSuccess: () => {
        qc.invalidateQueries(['tenants']);
        qc.invalidateQueries(['properties']);
      },
    }
  );
}
