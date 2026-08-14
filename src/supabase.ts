import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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

export const authRedirectUrl = () =>
  new URL(import.meta.env.BASE_URL, window.location.origin).toString();

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
