import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/use-wishlist';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const inWishlist = isInWishlist(product.id);
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.salePrice! / product.price) * 100)
    : 0;

  return (
    <div className="group relative">
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-2">
        {product.isNew && (
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            New
          </Badge>
        )}
        {hasDiscount && (
          <Badge variant="destructive">
            -{discountPercent}%
          </Badge>
        )}
      </div>

      {/* Wishlist Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-3 right-3 h-8 w-8 bg-background/80 backdrop-blur-sm transition-opacity",
          inWishlist ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        onClick={async (e) => {
          e.preventDefault();
          if (!user) {
            toast({
              title: "Sign in required",
              description: "Please sign in to add items to your wishlist.",
            });
            navigate('/auth');
            return;
          }
          await toggleWishlist(product.id);
          toast({
            title: inWishlist ? "Removed from wishlist" : "Added to wishlist",
            description: inWishlist 
              ? `${product.name} has been removed from your wishlist.`
              : `${product.name} has been added to your wishlist.`,
          });
        }}
      >
        <Heart className={cn("h-4 w-4", inWishlist && "fill-current text-destructive")} />
      </Button>

      {/* Product Info */}
      <div className="mt-4 space-y-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-sm hover:underline">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="font-semibold">${product.salePrice?.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="font-semibold">${product.price.toFixed(2)}</span>
          )}
        </div>
        <div className="flex gap-1.5 mt-2">
          {product.colors.slice(0, 4).map((color) => (
            <span
              key={color.name}
              className="w-4 h-4 rounded-full border border-border"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
