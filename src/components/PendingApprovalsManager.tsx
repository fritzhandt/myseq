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
  type: 'event' | 'resource' | 'community_alert' | 'special_event' | 'resource_modification' | 'job_modification' | 'civic_modification';
  data: any;
  action?: 'edit' | 'delete' | 'deactivate' | 'password_change';
  original_id?: string;
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
      const [
        eventsResult, 
        resourcesResult, 
        alertsResult, 
        specialEventsResult,
        resourceModsResult,
        jobModsResult,
        civicModsResult
      ] = await Promise.all([
        supabase.from('pending_events').select('*').eq('status', 'pending'),
        supabase.from('pending_resources').select('*').eq('status', 'pending'),
        supabase.from('pending_community_alerts').select('*').eq('status', 'pending'),
        supabase.from('pending_special_events').select('*').eq('status', 'pending'),
        supabase.from('pending_resource_modifications').select('*, resources(organization_name)').eq('status', 'pending'),
        supabase.from('pending_job_modifications').select('*, jobs(title)').eq('status', 'pending'),
        supabase.from('pending_civic_modifications').select('*, civic_organizations(name)').eq('status', 'pending')
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
        })),
        ...(resourceModsResult.data || []).map(item => ({
          id: item.id,
          title: `${item.action.toUpperCase()}: ${item.resources?.organization_name || 'Resource'}`,
          submitted_by: item.submitted_by,
          submitted_at: item.submitted_at,
          status: 'pending' as const,
          type: 'resource_modification' as const,
          action: item.action,
          original_id: item.resource_id,
          data: item
        })),
        ...(jobModsResult.data || []).map(item => ({
          id: item.id,
          title: `${item.action.toUpperCase()}: ${item.jobs?.title || 'Job'}`,
          submitted_by: item.submitted_by,
          submitted_at: item.submitted_at,
          status: 'pending' as const,
          type: 'job_modification' as const,
          action: item.action,
          original_id: item.job_id,
          data: item
        })),
        ...(civicModsResult.data || []).map(item => ({
          id: item.id,
          title: `${item.action.toUpperCase()}: ${item.civic_organizations?.name || 'Civic Org'}`,
          submitted_by: item.submitted_by,
          submitted_at: item.submitted_at,
          status: 'pending' as const,
          type: 'civic_modification' as const,
          action: item.action,
          original_id: item.civic_org_id,
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

      const reviewData = {
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes
      };

      // Handle modification types (edit/delete)
      if (item.type === 'resource_modification') {
        if (item.action === 'delete') {
          await supabase.from('resources').delete().eq('id', item.original_id);
        } else if (item.action === 'edit') {
          await supabase.from('resources').update(item.data.modified_data).eq('id', item.original_id);
        }
        await supabase.from('pending_resource_modifications').update(reviewData).eq('id', item.id);
      } else if (item.type === 'job_modification') {
        if (item.action === 'delete') {
          await supabase.from('jobs').delete().eq('id', item.original_id);
        } else if (item.action === 'edit') {
          await supabase.from('jobs').update(item.data.modified_data).eq('id', item.original_id);
        }
        await supabase.from('pending_job_modifications').update(reviewData).eq('id', item.id);
      } else if (item.type === 'civic_modification') {
        if (item.action === 'delete') {
          await supabase.from('civic_organizations').delete().eq('id', item.original_id);
        } else if (item.action === 'edit') {
          await supabase.from('civic_organizations').update(item.data.modified_data).eq('id', item.original_id);
        } else if (item.action === 'deactivate') {
          await supabase.from('civic_organizations').update(item.data.modified_data).eq('id', item.original_id);
        } else if (item.action === 'password_change') {
          await supabase.from('civic_organizations').update(item.data.modified_data).eq('id', item.original_id);
        }
        await supabase.from('pending_civic_modifications').update(reviewData).eq('id', item.id);
      } else {
        // Handle new item creation (existing code)
        let insertResult;

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
            categories: item.data.categories,
            type: item.data.type
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
      }

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
      } else if (item.type === 'resource_modification') {
        ({ error } = await supabase.from('pending_resource_modifications').update(rejectData).eq('id', item.id));
      } else if (item.type === 'job_modification') {
        ({ error } = await supabase.from('pending_job_modifications').update(rejectData).eq('id', item.id));
      } else if (item.type === 'civic_modification') {
        ({ error } = await supabase.from('pending_civic_modifications').update(rejectData).eq('id', item.id));
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
    
    // Show submitter info if available
    const submitterInfo = (data.submitter_name || data.submitter_phone) && (
      <div className="bg-muted p-3 rounded-lg mb-4">
        <Label className="font-semibold">Submitted by</Label>
        <p className="text-sm">
          {data.submitter_name || 'Unknown'} 
          {data.submitter_phone && <span className="text-muted-foreground ml-2">({data.submitter_phone})</span>}
        </p>
      </div>
    );
    
    switch (item.type) {
      case 'event':
        return (
          <div className="space-y-4">
            {submitterInfo}
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
        const isJob = data.type === 'job';
        const jobData = isJob ? JSON.parse(data.description) : null;
        
        return (
          <div className="space-y-4">
            {submitterInfo}
            {isJob && <Badge>Job Posting</Badge>}
            {data.type === 'business_opportunity' && <Badge>Business Opportunity</Badge>}
            <div>
              <Label className="font-semibold">{isJob ? 'Employer' : 'Organization'}</Label>
              <p className="text-sm">{data.organization_name}</p>
            </div>
            {isJob && (
              <>
                <div>
                  <Label className="font-semibold">Job Title</Label>
                  <p className="text-sm">{jobData.title}</p>
                </div>
                <div>
                  <Label className="font-semibold">Location</Label>
                  <p className="text-sm">{jobData.location}</p>
                </div>
                <div>
                  <Label className="font-semibold">Salary</Label>
                  <p className="text-sm">{jobData.salary}</p>
                </div>
              </>
            )}
            <div>
              <Label className="font-semibold">Description</Label>
              <p className="text-sm">{isJob ? jobData.description : data.description}</p>
            </div>
            {!isJob && data.categories && data.categories.length > 0 && (
              <div>
                <Label className="font-semibold">Categories</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {data.categories.map((cat: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{cat}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">{isJob ? 'Apply Info' : 'Website'}</Label>
                <p className="text-sm">{data.website || 'N/A'}</p>
              </div>
              <div>
                <Label className="font-semibold">Phone</Label>
                <p className="text-sm">{data.phone || 'N/A'}</p>
              </div>
              {!isJob && (
                <>
                  <div>
                    <Label className="font-semibold">Email</Label>
                    <p className="text-sm">{data.email || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Address</Label>
                    <p className="text-sm">{data.address || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>
            {!isJob && data.logo_url && (
              <div>
                <Label className="font-semibold">Logo</Label>
                <img 
                  src={data.logo_url} 
                  alt={data.logo_alt || 'Organization logo'} 
                  className="mt-2 max-h-32 object-contain rounded border"
                />
              </div>
            )}
            {!isJob && data.cover_photo_url && (
              <div>
                <Label className="font-semibold">Cover Photo</Label>
                <img 
                  src={data.cover_photo_url} 
                  alt={data.cover_photo_alt || 'Cover photo'} 
                  className="mt-2 max-h-48 w-full object-cover rounded border"
                />
              </div>
            )}
          </div>
        );
      case 'community_alert':
        return (
          <div className="space-y-4">
            {submitterInfo}
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
            {submitterInfo}
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
      case 'resource_modification':
        return (
          <div className="space-y-4">
            {submitterInfo}
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <Label className="font-semibold text-blue-900 dark:text-blue-100">Action</Label>
              <p className="text-sm text-blue-800 dark:text-blue-200 capitalize">{item.action}</p>
            </div>
            {item.action === 'edit' && data.modified_data && (
              <>
                <div>
                  <Label className="font-semibold">Organization Name</Label>
                  <p className="text-sm">{data.modified_data.organization_name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Description</Label>
                  <p className="text-sm">{data.modified_data.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Phone</Label>
                    <p className="text-sm">{data.modified_data.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Email</Label>
                    <p className="text-sm">{data.modified_data.email || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <Label className="font-semibold">Website</Label>
                  <p className="text-sm">{data.modified_data.website || 'N/A'}</p>
                </div>
                {data.modified_data.categories && data.modified_data.categories.length > 0 && (
                  <div>
                    <Label className="font-semibold">Categories</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.modified_data.categories.map((cat: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{cat}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {item.action === 'delete' && (
              <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  This will permanently delete the resource: <strong>{data.modified_data?.organization_name || 'Unknown'}</strong>
                </p>
              </div>
            )}
          </div>
        );
      case 'job_modification':
        return (
          <div className="space-y-4">
            {submitterInfo}
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <Label className="font-semibold text-blue-900 dark:text-blue-100">Action</Label>
              <p className="text-sm text-blue-800 dark:text-blue-200 capitalize">{item.action}</p>
            </div>
            {item.action === 'edit' && data.modified_data && (
              <>
                <div>
                  <Label className="font-semibold">Job Title</Label>
                  <p className="text-sm">{data.modified_data.title}</p>
                </div>
                <div>
                  <Label className="font-semibold">Employer</Label>
                  <p className="text-sm">{data.modified_data.employer}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Location</Label>
                    <p className="text-sm">{data.modified_data.location}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Salary</Label>
                    <p className="text-sm">{data.modified_data.salary}</p>
                  </div>
                </div>
                <div>
                  <Label className="font-semibold">Description</Label>
                  <p className="text-sm">{data.modified_data.description}</p>
                </div>
              </>
            )}
            {item.action === 'delete' && (
              <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  This will permanently delete the job posting: <strong>{data.modified_data?.title || 'Unknown'}</strong>
                </p>
              </div>
            )}
          </div>
        );
      case 'civic_modification':
        return (
          <div className="space-y-4">
            {submitterInfo}
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <Label className="font-semibold text-blue-900 dark:text-blue-100">Action</Label>
              <p className="text-sm text-blue-800 dark:text-blue-200 capitalize">{item.action?.replace('_', ' ')}</p>
            </div>
            {item.action === 'edit' && data.modified_data && (
              <>
                <div>
                  <Label className="font-semibold">Organization Name</Label>
                  <p className="text-sm">{data.modified_data.name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Description</Label>
                  <p className="text-sm">{data.modified_data.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Access Code</Label>
                    <p className="text-sm font-mono">{data.modified_data.access_code}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Coverage Area</Label>
                    <p className="text-sm">{data.modified_data.coverage_area}</p>
                  </div>
                </div>
                {data.modified_data.meeting_info && (
                  <div>
                    <Label className="font-semibold">Meeting Info</Label>
                    <p className="text-sm">{data.modified_data.meeting_info}</p>
                  </div>
                )}
                {data.modified_data.contact_info && (
                  <div>
                    <Label className="font-semibold">Contact Information</Label>
                    <div className="text-sm space-y-1 mt-1">
                      {data.modified_data.contact_info.email && <p>Email: {data.modified_data.contact_info.email}</p>}
                      {data.modified_data.contact_info.phone && <p>Phone: {data.modified_data.contact_info.phone}</p>}
                      {data.modified_data.contact_info.website && <p>Website: {data.modified_data.contact_info.website}</p>}
                    </div>
                  </div>
                )}
              </>
            )}
            {item.action === 'delete' && (
              <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  This will permanently delete the civic organization: <strong>{data.modified_data?.name || 'Unknown'}</strong>
                </p>
              </div>
            )}
            {item.action === 'deactivate' && (
              <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  This will {data.modified_data?.is_active ? 'activate' : 'deactivate'} the civic organization
                </p>
              </div>
            )}
            {item.action === 'password_change' && (
              <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  This will reset the password for the civic organization
                </p>
              </div>
            )}
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