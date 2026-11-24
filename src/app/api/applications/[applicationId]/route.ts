import { NextResponse } from "next/server";

import { getApiErrorMessage } from "@/lib/api";
import { backendFetch, getBackendAuth } from "@/lib/auth/backend-request";
import { STATEMENT_URL_ERROR, normalizeStatementUrl } from "@/lib/profile";

/**
 * BFF for setting or clearing the statement link on an application.
 * Proxies to PATCH {NEXT_PUBLIC_API_URL}/applications/{application_id}
 * Body: { "statement_url": "https://..." | null }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  const auth = await getBackendAuth();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
  }

  const { applicationId } = await params;
  if (!/^\d+$/.test(applicationId)) {
    return NextResponse.json({ success: false, error: "Invalid application id." }, { status: 400 });
  }

  let body: { statement_url?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  // Only a valid http(s) link or null (remove the link) is accepted.
  let statementUrl: string | null;
  if (body?.statement_url === null) {
    statementUrl = null;
  } else if (typeof body?.statement_url === "string") {
    statementUrl = normalizeStatementUrl(body.statement_url);
    if (statementUrl === null) {
      return NextResponse.json({ success: false, error: STATEMENT_URL_ERROR }, { status: 400 });
    }
  } else {
    return NextResponse.json(
      { success: false, error: "statement_url must be a link or null." },
      { status: 400 },
    );
  }

  let backendResponse: Response;
  try {
    backendResponse = await backendFetch(auth, `/applications/${applicationId}`, {
      method: "PATCH",
      body: JSON.stringify({ statement_url: statementUrl }),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to reach the server. Please try again." },
      { status: 503 },
    );
  }

  if (!backendResponse.ok) {
    const data: unknown = await backendResponse.json().catch(() => null);
    return NextResponse.json(
      { success: false, error: getApiErrorMessage(data, "Couldn't save the link.") },
      { status: backendResponse.status },
    );
  }

  return NextResponse.json({ success: true });
}
