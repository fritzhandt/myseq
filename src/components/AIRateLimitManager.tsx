import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Zap, RefreshCw, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const DEFAULT_DAILY_LIMIT = 100;

export default function AIRateLimitManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentUsage, setCurrentUsage] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(DEFAULT_DAILY_LIMIT);
  const [newLimit, setNewLimit] = useState('');
  const [searchDate, setSearchDate] = useState('');

  useEffect(() => {
    loadCurrentUsage();
  }, []);

  const loadCurrentUsage = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      setSearchDate(today);

      // Get today's AI search usage
      const { data, error } = await supabase
        .from('ai_search_usage')
        .select('search_count')
        .eq('search_date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCurrentUsage(data?.search_count || 0);
    } catch (error) {
      console.error('Error loading AI search usage:', error);
      toast({
        title: "Error",
        description: "Failed to load AI search usage",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLimit = async () => {
    const limit = parseInt(newLimit);
    
    if (isNaN(limit) || limit < 1) {
      toast({
        title: "Invalid Limit",
        description: "Please enter a valid number greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (limit < currentUsage) {
      toast({
        title: "Invalid Limit",
        description: `New limit (${limit}) cannot be lower than current usage (${currentUsage})`,
        variant: "destructive",
      });
      return;
    }

    try {
      setDailyLimit(limit);
      setNewLimit('');
      
      toast({
        title: "Success",
        description: `Daily limit updated to ${limit} searches`,
      });
    } catch (error) {
      console.error('Error updating limit:', error);
      toast({
        title: "Error",
        description: "Failed to update daily limit",
        variant: "destructive",
      });
    }
  };

  const handleResetLimit = () => {
    setDailyLimit(DEFAULT_DAILY_LIMIT);
    toast({
      title: "Success",
      description: `Daily limit reset to default (${DEFAULT_DAILY_LIMIT} searches)`,
    });
  };

  const remaining = Math.max(0, dailyLimit - currentUsage);
  const usagePercentage = dailyLimit > 0 ? (currentUsage / dailyLimit) * 100 : 0;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = usagePercentage >= 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Search Rate Limit
          </CardTitle>
          <CardDescription>
            Monitor and manage daily AI search usage limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Usage Stats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Today's Usage</p>
                <p className="text-2xl font-bold">{currentUsage}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Daily Limit</p>
                <p className="text-2xl font-bold">{dailyLimit}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Remaining</p>
                <p className={`text-2xl font-bold ${isAtLimit ? 'text-destructive' : isNearLimit ? 'text-orange-500' : 'text-green-600'}`}>
                  {remaining}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={usagePercentage} 
                className={`h-3 ${isAtLimit ? '[&>div]:bg-destructive' : isNearLimit ? '[&>div]:bg-orange-500' : ''}`}
              />
              <p className="text-xs text-muted-foreground">
                {usagePercentage.toFixed(1)}% of daily limit used
              </p>
            </div>

            {/* Status Messages */}
            {isAtLimit && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Daily limit reached! AI searches are currently blocked.
                </p>
              </div>
            )}
            {isNearLimit && !isAtLimit && (
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">
                  ⚡ Approaching daily limit! {remaining} searches remaining.
                </p>
              </div>
            )}
          </div>

          {/* Update Limit Section */}
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="newLimit">Adjust Daily Limit (Today Only)</Label>
              <div className="flex gap-2">
                <Input
                  id="newLimit"
                  type="number"
                  min="1"
                  placeholder={`Current: ${dailyLimit}`}
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleUpdateLimit}
                  disabled={!newLimit}
                >
                  Update
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a new limit for today only. This will reset to {DEFAULT_DAILY_LIMIT} tomorrow.
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={loadCurrentUsage}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </Button>
              <Button 
                variant="outline" 
                onClick={handleResetLimit}
              >
                Reset to Default ({DEFAULT_DAILY_LIMIT})
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> The daily limit resets at midnight. Increasing the limit only affects today's searches and will not persist to future days. The default limit is {DEFAULT_DAILY_LIMIT} searches per day.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Historical Stats Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-lg font-bold">{searchDate}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className={`text-lg font-bold ${isAtLimit ? 'text-destructive' : isNearLimit ? 'text-orange-500' : 'text-green-600'}`}>
                {isAtLimit ? 'At Limit' : isNearLimit ? 'Near Limit' : 'Normal'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}