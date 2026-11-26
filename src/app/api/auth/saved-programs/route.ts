import { NextResponse } from "next/server";

import { getApiBaseUrl } from "@/lib/api";
import { getBackendAuth } from "@/lib/server/backend-auth";

async function getAuthOrError() {
  const auth = await getBackendAuth();

  if (!auth) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "You must be signed in.",
        },
        { status: 401 },
      ),
    };
  }

  return { auth };
}

export async function GET() {
  const result = await getAuthOrError();

  if (result.error) {
    return result.error;
  }

  const { accessToken, userId } = result.auth;

  try {
    const response = await fetch(
      `${getApiBaseUrl()}/users/${userId}/saved-programs/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Unable to load saved programs.",
      },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const result = await getAuthOrError();

  if (result.error) {
    return result.error;
  }

  const { accessToken, userId } = result.auth;
  const body = await request.json();

  try {
    const response = await fetch(
      `${getApiBaseUrl()}/users/${userId}/saved-programs/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Unable to save program.",
      },
      { status: 503 },
    );
  }
}