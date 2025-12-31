import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export const useCustomerCount = () => {
  return useQuery({
    queryKey: ['customer-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    },
  });
};

export const useMonthlyStats = () => {
  return useQuery({
    queryKey: ['monthly-stats'],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // This month's orders
      const { data: thisMonthOrders, error: thisMonthError } = await supabase
        .from('orders')
        .select('total, created_at')
        .gte('created_at', startOfMonth.toISOString());

      if (thisMonthError) throw thisMonthError;

      // Last month's orders
      const { data: lastMonthOrders, error: lastMonthError } = await supabase
        .from('orders')
        .select('total, created_at')
        .gte('created_at', startOfLastMonth.toISOString())
        .lte('created_at', endOfLastMonth.toISOString());

      if (lastMonthError) throw lastMonthError;

      const thisMonthRevenue = thisMonthOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const lastMonthRevenue = lastMonthOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

      const thisMonthOrderCount = thisMonthOrders?.length || 0;
      const lastMonthOrderCount = lastMonthOrders?.length || 0;

      // Calculate percentage changes
      const revenueChange = lastMonthRevenue > 0 
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
        : thisMonthRevenue > 0 ? '100' : '0';

      const orderChange = lastMonthOrderCount > 0
        ? ((thisMonthOrderCount - lastMonthOrderCount) / lastMonthOrderCount * 100).toFixed(1)
        : thisMonthOrderCount > 0 ? '100' : '0';

      return {
        thisMonthRevenue,
        lastMonthRevenue,
        thisMonthOrderCount,
        lastMonthOrderCount,
        revenueChange: Number(revenueChange),
        orderChange: Number(orderChange),
      };
    },
  });
};

export const useRevenueChart = (days: number = 7) => {
  return useQuery({
    queryKey: ['revenue-chart', days],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(endDate, days - 1);

      const { data: orders, error } = await supabase
        .from('orders')
        .select('total, created_at')
        .gte('created_at', startOfDay(startDate).toISOString())
        .lte('created_at', endOfDay(endDate).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Create a map of dates with their totals
      const dailyRevenue: Record<string, { revenue: number; orders: number }> = {};
      
      // Initialize all days with zero
      for (let i = 0; i < days; i++) {
        const date = subDays(endDate, days - 1 - i);
        const dateKey = format(date, 'yyyy-MM-dd');
        dailyRevenue[dateKey] = { revenue: 0, orders: 0 };
      }

      // Aggregate orders by date
      orders?.forEach((order) => {
        const dateKey = format(new Date(order.created_at), 'yyyy-MM-dd');
        if (dailyRevenue[dateKey]) {
          dailyRevenue[dateKey].revenue += Number(order.total);
          dailyRevenue[dateKey].orders += 1;
        }
      });

      // Convert to array for chart
      return Object.entries(dailyRevenue).map(([date, data]) => ({
        date,
        displayDate: format(new Date(date), 'MMM dd'),
        revenue: data.revenue,
        orders: data.orders,
      }));
    },
  });
};

export const useTopSellingProducts = () => {
  return useQuery({
    queryKey: ['top-selling-products'],
    queryFn: async () => {
      // Get order items with counts
      const { data, error } = await supabase
        .from('order_items')
        .select('product_id, product_name, product_image, quantity');

      if (error) throw error;

      // Aggregate by product
      const productSales: Record<string, { 
        product_id: string | null; 
        product_name: string; 
        product_image: string | null;
        totalQuantity: number;
        totalRevenue: number;
      }> = {};

      data?.forEach((item) => {
        const key = item.product_id || item.product_name;
        if (!productSales[key]) {
          productSales[key] = {
            product_id: item.product_id,
            product_name: item.product_name,
            product_image: item.product_image,
            totalQuantity: 0,
            totalRevenue: 0,
          };
        }
        productSales[key].totalQuantity += item.quantity;
      });

      // Sort by quantity and return top 4
      return Object.values(productSales)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 4);
    },
  });
};
