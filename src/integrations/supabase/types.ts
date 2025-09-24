export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      civic_announcements: {
        Row: {
          civic_org_id: string
          content: string
          created_at: string
          id: string
          photos: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          civic_org_id: string
          content: string
          created_at?: string
          id?: string
          photos?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          civic_org_id?: string
          content?: string
          created_at?: string
          id?: string
          photos?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "civic_announcements_civic_org_id_fkey"
            columns: ["civic_org_id"]
            isOneToOne: false
            referencedRelation: "civic_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_gallery: {
        Row: {
          civic_org_id: string
          created_at: string
          description: string | null
          id: string
          order_index: number | null
          photo_url: string
          title: string | null
          updated_at: string
        }
        Insert: {
          civic_org_id: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number | null
          photo_url: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          civic_org_id?: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number | null
          photo_url?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      civic_important_links: {
        Row: {
          civic_org_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          order_index: number | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          civic_org_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          order_index?: number | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          civic_org_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          order_index?: number | null
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      civic_leadership: {
        Row: {
          civic_org_id: string
          contact_info: Json | null
          created_at: string
          id: string
          name: string
          order_index: number | null
          photo_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          civic_org_id: string
          contact_info?: Json | null
          created_at?: string
          id?: string
          name: string
          order_index?: number | null
          photo_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          civic_org_id?: string
          contact_info?: Json | null
          created_at?: string
          id?: string
          name?: string
          order_index?: number | null
          photo_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "civic_leadership_civic_org_id_fkey"
            columns: ["civic_org_id"]
            isOneToOne: false
            referencedRelation: "civic_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_newsletters: {
        Row: {
          civic_org_id: string
          created_at: string
          file_path: string
          id: string
          title: string
          updated_at: string
          upload_date: string
        }
        Insert: {
          civic_org_id: string
          created_at?: string
          file_path: string
          id?: string
          title: string
          updated_at?: string
          upload_date?: string
        }
        Update: {
          civic_org_id?: string
          created_at?: string
          file_path?: string
          id?: string
          title?: string
          updated_at?: string
          upload_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "civic_newsletters_civic_org_id_fkey"
            columns: ["civic_org_id"]
            isOneToOne: false
            referencedRelation: "civic_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_organizations: {
        Row: {
          access_code: string
          contact_info: Json
          coverage_area: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          meeting_address: string | null
          meeting_info: string | null
          name: string
          password_hash: string
          updated_at: string
        }
        Insert: {
          access_code: string
          contact_info?: Json
          coverage_area: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          meeting_address?: string | null
          meeting_info?: string | null
          name: string
          password_hash: string
          updated_at?: string
        }
        Update: {
          access_code?: string
          contact_info?: Json
          coverage_area?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          meeting_address?: string | null
          meeting_info?: string | null
          name?: string
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_alerts: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          long_description: string
          photos: string[] | null
          short_description: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          long_description: string
          photos?: string[] | null
          short_description: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          long_description?: string
          photos?: string[] | null
          short_description?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      elected_officials: {
        Row: {
          bio: string | null
          category: string
          created_at: string
          district: string | null
          email: string | null
          id: string
          level: string
          name: string
          office: string
          office_address: string | null
          party: string | null
          phone: string | null
          photo_url: string | null
          title: string
          updated_at: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          category: string
          created_at?: string
          district?: string | null
          email?: string | null
          id?: string
          level: string
          name: string
          office: string
          office_address?: string | null
          party?: string | null
          phone?: string | null
          photo_url?: string | null
          title: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          category?: string
          created_at?: string
          district?: string | null
          email?: string | null
          id?: string
          level?: string
          name?: string
          office?: string
          office_address?: string | null
          party?: string | null
          phone?: string | null
          photo_url?: string | null
          title?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          additional_images: string[] | null
          age_group: string[] | null
          archived: boolean
          civic_org_id: string | null
          cover_photo_url: string | null
          created_at: string
          description: string
          elected_officials: string[] | null
          event_date: string
          event_time: string
          id: string
          is_public: boolean
          location: string
          office_address: string | null
          registration_email: string | null
          registration_link: string | null
          registration_notes: string | null
          registration_phone: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          additional_images?: string[] | null
          age_group?: string[] | null
          archived?: boolean
          civic_org_id?: string | null
          cover_photo_url?: string | null
          created_at?: string
          description: string
          elected_officials?: string[] | null
          event_date: string
          event_time: string
          id?: string
          is_public?: boolean
          location: string
          office_address?: string | null
          registration_email?: string | null
          registration_link?: string | null
          registration_notes?: string | null
          registration_phone?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          additional_images?: string[] | null
          age_group?: string[] | null
          archived?: boolean
          civic_org_id?: string | null
          cover_photo_url?: string | null
          created_at?: string
          description?: string
          elected_officials?: string[] | null
          event_date?: string
          event_time?: string
          id?: string
          is_public?: boolean
          location?: string
          office_address?: string | null
          registration_email?: string | null
          registration_link?: string | null
          registration_notes?: string | null
          registration_phone?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_civic_org_id_fkey"
            columns: ["civic_org_id"]
            isOneToOne: false
            referencedRelation: "civic_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      government_agencies: {
        Row: {
          created_at: string
          description: string
          id: string
          keywords: string[] | null
          level: string
          name: string
          updated_at: string
          website: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          keywords?: string[] | null
          level: string
          name: string
          updated_at?: string
          website: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          keywords?: string[] | null
          level?: string
          name?: string
          updated_at?: string
          website?: string
        }
        Relationships: []
      }
      job_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          job_id: string
          reason: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          job_id: string
          reason: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          job_id?: string
          reason?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_reports_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          apply_info: string
          category: string
          created_at: string
          description: string
          employer: string
          id: string
          is_apply_link: boolean
          location: string
          salary: string
          title: string
          updated_at: string
        }
        Insert: {
          apply_info: string
          category?: string
          created_at?: string
          description: string
          employer: string
          id?: string
          is_apply_link?: boolean
          location: string
          salary: string
          title: string
          updated_at?: string
        }
        Update: {
          apply_info?: string
          category?: string
          created_at?: string
          description?: string
          employer?: string
          id?: string
          is_apply_link?: boolean
          location?: string
          salary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pdf_content: {
        Row: {
          content: string
          created_at: string
          document_type: string | null
          file_name: string
          hyperlinks: Json | null
          id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          document_type?: string | null
          file_name: string
          hyperlinks?: Json | null
          id?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          document_type?: string | null
          file_name?: string
          hyperlinks?: Json | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          address: string | null
          categories: string[]
          cover_photo_url: string | null
          created_at: string
          description: string
          email: string | null
          id: string
          logo_url: string | null
          organization_name: string
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          categories?: string[]
          cover_photo_url?: string | null
          created_at?: string
          description: string
          email?: string | null
          id?: string
          logo_url?: string | null
          organization_name: string
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          categories?: string[]
          cover_photo_url?: string | null
          created_at?: string
          description?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          organization_name?: string
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      special_event_assignments: {
        Row: {
          created_at: string
          event_id: string
          id: string
          special_event_day_id: string | null
          special_event_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          special_event_day_id?: string | null
          special_event_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          special_event_day_id?: string | null
          special_event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "special_event_assignments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "special_event_assignments_special_event_day_id_fkey"
            columns: ["special_event_day_id"]
            isOneToOne: false
            referencedRelation: "special_event_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "special_event_assignments_special_event_id_fkey"
            columns: ["special_event_id"]
            isOneToOne: false
            referencedRelation: "special_events"
            referencedColumns: ["id"]
          },
        ]
      }
      special_event_days: {
        Row: {
          created_at: string
          date: string
          description: string | null
          id: string
          special_event_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          id?: string
          special_event_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          special_event_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "special_event_days_special_event_id_fkey"
            columns: ["special_event_id"]
            isOneToOne: false
            referencedRelation: "special_events"
            referencedColumns: ["id"]
          },
        ]
      }
      special_events: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          start_date: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          start_date: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          start_date?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_expired_events: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
