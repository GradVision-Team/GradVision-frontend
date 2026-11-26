import { NextResponse } from "next/server";

import { getApiBaseUrl } from "@/lib/api";
import { getBackendAuth } from "@/lib/server/backend-auth";

export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ programId: string }>;
  },
) {
  const auth = await getBackendAuth();

  if (!auth) {
    return NextResponse.json(
      {
        success: false,
        error: "You must be signed in.",
      },
      { status: 401 },
    );
  }

  const { programId } = await params;
  const { accessToken, userId } = auth;

  try {
    const response = await fetch(
      `${getApiBaseUrl()}/users/${userId}/saved-programs/${programId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
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
        error: "Unable to remove saved program.",
      },
      { status: 503 },
    );
  }
}