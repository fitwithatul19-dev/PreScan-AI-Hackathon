import { createClient } from "@supabase/supabase-js";

// ==============================================================================
// PASTE YOUR SUPABASE URL AND PUBLIC KEY HERE:
// ==============================================================================
const SUPABASE_URL = "https://gwegvhrsssshxfrnwolb.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_6pNiNIoMRT17m8DnYdw1Tw_xBS6sb8Z";

// ==============================================================================
// EXPORT SUPABASE CLIENT & GOOGLE AUTH HELPER
// ==============================================================================
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

/**
 * Initiates Google OAuth sign in/sign up using Supabase.
 * Supports redirection for full browser tabs and popup fallback if inside an iframe.
 */
export async function signInWithGoogle() {
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
  const inIframe = typeof window !== 'undefined' && window.self !== window.top;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: inIframe,
    },
  });

  if (error) throw error;

  if (inIframe && data?.url) {
    window.open(data.url, '_blank');
  }

  return data;
}
