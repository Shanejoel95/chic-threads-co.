import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Instagram, Twitter, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-serif text-2xl font-semibold tracking-tight">LUXE</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Timeless elegance meets modern sophistication. Discover curated collections for the discerning individual.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="font-medium">Shop</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/shop?category=women" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Women
              </Link>
              <Link to="/shop?category=men" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Men
              </Link>
              <Link to="/shop?category=kids" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Kids
              </Link>
              <Link to="/shop?category=accessories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Accessories
              </Link>
              <Link to="/shop?filter=new" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                New Arrivals
              </Link>
            </nav>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-medium">Company</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-medium">Newsletter</h4>
            <p className="text-sm text-muted-foreground">
              Subscribe to receive updates on new arrivals and exclusive offers.
            </p>
            <form className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="flex-1"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 LUXE Fashion. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-sm text-muted-foreground">Visa</span>
            <span className="text-sm text-muted-foreground">Mastercard</span>
            <span className="text-sm text-muted-foreground">Amex</span>
            <span className="text-sm text-muted-foreground">PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
