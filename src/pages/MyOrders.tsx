import * as React from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, Loader2 } from 'lucide-react';
import { useUserOrders, Order } from '@/hooks/use-orders';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const statusConfig: Record<Order['status'], { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', icon: <Clock className="h-4 w-4" />, variant: 'secondary' },
  confirmed: { label: 'Confirmed', icon: <CheckCircle className="h-4 w-4" />, variant: 'default' },
  processing: { label: 'Processing', icon: <Package className="h-4 w-4" />, variant: 'default' },
  shipped: { label: 'Shipped', icon: <Truck className="h-4 w-4" />, variant: 'default' },
  delivered: { label: 'Delivered', icon: <CheckCircle className="h-4 w-4" />, variant: 'outline' },
  cancelled: { label: 'Cancelled', icon: <XCircle className="h-4 w-4" />, variant: 'destructive' },
};

const OrderStatusTracker = ({ status }: { status: Order['status'] }) => {
  const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const;
  const currentIndex = status === 'cancelled' ? -1 : steps.indexOf(status as typeof steps[number]);

  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <XCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 w-full">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                index <= currentIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {index < currentIndex ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            <span className="text-xs text-muted-foreground mt-1 capitalize hidden sm:block">
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 ${
                index < currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const OrderCard = ({ order }: { order: Order }) => {
  const config = statusConfig[order.status];
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-medium">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </CardTitle>
            <Badge variant={config.variant} className="flex items-center gap-1">
              {config.icon}
              {config.label}
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">
            {format(new Date(order.created_at), 'MMM dd, yyyy')}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Status Tracker */}
        <OrderStatusTracker status={order.status} />
        
        <Separator />
        
        {/* Order Items */}
        <div className="space-y-3">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex gap-3">
              {item.product_image && (
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="w-16 h-16 object-cover rounded-md"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.product_name}</p>
                <p className="text-sm text-muted-foreground">
                  Qty: {item.quantity}
                  {item.size && ` • Size: ${item.size}`}
                  {item.color && ` • Color: ${item.color}`}
                </p>
                <p className="text-sm font-medium">${item.total_price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        
        <Separator />
        
        {/* Order Summary */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            <p>Shipping: {order.shipping_city}, {order.shipping_state}</p>
            <p>Delivery: {order.delivery_method === 'express' ? 'Express' : 'Standard'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-lg font-semibold">${order.total.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MyOrders = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { data: orders, isLoading, error } = useUserOrders();

  if (authLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-12">
        <Card className="max-w-md mx-auto text-center p-8">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in to view your orders</h2>
          <p className="text-muted-foreground mb-4">
            Track your orders and view your order history
          </p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12">
        <Card className="max-w-md mx-auto text-center p-8">
          <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error loading orders</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">My Orders</h1>
          <Button variant="outline" asChild>
            <Link to="/shop">
              Continue Shopping
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <Card className="text-center p-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-4">
              When you place an order, it will appear here
            </p>
            <Button asChild>
              <Link to="/shop">Start Shopping</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
