import { ok } from "@/app/api/_helper/response";

export async function GET(request: Request) {
  return ok(request, {
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}

