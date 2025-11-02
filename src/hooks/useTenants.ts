import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

function mapApiTenant(t: any) {
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
