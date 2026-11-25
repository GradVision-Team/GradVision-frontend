import { NextResponse } from "next/server";

import { getApiBaseUrl, getApiErrorMessage } from "@/lib/api";

type RegisterRequestBody = {
  first_name?: unknown;
  last_name?: unknown;
  email?: unknown;
  password?: unknown;
};

/**
 * BFF for user registration (signup).
 *
 * Proxies to: POST {NEXT_PUBLIC_API_URL}/users
 * Keeps the browser same-origin so production does not depend on backend CORS.
 */
export async function POST(request: Request) {
  let body: RegisterRequestBody;

  try {
    body = (await request.json()) as RegisterRequestBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const firstName =
    typeof body.first_name === "string" ? body.first_name.trim() : "";
  const lastName =
    typeof body.last_name === "string" ? body.last_name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json(
      {
        success: false,
        error: "First name, last name, email, and password are required.",
      },
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
    backendResponse = await fetch(`${apiBaseUrl}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      }),
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

  if (backendResponse.status === 201) {
    return NextResponse.json({ success: true }, { status: 201 });
  }

  let message = "Something went wrong. Please try again.";

  try {
    const data: unknown = await backendResponse.json();
    message = getApiErrorMessage(data, message);
  } catch {
    // Non-JSON or empty body — keep generic message.
  }

  return NextResponse.json(
    { success: false, error: message },
    { status: backendResponse.status },
  );
}
