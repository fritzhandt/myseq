import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'main_admin' | 'sub_admin' | null;

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setUserRole(null);
          setLoading(false);
          return;
        }

        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user role:', error);
          toast({
            title: "Error",
            description: "Failed to fetch user role",
            variant: "destructive",
          });
          setUserRole(null);
        } else {
          setUserRole(roleData?.role || null);
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUserRole(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' && session) {
        fetchUserRole();
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const isMainAdmin = userRole === 'main_admin';
  const isSubAdmin = userRole === 'sub_admin';
  const hasAdminAccess = isMainAdmin || isSubAdmin;

  return {
    userRole,
    loading,
    isMainAdmin,
    isSubAdmin,
    hasAdminAccess
  };
};