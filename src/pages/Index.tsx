import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import { useFeaturedProducts, useNewArrivals, useCategories } from '@/hooks/use-products';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  const { data: featuredProducts = [], isLoading: featuredLoading } = useFeaturedProducts();
  const { data: newArrivals = [], isLoading: newLoading } = useNewArrivals();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="LUXE Fashion"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
        </div>
        <div className="container relative h-full flex items-center">
          <div className="max-w-xl space-y-6">
            <span className="inline-block text-sm font-medium tracking-widest uppercase text-muted-foreground">
              New Collection 2025
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight">
              Timeless Elegance Meets Modern Style
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover our curated collection of premium fashion pieces designed for the discerning individual.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/shop">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/shop?filter=new">New Arrivals</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold">Shop by Category</h2>
            <p className="mt-4 text-muted-foreground">
              Explore our collections crafted for every style
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categoriesLoading ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/shop?category=${category.slug}`}
                  className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-muted"
                >
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                    <h3 className="font-serif text-xl md:text-2xl font-semibold text-background">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-sm text-background/80 hidden md:block">
                      {category.description}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-8">
                No categories yet
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold">Featured Products</h2>
              <p className="mt-4 text-muted-foreground">Handpicked pieces from our latest collection</p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link to="/shop">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredLoading ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-8">
                No featured products yet
              </p>
            )}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link to="/shop">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="relative rounded-2xl overflow-hidden bg-primary text-primary-foreground">
            <div className="px-8 py-12 md:px-16 md:py-20 text-center">
              <span className="inline-block text-sm font-medium tracking-widest uppercase opacity-80">
                Limited Time Offer
              </span>
              <h2 className="mt-4 font-serif text-3xl md:text-4xl lg:text-5xl font-semibold">
                Up to 40% Off Selected Styles
              </h2>
              <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
                Discover exceptional value on premium pieces. Don't miss out on these exclusive savings.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="mt-8"
                asChild
              >
                <Link to="/shop?filter=sale">
                  Shop the Sale
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold">New Arrivals</h2>
              <p className="mt-4 text-muted-foreground">The latest additions to our collection</p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link to="/shop?filter=new">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newLoading ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : newArrivals.length > 0 ? (
              newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-8">
                No new arrivals yet
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold">Join Our Community</h2>
            <p className="mt-4 text-muted-foreground">
              Subscribe to receive early access to new collections, exclusive offers, and style inspiration.
            </p>
            <form className="mt-8 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" size="lg">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
