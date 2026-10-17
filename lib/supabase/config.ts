export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project") &&
  !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.includes("your-")
);
