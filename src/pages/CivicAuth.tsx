import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { Building2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import bcrypt from 'bcryptjs';

const CivicAuth = () => {
  const [accessCode, setAccessCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if already authenticated
  useEffect(() => {
    const civicSession = localStorage.getItem('civic_session');
    if (civicSession) {
      try {
        const session = JSON.parse(civicSession);
        if (session.expires > Date.now()) {
          navigate('/civic-admin');
          return;
        } else {
          localStorage.removeItem('civic_session');
        }
      } catch (error) {
        localStorage.removeItem('civic_session');
      }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both access code and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Find organization with matching access code
      const { data: org, error } = await supabase
        .from('civic_organizations')
        .select('*')
        .eq('access_code', accessCode.trim())
        .eq('is_active', true)
        .single();

      if (error || !org) {
        toast({
          title: "Authentication Failed",
          description: "Invalid access code or password",
          variant: "destructive",
        });
        return;
      }

      // Verify password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, org.password_hash);
      
      if (!isPasswordValid) {
        toast({
          title: "Authentication Failed", 
          description: "Invalid access code or password",
          variant: "destructive",
        });
        return;
      }

      // Create session
      const session = {
        orgId: org.id,
        orgName: org.name,
        expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      };

      localStorage.setItem('civic_session', JSON.stringify(session));
      
      toast({
        title: "Success",
        description: `Welcome back, ${org.name}!`,
      });

      navigate('/civic-admin');

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/civics')}
            className="mb-6 hover:bg-green-50 hover:text-green-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Organizations
          </Button>

          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Organization Access</CardTitle>
              <CardDescription>
                Enter your organization's access credentials to manage your civic organization profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accessCode">Access Code</Label>
                  <Input
                    id="accessCode"
                    type="text"
                    placeholder="Enter your access code"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="text-center font-mono"
                    maxLength={20}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Authenticating..." : "Access Admin Panel"}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Need access?</strong> Contact your organization administrator 
                  or the platform administrators to get your access credentials.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CivicAuth;