import { format, parseISO, formatDistanceToNow } from 'date-fns';

export const formatDate = (date?: string | null) => {
  if (!date) return '—';
  try { return format(parseISO(date), 'MMM d, yyyy'); } catch { return '—'; }
};

export const formatDateTime = (date?: string | null) => {
  if (!date) return '—';
  try { return format(parseISO(date), 'MMM d, yyyy HH:mm'); } catch { return '—'; }
};

export const timeAgo = (date?: string) => {
  if (!date) return '—';
  try { return formatDistanceToNow(parseISO(date), { addSuffix: true }); } catch { return '—'; }
};

export const formatKES = (amount?: number | null) => {
  if (amount == null) return 'KES 0';
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(amount);
};

export const getAge = (dob?: string | null, estimatedAge?: number | null) => {
  if (!dob && !estimatedAge) return 'Unknown';
  if (estimatedAge) return `~${estimatedAge} yrs`;
  try {
    const birth = parseISO(dob!);
    const now = new Date();
    const age = now.getFullYear() - birth.getFullYear();
    return `${age} yrs`;
  } catch { return '—'; }
};

export const getInitials = (name: string) => {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
};

export const severityColor = (s: string) => {
  const map: Record<string, string> = { low: 'bg-blue-100 text-blue-700', medium: 'bg-yellow-100 text-yellow-700', high: 'bg-orange-100 text-orange-700', critical: 'bg-red-100 text-red-700' };
  return map[s] || 'bg-gray-100 text-gray-700';
};

export const statusColor = (s: string) => {
  const map: Record<string, string> = { active: 'bg-green-100 text-green-700', exited: 'bg-gray-100 text-gray-600', transferred: 'bg-blue-100 text-blue-700', open: 'bg-red-100 text-red-700', resolved: 'bg-green-100 text-green-700' };
  return map[s] || 'bg-gray-100 text-gray-700';
};
