import { requireApiUser } from "@/app/api/_helper/auth";
import { errorResponse, ok } from "@/app/api/_helper/response";
import { getDashboardStatsForUser } from "@/app/api/_utils/dashboard";

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireApiUser();
    const stats = await getDashboardStatsForUser(supabase, user.id);
    return ok(request, stats);
  } catch (error) {
    return errorResponse(request, error);
  }
}

