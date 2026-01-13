import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface LikedProduct {
  id: string;
  title: string;
  image: string;
  description?: string;
  extract?: string;
  thumbnail?: string;
  likedAt: number;
}

const STORAGE_KEY = '@likedProducts';


let listeners: ((products: LikedProduct[]) => void)[] = [];

const notifyListeners = (products: LikedProduct[]) => {
  listeners.forEach(listener => listener(products));
};

export const addLikedProductsListener = (callback: (products: LikedProduct[]) => void) => {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
};

export const useLikedProducts = () => {
  const [likedProducts, setLikedProducts] = useState<LikedProduct[]>([]);
  const [loading, setLoading] = useState(true);


  const loadLikedProducts = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setLikedProducts(parsed);
      } else {
        setLikedProducts([]);
      }
    } catch (error) {
      console.error('Erro ao carregar liked products:', error);
      setLikedProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);


  const saveLikedProducts = useCallback(async (products: LikedProduct[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      setLikedProducts(products);
      notifyListeners(products);
    } catch (error) {
      console.error('Erro ao guardar liked products:', error);
    }
  }, []);

  const toggleLike = useCallback(
    async (product: Omit<LikedProduct, 'likedAt'>) => {
      const exists = likedProducts.find(p => p.id === product.id);
      
      if (exists) {

        const updated = likedProducts.filter(p => p.id !== product.id);
        await saveLikedProducts(updated);
      } else {

        const newProduct: LikedProduct = {
          ...product,
          likedAt: Date.now(),
        };
        const updated = [...likedProducts, newProduct];
        await saveLikedProducts(updated);
      }
    },
    [likedProducts, saveLikedProducts]
  );


  const isLiked = useCallback(
    (productId: string) => {
      return likedProducts.some(p => p.id === productId);
    },
    [likedProducts]
  );


  const removeLike = useCallback(
    async (productId: string) => {
      const updated = likedProducts.filter(p => p.id !== productId);
      await saveLikedProducts(updated);
    },
    [likedProducts, saveLikedProducts]
  );


  useEffect(() => {
    loadLikedProducts();
    

    const unsubscribe = addLikedProductsListener((products) => {
      setLikedProducts(products);
    });

    return unsubscribe;
  }, [loadLikedProducts]);

  return {
    likedProducts,
    loading,
    toggleLike,
    isLiked,
    removeLike,
    refreshLikes: loadLikedProducts,
  };
};
