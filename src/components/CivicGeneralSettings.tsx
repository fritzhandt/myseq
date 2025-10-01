import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CivicGeneralSettingsProps {
  orgId: string;
}

interface OrganizationData {
  name: string;
  description: string;
  coverage_area: string;
  contact_info: any;
  meeting_info: string;
  meeting_address: string;
  organization_type: string;
}

const CivicGeneralSettings = ({ orgId }: CivicGeneralSettingsProps) => {
  const [orgData, setOrgData] = useState<OrganizationData>({
    name: "",
    description: "",
    coverage_area: "",
    contact_info: {},
    meeting_info: "",
    meeting_address: "",
    organization_type: "civic_organization",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrganizationData();
  }, [orgId]);

  const fetchOrganizationData = async () => {
    try {
      const { data, error } = await supabase
        .from('civic_organizations')
        .select('name, description, coverage_area, contact_info, meeting_info, meeting_address, organization_type')
        .eq('id', orgId)
        .single();

      if (error) throw error;

      setOrgData({
        name: data.name || "",
        description: data.description || "",
        coverage_area: data.coverage_area || "",
        contact_info: data.contact_info || {},
        meeting_info: data.meeting_info || "",
        meeting_address: data.meeting_address || "",
        organization_type: data.organization_type || "civic_organization",
      });
    } catch (error) {
      console.error('Error fetching organization data:', error);
      toast({
        title: "Error",
        description: "Failed to load organization data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('civic_organizations')
        .update({
          name: orgData.name,
          description: orgData.description,
          coverage_area: orgData.coverage_area,
          contact_info: orgData.contact_info,
          meeting_info: orgData.meeting_info,
          meeting_address: orgData.meeting_address,
          organization_type: orgData.organization_type,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orgId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Organization information updated successfully",
      });
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: "Failed to update organization information",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateContactInfo = (field: string, value: string) => {
    setOrgData(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          General Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={orgData.name}
                onChange={(e) => setOrgData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Organization name"
              />
            </div>

            <div>
              <Label htmlFor="organization_type">Organization Type</Label>
              <Select
                value={orgData.organization_type}
                onValueChange={(value) => setOrgData(prev => ({ ...prev, organization_type: value }))}
              >
                <SelectTrigger id="organization_type">
                  <SelectValue placeholder="Select organization type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="community_board">Community Board</SelectItem>
                  <SelectItem value="civic_organization">Civic Organization</SelectItem>
                  <SelectItem value="police_precinct_council">Police Precinct Council</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="coverage_area">Coverage Area</Label>
              <Input
                id="coverage_area"
                value={orgData.coverage_area}
                onChange={(e) => setOrgData(prev => ({ ...prev, coverage_area: e.target.value }))}
                placeholder="e.g., Southeast Queens, Cambria Heights"
              />
            </div>

            <div>
              <Label htmlFor="meeting_info">Meeting Information</Label>
              <Input
                id="meeting_info"
                value={orgData.meeting_info}
                onChange={(e) => setOrgData(prev => ({ ...prev, meeting_info: e.target.value }))}
                placeholder="e.g., First Tuesday of every month at 7 PM"
              />
            </div>

            <div>
              <Label htmlFor="meeting_address">Meeting Address</Label>
              <Textarea
                id="meeting_address"
                value={orgData.meeting_address}
                onChange={(e) => setOrgData(prev => ({ ...prev, meeting_address: e.target.value }))}
                placeholder="Meeting location address"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={orgData.description}
                onChange={(e) => setOrgData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your organization and its mission"
                rows={4}
              />
            </div>

            <div>
              <Label>Contact Information</Label>
              <div className="space-y-3 mt-2">
                <Input
                  placeholder="Phone number"
                  value={orgData.contact_info.phone || ""}
                  onChange={(e) => updateContactInfo('phone', e.target.value)}
                />
                <Input
                  placeholder="Email address"
                  type="email"
                  value={orgData.contact_info.email || ""}
                  onChange={(e) => updateContactInfo('email', e.target.value)}
                />
                <Input
                  placeholder="Website URL"
                  type="url"
                  value={orgData.contact_info.website || ""}
                  onChange={(e) => updateContactInfo('website', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CivicGeneralSettings;