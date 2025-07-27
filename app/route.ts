import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    {
      status: 200,
      message: "Gowa Platform API is running",
      version: "2.3.36",
      clientName: "gowa_plataforma_api",
      manager: "/settings",
      documentation: "https://www.postman.com/rogerioamaral/gowa/overview"
    },
    { status: 200 }
  )
}