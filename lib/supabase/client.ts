import { createBrowserClient } from "@supabase/ssr";
import { supabasePublicKey, supabaseUrl } from "./config";

export function createClient() {
  return createBrowserClient(
    supabaseUrl,
    supabasePublicKey,
  );
}
