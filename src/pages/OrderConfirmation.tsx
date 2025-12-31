import { Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OrderConfirmation = () => {
  const orderNumber = `LX${Date.now().toString().slice(-8)}`;

  return (
    <div className="container py-16">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>

        <h1 className="font-serif text-3xl font-semibold mb-4">Order Confirmed!</h1>
        
        <p className="text-muted-foreground mb-2">
          Thank you for your purchase. Your order has been received.
        </p>
        
        <p className="text-sm text-muted-foreground mb-8">
          Order Number: <span className="font-mono font-medium text-foreground">{orderNumber}</span>
        </p>

        <div className="p-6 border rounded-lg bg-muted/30 mb-8">
          <div className="flex items-center justify-center gap-3 text-sm">
            <Package className="h-5 w-5 text-muted-foreground" />
            <span>
              A confirmation email has been sent to your email address.
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/shop">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
