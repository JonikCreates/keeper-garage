import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export type AuthProvider = "google" | "apple";

export type AuthCapabilities = {
  anonymous: boolean;
  email: boolean;
  phone: boolean;
  google: boolean;
  apple: boolean;
};

const unavailableCapabilities: AuthCapabilities = {
  anonymous: false,
  email: false,
  phone: false,
  google: false,
  apple: false,
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
    apple: Boolean(settings.external?.apple),
  };
}

export type VehicleRow = {
  id: string;
  owner_id: string;
  nickname: string;
  brand: "BMW";
  model: "3 Series (F30)";
  model_year: 2016;
  trim: string;
  engine_code: string;
  drivetrain: string;
  transmission: string;
  mileage: number | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};
