import { E } from '@bdui/dsl';

export const themeColor = (light: string, dark: string) =>
  E<string>(`session.themeMode == 'Тёмная' ? '${dark}' : '${light}'`);

export const page = {
  minHeight: '100vh',
  background: themeColor('#fbfcfe', '#0f172a'),
  color: themeColor('#182230', '#e5edf7'),
  padding: 0,
  gap: 0,
};

export const shell = {
  maxWidth: '1180px',
  width: '100%',
  margin: '0 auto',
  padding: '0 24px 36px',
  gap: 0,
};

export const topBar = {
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: '20px 0',
  background: 'transparent',
  borderBottom: themeColor('1px solid #d7dee8', '1px solid #334155'),
  flexWrap: 'wrap',
};

export const brandMark = {
  width: 42,
  height: 42,
  borderRadius: 6,
  border: '1px solid #b8c7d9',
  background: '#2563eb',
};

export const navRow = {
  gap: 8,
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
};

export const statusStrip = {
  gap: 10,
  flexWrap: 'wrap',
  padding: '10px 0',
  borderBottom: themeColor('1px solid #e3e8ef', '1px solid #243244'),
};

export const panel = {
  background: 'transparent',
  borderTop: themeColor('1px solid #d7dee8', '1px solid #334155'),
  padding: '22px 0',
  gap: 14,
};

export const quietPanel = {
  background: themeColor('#ffffff', '#172033'),
  borderLeft: themeColor('3px solid #94a3b8', '3px solid #14b8a6'),
  borderTop: themeColor('1px solid #e3e8ef', '1px solid #26364a'),
  padding: '12px 14px',
  gap: 8,
};

export const grid = {
  style: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  },
  gap: 14,
};

export const twoColumnGrid = {
  style: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  },
  columnGap: 32,
  rowGap: 18,
};

export const title = {
  fontSize: 34,
  fontWeight: 800,
  color: themeColor('#0f172a', '#f8fafc'),
  lineHeight: 1.14,
};
export const subtitle = {
  color: themeColor('#5b677a', '#b7c4d6'),
  lineHeight: 1.55,
  maxWidth: 720,
};
export const eyebrow = {
  color: themeColor('#0f766e', '#5eead4'),
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 0,
  textTransform: 'uppercase',
};
export const sectionTitle = {
  fontSize: 18,
  fontWeight: 800,
  color: themeColor('#101827', '#f1f5f9'),
};
export const metricValue = {
  fontSize: 26,
  fontWeight: 800,
  color: themeColor('#16213a', '#e2e8f0'),
};
export const muted = { color: themeColor('#6b7688', '#a9b6c8') };
export const success = { color: themeColor('#047857', '#5eead4'), fontWeight: 700 };
export const warning = { color: themeColor('#b45309', '#fbbf24'), fontWeight: 700 };
export const danger = { color: themeColor('#b91c1c', '#fca5a5'), fontWeight: 700 };
export const pill = {
  borderLeft: themeColor('3px solid #0f766e', '3px solid #5eead4'),
  borderRadius: 0,
  padding: '5px 10px',
  background: themeColor('#eef7f5', '#12312f'),
  color: themeColor('#1f3f3a', '#d7fffb'),
  fontSize: 12,
  fontWeight: 700,
};
export const fieldGroup = { gap: 6 };
export const inputStyle = {
  width: '100%',
  minHeight: 42,
  borderRadius: 4,
  border: themeColor('1px solid #aebccd', '1px solid #43546a'),
  padding: '9px 11px',
  background: themeColor('#ffffff', '#111827'),
  color: themeColor('#16213a', '#f8fafc'),
};
export const primaryButton = {
  variant: 'primary',
  minHeight: 40,
  borderRadius: 4,
  border: '1px solid #0f766e',
  background: '#0f766e',
  color: '#ffffff',
  padding: '9px 14px',
  fontWeight: 800,
  boxShadow: 'none',
};
export const secondaryButton = {
  variant: 'secondary',
  minHeight: 40,
  borderRadius: 4,
  border: themeColor('1px solid #aebccd', '1px solid #475569'),
  background: themeColor('#ffffff', '#172033'),
  color: themeColor('#16213a', '#f8fafc'),
  padding: '9px 14px',
  fontWeight: 800,
  boxShadow: 'none',
};
