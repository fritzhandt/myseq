import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Phone, Mail, MapPin, ChevronDown, ChevronUp } from "lucide-react";

interface Resource {
  id: string;
  organization_name: string;
  description: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  logo_url?: string;
  cover_photo_url?: string;
  categories: string[];
}

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
      {/* Cover Photo Section */}
      {resource.cover_photo_url && (
        <div className="relative h-48 w-full">
          <img
            src={resource.cover_photo_url}
            alt={`${resource.organization_name} cover`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-2">
          {resource.logo_url ? (
            <img
              src={resource.logo_url}
              alt={`${resource.organization_name} logo`}
              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <div className="text-primary/60 text-lg font-bold">
                {resource.organization_name.charAt(0)}
              </div>
            </div>
          )}
          <CardTitle className="text-lg">{resource.organization_name}</CardTitle>
        </div>
        <div className="flex flex-wrap gap-2">
          {resource.categories.map((category) => (
            <Badge key={category} variant="secondary" className="capitalize text-xs">
              {category}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="mb-4">
          <p className={`text-muted-foreground ${isExpanded ? '' : 'line-clamp-3'}`}>
            {resource.description}
          </p>
          {resource.description.length > 120 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 p-0 h-auto text-sm text-primary hover:text-primary/80 font-medium"
            >
              {isExpanded ? (
                <>
                  Show less <ChevronUp className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Show more <ChevronDown className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
        
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

        <div className="mt-auto pt-4">
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
        </div>
      </CardContent>
    </Card>
  );
}