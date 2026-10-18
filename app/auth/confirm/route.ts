import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const requestedNext = searchParams.get("next") ?? "/";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/";
  const supabase = await createClient();

  // Supabase's SSR/browser clients use PKCE by default. Email confirmation
  // links therefore arrive with a one-time `code` that must be exchanged for
  // a cookie-backed session on the server.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
    redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
  }

  // Keep supporting older Supabase email templates that send token_hash/type.
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) redirect(next);
    redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
  }

  const providerError = searchParams.get("error_description") ?? searchParams.get("error");
  redirect(`/auth/error?error=${encodeURIComponent(providerError ?? "The confirmation link is missing its code or has expired.")}`);
}
