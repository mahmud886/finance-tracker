import type { User } from "@supabase/supabase-js";

import { ApiError } from "@/app/api/_helper/errors";
import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type AuthContext = {
  supabase: SupabaseServerClient;
  user: User;
};

export async function requireApiUser(): Promise<AuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
  }

  return { supabase, user };
}

