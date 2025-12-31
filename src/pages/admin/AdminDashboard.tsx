import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/hooks/use-products';
import { useAdminOrders } from '@/hooks/use-orders';
import { useCustomerCount, useMonthlyStats, useTopSellingProducts } from '@/hooks/use-admin-stats';
import RevenueChart from '@/components/admin/RevenueChart';

const AdminDashboard = () => {
  const { data: products = [], isLoading: productsLoading } = useProducts(true);
  const { data: orders = [], isLoading: ordersLoading } = useAdminOrders();
  const { data: customerCount = 0, isLoading: customersLoading } = useCustomerCount();
  const { data: monthlyStats, isLoading: statsLoading } = useMonthlyStats();
  const { data: topProducts = [], isLoading: topProductsLoading } = useTopSellingProducts();

  const isLoading = productsLoading || ordersLoading || customersLoading || statsLoading;

  // Calculate total revenue from all orders
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);

  // Low stock products (less than 20)
  const lowStockProducts = products.filter((p) => p.stock < 20);

  // Recent orders (last 5)
  const recentOrders = orders.slice(0, 5);

  // Stats for display
  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: monthlyStats ? `${monthlyStats.revenueChange >= 0 ? '+' : ''}${monthlyStats.revenueChange}%` : '+0%',
      trend: monthlyStats && monthlyStats.revenueChange >= 0 ? 'up' : 'down',
      icon: DollarSign,
    },
    {
      title: 'Orders',
      value: orders.length.toString(),
      change: monthlyStats ? `${monthlyStats.orderChange >= 0 ? '+' : ''}${monthlyStats.orderChange}%` : '+0%',
      trend: monthlyStats && monthlyStats.orderChange >= 0 ? 'up' : 'down',
      icon: ShoppingCart,
    },
    {
      title: 'Products',
      value: products.length.toString(),
      change: `${products.length}`,
      trend: 'up',
      icon: Package,
    },
    {
      title: 'Customers',
      value: customerCount.toString(),
      change: `${customerCount}`,
      trend: 'up',
      icon: Users,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      case 'processing':
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs mt-1">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                  )}
                  <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <RevenueChart />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{order.shipping_name}</p>
                      <p className="text-xs text-muted-foreground">{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">${Number(order.total).toFixed(2)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No orders yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded bg-muted overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute top-0.5 right-0.5 p-0.5 rounded-full ${product.isVisible ? 'bg-green-500' : 'bg-muted-foreground'}`}>
                        {product.isVisible ? (
                          <Eye className="h-2.5 w-2.5 text-white" />
                        ) : (
                          <EyeOff className="h-2.5 w-2.5 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-destructive">
                        {product.stock} left
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  All products are well stocked
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          {topProductsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : topProducts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {topProducts.map((product, index) => (
                <div key={product.product_id || index} className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded bg-muted overflow-hidden">
                    {product.product_image ? (
                      <img
                        src={product.product_image}
                        alt={product.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className={`absolute top-0.5 right-0.5 p-0.5 rounded-full ${product.isVisible ? 'bg-green-500' : 'bg-muted-foreground'}`}>
                      {product.isVisible ? (
                        <Eye className="h-2.5 w-2.5 text-white" />
                      ) : (
                        <EyeOff className="h-2.5 w-2.5 text-white" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm line-clamp-1">{product.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.totalQuantity} sold
                    </p>
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Top seller</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No sales data yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
