export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: 'men' | 'women' | 'kids' | 'accessories';
  sizes: string[];
  colors: { name: string; hex: string }[];
  stock: number;
  sku: string;
  featured: boolean;
  isNew: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}
