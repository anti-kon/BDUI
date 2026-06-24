const retailFont = '"Segoe UI", "Noto Sans", "Roboto", Arial, sans-serif';

export const page = {
  fontFamily: retailFont,
  gap: 22,
  margin: '0 auto',
  maxWidth: '1120px',
  padding: '22px 18px 34px',
};

export const headerPanel = {
  alignItems: 'center',
  background: '#171717',
  borderRadius: 22,
  color: '#fff7ed',
  flexWrap: 'wrap',
  gap: 14,
  justifyContent: 'space-between',
  padding: 18,
};

export const navButton = {
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: 999,
  color: '#fff7ed',
  minHeight: 40,
  padding: '9px 16px',
};

export const primaryButton = {
  background: '#111827',
  border: '1px solid #111827',
  borderRadius: 999,
  color: '#ffffff',
  minHeight: 44,
  padding: '11px 18px',
};

export const secondaryButton = {
  background: '#ffffff',
  border: '1px solid #d6d3d1',
  borderRadius: 999,
  color: '#292524',
  minHeight: 44,
  padding: '11px 18px',
};

export const heroPanel = {
  background: '#fff7ed',
  border: '1px solid #fed7aa',
  borderRadius: 24,
  boxShadow: '0 18px 50px rgba(120, 53, 15, 0.10)',
  display: 'grid',
  gap: 18,
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  overflow: 'hidden',
  padding: 24,
};

export const card = {
  background: '#ffffff',
  border: '1px solid #e7e5e4',
  borderRadius: 18,
  boxShadow: '0 10px 28px rgba(41, 37, 36, 0.07)',
  gap: 12,
  padding: 18,
};

export const flatPanel = {
  background: '#ffffff',
  border: '1px solid #e7e5e4',
  borderRadius: 18,
  gap: 12,
  padding: 18,
};

export const productGrid = {
  display: 'grid',
  gap: 18,
  gridTemplateColumns: 'repeat(auto-fit, minmax(245px, 1fr))',
};

export const productCard = {
  ...card,
  justifyContent: 'space-between',
  minWidth: 0,
  overflow: 'hidden',
  padding: 14,
};

export const imageFrame = {
  background: '#f5f5f4',
  border: '1px solid #e7e5e4',
  borderRadius: 16,
  overflow: 'hidden',
};

export const title = { color: '#fff7ed', fontSize: 32, fontWeight: 900, lineHeight: 1.05 };
export const heroTitle = { color: '#1c1917', fontSize: 30, fontWeight: 900, lineHeight: 1.15 };
export const sectionTitle = { color: '#1c1917', fontSize: 20, fontWeight: 850, lineHeight: 1.2 };
export const productTitle = { color: '#1c1917', fontSize: 18, fontWeight: 850, lineHeight: 1.25 };
export const muted = { color: '#6b7280', lineHeight: 1.45 };
export const lightMuted = { color: '#fed7aa', lineHeight: 1.35 };
export const accent = { color: '#047857', fontWeight: 850 };
export const warning = { color: '#b45309', fontWeight: 850 };
export const danger = { color: '#b91c1c', fontWeight: 850 };
export const price = { color: '#111827', fontSize: 24, fontWeight: 950 };
export const small = { color: '#78716c', fontSize: 13 };
export const badge = {
  background: '#ecfdf5',
  border: '1px solid #a7f3d0',
  borderRadius: 999,
  color: '#047857',
  fontSize: 13,
  fontWeight: 850,
  padding: '5px 10px',
};
export const warmBadge = {
  background: '#ffedd5',
  border: '1px solid #fed7aa',
  borderRadius: 999,
  color: '#9a3412',
  fontSize: 13,
  fontWeight: 850,
  padding: '5px 10px',
};
