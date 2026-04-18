import { errorResponse, noContent } from "@/app/api/_helper/response";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return noContent();
  } catch (error) {
    return errorResponse(request, error);
  }
}

