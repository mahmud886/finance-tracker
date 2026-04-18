import { parseJsonBody } from "@/app/api/_helper/request";
import { errorResponse, ok } from "@/app/api/_helper/response";
import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody(request, forgotPasswordSchema);
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(payload.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    if (error) {
      return Response.json(
        {
          success: false,
          error: {
            code: "AUTH_FORGOT_PASSWORD_FAILED",
            message: error.message,
          },
        },
        { status: 400 },
      );
    }

    return ok(request, { message: "Reset link sent to your email." });
  } catch (error) {
    return errorResponse(request, error);
  }
}

