import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const AdminSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [setupCode, setSetupCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Please log in first',
        description: 'You need to be logged in to set up admin access.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!setupCode.trim()) {
      toast({
        title: 'Setup code required',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('setup-admin', {
        body: { setup_code: setupCode, user_id: user.id },
      });

      if (error) throw error;

      if (data?.success) {
        setSuccess(true);
        toast({
          title: 'Admin access granted!',
          description: 'You now have admin privileges. Redirecting...',
        });
        
        // Refresh auth state and redirect
        setTimeout(() => {
          window.location.href = '/admin';
        }, 2000);
      } else {
        toast({
          title: 'Setup failed',
          description: data?.error || 'Invalid setup code',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Admin setup error:', error);
      toast({
        title: 'Setup failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-serif text-2xl font-semibold mb-4">Admin Setup</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to set up admin access.
          </p>
          <Button onClick={() => navigate('/auth')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-semibold mb-4">Admin Access Granted!</h1>
          <p className="text-muted-foreground mb-6">
            You now have access to the admin panel. Redirecting...
          </p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-2xl font-semibold">Admin Setup</h1>
          <p className="text-muted-foreground mt-2">
            Enter the admin setup code to gain access to the admin panel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="setupCode">Setup Code</Label>
            <Input
              id="setupCode"
              type="password"
              placeholder="Enter admin setup code"
              value={setupCode}
              onChange={(e) => setSetupCode(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Verify & Grant Access
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Logged in as: {user.email}
        </p>
      </div>
    </div>
  );
};

export default AdminSetup;
