import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useCategories } from '@/hooks/use-products';
import { useImageUpload } from '@/hooks/use-image-upload';
import { Loader2, Plus, X, Upload, ImageIcon, Trash2 } from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  discount_percentage: string;
  category_id: string;
  stock: string;
  featured: boolean;
  is_new: boolean;
  is_visible: boolean;
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: string[];
}

interface ProductFormProps {
  initialData?: {
    id?: string;
    name: string;
    description?: string;
    price: number;
    salePrice?: number | null;
    discountPercentage?: number | null;
    category?: string;
    stock: number;
    featured: boolean;
    isNew: boolean;
    isVisible?: boolean;
    sizes?: string[];
    colors?: { name: string; hex: string }[];
    images?: string[];
  };
  onSubmit: (data: {
    name: string;
    description?: string;
    price: number;
    sale_price?: number | null;
    discount_percentage?: number | null;
    category_id?: string | null;
    sizes: string[];
    colors: string[];
    images: string[];
    stock: number;
    featured: boolean;
    is_new: boolean;
    is_visible: boolean;
  }) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const ProductForm = ({ initialData, onSubmit, isLoading, submitLabel = 'Save Product' }: ProductFormProps) => {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { uploadImage, isUploading } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    discount_percentage: '',
    category_id: '',
    stock: '0',
    featured: false,
    is_new: false,
    is_visible: true,
    sizes: [],
    colors: [],
    images: [],
  });

  const [newSize, setNewSize] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');

  useEffect(() => {
    if (initialData) {
      const category = categories?.find(c => c.slug === initialData.category);
      
      // Calculate discount percentage from price and sale price if not provided
      let discountPct = initialData.discountPercentage;
      if (!discountPct && initialData.salePrice && initialData.price > 0) {
        discountPct = Math.round(((initialData.price - initialData.salePrice) / initialData.price) * 100);
      }
      
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        price: initialData.price.toString(),
        discount_percentage: discountPct?.toString() || '',
        category_id: category?.id || '',
        stock: initialData.stock.toString(),
        featured: initialData.featured,
        is_new: initialData.isNew,
        is_visible: initialData.isVisible ?? true,
        sizes: initialData.sizes || [],
        colors: initialData.colors || [],
        images: initialData.images || [],
      });
    }
  }, [initialData, categories]);

  const handleAddSize = (size: string) => {
    if (size && !formData.sizes.includes(size)) {
      setFormData({ ...formData, sizes: [...formData.sizes, size] });
      setNewSize('');
    }
  };

  const handleRemoveSize = (size: string) => {
    setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== size) });
  };

  const handleAddColor = () => {
    if (newColorName && !formData.colors.some(c => c.name === newColorName)) {
      setFormData({
        ...formData,
        colors: [...formData.colors, { name: newColorName, hex: newColorHex }],
      });
      setNewColorName('');
      setNewColorHex('#000000');
    }
  };

  const handleRemoveColor = (colorName: string) => {
    setFormData({ ...formData, colors: formData.colors.filter(c => c.name !== colorName) });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, url],
        }));
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageUrl),
    }));
  };

  const calculateSalePrice = (): number | null => {
    const price = parseFloat(formData.price);
    const discount = parseFloat(formData.discount_percentage);
    
    if (!price || !discount || discount <= 0 || discount >= 100) {
      return null;
    }
    
    return Math.round((price * (1 - discount / 100)) * 100) / 100;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const salePrice = calculateSalePrice();
    
    onSubmit({
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      sale_price: salePrice,
      discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : null,
      category_id: formData.category_id || null,
      sizes: formData.sizes.length > 0 ? formData.sizes : ['One Size'],
      colors: formData.colors.length > 0 
        ? formData.colors.map(c => JSON.stringify(c))
        : ['{"name": "Default", "hex": "#000000"}'],
      images: formData.images.length > 0 ? formData.images : ['/placeholder.svg'],
      stock: parseInt(formData.stock, 10),
      featured: formData.featured,
      is_new: formData.is_new,
      is_visible: formData.is_visible,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Product Images */}
      <div className="space-y-3">
        <Label>Product Images</Label>
        <div className="flex flex-wrap gap-3">
          {formData.images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Product ${index + 1}`}
                className="w-20 h-20 object-cover rounded-md border border-border"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(image)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-20 h-20 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span className="text-xs mt-1">Upload</span>
              </>
            )}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            placeholder="Enter product name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock *</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            placeholder="0"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter product description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discount">Discount %</Label>
          <Input
            id="discount"
            type="number"
            min="0"
            max="99"
            step="1"
            placeholder="0"
            value={formData.discount_percentage}
            onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
          />
          {calculateSalePrice() && (
            <p className="text-xs text-muted-foreground">
              Sale price: ${calculateSalePrice()?.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category_id}
          onValueChange={(value) => setFormData({ ...formData, category_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder={categoriesLoading ? 'Loading...' : 'Select category'} />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sizes Management */}
      <div className="space-y-3">
        <Label>Sizes</Label>
        <div className="flex flex-wrap gap-2">
          {formData.sizes.map((size) => (
            <Badge key={size} variant="secondary" className="gap-1 pr-1">
              {size}
              <button
                type="button"
                onClick={() => handleRemoveSize(size)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Select value={newSize} onValueChange={handleAddSize}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Add size" />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_SIZES.filter(s => !formData.sizes.includes(s)).map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 flex-1">
            <Input
              placeholder="Custom size"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSize(newSize);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleAddSize(newSize)}
              disabled={!newSize}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Colors Management */}
      <div className="space-y-3">
        <Label>Colors</Label>
        <div className="flex flex-wrap gap-2">
          {formData.colors.map((color) => (
            <Badge key={color.name} variant="secondary" className="gap-2 pr-1">
              <span
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: color.hex }}
              />
              {color.name}
              <button
                type="button"
                onClick={() => handleRemoveColor(color.name)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            type="color"
            value={newColorHex}
            onChange={(e) => setNewColorHex(e.target.value)}
            className="w-12 h-10 p-1 cursor-pointer"
          />
          <Input
            placeholder="Color name (e.g., Navy Blue)"
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddColor();
              }
            }}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddColor}
            disabled={!newColorName}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Product Options */}
      <div className="space-y-4 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="is_visible">Visible on Site</Label>
            <p className="text-xs text-muted-foreground">Show this product to customers</p>
          </div>
          <Switch
            id="is_visible"
            checked={formData.is_visible}
            onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
          />
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
            />
            <Label htmlFor="featured">Featured Product</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isNew"
              checked={formData.is_new}
              onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked as boolean })}
            />
            <Label htmlFor="isNew">New Arrival</Label>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isLoading || isUploading} className="mt-2">
        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
};

export default ProductForm;
