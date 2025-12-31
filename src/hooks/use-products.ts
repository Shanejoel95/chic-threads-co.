import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Product, Category } from '@/types/product';

interface DbProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  discount_percentage: number | null;
  images: string[];
  sizes: string[];
  colors: string[];
  category_id: string | null;
  stock: number;
  featured: boolean;
  is_new: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
}

// Transform database product to app Product type
const transformProduct = (dbProduct: DbProduct): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  description: dbProduct.description || '',
  price: Number(dbProduct.price),
  salePrice: dbProduct.sale_price ? Number(dbProduct.sale_price) : undefined,
  images: dbProduct.images,
  category: (dbProduct.categories?.slug || 'accessories') as Product['category'],
  sizes: dbProduct.sizes,
  colors: dbProduct.colors.map((color) => {
    // Parse color string if it's JSON, otherwise use as name with default hex
    try {
      const parsed = JSON.parse(color);
      return { name: parsed.name, hex: parsed.hex };
    } catch {
      return { name: color, hex: '#808080' };
    }
  }),
  stock: dbProduct.stock,
  sku: `SKU-${dbProduct.id.slice(0, 8).toUpperCase()}`,
  featured: dbProduct.featured,
  isNew: dbProduct.is_new,
  isVisible: dbProduct.is_visible,
});

// Transform database category to app Category type
const transformCategory = (dbCategory: DbCategory): Category => ({
  id: dbCategory.id,
  name: dbCategory.name,
  slug: dbCategory.slug,
  description: dbCategory.description || '',
  image: dbCategory.image || '',
});

export const useProducts = (includeHidden = false) => {
  return useQuery({
    queryKey: ['products', { includeHidden }],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `);
      
      if (!includeHidden) {
        query = query.eq('is_visible', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return (data as DbProduct[]).map(transformProduct);
    },
  });
};

export const useProduct = (id: string, includeHidden = false) => {
  return useQuery({
    queryKey: ['product', id, { includeHidden }],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('id', id);
      
      if (!includeHidden) {
        query = query.eq('is_visible', true);
      }
      
      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return transformProduct(data as DbProduct);
    },
    enabled: !!id,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('featured', true)
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as DbProduct[]).map(transformProduct);
    },
  });
};

export const useNewArrivals = () => {
  return useQuery({
    queryKey: ['products', 'new'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('is_new', true)
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as DbProduct[]).map(transformProduct);
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return (data as DbCategory[]).map(transformCategory);
    },
  });
};
