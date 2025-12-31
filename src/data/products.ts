import product1 from '@/assets/product-1.jpg';
import product2 from '@/assets/product-2.jpg';
import product3 from '@/assets/product-3.jpg';
import product4 from '@/assets/product-4.jpg';
import product5 from '@/assets/product-5.jpg';
import product6 from '@/assets/product-6.jpg';
import product7 from '@/assets/product-7.jpg';
import product8 from '@/assets/product-8.jpg';
import categoryMen from '@/assets/category-men.jpg';
import categoryWomen from '@/assets/category-women.jpg';
import categoryKids from '@/assets/category-kids.jpg';
import categoryAccessories from '@/assets/category-accessories.jpg';
import type { Product, Category } from '@/types/product';

export const products: Product[] = [
  {
    id: '1',
    name: 'Cashmere Wool Coat',
    description: 'Luxuriously soft cashmere wool coat with a timeless silhouette. Perfect for elegant occasions and everyday sophistication.',
    price: 495,
    images: [product1],
    category: 'women',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Cream', hex: '#F5F5DC' },
      { name: 'Camel', hex: '#C19A6B' },
    ],
    stock: 15,
    sku: 'LX-WC-001',
    featured: true,
    isNew: true,
  },
  {
    id: '2',
    name: 'Designer Blazer',
    description: 'Sharp tailored blazer crafted from premium Italian wool. A wardrobe essential for the modern professional.',
    price: 385,
    salePrice: 299,
    images: [product2],
    category: 'women',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Navy', hex: '#1a2a4a' },
    ],
    stock: 22,
    sku: 'LX-WB-002',
    featured: true,
    isNew: false,
  },
  {
    id: '3',
    name: 'Silk Blouse',
    description: 'Elegant silk blouse with a relaxed fit and refined details. Versatile enough for the office or evening wear.',
    price: 195,
    images: [product3],
    category: 'women',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Champagne', hex: '#F7E7CE' },
      { name: 'Ivory', hex: '#FFFFF0' },
    ],
    stock: 30,
    sku: 'LX-WS-003',
    featured: false,
    isNew: true,
  },
  {
    id: '4',
    name: 'Tailored Trousers',
    description: 'Impeccably tailored trousers in fine wool blend. The perfect foundation for any refined ensemble.',
    price: 225,
    images: [product4],
    category: 'men',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Navy', hex: '#1a2a4a' },
      { name: 'Charcoal', hex: '#36454F' },
    ],
    stock: 18,
    sku: 'LX-MT-004',
    featured: true,
    isNew: false,
  },
  {
    id: '5',
    name: 'Merino Turtleneck',
    description: 'Ultra-soft merino wool turtleneck sweater. Warmth and elegance combined in a timeless design.',
    price: 175,
    images: [product5],
    category: 'men',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Camel', hex: '#C19A6B' },
      { name: 'Burgundy', hex: '#722F37' },
    ],
    stock: 25,
    sku: 'LX-MS-005',
    featured: false,
    isNew: true,
  },
  {
    id: '6',
    name: 'Cashmere Scarf',
    description: 'Sumptuous cashmere scarf with delicate fringe detailing. An accessory that elevates any look.',
    price: 145,
    images: [product6],
    category: 'accessories',
    sizes: ['One Size'],
    colors: [
      { name: 'Grey', hex: '#808080' },
      { name: 'Camel', hex: '#C19A6B' },
    ],
    stock: 40,
    sku: 'LX-AC-006',
    featured: true,
    isNew: false,
  },
  {
    id: '7',
    name: 'Essential Cotton Tee',
    description: 'Premium organic cotton t-shirt with a relaxed fit. The foundation of effortless style.',
    price: 65,
    images: [product7],
    category: 'men',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Black', hex: '#1a1a1a' },
    ],
    stock: 50,
    sku: 'LX-MT-007',
    featured: false,
    isNew: false,
  },
  {
    id: '8',
    name: 'Flowing Maxi Dress',
    description: 'Ethereal maxi dress in flowing chiffon. A statement piece for special occasions and memorable moments.',
    price: 345,
    salePrice: 275,
    images: [product8],
    category: 'women',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Dusty Rose', hex: '#D4A5A5' },
      { name: 'Sage', hex: '#9CAF88' },
    ],
    stock: 12,
    sku: 'LX-WD-008',
    featured: true,
    isNew: true,
  },
];

export const categories: Category[] = [
  {
    id: '1',
    name: 'Women',
    slug: 'women',
    image: categoryWomen,
    description: 'Elegant pieces for the modern woman',
  },
  {
    id: '2',
    name: 'Men',
    slug: 'men',
    image: categoryMen,
    description: 'Refined essentials for the discerning gentleman',
  },
  {
    id: '3',
    name: 'Kids',
    slug: 'kids',
    image: categoryKids,
    description: 'Playful yet sophisticated styles for children',
  },
  {
    id: '4',
    name: 'Accessories',
    slug: 'accessories',
    image: categoryAccessories,
    description: 'The finishing touches that elevate every look',
  },
];
