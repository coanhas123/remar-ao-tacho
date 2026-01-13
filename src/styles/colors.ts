export const palette = {
  backgroundLight: '#F5F5F5',
  backgroundDark: '#000000ff',
  black: '#000000',
  white: '#FFFFFF',
  pink: '#EE448D',
  orange: '#F99D2F',
  yellow: '#F6ED44',
  blue: '#27AAE1',
  purple: '#662D91',
  green: '#98CB4F',
};

export const semanticColors = {
  background: palette.backgroundDark,
  card: '#000000ff',
  elevatedCard: '#000000ff',
  muted: '#ffffffff',
  border: '#000000ff',
  overlay: 'rgba(0, 0, 0, 0.5)',
  text: palette.white,
  textMuted: '#C9D1D9',
  black: palette.black,
  white: palette.white,
  accentPrimary: palette.yellow,
  accentSecondary: palette.purple,
  accentHighlight: palette.pink,
  statusInfo: palette.blue,
  statusWarning: palette.orange,
  statusSuccess: palette.green,
  statusAlert: palette.pink,
};

export type SemanticColors = typeof semanticColors;
