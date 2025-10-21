import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SkipLinks from "@/components/SkipLinks";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Building2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CivicAuth = () => {
  const [accessCode, setAccessCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if already authenticated
  useEffect(() => {
    const sessionToken = localStorage.getItem('civic_session_token');
    if (sessionToken) {
      navigate('/civic-admin');
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
      // Call secure civic auth edge function
      const response = await fetch(
        'https://qdqmhgwjupsoradhktzu.supabase.co/functions/v1/civic-auth?action=login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcW1oZ3dqdXBzb3JhZGhrdHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzODY5NzQsImV4cCI6MjA3Mzk2Mjk3NH0.90wVzi9LjnGUlBtCEBw6XHKJkf2DY1e_nVq7sP0L_8o',
          },
          body: JSON.stringify({
            access_code: accessCode.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        // Handle password reset needed error
        if (data.error === 'PASSWORD_NEEDS_RESET') {
          toast({
            title: "Password Reset Required",
            description: data.message || "Your password format needs to be updated. Please contact the platform administrator.",
            variant: "destructive",
            duration: 10000,
          });
        } else {
          toast({
            title: "Authentication Failed",
            description: data.error || "Invalid access code or password",
            variant: "destructive",
          });
        }
        return;
      }

      // Store only the session token (not the full session data)
      localStorage.setItem('civic_session_token', data.session_token);
      localStorage.setItem('civic_org_name', data.org_name);
      localStorage.setItem('civic_org_id', data.org_id);

      toast({
        title: "Success",
        description: `Welcome back, ${data.org_name}!`,
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
    <>
      <SkipLinks />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <header id="primary-navigation">
          <Navbar />
        </header>
        
        <main id="main-content" className="container mx-auto px-4 py-8">
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
      <Footer />
    </>
  );
};

export default CivicAuth;