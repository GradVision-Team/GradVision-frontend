import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth-cookies";
import { extractUserIdFromAccessToken } from "@/lib/auth/session";

export async function getBackendAuth() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const userId = extractUserIdFromAccessToken(accessToken);

  if (userId === null) {
    return null;
  }

  return {
    accessToken,
    userId,
  };
}