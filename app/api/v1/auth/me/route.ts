import { requireApiUser } from "@/app/api/_helper/auth";
import { errorResponse, ok } from "@/app/api/_helper/response";

export async function GET(request: Request) {
  try {
    const { user } = await requireApiUser();
    return ok(request, {
      id: user.id,
      email: user.email,
      name: user.user_metadata.name ?? null,
    });
  } catch (error) {
    return errorResponse(request, error);
  }
}

