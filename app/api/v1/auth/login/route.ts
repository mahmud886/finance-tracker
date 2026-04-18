import { parseJsonBody } from "@/app/api/_helper/request";
import { errorResponse, ok } from "@/app/api/_helper/response";
import { createClient } from "@/lib/supabase/server";
import { signInSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody(request, signInSchema);
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(payload);

    if (error) {
      return Response.json(
        {
          success: false,
          error: {
            code: "AUTH_INVALID_CREDENTIALS",
            message: error.message,
          },
        },
        { status: 401 },
      );
    }

    return ok(request, { message: "Signed in" });
  } catch (error) {
    return errorResponse(request, error);
  }
}

