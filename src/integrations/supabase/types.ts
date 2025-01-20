export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_addons: {
        Row: {
          booking_room_id: string | null
          created_at: string
          id: string
          service_option_id: string | null
        }
        Insert: {
          booking_room_id?: string | null
          created_at?: string
          id?: string
          service_option_id?: string | null
        }
        Update: {
          booking_room_id?: string | null
          created_at?: string
          id?: string
          service_option_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_addons_booking_room_id_fkey"
            columns: ["booking_room_id"]
            isOneToOne: false
            referencedRelation: "booking_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_addons_service_option_id_fkey"
            columns: ["service_option_id"]
            isOneToOne: false
            referencedRelation: "service_options"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_rooms: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          room_type_id: string | null
          service_type: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          room_type_id?: string | null
          service_type: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          room_type_id?: string | null
          service_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_rooms_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "service_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_rooms_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      dev_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          value?: string
        }
        Relationships: []
      }
      price_adjustments: {
        Row: {
          adjusted_by: string | null
          created_at: string
          id: string
          new_price: number
          previous_price: number
          service_option_id: string | null
        }
        Insert: {
          adjusted_by?: string | null
          created_at?: string
          id?: string
          new_price: number
          previous_price: number
          service_option_id?: string | null
        }
        Update: {
          adjusted_by?: string | null
          created_at?: string
          id?: string
          new_price?: number
          previous_price?: number
          service_option_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_adjustments_adjusted_by_fkey"
            columns: ["adjusted_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_adjustments_service_option_id_fkey"
            columns: ["service_option_id"]
            isOneToOne: false
            referencedRelation: "service_options"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          id: string
          name?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          created_at: string
          id: string
          property_type: string
          user_id: string | null
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          property_type: string
          user_id?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          property_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_types: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      service_bookings: {
        Row: {
          booking_date: string | null
          created_at: string
          id: string
          status: string | null
          time_slot: string | null
          total_price: number
          user_id: string | null
        }
        Insert: {
          booking_date?: string | null
          created_at?: string
          id?: string
          status?: string | null
          time_slot?: string | null
          total_price: number
          user_id?: string | null
        }
        Update: {
          booking_date?: string | null
          created_at?: string
          id?: string
          status?: string | null
          time_slot?: string | null
          total_price?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_options: {
        Row: {
          created_at: string
          id: string
          is_addon: boolean | null
          name: string
          price: number
          room_type_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_addon?: boolean | null
          name: string
          price: number
          room_type_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_addon?: boolean | null
          name?: string
          price?: number
          room_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_options_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      service_preferences: {
        Row: {
          created_at: string
          frequency: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          frequency: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          frequency?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_templates: {
        Row: {
          base_price: number
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          base_price: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      admin_role: "super_admin" | "admin" | "manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
