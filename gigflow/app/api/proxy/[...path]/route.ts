import { NextRequest, NextResponse } from "next/server";

const backendBaseUrl =
  process.env.API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";
const backendOrigin = new URL(backendBaseUrl).origin;

const forward = async (
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) => {
  const { path } = await context.params;
  const joinedPath = path.join("/");
  const targetBaseUrl = path[0] === "uploads" ? backendOrigin : backendBaseUrl;
  const targetUrl = `${targetBaseUrl}/${joinedPath}${request.nextUrl.search}`;
  const headers = new Headers();
  const authHeader = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");

  if (authHeader) headers.set("authorization", authHeader);
  if (contentType) headers.set("content-type", contentType);

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.arrayBuffer(),
  });

  const responseBody = await response.arrayBuffer();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json",
    },
  });
};

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;
