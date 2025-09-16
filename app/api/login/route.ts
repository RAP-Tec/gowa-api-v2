import { NextRequest, NextResponse } from "next/server";

const GOWA_USER = process.env.GOWA_USER || "admin";
const AUTH_KEY = process.env.AUTH_KEY || "admin-AUTH_KEY-01234567890";

export async function POST(request: NextRequest) {
  try {
    const { user, apiKey, apikey } = await request.json();
    if (user === GOWA_USER && apiKey === AUTH_KEY) {
      return NextResponse.json({ success: true, apikey: apikey || "" });
    } else {
      return NextResponse.json({ success: false }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
