import { parseJsonBody } from "@/app/api/_helper/request";
import { created, errorResponse } from "@/app/api/_helper/response";
import { createClient } from "@/lib/supabase/server";
import { signUpSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody(request, signUpSchema);
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          name: payload.name,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      },
    });

    if (error) {
      return Response.json(
        {
          success: false,
          error: {
            code: "AUTH_SIGNUP_FAILED",
            message: error.message,
          },
        },
        { status: 400 },
      );
    }

    return created(request, {
      message: "Account created. Check your inbox to verify your email.",
    });
  } catch (error) {
    return errorResponse(request, error);
  }
}

