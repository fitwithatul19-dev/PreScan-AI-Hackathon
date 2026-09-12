import { createClient } from "@supabase/supabase-js";

// ==============================================================================
// PASTE YOUR SUPABASE URL AND PUBLIC KEY HERE:
// ==============================================================================
const SUPABASE_URL = "https://gwegvhrsssshxfrnwolb.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_6pNiNIoMRT17m8DnYdw1Tw_xBS6sb8Z";

// ==============================================================================
// EXPORT SUPABASE CLIENT
// ==============================================================================
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
