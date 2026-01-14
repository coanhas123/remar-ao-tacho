import { Moodboard, Product } from '@/src/types/content';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = '@moodboards';

export const useMoodboards = () => {
  const [moodboards, setMoodboards] = useState<Moodboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Carregar moodboards do AsyncStorage
  const loadMoodboards = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMoodboards(parsed);
      } else {
        setMoodboards([]);
      }
    } catch (error) {
      console.error('Erro ao carregar moodboards:', error);
      setMoodboards([]);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  // Guardar moodboards no AsyncStorage
  const saveMoodboards = useCallback(async (boards: Moodboard[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
      setMoodboards(boards);
    } catch (error) {
      console.error('Erro ao guardar moodboards:', error);
    }
  }, []);

  // Criar novo moodboard
  const createMoodboard = useCallback(async (title: string, color?: string): Promise<string> => {
    const newBoard: Moodboard = {
      id: Date.now().toString(),
      title,
      color,
      products: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    setMoodboards(prevBoards => {
      const updated = [...prevBoards, newBoard];
      saveMoodboards(updated);
      return updated;
    });
    
    return newBoard.id;
  }, [saveMoodboards]);


  const addProductToMoodboard = useCallback(async (moodboardId: string, product: Product) => {
    setMoodboards(prevBoards => {
      const updated = prevBoards.map(board => {
        if (board.id === moodboardId) {
      
          const exists = board.products.some(p => p.id === product.id);
          if (exists) return board;
          
          const newProducts = [...board.products, product];
          const shouldUpdateCover = board.products.length === 0 || !board.coverImage;
          
          return {
            ...board,
            products: newProducts,
            coverImage: shouldUpdateCover ? product.image : board.coverImage,
            updatedAt: Date.now(),
          };
        }
        return board;
      });
      
      saveMoodboards(updated);
      return updated;
    });
  }, [saveMoodboards]);


  const removeProductFromMoodboard = useCallback(async (moodboardId: string, productId: string) => {
    const updated = moodboards.map(board => {
      if (board.id === moodboardId) {
        const newProducts = board.products.filter(p => p.id !== productId);
        return {
          ...board,
          products: newProducts,
          coverImage: newProducts.length > 0 ? newProducts[0].image : undefined,
          updatedAt: Date.now(),
        };
      }
      return board;
    });
    
    await saveMoodboards(updated);
  }, [moodboards, saveMoodboards]);


  const deleteMoodboard = useCallback(async (moodboardId: string) => {
    const updated = moodboards.filter(board => board.id !== moodboardId);
    await saveMoodboards(updated);
  }, [moodboards, saveMoodboards]);


  const getMoodboard = useCallback((moodboardId: string) => {
    return moodboards.find(board => board.id === moodboardId);
  }, [moodboards]);


  const updateMoodboardTitle = useCallback(async (moodboardId: string, title: string) => {
    const updated = moodboards.map(board => 
      board.id === moodboardId 
        ? { ...board, title, updatedAt: Date.now() }
        : board
    );
    await saveMoodboards(updated);
  }, [moodboards, saveMoodboards]);


  const updateMoodboardCoverImage = useCallback(async (moodboardId: string, coverImage: string) => {
    const updated = moodboards.map(board => 
      board.id === moodboardId 
        ? { ...board, coverImage, updatedAt: Date.now() }
        : board
    );
    await saveMoodboards(updated);
  }, [moodboards, saveMoodboards]);


  const refreshMoodboards = useCallback(() => {
    loadMoodboards();
  }, [loadMoodboards]);

  useEffect(() => {
    loadMoodboards();
  }, [loadMoodboards]);

  return {
    moodboards,
    loading,
    initialized,
    createMoodboard,
    addProductToMoodboard,
    removeProductFromMoodboard,
    deleteMoodboard,
    getMoodboard,
    updateMoodboardTitle,
    updateMoodboardCoverImage,
    refreshMoodboards,
  };
};