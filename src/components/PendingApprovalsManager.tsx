import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Eye, Check, X, Clock } from 'lucide-react';

interface PendingItem {
  id: string;
  title: string;
  submitted_by: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'event' | 'resource' | 'community_alert' | 'special_event';
  data: any;
}

export const PendingApprovalsManager = () => {
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const { toast } = useToast();

  const fetchPendingItems = async () => {
    setLoading(true);
    try {
      // Fetch all pending items from different tables
      const [eventsResult, resourcesResult, alertsResult, specialEventsResult] = await Promise.all([
        supabase.from('pending_events').select('*').eq('status', 'pending'),
        supabase.from('pending_resources').select('*').eq('status', 'pending'),
        supabase.from('pending_community_alerts').select('*').eq('status', 'pending'),
        supabase.from('pending_special_events').select('*').eq('status', 'pending')
      ]);

      const items: PendingItem[] = [
        ...(eventsResult.data || []).map(item => ({
          id: item.id,
          title: item.title,
          submitted_by: item.submitted_by,
          submitted_at: item.submitted_at,
          status: 'pending' as const,
          type: 'event' as const,
          data: item
        })),
        ...(resourcesResult.data || []).map(item => ({
          id: item.id,
          title: item.organization_name,
          submitted_by: item.submitted_by,
          submitted_at: item.submitted_at,
          status: 'pending' as const,
          type: 'resource' as const,
          data: item
        })),
        ...(alertsResult.data || []).map(item => ({
          id: item.id,
          title: item.title,
          submitted_by: item.submitted_by,
          submitted_at: item.submitted_at,
          status: 'pending' as const,
          type: 'community_alert' as const,
          data: item
        })),
        ...(specialEventsResult.data || []).map(item => ({
          id: item.id,
          title: item.title,
          submitted_by: item.submitted_by,
          submitted_at: item.submitted_at,
          status: 'pending' as const,
          type: 'special_event' as const,
          data: item
        }))
      ];

      // Sort by submission date (newest first)
      items.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
      
      setPendingItems(items);
    } catch (error) {
      console.error('Error fetching pending items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const handleApprove = async (item: PendingItem) => {
    setIsReviewing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Move to main table based on type
      let insertResult;
      const reviewData = {
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes
      };

      if (item.type === 'event') {
        insertResult = await supabase.from('events').insert({
          title: item.data.title,
          description: item.data.description,
          location: item.data.location,
          event_date: item.data.event_date,
          event_time: item.data.event_time,
          cover_photo_url: item.data.cover_photo_url,
          additional_images: item.data.additional_images,
          tags: item.data.tags,
          age_group: item.data.age_group,
          elected_officials: item.data.elected_officials,
          registration_link: item.data.registration_link,
          registration_email: item.data.registration_email,
          registration_phone: item.data.registration_phone,
          registration_notes: item.data.registration_notes,
          office_address: item.data.office_address,
          is_public: item.data.is_public,
          civic_org_id: item.data.civic_org_id
        });
      } else if (item.type === 'resource') {
        insertResult = await supabase.from('resources').insert({
          organization_name: item.data.organization_name,
          description: item.data.description,
          website: item.data.website,
          phone: item.data.phone,
          email: item.data.email,
          address: item.data.address,
          logo_url: item.data.logo_url,
          cover_photo_url: item.data.cover_photo_url,
          categories: item.data.categories
        });
      } else if (item.type === 'community_alert') {
        insertResult = await supabase.from('community_alerts').insert({
          title: item.data.title,
          short_description: item.data.short_description,
          long_description: item.data.long_description,
          photos: item.data.photos,
          is_active: item.data.is_active
        });
      } else if (item.type === 'special_event') {
        insertResult = await supabase.from('special_events').insert({
          title: item.data.title,
          description: item.data.description,
          type: item.data.type,
          start_date: item.data.start_date,
          end_date: item.data.end_date,
          is_active: item.data.is_active
        });
      }

      if (insertResult?.error) throw insertResult.error;

      // Update pending item status
      let updateError;
      if (item.type === 'event') {
        ({ error: updateError } = await supabase.from('pending_events').update(reviewData).eq('id', item.id));
      } else if (item.type === 'resource') {
        ({ error: updateError } = await supabase.from('pending_resources').update(reviewData).eq('id', item.id));
      } else if (item.type === 'community_alert') {
        ({ error: updateError } = await supabase.from('pending_community_alerts').update(reviewData).eq('id', item.id));
      } else if (item.type === 'special_event') {
        ({ error: updateError } = await supabase.from('pending_special_events').update(reviewData).eq('id', item.id));
      }

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: `${item.type.replace('_', ' ')} approved successfully`,
      });
      
      setSelectedItem(null);
      setReviewNotes('');
      fetchPendingItems();
    } catch (error) {
      console.error('Error approving item:', error);
      toast({
        title: "Error",
        description: "Failed to approve item",
        variant: "destructive",
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleReject = async (item: PendingItem) => {
    setIsReviewing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let error;
      const rejectData = {
        status: 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes
      };
      
      if (item.type === 'event') {
        ({ error } = await supabase.from('pending_events').update(rejectData).eq('id', item.id));
      } else if (item.type === 'resource') {
        ({ error } = await supabase.from('pending_resources').update(rejectData).eq('id', item.id));
      } else if (item.type === 'community_alert') {
        ({ error } = await supabase.from('pending_community_alerts').update(rejectData).eq('id', item.id));
      } else if (item.type === 'special_event') {
        ({ error } = await supabase.from('pending_special_events').update(rejectData).eq('id', item.id));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `${item.type.replace('_', ' ')} rejected`,
      });
      
      setSelectedItem(null);
      setReviewNotes('');
      fetchPendingItems();
    } catch (error) {
      console.error('Error rejecting item:', error);
      toast({
        title: "Error",
        description: "Failed to reject item",
        variant: "destructive",
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const getItemTypeDisplay = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderItemDetails = (item: PendingItem) => {
    const data = item.data;
    
    switch (item.type) {
      case 'event':
        return (
          <div className="space-y-4">
            <div>
              <Label className="font-semibold">Title</Label>
              <p className="text-sm">{data.title}</p>
            </div>
            <div>
              <Label className="font-semibold">Description</Label>
              <p className="text-sm">{data.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">Date</Label>
                <p className="text-sm">{format(new Date(data.event_date), 'PPP')}</p>
              </div>
              <div>
                <Label className="font-semibold">Time</Label>
                <p className="text-sm">{data.event_time}</p>
              </div>
            </div>
            <div>
              <Label className="font-semibold">Location</Label>
              <p className="text-sm">{data.location}</p>
            </div>
          </div>
        );
      case 'resource':
        return (
          <div className="space-y-4">
            <div>
              <Label className="font-semibold">Organization</Label>
              <p className="text-sm">{data.organization_name}</p>
            </div>
            <div>
              <Label className="font-semibold">Description</Label>
              <p className="text-sm">{data.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">Website</Label>
                <p className="text-sm">{data.website || 'N/A'}</p>
              </div>
              <div>
                <Label className="font-semibold">Phone</Label>
                <p className="text-sm">{data.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        );
      case 'community_alert':
        return (
          <div className="space-y-4">
            <div>
              <Label className="font-semibold">Title</Label>
              <p className="text-sm">{data.title}</p>
            </div>
            <div>
              <Label className="font-semibold">Short Description</Label>
              <p className="text-sm">{data.short_description}</p>
            </div>
            <div>
              <Label className="font-semibold">Long Description</Label>
              <p className="text-sm">{data.long_description}</p>
            </div>
          </div>
        );
      case 'special_event':
        return (
          <div className="space-y-4">
            <div>
              <Label className="font-semibold">Title</Label>
              <p className="text-sm">{data.title}</p>
            </div>
            <div>
              <Label className="font-semibold">Description</Label>
              <p className="text-sm">{data.description || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">Type</Label>
                <p className="text-sm">{data.type}</p>
              </div>
              <div>
                <Label className="font-semibold">Start Date</Label>
                <p className="text-sm">{format(new Date(data.start_date), 'PPP')}</p>
              </div>
            </div>
          </div>
        );
      default:
        return <p>Unknown item type</p>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pending Approvals</h2>
          <p className="text-muted-foreground">
            Review and approve content submitted by sub-admins
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {pendingItems.length} pending
        </Badge>
      </div>

      {pendingItems.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
              <p className="text-muted-foreground">No pending approvals at this time.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingItems.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <Badge variant="outline">
                    {getItemTypeDisplay(item.type)}
                  </Badge>
                </div>
                <CardDescription>
                  Submitted {format(new Date(item.submitted_at), 'PPP p')}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedItem(item)}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Review & Approve
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={selectedItem !== null} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review {selectedItem && getItemTypeDisplay(selectedItem.type)}</DialogTitle>
            <DialogDescription>
              Review the details and approve or reject this submission.
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6">
              {renderItemDetails(selectedItem)}
              
              <div>
                <Label htmlFor="review-notes">Review Notes (Optional)</Label>
                <Textarea
                  id="review-notes"
                  placeholder="Add any notes about your decision..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedItem(null)}
              disabled={isReviewing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedItem && handleReject(selectedItem)}
              disabled={isReviewing}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => selectedItem && handleApprove(selectedItem)}
              disabled={isReviewing}
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};