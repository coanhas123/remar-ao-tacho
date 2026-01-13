import { DefaultTheme, Theme } from '@react-navigation/native';
import { createContext, createElement, ReactNode, useContext, useMemo } from 'react';
import { palette, semanticColors, SemanticColors } from './colors';
import { radii, spacing } from './spacing';
import { typography } from './typography';

export interface AppTheme {
  colors: SemanticColors & { palette: typeof palette };
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  shadows: {
    soft: string;
    medium: string;
  };
}

const baseTheme: AppTheme = {
  colors: { ...semanticColors, palette },
  spacing,
  radii,
  typography,
  shadows: {
    soft: '0 8px 24px rgba(0, 0, 0, 0.25)',
    medium: '0 16px 48px rgba(0, 0, 0, 1)',
  },
};

const ThemeContext = createContext<AppTheme>(baseTheme);

interface ThemeProviderProps {
  children?: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) =>
  createElement(ThemeContext.Provider, { value: baseTheme }, children);

export const useTheme = () => useContext(ThemeContext);

export const createNavigationTheme = (theme: AppTheme): Theme => ({
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.accentPrimary,
    background: theme.colors.background,
    card: theme.colors.card,
    text: theme.colors.text,
    border: theme.colors.border,
    notification: theme.colors.accentHighlight,
  },
});

export function useThemedStyles<T>(factory: (theme: AppTheme) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [theme, factory]);
}
