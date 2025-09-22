import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Phone } from "lucide-react";

interface Resource {
  id: string;
  organization_name: string;
  description: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  logo_url?: string;
  categories: string[];
}

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{resource.organization_name}</CardTitle>
            <div className="flex flex-wrap gap-2">
              {resource.categories.map((category) => (
                <Badge key={category} variant="secondary" className="capitalize text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          {resource.logo_url && (
            <img
              src={resource.logo_url}
              alt={`${resource.organization_name} logo`}
              className="w-16 h-16 object-cover rounded-md ml-4"
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {resource.description}
        </p>
        
        {/* Contact Information */}
        {(resource.phone || resource.email || resource.address) && (
          <div className="mb-4 space-y-1">
            {resource.phone && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="h-3 w-3 mr-2" />
                <a href={`tel:${resource.phone}`} className="hover:text-primary truncate">
                  {resource.phone}
                </a>
              </div>
            )}
            {resource.email && (
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="h-3 w-3 mr-2">✉️</span>
                <a href={`mailto:${resource.email}`} className="hover:text-primary truncate">
                  {resource.email}
                </a>
              </div>
            )}
            {resource.address && (
              <div className="flex items-start text-sm text-muted-foreground">
                <span className="h-3 w-3 mr-2 mt-0.5">📍</span>
                <span className="line-clamp-2">{resource.address}</span>
              </div>
            )}
          </div>
        )}

        {resource.website && (
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a
              href={resource.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Website
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}