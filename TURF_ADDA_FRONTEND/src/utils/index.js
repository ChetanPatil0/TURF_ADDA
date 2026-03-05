// utils/index.js

// ────────────── Numbers & Currency ──────────────
export const formatNumber = (value = 0) => 
  Number(value).toLocaleString('en-IN');

export const formatRupee = (value = 0) => 
  `₹${formatNumber(value)}`;

// ────────────── Date & Time Helpers ──────────────
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const getTodayShort = () => 
  new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const getTodayLong = () => 
  new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

 export const  formatTime =(t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m.padStart(2, '0')} ${ampm}`;
};

// ────────────── Very common status helpers ──────────────
export const getStatusStyle = (status = '') => {
  const s = (status || '').toLowerCase();

  if (s === 'active') return {
    label: 'Active',
    bg: 'bg-[var(--color-primary-light)]',
    text: 'text-[var(--color-primary)]',
    dot: 'var(--color-primary)',
  };

  if (s === 'pending') return {
   label: 'Verification Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-500',
    dot: 'var(--color-secondary)',
  };

  if (s === 'inactive') return {
    label: 'Inactive',
    bg: 'bg-gray-100',
    text: 'text-[var(--color-text-secondary)]',
    dot: 'var(--color-disabled)',
  };

  return {
    label: status || 'Unknown',
    bg: 'bg-gray-100',
    text: 'text-[var(--color-text-secondary)]',
    dot: 'var(--color-disabled)',
  };
};

// ────────────── NEW UTILITIES ADDED HERE ──────────────

// Format date as dd/mm/yyyy
export const formatDateDDMMYYYY = (dateInput) => {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Truncate long text with ellipsis
export const truncateText = (text, maxLength = 60) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Capitalize first letter of string
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Shorten UUID/id for display (first 6 + last 4 chars)
export const getShortId = (id, separator = '...') => {
  if (!id || id.length < 10) return id || '—';
  return `${id.substring(0, 6)}${separator}${id.substring(id.length - 4)}`;
};