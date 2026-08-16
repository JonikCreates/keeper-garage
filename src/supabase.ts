import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export type AuthProvider = "google";

export type AuthCapabilities = {
  anonymous: boolean;
  email: boolean;
  phone: boolean;
  google: boolean;
};

const unavailableCapabilities: AuthCapabilities = {
  anonymous: false,
  email: false,
  phone: false,
  google: false,
};

export const hasSupabaseConfig = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const authRedirectUrl = (accountTab: "profile" | "security" = "profile") => {
  const url = new URL(import.meta.env.BASE_URL, window.location.origin);
  url.searchParams.set("account", accountTab);
  return url.toString();
};

export async function getAuthCapabilities(): Promise<AuthCapabilities> {
  if (!hasSupabaseConfig) return unavailableCapabilities;

  const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
    headers: { apikey: supabasePublishableKey },
  });
  if (!response.ok) throw new Error("Keeper could not validate its authentication configuration.");

  const settings = await response.json() as { external?: Record<string, boolean> };
  return {
    anonymous: Boolean(settings.external?.anonymous_users),
    email: Boolean(settings.external?.email),
    phone: Boolean(settings.external?.phone),
    google: Boolean(settings.external?.google),
  };
}

export type VehicleRow = {
  id: string;
  owner_id: string;
  nickname: string;
  brand: "BMW";
  model: "3 Series (F30)" | "3 Series (E46)" | "5 Series (E39)" | "3 Series (E36)";
  model_year: number;
  trim: string;
  engine_code: string;
  drivetrain: string;
  transmission: string;
  mileage: number | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type MaintenanceRecordRow = {
  id: string;
  owner_id: string;
  vehicle_id: string;
  maintenance_slug: string;
  maintenance_name: string;
  work_performed: string;
  notes: string | null;
  fluid_brand: string | null;
  fluid_product: string | null;
  fluid_type: string | null;
  fluid_viscosity: string | null;
  fluid_specification: string | null;
  fluid_quantity: number | null;
  fluid_unit: string | null;
  filter_product: string | null;
  completed_at: string;
  mileage: number;
  created_at: string;
};

export type VehicleMaintenanceItemRow = {
  id: string;
  owner_id: string;
  vehicle_id: string;
  item_slug: string;
  item_name: string;
  item_type: "known_issue" | "custom" | "custom_issue";
  category: string;
  severity: "critical" | "important" | "routine";
  notes: string | null;
  date_found: string | null;
  mileage_found: number | null;
  issue_status: "watching" | "needs_repair" | "repaired" | null;
  plan_type: "mileage" | "time" | "both" | "none";
  mileage_interval: number | null;
  time_interval_months: number | null;
  tracks_fluid: boolean;
  created_at: string;
};
