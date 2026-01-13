import { Moodboard, Product, useMoodboards as useMoodboardsHook } from '@/src/hooks/useMoodboards';
import React, { createContext, ReactNode, useContext } from 'react';

interface MoodboardContextType {
  moodboards: Moodboard[];
  loading: boolean;
  initialized: boolean;
  createMoodboard: (title: string, color?: string) => Promise<string>;
  addProductToMoodboard: (moodboardId: string, product: Product) => Promise<void>;
  removeProductFromMoodboard: (moodboardId: string, productId: string) => Promise<void>;
  deleteMoodboard: (moodboardId: string) => Promise<void>;
  getMoodboard: (moodboardId: string) => Moodboard | undefined;
  updateMoodboardTitle: (moodboardId: string, title: string) => Promise<void>;
  updateMoodboardCoverImage: (moodboardId: string, coverImage: string) => Promise<void>;
  refreshMoodboards: () => void;
}

const MoodboardContext = createContext<MoodboardContextType | undefined>(undefined);

interface MoodboardProviderProps {
  children: ReactNode;
}

export const MoodboardProvider: React.FC<MoodboardProviderProps> = ({ children }) => {
  const moodboardHook = useMoodboardsHook();

  return (
    <MoodboardContext.Provider value={moodboardHook}>
      {children}
    </MoodboardContext.Provider>
  );
};

export const useMoodboards = (): MoodboardContextType => {
  const context = useContext(MoodboardContext);
  if (!context) {
    throw new Error('useMoodboards must be used within a MoodboardProvider');
  }
  return context;
};
