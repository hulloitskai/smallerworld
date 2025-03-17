import { createBrowserClient } from "@supabase/ssr";
import { type SupabaseClient } from "@supabase/supabase-js";

export const createSupabaseClient = (): SupabaseClient => {
  const projectId = requireMeta("supabase-project-id");
  const publicKey = requireMeta("supabase-public-key");
  return createBrowserClient(`https://${projectId}.supabase.co`, publicKey, {
    isSingleton: true,
    cookieOptions: {
      name: "supabase_session",
      sameSite: false,
    },
  });
};

export const setupSupabase = () => {
  const supabase = createSupabaseClient();
  supabase.auth.onAuthStateChange(event => {
    console.info("Supabase auth state changed to:", event);
  });
};
