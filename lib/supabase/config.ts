export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mdssyyzacqeckmtatigy.supabase.co";
export const supabasePublicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const supabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublicKey &&
  !supabaseUrl.includes("your-project") &&
  !supabasePublicKey.includes("your-")
);
