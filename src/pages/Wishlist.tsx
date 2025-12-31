import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/use-wishlist';
import { useProducts } from '@/hooks/use-products';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';

const Wishlist = () => {
  const { user } = useAuth();
  const { wishlistItems, isLoading: wishlistLoading } = useWishlist();
  const { data: products = [], isLoading: productsLoading } = useProducts();

  if (!user) {
    return (
      <div className="container py-16 text-center">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Sign in to view your wishlist</h1>
        <p className="text-muted-foreground mb-6">
          Save your favorite items and access them anytime.
        </p>
        <Button asChild>
          <Link to="/auth">Sign In</Link>
        </Button>
      </div>
    );
  }

  const isLoading = wishlistLoading || productsLoading;

  const wishlistProducts = products.filter(product =>
    wishlistItems.some(item => item.product_id === product.id)
  );

  if (isLoading) {
    return (
      <div className="container py-16">
        <h1 className="text-3xl font-semibold mb-8">My Wishlist</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="container py-16 text-center">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Your wishlist is empty</h1>
        <p className="text-muted-foreground mb-6">
          Browse our collection and save items you love.
        </p>
        <Button asChild>
          <Link to="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-semibold mb-8">My Wishlist</h1>
      <p className="text-muted-foreground mb-6">
        {wishlistProducts.length} item{wishlistProducts.length !== 1 ? 's' : ''} saved
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
