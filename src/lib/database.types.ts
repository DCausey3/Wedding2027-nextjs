/**
 * src/lib/database.types.ts
 *
 * Generated types for the Supabase schema.
 * Run `npx supabase gen types typescript --project-id <your-project-id> > src/lib/database.types.ts`
 * to regenerate from your live schema.
 *
 * These are hand-written to match schema/wedding.sql until you run the generator.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type GuestType =
  | "COLOMBIA_ONLY"
  | "USA_ONLY"
  | "BOTH"
  | "CHOOSE_ONE"
  | "BRIDAL_PARTY";

export type RSVPStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export type WeddingLocation = "COLOMBIA" | "USA";

export type Entree =
  | "FILET_MIGNON"
  | "PAN_SEARED_SALMON"
  | "MUSHROOM_RISOTTO"
  | "HERB_ROASTED_CHICKEN";

export type UserRole = "admin" | "bride" | "groom" | "guest";

export interface Database {
  public: {
    Tables: {
      guests: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          invitation_code: string;
          guest_type: GuestType;
          plus_one_allowed: boolean;
          table_number: number | null;
          side: "BRIDE" | "GROOM" | "BOTH" | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["guests"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["guests"]["Insert"]>;
      };
      rsvps: {
        Row: {
          id: string;
          guest_id: string;
          status: RSVPStatus;
          colombia_attending: boolean;
          usa_attending: boolean;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["rsvps"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["rsvps"]["Insert"]>;
      };
      plus_ones: {
        Row: {
          id: string;
          rsvp_id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["plus_ones"]["Row"],
          "id" | "created_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["plus_ones"]["Insert"]>;
      };
      meal_preferences: {
        Row: {
          id: string;
          rsvp_id: string | null;
          plus_one_id: string | null;
          entree: Entree;
          dietary_restrictions: string | null;
          event_type: WeddingLocation;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["meal_preferences"]["Row"],
          "id" | "created_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["meal_preferences"]["Insert"]>;
      };
      travel_info: {
        Row: {
          id: string;
          guest_id: string;
          flight_booked: boolean;
          hotel_booked: boolean;
          shuttle_needed: boolean;
          colombia_arrival: string | null;
          colombia_departure: string | null;
          usa_arrival: string | null;
          usa_departure: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["travel_info"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["travel_info"]["Insert"]>;
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: UserRole;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["user_roles"]["Row"],
          "id" | "created_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Insert"]>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_dashboard_stats: {
        Args: Record<string, never>;
        Returns: {
          total_invited: number;
          accepted: number;
          declined: number;
          pending: number;
          colombia_count: number;
          usa_count: number;
          both_count: number;
          plus_one_count: number;
          flights_booked: number;
          hotels_booked: number;
          shuttles_needed: number;
        }[];
      };
    };
    Enums: {
      guest_type: GuestType;
      rsvp_status: RSVPStatus;
      wedding_location: WeddingLocation;
      entree: Entree;
      user_role: UserRole;
    };
  };
}
