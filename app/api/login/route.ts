import { NextRequest, NextResponse } from "next/server";

const GOWA_USER = process.env.GOWA_USER || "";
const GOWA_API_KEY = process.env.GOWA_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const { user, apiKey } = await request.json();
    if (user === GOWA_USER && apiKey === GOWA_API_KEY) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
