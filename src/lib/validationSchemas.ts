import { z } from 'zod';

// Event validation schema
export const eventSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().trim().min(1, "Description is required").max(5000, "Description must be less than 5000 characters"),
  location: z.string().trim().min(1, "Location is required").max(500, "Location must be less than 500 characters"),
  event_date: z.string().min(1, "Event date is required"),
  event_time: z.string().min(1, "Event time is required"),
  is_public: z.boolean(),
  cover_photo_url: z.string().url("Invalid URL").optional().or(z.literal('')),
  registration_link: z.string().url("Invalid URL").optional().or(z.literal('')),
  registration_email: z.string().email("Invalid email").optional().or(z.literal('')),
  registration_phone: z.string().max(20, "Phone number too long").optional().or(z.literal('')),
  registration_notes: z.string().max(1000, "Notes must be less than 1000 characters").optional().or(z.literal('')),
  office_address: z.string().max(500, "Address must be less than 500 characters").optional().or(z.literal('')),
  age_group: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  elected_officials: z.array(z.string()).optional(),
  additional_images: z.array(z.string()).optional(),
});

// Resource validation schema
export const resourceSchema = z.object({
  organization_name: z.string().trim().min(1, "Organization name is required").max(200, "Name must be less than 200 characters"),
  description: z.string().trim().min(1, "Description is required").max(5000, "Description must be less than 5000 characters"),
  website: z.string().url("Invalid URL").optional().or(z.literal('')),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  phone: z.string().max(20, "Phone number too long").optional().or(z.literal('')),
  address: z.string().max(500, "Address must be less than 500 characters").optional().or(z.literal('')),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  type: z.enum(['resource', 'organization']),
  logo_url: z.string().url("Invalid URL").optional().or(z.literal('')),
  cover_photo_url: z.string().url("Invalid URL").optional().or(z.literal('')),
});

// Job validation schema
export const jobSchema = z.object({
  title: z.string().trim().min(1, "Job title is required").max(200, "Title must be less than 200 characters"),
  employer: z.string().trim().min(1, "Employer is required").max(200, "Employer must be less than 200 characters"),
  description: z.string().trim().min(1, "Description is required").max(5000, "Description must be less than 5000 characters"),
  location: z.string().trim().min(1, "Location is required").max(200, "Location must be less than 200 characters"),
  salary: z.string().trim().min(1, "Salary information is required").max(100, "Salary must be less than 100 characters"),
  apply_info: z.string().trim().min(1, "Application information is required").max(1000, "Application info must be less than 1000 characters"),
  category: z.enum(['government', 'private', 'nonprofit']),
  subcategory: z.string().max(100, "Subcategory must be less than 100 characters").optional().or(z.literal('')),
  is_apply_link: z.boolean(),
});

// Community Alert validation schema
export const communityAlertSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  short_description: z.string().trim().min(1, "Short description is required").max(500, "Short description must be less than 500 characters"),
  long_description: z.string().trim().min(1, "Long description is required").max(5000, "Long description must be less than 5000 characters"),
  is_active: z.boolean(),
  photos: z.array(z.string()).optional(),
});

// Civic Organization validation schema
export const civicOrganizationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name must be less than 200 characters"),
  description: z.string().trim().min(1, "Description is required").max(5000, "Description must be less than 5000 characters"),
  coverage_area: z.string().trim().min(1, "Coverage area is required").max(500, "Coverage area must be less than 500 characters"),
  meeting_info: z.string().max(1000, "Meeting info must be less than 1000 characters").optional().or(z.literal('')),
  meeting_address: z.string().max(500, "Address must be less than 500 characters").optional().or(z.literal('')),
  organization_type: z.string().trim().min(1, "Organization type is required").max(100),
  contact_info: z.object({
    email: z.string().email("Invalid email").optional(),
    phone: z.string().max(20, "Phone number too long").optional(),
    website: z.string().url("Invalid URL").optional(),
  }).optional(),
  access_code: z.string().trim().min(1, "Access code is required").max(50, "Access code must be less than 50 characters"),
  is_active: z.boolean(),
});

// Contact form validation schema
export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
});

// Helper function to sanitize text input (remove potentially dangerous characters)
export const sanitizeText = (text: string): string => {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .trim();
};

// Helper function to validate and sanitize URLs
export const sanitizeUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid protocol');
    }
    return url;
  } catch {
    return '';
  }
};

// Public submission schemas with either/or validation for website/address
export const publicResourceSchema = z.object({
  organization_name: z.string().trim().min(1, "Organization name is required").max(200, "Name must be less than 200 characters"),
  description: z.string().trim().min(1, "Description is required").max(5000, "Description must be less than 5000 characters"),
  website: z.string().trim().optional().or(z.literal('')),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  phone: z.string().max(20, "Phone number too long").optional().or(z.literal('')),
  address: z.string().max(500, "Address must be less than 500 characters").optional().or(z.literal('')),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  logo_url: z.string().optional().or(z.literal('')),
  cover_photo_url: z.string().optional().or(z.literal('')),
}).refine(
  (data) => data.website || data.address,
  { message: "Either website or address must be provided", path: ["website"] }
);

export const publicJobSchema = z.object({
  title: z.string().trim().min(1, "Job title is required").max(200, "Title must be less than 200 characters"),
  employer: z.string().trim().min(1, "Employer is required").max(200, "Employer must be less than 200 characters"),
  description: z.string().trim().min(1, "Description is required").max(5000, "Description must be less than 5000 characters"),
  location: z.string().trim().min(1, "Location is required").max(200, "Location must be less than 200 characters"),
  salary: z.string().trim().min(1, "Salary information is required").max(100, "Salary must be less than 100 characters"),
  apply_info: z.string().trim().min(1, "Application information is required").max(1000, "Application info must be less than 1000 characters"),
  category: z.enum(['government', 'private', 'nonprofit']),
  subcategory: z.string().max(100, "Subcategory must be less than 100 characters").optional().or(z.literal('')),
  is_apply_link: z.boolean(),
  contact_email: z.string().email("Invalid email").optional().or(z.literal('')),
  contact_phone: z.string().max(20, "Phone number too long").optional().or(z.literal('')),
});
