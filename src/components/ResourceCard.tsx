import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Phone, Mail, MapPin } from "lucide-react";

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
    <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
      {/* Featured Image/Logo Section */}
      {resource.logo_url ? (
        <div className="relative h-32 w-full bg-gradient-to-br from-primary/5 to-primary/10">
          <img
            src={resource.logo_url}
            alt={`${resource.organization_name} logo`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
      ) : (
        <div className="h-32 w-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
          <div className="text-primary/60 text-4xl font-bold">
            {resource.organization_name.charAt(0)}
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <CardTitle className="text-lg mb-2">{resource.organization_name}</CardTitle>
        <div className="flex flex-wrap gap-2">
          {resource.categories.map((category) => (
            <Badge key={category} variant="secondary" className="capitalize text-xs">
              {category}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {resource.description}
        </p>
        
        {/* Contact Information */}
        {(resource.phone || resource.email || resource.address) && (
          <div className="mb-4 space-y-2">
            {resource.phone && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mr-3 text-primary flex-shrink-0" />
                <a href={`tel:${resource.phone}`} className="hover:text-primary truncate">
                  {resource.phone}
                </a>
              </div>
            )}
            {resource.email && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mr-3 text-primary flex-shrink-0" />
                <a href={`mailto:${resource.email}`} className="hover:text-primary truncate">
                  {resource.email}
                </a>
              </div>
            )}
            {resource.address && (
              <div className="flex items-start text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-3 mt-0.5 text-primary flex-shrink-0" />
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