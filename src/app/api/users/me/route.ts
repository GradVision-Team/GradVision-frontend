import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getApiBaseUrl, getApiErrorMessage } from "@/lib/api";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth-cookies";
import { extractUserIdFromAccessToken } from "@/lib/auth/session";

/**
 * BFF for authenticated profile updates.
 *
 * Proxies to the verified backend route:
 *   PATCH {NEXT_PUBLIC_API_URL}/users/{id}
 * which mounts as absolute path PATCH /api/users/{id}
 * (users router prefix="/users" + app include_router prefix="/api").
 */
export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value?.trim();

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: "Not authenticated." },
      { status: 401 },
    );
  }

  const userId = extractUserIdFromAccessToken(accessToken);
  if (userId === null) {
    return NextResponse.json(
      { success: false, error: "Not authenticated." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  let apiBaseUrl: string;

  try {
    apiBaseUrl = getApiBaseUrl();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error:
          "API URL is not configured. Set NEXT_PUBLIC_API_URL in .env.local.",
      },
      { status: 500 },
    );
  }

  let backendResponse: Response;

  try {
    backendResponse = await fetch(`${apiBaseUrl}/users/${userId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to reach the server. Check your connection and try again.",
      },
      { status: 503 },
    );
  }

  if (backendResponse.status === 401) {
    return NextResponse.json(
      { success: false, error: "Not authenticated." },
      { status: 401 },
    );
  }

  let data: unknown = null;

  try {
    data = await backendResponse.json();
  } catch {
    data = null;
  }

  if (!backendResponse.ok) {
    return NextResponse.json(
      {
        success: false,
        error: getApiErrorMessage(
          data,
          "Something went wrong. Please try again.",
        ),
      },
      { status: backendResponse.status },
    );
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    data.success === true
  ) {
    return NextResponse.json({ success: true });
  }

  // Backend SuccessResponse is { success: true }; accept empty/ok as success too.
  if (backendResponse.ok) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { success: false, error: "Something went wrong. Please try again." },
    { status: 502 },
  );
}
