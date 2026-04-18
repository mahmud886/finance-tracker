import { parseJsonBody } from "@/app/api/_helper/request";
import { errorResponse, ok } from "@/app/api/_helper/response";
import { createClient } from "@/lib/supabase/server";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody(request, resetPasswordSchema);
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: payload.password,
    });

    if (error) {
      return Response.json(
        {
          success: false,
          error: {
            code: "AUTH_RESET_PASSWORD_FAILED",
            message: error.message,
          },
        },
        { status: 400 },
      );
    }

    return ok(request, { message: "Password updated." });
  } catch (error) {
    return errorResponse(request, error);
  }
}

