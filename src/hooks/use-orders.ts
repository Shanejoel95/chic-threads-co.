import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  size: string | null;
  color: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string | null;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  delivery_method: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface CreateOrderInput {
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  shipping_name: string;
  shipping_email: string;
  shipping_phone?: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country?: string;
  delivery_method: string;
  notes?: string;
  items: {
    product_id: string;
    product_name: string;
    product_image?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    size?: string;
    color?: string;
  }[];
}

// Hook for fetching all orders (admin)
export const useAdminOrders = () => {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });
};

// Hook for fetching user's orders
export const useUserOrders = () => {
  return useQuery({
    queryKey: ['user-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });
};

// Hook for fetching a single order
export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .maybeSingle();

      if (error) throw error;
      return data as Order | null;
    },
    enabled: !!orderId,
  });
};

// Hook for creating an order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to place an order');
      }

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          subtotal: input.subtotal,
          shipping_cost: input.shipping_cost,
          tax: input.tax,
          total: input.total,
          shipping_name: input.shipping_name,
          shipping_email: input.shipping_email,
          shipping_phone: input.shipping_phone,
          shipping_address: input.shipping_address,
          shipping_city: input.shipping_city,
          shipping_state: input.shipping_state,
          shipping_zip: input.shipping_zip,
          shipping_country: input.shipping_country || 'United States',
          delivery_method: input.delivery_method,
          notes: input.notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = input.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        size: item.size,
        color: item.color,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Send order confirmation email
      try {
        const { error: emailError } = await supabase.functions.invoke('send-order-confirmation', {
          body: {
            orderId: order.id,
            customerEmail: input.shipping_email,
            customerName: input.shipping_name,
            items: input.items.map(item => ({
              product_name: item.product_name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              size: item.size,
              color: item.color,
            })),
            subtotal: input.subtotal,
            shippingCost: input.shipping_cost,
            tax: input.tax,
            total: input.total,
            shippingAddress: input.shipping_address,
            shippingCity: input.shipping_city,
            shippingState: input.shipping_state,
            shippingZip: input.shipping_zip,
            shippingCountry: input.shipping_country || 'United States',
            deliveryMethod: input.delivery_method,
          },
        });

        if (emailError) {
          console.error('Failed to send order confirmation email:', emailError);
        }
      } catch (emailErr) {
        console.error('Error sending confirmation email:', emailErr);
        // Don't throw - order was still created successfully
      }

      return order as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (error) => {
      toast({
        title: 'Error creating order',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook for updating order status (admin)
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
      // First, get the order details for the email
      const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;

      // Update the order status
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      // Send status update email
      try {
        const { error: emailError } = await supabase.functions.invoke('send-order-status-update', {
          body: {
            orderId: orderId,
            customerEmail: orderData.shipping_email,
            customerName: orderData.shipping_name,
            newStatus: status,
            orderTotal: orderData.total,
          },
        });

        if (emailError) {
          console.error('Failed to send status update email:', emailError);
        }
      } catch (emailErr) {
        console.error('Error sending status update email:', emailErr);
        // Don't throw - status was still updated successfully
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      toast({
        title: 'Order updated',
        description: `Order status changed to ${variables.status}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating order',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
