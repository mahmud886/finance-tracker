import { requireApiUser } from "@/app/api/_helper/auth";
import { parseJsonBody } from "@/app/api/_helper/request";
import { errorResponse, ok } from "@/app/api/_helper/response";
import { profileSchema } from "@/lib/validations/auth";

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireApiUser();
    const { data } = await supabase.from("users").select("*").eq("id", user.id).single();

    return ok(
      request,
      data ?? {
        id: user.id,
        email: user.email ?? "",
        name: user.user_metadata.name ?? "",
        avatar_url: null,
        currency: "USD",
        created_at: new Date().toISOString(),
      },
    );
  } catch (error) {
    return errorResponse(request, error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await requireApiUser();
    const payload = await parseJsonBody(request, profileSchema);

    const { error } = await supabase.from("users").upsert({
      id: user.id,
      email: user.email ?? "",
      ...payload,
    });

    if (error) {
      throw new Error(error.message);
    }

    return ok(request, { message: "Profile updated" });
  } catch (error) {
    return errorResponse(request, error);
  }
}

